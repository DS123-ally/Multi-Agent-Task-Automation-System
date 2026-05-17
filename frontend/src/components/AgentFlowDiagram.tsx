import React from "react";
import { CheckCircle, Circle } from "lucide-react";
import { useStore } from "../store/taskStore";

export const AgentFlowDiagram: React.FC = () => {
  const { currentExecution } = useStore();
  const { isRunning, plan, tool, output } = currentExecution;

  const agents = [
    {
      name: "Planner Agent",
      description: "Creates execution plan",
      icon: "📋",
      completed: !!plan,
      active: isRunning && !plan && !tool,
    },
    {
      name: "Tool Selector",
      description: "Selects appropriate tool",
      icon: "🎯",
      completed: !!tool,
      active: isRunning && !!plan && !tool,
    },
    {
      name: "Executor",
      description: "Executes task",
      icon: "⚡",
      completed: !!output,
      active: isRunning && !!tool && !output,
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>🔄</span> Agent Flow
      </h2>

      <div className="space-y-4">
        {agents.map((agent, index) => (
          <React.Fragment key={agent.name}>
            <div
              className={`flex items-center gap-4 p-4 rounded-lg transition ${
                agent.completed
                  ? "bg-green-50 border border-green-200"
                  : agent.active
                  ? "bg-blue-50 border border-blue-200 animate-pulse"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <div className="text-3xl">{agent.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">{agent.name}</h3>
                <p className="text-sm text-gray-600">{agent.description}</p>
              </div>
              <div>
                {agent.completed ? (
                  <CheckCircle className="text-green-600" size={24} />
                ) : agent.active ? (
                  <Circle className="text-blue-600 animate-spin" size={24} />
                ) : (
                  <Circle className="text-gray-400" size={24} />
                )}
              </div>
            </div>

            {index < agents.length - 1 && (
              <div className="flex justify-center py-2">
                <div className="h-6 w-1 bg-gradient-to-b from-gray-300 to-gray-200"></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {isRunning && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">
            ⏳ Task is running... Please wait for completion
          </p>
        </div>
      )}

      {!isRunning && !plan && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Execute a task from the Chat tab to see the agent flow
          </p>
        </div>
      )}
    </div>
  );
};
