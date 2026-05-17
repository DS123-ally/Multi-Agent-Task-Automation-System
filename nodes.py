from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv
import os
from tools import email_tool,linkedin_tool,summary_tool

load_dotenv(dotenv_path=".env",override=True)

llm=ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.1-8b-instant",
    temperature=0
    )

## 1. Planner Agent

def planner_agent(state):
    user_input = state["input"]

    prompt = f"""

    You are a planner agent that creates a plan to achieve the user's goal. The user's input is:
    Task: {user_input}
    Create a step-by-step plan to achieve this task. Be concise and clear.

    """

    response = llm.invoke([HumanMessage(content=prompt)])

    return {"plan": response.content}

## 2. Tool Selector Agent
def tool_agent(state):
    user_input = state["input"]

    prompt = f"""
    Classify this task into EXACTLY ONE tool.

    Task: {user_input}

    Available tools:
    - email → writing professional emails
    - linkedin → writing LinkedIn posts/content
    - summary → summarizing text/content
    - general → everything else

    Rules:
    - If task mentions "linkedin", "post", "social media" → linkedin
    - If task mentions "email", "mail", "compose message" → email
    - If task mentions "summarize", "summary" → summary
    - Otherwise → general

    Return ONLY one word:
    email / linkedin / summary / general
    """

    response = llm.invoke([HumanMessage(content=prompt)])

    tool = response.content.strip().lower()

    valid_tools = ["email", "linkedin", "summary", "general"]

    if tool not in valid_tools:
        tool = "general"

    return {"tool": tool}

# 3. Executor Agent
def executor_agent(state):
    user_input = state["input"]
    tool = state["tool"]
    plan = state["plan"]

    base_prompt = f"""
    You are an executor agent.

    Task:
    {user_input}

    Plan:
    {plan}
    """

    if tool == "email":
        prompt = base_prompt + """
        Write a professional email.
        Include:
        - Subject
        - Formal greeting
        - Clear message
        - Professional signature
        """

    elif tool == "linkedin":
        prompt = base_prompt + """
        Write an engaging LinkedIn post.

        Requirements:
        - Professional but conversational
        - Short and impactful
        - Add relevant hashtags
        - Make it authentic
        """

    elif tool == "summary":
        prompt = base_prompt + """
        Write a concise summary.
        """

    else:
        prompt = base_prompt + """
        Execute the task clearly.
        """

    response = llm.invoke([HumanMessage(content=prompt)])

    return {"output": response.content}


