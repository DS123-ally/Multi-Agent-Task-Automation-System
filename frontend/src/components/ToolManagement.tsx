import React from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { useStore } from "../store/taskStore";

export const ToolManagement: React.FC = () => {
  const { tools, toggleTool } = useStore();

  const toolDescriptions: Record<string, { emoji: string; details: string }> =
    {
      email: {
        emoji: "📧",
        details: "Generate professional emails with proper formatting and tone",
      },
      linkedin: {
        emoji: "💼",
        details: "Create engaging LinkedIn posts and professional content",
      },
      summary: {
        emoji: "📝",
        details: "Summarize long-form content into concise summaries",
      },
      general: {
        emoji: "🎯",
        details: "Fallback tool for general tasks and queries",
      },
    };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span>🛠️</span> Tool Management
      </h2>

      <div className="space-y-3">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {toolDescriptions[tool.name]?.emoji || "⚙️"}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-800 capitalize">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {toolDescriptions[tool.name]?.details || tool.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  tool.enabled
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {tool.enabled ? "Enabled" : "Disabled"}
              </span>
              <button
                onClick={() => toggleTool(tool.name)}
                className={`p-2 rounded-lg transition ${
                  tool.enabled
                    ? "bg-green-100 text-green-600 hover:bg-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tool.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">💡 Tip:</span> Tools that are enabled
          can be used by the system when appropriate. Disabling a tool prevents
          it from being selected for tasks.
        </p>
      </div>
    </div>
  );
};
