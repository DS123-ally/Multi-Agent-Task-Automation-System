from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import os
from tools import email_tool, linkedin_tool, summary_tool, research_tool

load_dotenv(dotenv_path=".env", override=True)

llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.1-8b-instant",
    temperature=0
)

# 1. Planner Agent
def planner_agent(state):
    user_input = state["input"]
    chat_history = "\n".join(state.get("chat_history", []))
    prompt = f"""
    You are a planner agent that creates a plan to achieve the user's goal.
    
    Previous Conversation History:
    {chat_history}
    
    The user's input is:
    Task: {user_input}
    
    Create a step-by-step plan to achieve this task. Be concise and clear.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"plan": response.content}

# 2. Tool Selector Agent (Using Structured Output)
class ToolSelection(BaseModel):
    tool: str = Field(
        description="The selected tool. Must be one of: 'email', 'linkedin', 'summary', 'research', 'general'"
    )

def tool_agent(state):
    user_input = state["input"]
    chat_history = "\n".join(state.get("chat_history", []))
    prompt = f"""
    Classify this task into EXACTLY ONE tool.
    
    Previous Conversation History:
    {chat_history}
    
    Task: {user_input}
    
    Available tools:
    - email → writing professional emails
    - linkedin → writing LinkedIn posts/content
    - summary → summarizing text/content
    - research → researching facts, news, or searching the web
    - general → everything else
    """
    try:
        structured_llm = llm.with_structured_output(ToolSelection)
        response = structured_llm.invoke([HumanMessage(content=prompt)])
        tool = response.tool.lower()
    except Exception:
        # Fallback if structured output fails
        tool = "general"

    valid_tools = ["email", "linkedin", "summary", "research", "general"]
    if tool not in valid_tools:
        tool = "general"

    return {"tool": tool}

# 3. Specialized Executors (For Conditional Edges)
def _base_execute(state, tool_name, tool_func, instruction_prompt, arg_key="task"):
    user_input = state["input"]
    plan = state["plan"]
    chat_history = "\n".join(state.get("chat_history", []))
    
    # Execute the actual tool
    try:
        tool_result = tool_func.invoke({arg_key: user_input})
    except Exception as e:
        tool_result = f"Tool execution failed: {str(e)}"
        
    prompt = f"""
    You are an executor agent.
    
    Previous Conversation History:
    {chat_history}
    
    Task: {user_input}
    Plan: {plan}
    
    Tool Result / Context:
    {tool_result}
    
    {instruction_prompt}
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"output": response.content}

def email_executor(state):
    return _base_execute(
        state, 
        "email", 
        email_tool, 
        "Write a professional email using the tool result. Include Subject, greeting, and signature."
    )

def linkedin_executor(state):
    return _base_execute(
        state, 
        "linkedin", 
        linkedin_tool, 
        "Write an engaging LinkedIn post based on the tool result. Use hashtags."
    )

def summary_executor(state):
    return _base_execute(
        state, 
        "summary", 
        summary_tool, 
        "Write a concise summary based on the tool result."
    )

def research_executor(state):
    user_input = state["input"]
    plan = state["plan"]
    chat_history = "\n".join(state.get("chat_history", []))
    
    # 1. Generate a precise search query
    query_prompt = f"""
    Extract a precise, 3-5 word Google search query from the user's task.
    Do not include conversational words. Only output the search query.
    Task: {user_input}
    """
    search_query = llm.invoke([HumanMessage(content=query_prompt)]).content.strip()
    
    # 2. Execute the tool with the precise query
    try:
        tool_result = research_tool.invoke({"query": search_query})
    except Exception as e:
        tool_result = f"Tool execution failed: {str(e)}"
        
    # 3. Generate final output with strict URL instructions
    prompt = f"""
    You are an executor agent.
    
    Previous Conversation History:
    {chat_history}
    
    Task: {user_input}
    Plan: {plan}
    Search Query Used: {search_query}
    
    Tool Result / Context:
    {tool_result}
    
    Synthesize the research results to answer the user's task comprehensively. 
    CRITICAL: YOU MUST INCLUDE the source URLs/links provided in the tool results. 
    However, ONLY provide URLs that are highly authoritative, reliable, and directly related to the topic. 
    If a URL looks like spam, is irrelevant, or seems inaccessible, DO NOT include it.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"output": response.content}

def general_executor(state):
    user_input = state["input"]
    plan = state["plan"]
    chat_history = "\n".join(state.get("chat_history", []))
    
    prompt = f"""
    You are an executor agent.
    
    Previous Conversation History:
    {chat_history}
    
    Task: {user_input}
    Plan: {plan}
    
    Execute the task clearly based on the plan.
    """
    response = llm.invoke([HumanMessage(content=prompt)])
    return {"output": response.content}
