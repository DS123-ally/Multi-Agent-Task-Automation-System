from graph import graph

result = graph.invoke({"input": "What is the capital of France?"})
print("Plan:", result["plan"])
print("Tool:", result["tool"])
print("Output:", result["output"])
