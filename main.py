from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import time

from graph import graph

app = FastAPI(title="Multi-Agent Task Executor API")

# Allow requests from Next.js frontend (Local and Firebase)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TaskRequest(BaseModel):
    input: str
    chat_history: Optional[List[str]] = []

class TaskResponse(BaseModel):
    plan: str
    tool: str
    output: str
    chat_history: List[str]
    duration: float

@app.post("/execute", response_model=TaskResponse)
async def execute_task(request: TaskRequest):
    start_time = time.time()
    try:
        # Pass to LangGraph agent
        result = graph.invoke({
            "input": request.input,
            "chat_history": request.chat_history
        })
        
        # Update chat history
        updated_history = request.chat_history.copy() if request.chat_history else []
        updated_history.append(f"User: {request.input}")
        updated_history.append(f"Agent: {result.get('output', 'No output generated')}")
        
        duration = time.time() - start_time
        
        return TaskResponse(
            plan=result.get("plan", "No plan generated"),
            tool=result.get("tool", "unknown"),
            output=result.get("output", "No output generated"),
            chat_history=updated_history,
            duration=duration
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
