# Agent OS - Multi-Agent Task Automation System

A powerful, AI-driven autonomous agent system that utilizes specialized agents to plan, select tools, and execute various requests. 

This project is built using a modern decoupled architecture:
- **Frontend**: Next.js (React), Tailwind CSS, Firebase Authentication, and Firestore Database.
- **Backend**: FastAPI, Python 3.11, LangChain, LangGraph, and Groq (Llama-3).

## 🚀 Features

- **Multi-Agent Workflow**: Utilizes specialized agents (Planner, Tool Selector, Executor) working together through LangGraph.
- **Smart Tool Selection**: Automatically classifies user tasks and uses the best-suited tool (e.g., Web Research via Tavily, Email Composition, LinkedIn Posts, Summarization, or General Tasks).
- **ChatGPT-Style Web Interface**: A beautiful Next.js UI with real-time Firestore syncing, a collapsible sidebar, and conversation threading.
- **Fast Inference**: Powered by Groq's high-speed inference engine using the `llama-3.1-8b-instant` model.

## 🛠️ Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS, Firebase (Auth & Firestore)
- **Backend**: Python 3.11, FastAPI, Uvicorn
- **AI Stack**: LangChain, LangGraph, Groq API, Tavily API (Search)
- **Deployment**: Render (Backend - Docker), Firebase Hosting (Frontend)

## 📁 Project Structure

```
├── frontend/             # Next.js Application
│   ├── src/app/          # React components and pages
│   └── src/lib/          # Firebase configuration
│
├── main.py               # FastAPI backend entrypoint
├── graph.py              # LangGraph state machine definition
├── nodes.py              # Logic for Planner, Tool Selector, and Executor agents
├── tools.py              # Specific implementations for tools
├── requirements.txt      # Python dependencies
├── Dockerfile            # Container definition for the backend
├── render.yaml           # Blueprint for automatic Render deployment
└── .env                  # Environment variables (API Keys)
```

## ⚙️ Local Setup Instructions

### 1. Backend (FastAPI)
Open a terminal in the root directory:
```bash
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt
```
Create a `.env` file in the root directory and add your API Keys:
```env
GROQ_API_KEY=your_groq_api_key_here
TAVILY_API_KEY=your_tavily_api_key_here
```
Run the backend server:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (Next.js)
Open a new terminal in the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
*The web app will be available at http://localhost:3000*

## 📦 Deployment Instructions

### Backend (Render & Docker)
The backend is completely containerized and configured for automatic deployment on Render using Infrastructure as Code (`render.yaml`).

1. Push this repository to GitHub.
2. Go to [Render.com](https://render.com) and create a New **Blueprint**.
3. Connect your GitHub repository. Render will read the `render.yaml` file, detect the `Dockerfile`, and automatically build the web service.
4. Render will prompt you for your `GROQ_API_KEY` and `TAVILY_API_KEY`.
5. Once live, copy your backend URL (e.g., `https://agent-os-backend.onrender.com`).

### Frontend (Firebase Hosting)
1. Update your Next.js Axios configuration in `frontend/src/app/page.tsx` to point to your new Render backend URL instead of localhost.
2. Build the Next.js app:
```bash
npm run build
```
3. Deploy to Firebase:
```bash
firebase deploy --only hosting
```
