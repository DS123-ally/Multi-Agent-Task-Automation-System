from langgraph.graph import StateGraph
from typing import TypedDict
from nodes import planner_agent, tool_agent, executor_agent

class AgentState(TypedDict):
    input: str
    plan:str
    tool: str
    output: str

builder=StateGraph(AgentState)

builder.add_node("planner",planner_agent)
builder.add_node("tool_selector",tool_agent)
builder.add_node("executor",executor_agent)

builder.set_entry_point("planner")

builder.add_edge("planner","tool_selector")
builder.add_edge("tool_selector","executor")

builder.set_finish_point("executor")

graph=builder.compile()