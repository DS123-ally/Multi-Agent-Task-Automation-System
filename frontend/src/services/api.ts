import axios from "axios";
import type { AxiosInstance } from "axios";
import type { Task, Tool, HistoryResponse, TaskUpdate } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || "ws://localhost:8000";

class APIClient {
  private client: AxiosInstance;
  private websocket: WebSocket | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // =====================
  // HTTP ENDPOINTS
  // =====================

  async executeTask(input: string): Promise<Task> {
    const response = await this.client.post("/api/execute-task", { input });
    return response.data;
  }

  async getHistory(skip: number = 0, limit: number = 50): Promise<HistoryResponse> {
    const response = await this.client.get("/api/history", {
      params: { skip, limit },
    });
    return response.data;
  }

  async deleteTask(taskId: string): Promise<void> {
    await this.client.delete(`/api/history/${taskId}`);
  }

  async clearHistory(): Promise<number> {
    const response = await this.client.delete("/api/history");
    return response.data.count;
  }

  async getTools(): Promise<Tool[]> {
    const response = await this.client.get("/api/tools");
    return response.data.tools;
  }

  // =====================
  // WEBSOCKET
  // =====================

  connectWebSocket(
    clientId: string,
    onMessage: (message: TaskUpdate) => void,
    onError: (error: string) => void,
    onClose: () => void
  ): void {
    try {
      const wsUrl = `${WS_BASE_URL}/ws/task-stream/${clientId}`;
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log("✅ WebSocket connected");
      };

      this.websocket.onmessage = (event) => {
        try {
          const message: TaskUpdate = JSON.parse(event.data);
          onMessage(message);
        } catch (e) {
          console.error("Error parsing WebSocket message:", e);
        }
      };

      this.websocket.onerror = (event) => {
        const errorMsg = `WebSocket error: ${event}`;
        console.error(errorMsg);
        onError(errorMsg);
      };

      this.websocket.onclose = () => {
        console.log("❌ WebSocket disconnected");
        onClose();
      };
    } catch (error) {
      const errorMsg = `Failed to connect WebSocket: ${error}`;
      console.error(errorMsg);
      onError(errorMsg);
    }
  }

  sendTaskToWebSocket(input: string): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(
        JSON.stringify({
          type: "execute",
          input,
        })
      );
    } else {
      console.error("WebSocket is not connected");
    }
  }

  sendPing(): void {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify({ type: "ping" }));
    }
  }

  disconnectWebSocket(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  isWebSocketConnected(): boolean {
    return this.websocket !== null && this.websocket.readyState === WebSocket.OPEN;
  }
}

export const apiClient = new APIClient();
