from graph import graph

# Logo / Banner
LOGO = """
╔══════════════════════════════════════╗
║      MULTI-AGENT TASK EXECUTOR       ║
║                                      ║
╚══════════════════════════════════════╝
"""

def run_agent(user_input):
    result = graph.invoke({"input": user_input})
    return result


if __name__ == "__main__":
    print(LOGO)   # Display logo
    print("🚀 Multi-Agent System for Task Execution\n")
    
    user_input = input("Enter your task: ")
    result = run_agent(user_input)

    print("\n📌 PLAN:\n")
    print(result["plan"])

    print("\n🛠 TOOL USED:\n")
    print(result["tool"])

    print("\n✅ OUTPUT:\n")
    print(result["output"])