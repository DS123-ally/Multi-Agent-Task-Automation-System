import React from "react";
import { TaskHistory } from "../components/TaskHistory";
import { AgentFlowDiagram } from "../components/AgentFlowDiagram";
import { ToolManagement } from "../components/ToolManagement";

export const DashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold">📊 Dashboard</h1>
        <p className="text-purple-100 mt-1">
          Monitor agent execution, manage tools, and view task history
        </p>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Task History - spans 2 columns */}
          <div className="lg:col-span-2">
            <TaskHistory />
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6">
            {/* Agent Flow */}
            <div className="flex-1">
              <AgentFlowDiagram />
            </div>

            {/* Tool Management */}
            <div className="flex-1">
              <ToolManagement />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
