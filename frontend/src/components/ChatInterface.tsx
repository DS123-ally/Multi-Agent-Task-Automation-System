import React, { useRef, useEffect, useState } from "react";
import { Send, Loader } from "lucide-react";
import { useTaskExecution } from "../hooks/useTaskExecution";
import { useStore } from "../store/taskStore";
import { Message } from "./Message";

export const ChatInterface: React.FC = () => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { executeTask, isRunning, plan, tool, output, error } = useTaskExecution();
  const { streamingOutput } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [streamingOutput, plan, tool, output]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isRunning) {
      await executeTask(input);
      setInput("");
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <h1 className="text-3xl font-bold">🤖 Multi-Agent Task Executor</h1>
        <p className="text-blue-100 mt-1">
          Real-time task execution with AI-powered agents
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-2">
        {/* User Input */}
        {input && !isRunning && (
          <div className="mb-4">
            <Message type="user" content={input} />
          </div>
        )}

        {/* Streaming Output */}
        {streamingOutput.length > 0 && (
          <div className="mb-4">
            <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-700 font-mono">
              <div className="text-xs text-gray-500 mb-2">📡 Live Output</div>
              {streamingOutput.map((line, idx) => (
                <div key={idx} className="animate-fade-in">
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {plan && <Message type="plan" content={plan} onCopy={() => handleCopy(plan)} />}
        {tool && <Message type="tool" content={tool} onCopy={() => handleCopy(tool)} />}
        {output && (
          <Message type="output" content={output} onCopy={() => handleCopy(output)} />
        )}
        {error && <Message type="error" content={error} />}

        {/* Loading Indicator */}
        {isRunning && !output && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Loader className="animate-spin text-blue-600" size={20} />
            <span className="text-blue-700 font-medium">Processing task...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t bg-gray-50 p-6">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your task here... (e.g., 'Write a professional email', 'Create a LinkedIn post')"
            disabled={isRunning}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isRunning || !input.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            {isRunning ? (
              <>
                <Loader size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send size={18} />
                Send
              </>
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Use the Dashboard tab to manage tools and view task history
        </p>
      </div>
    </div>
  );
};
