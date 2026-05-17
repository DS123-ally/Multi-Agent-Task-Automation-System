from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json
import asyncio
from datetime import datetime
import uuid
import logging

from graph import graph
from database import db
from schemas import TaskRequest, TaskResponse, TaskUpdate, ToolConfig, HistoryRequest, HistoryResponse

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Multi-Agent Task Executor API",
    description="Backend API for task execution with real-time WebSocket streaming",
    version="1.0.0"
)

# Add CORS middleware for localhost frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"Client {client_id} connected")
    
    async def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"Client {client_id} disconnected")
    
    async def send_message(self, client_id: str, message: dict):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {e}")

manager = ConnectionManager()

# =====================
# API ENDPOINTS
# =====================

@app.on_event("startup")
async def startup():
    """Connect to MongoDB on app startup"""
    try:
        db.connect()
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        # Continue anyway - will fail when trying to save tasks

@app.on_event("shutdown")
async def shutdown():
    """Disconnect from MongoDB on app shutdown"""
    db.disconnect()

@app.get("/", tags=["root"])
async def root():
    """Root endpoint - API health check"""
    return {
        "status": "running",
        "message": "Multi-Agent Task Executor API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.post("/api/execute-task", response_model=TaskResponse, tags=["tasks"])
async def execute_task(request: TaskRequest):
    """
    Execute a task and return results.
    Note: For real-time streaming, use WebSocket endpoint instead.
    """
    try:
        task_id = str(uuid.uuid4())
        
        # Execute task
        result = graph.invoke({"input": request.input})
        
        # Prepare task data for storage
        task_data = {
            "input": request.input,
            "plan": result.get("plan", ""),
            "tool": result.get("tool", ""),
            "output": result.get("output", ""),
            "status": "completed"
        }
        
        # Save to MongoDB
        saved_id = db.save_task(task_data)
        
        return TaskResponse(
            id=saved_id,
            input=request.input,
            plan=result.get("plan", ""),
            tool=result.get("tool", ""),
            output=result.get("output", ""),
            timestamp=datetime.utcnow(),
            status="completed"
        )
    except Exception as e:
        logger.error(f"Error executing task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history", response_model=HistoryResponse, tags=["history"])
async def get_history(skip: int = 0, limit: int = 50):
    """
    Retrieve task history from MongoDB
    """
    try:
        tasks, total = db.get_history(skip=skip, limit=limit)
        
        # Convert to TaskResponse objects
        task_responses = [
            TaskResponse(
                id=task.get("id", ""),
                input=task.get("input", ""),
                plan=task.get("plan", ""),
                tool=task.get("tool", ""),
                output=task.get("output", ""),
                timestamp=task.get("timestamp", datetime.utcnow()),
                status=task.get("status", "completed")
            )
            for task in tasks
        ]
        
        return HistoryResponse(tasks=task_responses, total=total)
    except Exception as e:
        logger.error(f"Error retrieving history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history/{task_id}", tags=["history"])
async def delete_task(task_id: str):
    """Delete a specific task from history"""
    try:
        success = db.delete_task(task_id)
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"status": "deleted", "id": task_id}
    except Exception as e:
        logger.error(f"Error deleting task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/history", tags=["history"])
async def clear_history():
    """Clear all tasks from history"""
    try:
        count = db.clear_history()
        return {"status": "cleared", "count": count}
    except Exception as e:
        logger.error(f"Error clearing history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tools", tags=["tools"])
async def get_tools():
    """
    List available tools
    """
    tools = [
        {"name": "email", "enabled": True, "description": "Writing professional emails"},
        {"name": "linkedin", "enabled": True, "description": "Writing LinkedIn posts/content"},
        {"name": "summary", "enabled": True, "description": "Summarizing text/content"},
        {"name": "general", "enabled": True, "description": "Everything else"}
    ]
    return {"tools": tools}

# =====================
# WEBSOCKET ENDPOINT
# =====================

@app.websocket("/ws/task-stream/{client_id}")
async def websocket_execute_task(websocket: WebSocket, client_id: str):
    """
    WebSocket endpoint for real-time task streaming.
    Streams plan → tool → output in real-time.
    """
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            # Receive task from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "execute":
                task_input = message.get("input", "")
                task_id = str(uuid.uuid4())
                
                try:
                    # Send task started notification
                    await manager.send_message(client_id, {
                        "type": "status",
                        "content": "Task started",
                        "taskId": task_id
                    })
                    
                    # Execute task and stream results
                    result = graph.invoke({"input": task_input})
                    
                    # Stream plan
                    await asyncio.sleep(0.1)  # Simulate streaming
                    await manager.send_message(client_id, {
                        "type": "plan",
                        "content": result.get("plan", ""),
                        "taskId": task_id
                    })
                    
                    # Stream tool
                    await asyncio.sleep(0.1)
                    await manager.send_message(client_id, {
                        "type": "tool",
                        "content": result.get("tool", ""),
                        "taskId": task_id
                    })
                    
                    # Stream output
                    await asyncio.sleep(0.1)
                    await manager.send_message(client_id, {
                        "type": "output",
                        "content": result.get("output", ""),
                        "taskId": task_id
                    })
                    
                    # Save to MongoDB
                    task_data = {
                        "input": task_input,
                        "plan": result.get("plan", ""),
                        "tool": result.get("tool", ""),
                        "output": result.get("output", ""),
                        "status": "completed"
                    }
                    saved_id = db.save_task(task_data)
                    
                    # Send completion
                    await manager.send_message(client_id, {
                        "type": "complete",
                        "content": "Task completed",
                        "taskId": task_id,
                        "savedId": saved_id
                    })
                    
                except Exception as e:
                    logger.error(f"Error executing task: {e}")
                    await manager.send_message(client_id, {
                        "type": "error",
                        "content": str(e),
                        "taskId": task_id
                    })
            
            elif message.get("type") == "ping":
                # Keep-alive ping
                await manager.send_message(client_id, {
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })
    
    except WebSocketDisconnect:
        await manager.disconnect(client_id)
        logger.info(f"Client {client_id} disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await manager.disconnect(client_id)

# =====================
# ERROR HANDLERS
# =====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=False)
