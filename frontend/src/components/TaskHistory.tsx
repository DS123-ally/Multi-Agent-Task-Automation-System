import React from "react";
import { Trash2, RotateCcw, Eye } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTaskHistory } from "../hooks/useTaskHistory";
import { useTaskExecution } from "../hooks/useTaskExecution";
import type { Task } from "../types";

export const TaskHistory: React.FC = () => {
  const { taskHistory, deleteTask, clearAllHistory } = useTaskHistory();
  const { executeTask } = useTaskExecution();
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  const handleRerun = (task: Task) => {
    executeTask(task.input);
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm("Delete this task?")) {
      await deleteTask(taskId);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Delete all history? This cannot be undone.")) {
      await clearAllHistory();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* History List */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">📜 Task History</h2>
            {taskHistory.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
              >
                Clear All
              </button>
            )}
          </div>
          <p className="text-green-100 text-sm mt-1">
            {taskHistory.length} task{taskHistory.length !== 1 ? "s" : ""} in history
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {taskHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Eye size={48} className="mb-2" />
              <p>No tasks yet. Execute a task in the Chat tab to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {taskHistory.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    selectedTask?.id === task.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {task.input}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRerun(task);
                        }}
                        className="p-1 hover:bg-blue-100 rounded transition"
                        title="Re-run task"
                      >
                        <RotateCcw size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(task.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded transition"
                        title="Delete task"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(task.timestamp)} • {task.tool || "general"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Details */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <h3 className="font-bold">📋 Task Details</h3>
        </div>

        {selectedTask ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Task
              </label>
              <p className="text-sm text-gray-800">{selectedTask.input}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Tool
              </label>
              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                {selectedTask.tool || "general"}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Plan
              </label>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded max-h-40 overflow-y-auto prose prose-sm max-w-none">
                {selectedTask.plan ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedTask.plan}
                  </ReactMarkdown>
                ) : (
                  "-"
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Output
              </label>
              <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded max-h-64 overflow-y-auto prose prose-sm max-w-none">
                {selectedTask.output ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedTask.output}
                  </ReactMarkdown>
                ) : (
                  "-"
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Timestamp
              </label>
              <p className="text-sm text-gray-600">
                {formatDate(selectedTask.timestamp)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p className="text-center text-sm">
              Select a task to view details
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
