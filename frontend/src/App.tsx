import React from "react";
import { useStore } from "./store/taskStore";
import { ChatPage } from "./pages/ChatPage";
import { DashboardPage } from "./pages/DashboardPage";
import { MessageCircle, Settings } from "lucide-react";
import "./App.css";

function App() {
  const { activeTab, setActiveTab } = useStore();

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100">
      {/* Tab Navigation */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-0">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
                activeTab === "chat"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <MessageCircle size={20} />
              Chat
            </button>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition border-b-2 ${
                activeTab === "dashboard"
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Settings size={20} />
              Dashboard
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Multi-Agent Task Executor v1.0
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" && <ChatPage />}
        {activeTab === "dashboard" && <DashboardPage />}
      </div>
    </div>
  );
}

export default App;

