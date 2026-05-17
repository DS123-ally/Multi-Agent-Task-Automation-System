from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TaskRequest(BaseModel):
    """Schema for task execution request"""
    input: str = Field(..., min_length=1, description="User task description")


class TaskResponse(BaseModel):
    """Schema for task execution response"""
    id: str
    input: str
    plan: str
    tool: str
    output: str
    timestamp: datetime
    status: str = "completed"  # completed, failed, running


class TaskUpdate(BaseModel):
    """Schema for streaming task updates"""
    type: str  # "plan", "tool", "output", "error", "complete"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ToolConfig(BaseModel):
    """Schema for tool configuration"""
    name: str
    enabled: bool = True
    description: str = ""


class HistoryRequest(BaseModel):
    """Schema for history query"""
    skip: int = 0
    limit: int = 50


class HistoryResponse(BaseModel):
    """Schema for history response"""
    tasks: List[TaskResponse]
    total: int
