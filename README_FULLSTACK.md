# Multi-Agent Task Executor - Frontend & Backend Setup

A full-stack application featuring a React + TypeScript frontend with real-time WebSocket streaming, backed by a FastAPI server with MongoDB integration for task history.

## 🎯 Features

- **Dual-Mode UI**: Chat interface for quick task execution + Dashboard for oversight
- **Real-time WebSocket Streaming**: See plan → tool → output as they're generated
- **Agent Visualization**: Monitor the execution flow (Planner → Tool Selector → Executor)
- **Tool Management**: Enable/disable tools to control which agents can be used
- **Task History**: MongoDB-backed persistent history of all executed tasks
- **Export Results**: Copy/download task results in multiple formats
- **Responsive Design**: Works on desktop and tablet devices

---

## 📋 Prerequisites

- **Python 3.9+** with pip and venv
- **Node.js 18+** with npm
- **MongoDB**: Local instance or Atlas cloud connection
- **GROQ API Key** for LLM access

---

## 🚀 Installation & Setup

### Step 1: Backend Setup

```bash
cd "c:\Multi-Agent System"

# Create and activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies (updated with FastAPI, MongoDB, WebSocket)
pip install -r requirements.txt
```

### Step 2: Environment Variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
MONGODB_URL=mongodb://localhost:27017
```

Or use MongoDB Atlas:
```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/multi_agent_db?retryWrites=true&w=majority
```

### Step 3: Start MongoDB

**Local MongoDB:**
```bash
# If installed locally
mongod
```

**MongoDB Atlas (Cloud):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a cluster and get connection string
- Update `.env` with your connection string

### Step 4: Start Backend Server

```bash
cd "c:\Multi-Agent System"
.\venv\Scripts\Activate.ps1
python api.py
```

The backend will start on `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/`

### Step 5: Frontend Setup

```bash
cd "c:\Multi-Agent System\frontend"

# Install dependencies
npm install

# Environment is pre-configured in .env
# Development server will proxy API calls to localhost:8000
```

### Step 6: Start Frontend

```bash
cd "c:\Multi-Agent System\frontend"
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## 📚 Project Structure

```
Multi-Agent System/
├── app.py                          # Original CLI app
├── graph.py                        # LangChain graph definition
├── nodes.py                        # Agent definitions
├── tools.py                        # Tool definitions
├── requirements.txt                # Python dependencies (updated)
│
├── api.py                          # FastAPI server
├── database.py                     # MongoDB models
├── schemas.py                      # Pydantic models
├── .env                            # Environment variables
│
└── frontend/                       # React + TypeScript app
    ├── src/
    │   ├── components/
    │   │   ├── ChatInterface.tsx   # Main chat UI
    │   │   ├── Message.tsx         # Message display component
    │   │   ├── TaskHistory.tsx     # History list and details
    │   │   ├── AgentFlowDiagram.tsx # Agent status visualization
    │   │   └── ToolManagement.tsx  # Tool enable/disable UI
    │   │
    │   ├── pages/
    │   │   ├── ChatPage.tsx        # Chat tab page
    │   │   └── DashboardPage.tsx   # Dashboard tab page
    │   │
    │   ├── hooks/
    │   │   ├── useWebSocket.ts     # WebSocket connection management
    │   │   ├── useTaskExecution.ts # Task execution logic
    │   │   └── useTaskHistory.ts   # History fetching and caching
    │   │
    │   ├── services/
    │   │   └── api.ts              # API client and WebSocket handler
    │   │
    │   ├── store/
    │   │   └── taskStore.ts        # Zustand global state management
    │   │
    │   ├── types/
    │   │   └── index.ts            # TypeScript interfaces
    │   │
    │   ├── styles/
    │   │   └── (Tailwind CSS config in tailwind.config.js)
    │   │
    │   ├── App.tsx                 # Main app with tab switching
    │   ├── index.css               # Tailwind + global styles
    │   └── main.tsx                # React entry point
    │
    ├── public/                     # Static assets
    ├── package.json                # Node dependencies
    ├── vite.config.ts              # Vite configuration (with API proxy)
    ├── tailwind.config.js          # Tailwind CSS configuration
    ├── postcss.config.js           # PostCSS configuration
    ├── tsconfig.json               # TypeScript configuration
    └── .env                        # Frontend environment variables
```

---

## 🔌 API Endpoints

### REST Endpoints

- `POST /api/execute-task` - Execute a task (HTTP)
- `GET /api/history` - Retrieve task history with pagination
- `DELETE /api/history/{task_id}` - Delete a specific task
- `DELETE /api/history` - Clear all history
- `GET /api/tools` - List available tools
- `GET /` - Health check

### WebSocket Endpoint

- `WS /ws/task-stream/{client_id}` - Real-time task streaming

**Message format:**
```json
{
  "type": "execute",
  "input": "Write a professional email"
}
```

**Response messages:**
```json
{"type": "plan", "content": "...", "taskId": "..."}
{"type": "tool", "content": "email", "taskId": "..."}
{"type": "output", "content": "...", "taskId": "..."}
{"type": "complete", "savedId": "...", "taskId": "..."}
{"type": "error", "content": "...", "taskId": "..."}
```

