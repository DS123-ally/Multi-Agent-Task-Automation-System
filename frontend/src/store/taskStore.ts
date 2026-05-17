import { create } from "zustand";
import type { StoreState, Tool, ExecutionState } from "../types";

const DEFAULT_EXECUTION_STATE: ExecutionState = {
  isRunning: false,
  plan: "",
  tool: "",
  output: "",
  error: undefined,
};

const DEFAULT_TOOLS: Tool[] = [
  { name: "email", enabled: true, description: "Writing professional emails" },
  { name: "linkedin", enabled: true, description: "Writing LinkedIn posts/content" },
  { name: "summary", enabled: true, description: "Summarizing text/content" },
  { name: "general", enabled: true, description: "Everything else" },
];

export const useStore = create<StoreState>((set) => ({
  // Active tab
  activeTab: "chat",
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Current execution state
  currentExecution: DEFAULT_EXECUTION_STATE,
  setCurrentExecution: (state) =>
    set((prev) => ({
      currentExecution: { ...prev.currentExecution, ...state },
    })),
  resetExecution: () => set({ currentExecution: DEFAULT_EXECUTION_STATE }),

  // Task history
  taskHistory: [],
  addTaskToHistory: (task) =>
    set((prev) => ({
      taskHistory: [task, ...prev.taskHistory],
    })),
  loadHistory: (tasks) => set({ taskHistory: tasks }),
  clearLocalHistory: () => set({ taskHistory: [] }),

  // Tools
  tools: DEFAULT_TOOLS,
  setTools: (tools) => set({ tools }),
  toggleTool: (toolName) =>
    set((prev) => ({
      tools: prev.tools.map((t) =>
        t.name === toolName ? { ...t, enabled: !t.enabled } : t
      ),
    })),

  // Streaming output
  streamingOutput: [],
  addStreamingOutput: (content) =>
    set((prev) => ({
      streamingOutput: [...prev.streamingOutput, content],
    })),
  clearStreamingOutput: () => set({ streamingOutput: [] }),
}));
