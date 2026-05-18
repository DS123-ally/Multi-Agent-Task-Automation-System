# pyrefly: ignore [missing-import]
import streamlit as st
import uuid
from datetime import datetime
from typing import List, Dict
import pandas as pd
import time
from collections import Counter

# Import the agent graph directly
from graph import graph

# Page configuration
st.set_page_config(
    page_title="Multi-Agent Task Executor",
    page_icon="🤖",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS
st.markdown("""
<style>
    /* Plan container */
    .plan-container {
        background: linear-gradient(135deg, #f0f4ff 0%, #fff5f7 100%);
        border-left: 4px solid #667eea;
        border-radius: 8px;
        padding: 15px;
        margin: 10px 0;
    }
    
    /* Tool container */
    .tool-container {
        background: linear-gradient(135deg, #fff5f7 0%, #f0f4ff 100%);
        border-left: 4px solid #ec4899;
        border-radius: 8px;
        padding: 15px;
        margin: 10px 0;
    }
    
    /* Output container */
    .output-container {
        background: linear-gradient(135deg, #f0fdf4 0%, #f5f3ff 100%);
        border-left: 4px solid #10b981;
        border-radius: 8px;
        padding: 15px;
        margin: 10px 0;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if "task_history" not in st.session_state:
    st.session_state.task_history = []
if "current_task" not in st.session_state:
    st.session_state.current_task = None

# Helper functions
def get_tool_icon(tool: str) -> str:
    """Get icon for tool type"""
    icons = {
        "email": "📧",
        "linkedin": "💼",
        "summary": "📝",
        "general": "🔧"
    }
    return icons.get(tool.lower(), "🔧")

def format_duration(seconds: float) -> str:
    """Format duration in human-readable format"""
    if seconds < 1:
        return f"{seconds*1000:.0f}ms"
    elif seconds < 60:
        return f"{seconds:.1f}s"
    else:
        return f"{seconds/60:.1f}m"

def execute_task(task_input: str) -> Dict:
    """Execute task using the agent graph"""
    start_time = time.time()
    try:
        result = graph.invoke({"input": task_input})
        duration = time.time() - start_time
        
        return {
            "id": str(uuid.uuid4())[:12],
            "input": task_input,
            "plan": result.get("plan", "No plan generated"),
            "tool": result.get("tool", "Unknown"),
            "output": result.get("output", "No output generated"),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "completed",
            "duration": duration
        }
    except Exception as e:
        duration = time.time() - start_time
        return {
            "id": str(uuid.uuid4())[:12],
            "input": task_input,
            "plan": "Error generating plan",
            "tool": "Error",
            "output": f"Error: {str(e)}",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "error",
            "duration": duration
        }

# Header
col1, col2 = st.columns([3, 1])
with col1:
    st.markdown("""
    <div style="padding: 30px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                border-radius: 12px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);">
        <h1 style="color: white; margin: 0; font-size: 2.5em; text-align: center;">🤖 Multi-Agent Task Executor</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 1em; text-align: center;">
            Intelligent task planning and execution powered by AI agents
        </p>
    </div>
    """, unsafe_allow_html=True)

with col2:
    st.success("✅ Ready to Execute")

# Sidebar
with st.sidebar:
    st.markdown("### 📊 Statistics")
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.metric("Total Tasks", len(st.session_state.task_history))
    
    with col2:
        if len(st.session_state.task_history) > 0:
            success = sum(1 for t in st.session_state.task_history if t.get("status") == "completed")
            rate = (success / len(st.session_state.task_history)) * 100
            st.metric("Success Rate", f"{rate:.0f}%")
        else:
            st.metric("Success Rate", "N/A")
    
    with col3:
        if len(st.session_state.task_history) > 0:
            avg_time = sum(t.get("duration", 0) for t in st.session_state.task_history) / len(st.session_state.task_history)
            st.metric("Avg Time", format_duration(avg_time))
        else:
            st.metric("Avg Time", "N/A")
    
    st.markdown("---")
    
    # Tool Statistics
    if st.session_state.task_history:
        st.markdown("### 🛠️ Tool Usage")
        tools = [t.get("tool", "unknown") for t in st.session_state.task_history]
        tool_counts = Counter(tools)
        
        for tool, count in tool_counts.most_common(5):
            icon = get_tool_icon(tool)
            st.write(f"{icon} {tool.upper()}: {count}")
    else:
        st.markdown("### 🛠️ Available Tools")
        tools_info = {
            "📧 Email": "Professional email composition",
            "💼 LinkedIn": "LinkedIn posts and content",
            "📝 Summary": "Text summarization",
            "🔧 General": "Any other task"
        }
        for tool, description in tools_info.items():
            st.caption(f"{tool}: {description}")
    
    st.markdown("---")
    
    # Actions
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔄 Refresh", use_container_width=True):
            st.rerun()
    with col2:
        if st.button("🗑️ Clear All", use_container_width=True):
            st.session_state.task_history = []
            st.session_state.current_task = None
            st.rerun()

# Main content
tab_execute, tab_history, tab_stats = st.tabs(["🚀 Execute", "📜 History", "📊 Analytics"])

with tab_execute:
    col1, col2 = st.columns([2, 1], gap="large")
    
    with col1:
        st.markdown("### 🎯 Task Input")
        
        task_input = st.text_area(
            "Enter your task or request:",
            placeholder="e.g., Write a professional email to my manager about Q2 results...",
            height=150,
            label_visibility="collapsed"
        )
        
        col_btn1, col_btn2, col_btn3 = st.columns(3)
        with col_btn1:
            execute_button = st.button(
                "🚀 Execute Task",
                type="primary",
                use_container_width=True,
                disabled=not task_input.strip()
            )
        with col_btn2:
            clear_button = st.button(
                "🔄 Clear",
                use_container_width=True
            )
        with col_btn3:
            pass
    
    with col2:
        st.markdown("### 📋 Status")
        if st.session_state.current_task:
            status = st.session_state.current_task.get("status", "completed")
            if status == "completed":
                st.success("✅ Completed")
            elif status == "running":
                st.warning("⏳ Running")
            else:
                st.error("❌ Error")
            
            duration = st.session_state.current_task.get("duration", 0)
            st.metric("Execution Time", format_duration(duration))
            
            timestamp = st.session_state.current_task.get("timestamp", "N/A")
            st.caption(f"⏰ {timestamp}")
        else:
            st.info("👉 Ready to execute")
    
    if clear_button:
        task_input = ""
        st.rerun()
    
    # Execute task
    if execute_button and task_input.strip():
        with st.spinner("🔄 Executing task..."):
            try:
                progress_bar = st.progress(0)
                
                # Show progress
                progress_bar.progress(33)
                task_result = execute_task(task_input)
                progress_bar.progress(99)
                
                st.session_state.current_task = task_result
                st.session_state.task_history.insert(0, task_result)
                progress_bar.progress(100)
                st.success("✅ Task executed successfully!")
                        
            except Exception as e:
                st.error(f"❌ Error: {str(e)}")
    
    # Display results
    if st.session_state.current_task:
        st.markdown("---")
        st.markdown("### 📊 Results")
        
        result_tab1, result_tab2, result_tab3, result_tab4 = st.tabs(
            ["📋 Plan", "🔧 Tool", "✅ Output", "ℹ️ Details"]
        )
        
        with result_tab1:
            st.markdown('<div class="plan-container">', unsafe_allow_html=True)
            plan = st.session_state.current_task.get("plan", "No plan generated")
            st.write(plan)
            st.markdown('</div>', unsafe_allow_html=True)
        
        with result_tab2:
            st.markdown('<div class="tool-container">', unsafe_allow_html=True)
            tool_name = st.session_state.current_task.get("tool", "Unknown")
            icon = get_tool_icon(tool_name)
            st.success(f"{icon} **{tool_name.upper()}**")
            st.markdown('</div>', unsafe_allow_html=True)
        
        with result_tab3:
            st.markdown('<div class="output-container">', unsafe_allow_html=True)
            output = st.session_state.current_task.get("output", "No output generated")
            st.write(output)
            st.code(output, language="text")
            st.markdown('</div>', unsafe_allow_html=True)
        
        with result_tab4:
            col1, col2, col3 = st.columns(3)
            with col1:
                task_id = st.session_state.current_task.get("id", "N/A")
                st.metric("Task ID", task_id)
            with col2:
                status = st.session_state.current_task.get("status", "Unknown").upper()
                st.metric("Status", status)
            with col3:
                duration = st.session_state.current_task.get("duration", 0)
                st.metric("Duration", format_duration(duration))
            
            st.write("**Timestamp:**", st.session_state.current_task.get("timestamp", "N/A"))
            st.write("**Input:**", st.session_state.current_task.get("input", "N/A"))

with tab_history:
    st.markdown("### 📜 Task History")
    
    if st.session_state.task_history:
        # Filter options
        col1, col2 = st.columns(2)
        with col1:
            filter_tool = st.selectbox(
                "Filter by tool:",
                ["All"] + list(set(t.get("tool", "unknown") for t in st.session_state.task_history))
            )
        with col2:
            filter_status = st.selectbox(
                "Filter by status:",
                ["All"] + list(set(t.get("status", "unknown") for t in st.session_state.task_history))
            )
        
        # Apply filters
        filtered_history = st.session_state.task_history
        if filter_tool != "All":
            filtered_history = [t for t in filtered_history if t.get("tool") == filter_tool]
        if filter_status != "All":
            filtered_history = [t for t in filtered_history if t.get("status") == filter_status]
        
        # Display as table
        if filtered_history:
            history_data = []
            for i, task in enumerate(filtered_history):
                history_data.append({
                    "No.": i + 1,
                    "Task": task.get("input", "")[:60] + "...",
                    "Tool": get_tool_icon(task.get("tool", "unknown")) + " " + task.get("tool", "unknown").upper(),
                    "Status": "✅" if task.get("status") == "completed" else "❌",
                    "Time": format_duration(task.get("duration", 0))
                })
            
            df = pd.DataFrame(history_data)
            st.dataframe(df, use_container_width=True, hide_index=True)
            
            st.markdown("---")
            
            # Detailed view
            st.markdown("### 📌 Details")
            selected_idx = st.number_input(
                "View task #",
                min_value=1,
                max_value=len(filtered_history),
                value=1
            ) - 1
            
            task = filtered_history[selected_idx]
            
            expander = st.expander(f"📌 {selected_idx + 1}. {task.get('input', '')[:80]}", expanded=True)
            with expander:
                col1, col2, col3 = st.columns(3)
                with col1:
                    st.write(f"**Tool:** {get_tool_icon(task.get('tool', 'unknown'))} {task.get('tool', 'unknown').upper()}")
                with col2:
                    st.write(f"**Status:** {task.get('status', 'unknown').upper()}")
                with col3:
                    st.write(f"**Duration:** {format_duration(task.get('duration', 0))}")
                
                st.markdown("---")
                st.write("**Input:**")
                st.write(task.get('input', 'N/A'))
                
                st.write("**Plan:**")
                st.write(task.get('plan', 'N/A'))
                
                st.write("**Output:**")
                st.code(task.get('output', 'N/A'), language="text")
        else:
            st.info("No tasks match the selected filters.")
    else:
        st.info("📭 No tasks executed yet. Start by entering a task above!")

with tab_stats:
    st.markdown("### 📊 Analytics")
    
    if st.session_state.task_history:
        # Summary metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Total Tasks", len(st.session_state.task_history))
        
        with col2:
            success = sum(1 for t in st.session_state.task_history if t.get("status") == "completed")
            rate = (success / len(st.session_state.task_history)) * 100
            st.metric("Success Rate", f"{rate:.1f}%")
        
        with col3:
            avg_time = sum(t.get("duration", 0) for t in st.session_state.task_history) / len(st.session_state.task_history)
            st.metric("Avg Execution Time", format_duration(avg_time))
        
        with col4:
            tools = [t.get("tool", "unknown") for t in st.session_state.task_history]
            unique_tools = len(set(tools))
            st.metric("Tools Used", unique_tools)
        
        st.markdown("---")
        
        # Charts
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### 🛠️ Tool Distribution")
            tools = [t.get("tool", "unknown") for t in st.session_state.task_history]
            tool_counts = Counter(tools)
            tool_df = pd.DataFrame(
                list(tool_counts.items()),
                columns=["Tool", "Count"]
            )
            st.bar_chart(tool_df.set_index("Tool"))
        
        with col2:
            st.markdown("### ⏱️ Execution Times")
            times = [t.get("duration", 0) for t in st.session_state.task_history if t.get("duration")]
            if times:
                time_df = pd.DataFrame({
                    "Task": range(1, len(times) + 1),
                    "Duration (seconds)": times
                })
                st.bar_chart(time_df.set_index("Task")["Duration (seconds)"])
        
        st.markdown("---")
        
        # Status summary
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### ✅ Status Summary")
            statuses = [t.get("status", "unknown") for t in st.session_state.task_history]
            status_counts = Counter(statuses)
            status_df = pd.DataFrame(
                list(status_counts.items()),
                columns=["Status", "Count"]
            )
            st.bar_chart(status_df.set_index("Status")["Count"])
        
        with col2:
            st.markdown("### 📈 Top Tools")
            tools = [t.get("tool", "unknown") for t in st.session_state.task_history]
            tool_counts = Counter(tools)
            st.write(pd.DataFrame(
                sorted(tool_counts.items(), key=lambda x: x[1], reverse=True),
                columns=["Tool", "Uses"]
            ))
    else:
        st.info("📊 Execute some tasks to see analytics!")

# Footer
st.markdown("---")
st.markdown("""
<div style="text-align: center; color: gray; padding: 20px;">
    <p>🚀 Multi-Agent Task Executor v1.0 (Standalone) | Powered by LangChain + Streamlit</p>
    <p style="font-size: 0.9em;">© 2024 Multi-Agent System</p>
</div>
""", unsafe_allow_html=True)
