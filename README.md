# Multi-Agent Task Automation System

A powerful, AI-driven task automation system that utilizes multiple specialized agents to plan, select tools, and execute various requests. Powered by **LangChain**, **LangGraph**, **Groq (Llama-3)**, and **Streamlit**.

## 🚀 Features

- **Multi-Agent Workflow**: Utilizes specialized agents (Planner, Tool Selector, Executor) working together through LangGraph.
- **Smart Tool Selection**: Automatically classifies user tasks and uses the best-suited tool (e.g., Email Composition, LinkedIn Posts, Summarization, or General Tasks).
- **Web Interface**: A beautiful and interactive Streamlit UI to enter tasks, view execution steps, and monitor analytics.
- **CLI Mode**: A lightweight Command-Line Interface (`app.py`) for quick testing and execution.
- **Fast Inference**: Powered by Groq's high-speed inference engine using the `llama-3.1-8b-instant` model.

## 🛠️ Technologies Used

- **Python 3.10+**
- **LangChain & LangGraph**: For defining the state machine and connecting the agents.
- **Groq API**: For lightning-fast LLM responses.
- **Streamlit**: For the web-based user interface.

## 📁 Project Structure

```
├── app.py                # Command-Line Interface (CLI) entrypoint
├── streamlit_app.py      # Streamlit Web UI entrypoint
├── graph.py              # LangGraph state machine definition
├── nodes.py              # Logic for Planner, Tool Selector, and Executor agents
├── tools.py              # Specific implementations for tools (email, linkedin, summary)
├── requirements.txt      # Python dependencies
└── .env                  # Environment variables (API Keys)
```

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd Multi-Agent System
```

### 2. Create a Virtual Environment
It's recommended to run the project in a virtual environment.
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Environment Variables
Create a `.env` file in the root directory and add your Groq API Key:
```env
GROQ_API_KEY=your_groq_api_key_here
```

## ▶️ How to Run

### Option 1: Streamlit Web UI (Recommended)
Launch the interactive web application, which includes a graphical task executor, historical task tracking, and analytics.
```bash
streamlit run streamlit_app.py
```
*The app will be available at http://localhost:8501*

### Option 2: Command-Line Interface (CLI)
For a quick, text-based execution without a web UI:
```bash
python app.py
```

## 🧠 How it Works

1. **Planner Agent**: Analyzes the user's task and formulates a step-by-step plan.
2. **Tool Selector Agent**: Classifies the task to determine which tool (email, linkedin, summary, or general) is best suited to achieve the goal.
3. **Executor Agent**: Takes the plan and the chosen tool, then executes the task to produce the final output.

## 📦 Deployment

To make deployment easy and avoid Python 3.14 protobuf C-extension issues, this project targets Python 3.11.

- `Procfile`: starts the Streamlit app for platforms like Heroku or Render.
- `runtime.txt`: pins the Python runtime to `python-3.11.6`.

Quick deploy steps (Render / Heroku):

1. Create the app on your chosen platform.
2. Push this repository to the connected Git remote.
3. The platform will install dependencies from `requirements.txt` and use `runtime.txt` for Python version.

Local test commands:
```bash
python -m venv venv
# Activate the venv (Windows):
venv\Scripts\activate
pip install -r requirements.txt
streamlit run streamlit_app.py
```

If you hit protobuf-related errors on newer Python versions, ensure the deployed runtime is Python 3.11.