---

## 🎮 Usage

### Chat Interface
1. Open http://localhost:5173
2. Enter your task (e.g., "Write a LinkedIn post about AI")
3. Watch real-time streaming of plan → tool → output
4. Copy results or switch to Dashboard to view history

### Dashboard
1. Click the **Dashboard** tab
2. **Left Panel**: View and manage task history
   - Click a task to see full details
   - Re-run or delete tasks
   - Clear all history
3. **Top Right**: Agent flow visualization
   - See which agent is currently running
4. **Bottom Right**: Tool management
   - Enable/disable tools for the system to use

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
❌ Failed to connect to MongoDB: [Errno 11001]
```
**Solution:** 
- Ensure MongoDB is running: `mongod`
- Or update `.env` with valid MongoDB Atlas connection string
- Check MongoDB is accessible: `mongosh` or `mongo`

### WebSocket Connection Failed
```
WebSocket error: Failed to connect...
```
**Solution:**
- Ensure backend is running: `python api.py`
- Check CORS is enabled (should be in api.py)
- Verify WebSocket proxy in vite.config.ts

### API Proxy Not Working
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```
**Solution:**
- Start backend on port 8000: `python api.py`
- Update vite.config.ts proxy if using different port
- Clear browser cache and restart dev server

### Port Already in Use
```
Address already in use :::8000
```
**Solution:**
- Kill process on port 8000: `netstat -ano | findstr :8000`
- Or change port in api.py: `uvicorn.run(app, port=8001)`

---

## 📊 Database Schema

**MongoDB Collection:** `multi_agent_db.tasks`

```json
{
  "_id": ObjectId,
  "input": "User task description",
  "plan": "Step-by-step plan created by planner agent",
  "tool": "email|linkedin|summary|general",
  "output": "Final output from executor agent",
  "status": "completed|failed|running",
  "timestamp": ISODate
}
```

---

## 🔧 Configuration

### Backend (Python)

**api.py**
- CORS origins: `["http://localhost:5173", "http://localhost:3000"]`
- WebSocket timeout: 30 seconds (keep-alive ping)
- Task execution: Uses existing `graph.invoke()`

**database.py**
- MongoDB URL: From `.env` or `localhost:27017`
- Database: `multi_agent_db`
- Collection: `tasks`

### Frontend (React)

**vite.config.ts**
- Port: `5173`
- API proxy: `/api` → `http://localhost:8000`
- WebSocket proxy: `/ws` → `ws://localhost:8000`

**.env**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000
```

**tailwind.config.js**
- Custom colors, fonts, animations
- Mobile-responsive breakpoints

---

## 🎨 UI Components

### Message Component
Displays plan/tool/output with copy buttons
- Auto-colors based on message type
- Syntax highlighting for code
- Copy-to-clipboard functionality

### ChatInterface
Main chat experience
- Real-time streaming output
- Input validation
- Loading spinner
- Error display
- Responsive layout

### TaskHistory
History list with detail panel
- Pagination support
- Re-run and delete actions
- Full task details display
- Timestamp formatting

### AgentFlowDiagram
Shows agent execution progress
- Planner → Tool Selector → Executor flow
- Visual status indicators (idle/running/complete)
- Auto-updates during task execution

### ToolManagement
Enable/disable tools
- Current status display
- Tool descriptions
- Toggle buttons
- In-memory state (doesn't persist to DB)

---

## 🚀 Deployment Notes

### Local Development
- Runs on `localhost:5173` (frontend) and `localhost:8000` (backend)
- No authentication required
- MongoDB can be local or cloud
- Perfect for testing and development

### Production Deployment
When ready to deploy:
- Set up proper CORS for your domain
- Use environment variables for all secrets
- Enable MongoDB authentication
- Use production-grade WebSocket setup
- Implement rate limiting and authentication
- Deploy backend to cloud (Heroku, AWS, GCP, etc.)
- Deploy frontend to Vercel, Netlify, or similar

---

## 📝 Environment Variables

### Backend (.env)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | ✅ | - | API key for Groq LLM |
| `MONGODB_URL` | ❌ | `mongodb://localhost:27017` | MongoDB connection string |

### Frontend (.env)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | ❌ | `http://localhost:8000` | Backend API base URL |
| `VITE_WS_BASE_URL` | ❌ | `ws://localhost:8000` | WebSocket server URL |

---

## 📖 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Driver (PyMongo)](https://pymongo.readthedocs.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand Store](https://github.com/pmndrs/zustand)
- [LangChain Documentation](https://python.langchain.com/)

---

## 📄 License

This project is part of the Multi-Agent System learning project.

---

## 🤝 Contributing

To extend this project:

1. **Add New Tools**: Update `tools.py` and API tools endpoint
2. **Customize UI**: Modify components in `frontend/src/components/`
3. **Change Theme**: Edit `tailwind.config.js` or `index.css`
4. **Add Features**: Extend hooks and store as needed

---

**Version**: 1.0.0  
**Last Updated**: May 17, 2026
