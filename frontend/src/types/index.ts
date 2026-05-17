export interface Task {
  id: string;
  input: string;
  plan: string;
  tool: string;
  output: string;
  timestamp: string;
  status: "completed" | "failed" | "running";
}

export interface TaskUpdate {
  type: "plan" | "tool" | "output" | "error" | "status" | "complete" | "pong";
  content: string;
  taskId?: string;
  savedId?: string;
  timestamp?: string;
}

export interface Tool {
  name: string;
  enabled: boolean;
  description: string;
}

export interface HistoryResponse {
  tasks: Task[];
  total: number;
}

export interface ExecutionState {
  isRunning: boolean;
  currentTaskId?: string;
  plan: string;
  tool: string;
  output: string;
  error?: string;
}

export interface StoreState {
  activeTab: "chat" | "dashboard";
  setActiveTab: (tab: "chat" | "dashboard") => void;
  
  currentExecution: ExecutionState;
  setCurrentExecution: (state: Partial<ExecutionState>) => void;
  resetExecution: () => void;
  
  taskHistory: Task[];
  addTaskToHistory: (task: Task) => void;
  loadHistory: (tasks: Task[]) => void;
  clearLocalHistory: () => void;
  
  tools: Tool[];
  setTools: (tools: Tool[]) => void;
  toggleTool: (toolName: string) => void;
  
  streamingOutput: string[];
  addStreamingOutput: (content: string) => void;
  clearStreamingOutput: () => void;
}
