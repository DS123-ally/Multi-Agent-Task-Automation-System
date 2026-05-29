from langgraph.graph import StateGraph, END
from typing import TypedDict
from nodes import (
    planner_agent, 
    tool_agent, 
    email_executor, 
    linkedin_executor, 
    summary_executor, 
    research_executor, 
    general_executor
)

class AgentState(TypedDict):
    input: str
    plan: str
    tool: str
    output: str
    chat_history: list

builder = StateGraph(AgentState)

builder.add_node("planner", planner_agent)
builder.add_node("tool_selector", tool_agent)
builder.add_node("email", email_executor)
builder.add_node("linkedin", linkedin_executor)
builder.add_node("summary", summary_executor)
builder.add_node("research", research_executor)
builder.add_node("general", general_executor)

builder.set_entry_point("planner")
builder.add_edge("planner", "tool_selector")

def route_tool(state):
    return state["tool"]

builder.add_conditional_edges(
    "tool_selector",
    route_tool,
    {
        "email": "email",
        "linkedin": "linkedin",
        "summary": "summary",
        "research": "research",
        "general": "general"
    }
)

builder.add_edge("email", END)
builder.add_edge("linkedin", END)
builder.add_edge("summary", END)
builder.add_edge("research", END)
builder.add_edge("general", END)

graph = builder.compile()