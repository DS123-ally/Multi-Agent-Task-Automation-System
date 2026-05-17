import { useEffect, useRef, useCallback } from "react";
import { apiClient } from "../services/api";
import { useStore } from "../store/taskStore";
import type { Task, TaskUpdate } from "../types";

export const useWebSocket = () => {
  const clientIdRef = useRef(`client-${Date.now()}`);
  const { setCurrentExecution, addTaskToHistory, addStreamingOutput } = useStore();
  const isConnectingRef = useRef(false);

  const handleWebSocketMessage = useCallback((message: TaskUpdate) => {
    console.log("📨 WebSocket message:", message.type, message.content);

    switch (message.type) {
      case "plan":
        setCurrentExecution({ plan: message.content });
        addStreamingOutput(`📋 Plan: ${message.content}`);
        break;

      case "tool":
        setCurrentExecution({ tool: message.content });
        addStreamingOutput(`🛠️ Tool: ${message.content}`);
        break;

      case "output":
        setCurrentExecution({ output: message.content });
        addStreamingOutput(`✅ Output: ${message.content}`);
        break;

      case "error":
        setCurrentExecution({
          error: message.content,
          isRunning: false,
        });
        addStreamingOutput(`❌ Error: ${message.content}`);
        break;

      case "complete":
        const state = useStore.getState();
        const newTask: Task = {
          id: message.savedId || message.taskId || Date.now().toString(),
          input: state.currentExecution.tool || "", // We need to store input separately
          plan: state.currentExecution.plan,
          tool: state.currentExecution.tool,
          output: state.currentExecution.output,
          timestamp: new Date().toISOString(),
          status: "completed",
        };
        addTaskToHistory(newTask);
        setCurrentExecution({ isRunning: false });
        break;

      case "status":
        if (message.content === "Task started") {
          setCurrentExecution({ isRunning: true });
        }
        break;

      case "pong":
        // Keep-alive response
        break;

      default:
        console.warn("Unknown message type:", message.type);
    }
  }, [setCurrentExecution, addTaskToHistory, addStreamingOutput]);

  const handleWebSocketError = useCallback((error: string) => {
    console.error("❌ WebSocket error:", error);
    setCurrentExecution({ error, isRunning: false });
    addStreamingOutput(`❌ Connection error: ${error}`);
  }, [setCurrentExecution, addStreamingOutput]);

  const handleWebSocketClose = useCallback(() => {
    console.log("🔌 WebSocket closed");
    isConnectingRef.current = false;
  }, []);

  const connect = useCallback(() => {
    if (!isConnectingRef.current) {
      isConnectingRef.current = true;
      apiClient.connectWebSocket(
        clientIdRef.current,
        handleWebSocketMessage,
        handleWebSocketError,
        handleWebSocketClose
      );
    }
  }, [handleWebSocketMessage, handleWebSocketError, handleWebSocketClose]);

  const disconnect = useCallback(() => {
    apiClient.disconnectWebSocket();
    isConnectingRef.current = false;
  }, []);

  const sendTask = useCallback((input: string) => {
    if (apiClient.isWebSocketConnected()) {
      setCurrentExecution({
        isRunning: true,
        plan: "",
        tool: "",
        output: "",
        error: undefined,
      });
      apiClient.sendTaskToWebSocket(input);
    } else {
      const error = "WebSocket not connected. Reconnecting...";
      setCurrentExecution({ error });
      connect();
      // Retry after connection
      setTimeout(() => {
        apiClient.sendTaskToWebSocket(input);
      }, 1000);
    }
  }, [setCurrentExecution, connect]);

  // Auto-reconnect on mount
  useEffect(() => {
    connect();
    const keepAliveInterval = setInterval(() => {
      apiClient.sendPing();
    }, 30000); // Ping every 30 seconds

    return () => {
      clearInterval(keepAliveInterval);
      disconnect();
    };
  }, [connect, disconnect]);

  return { connect, disconnect, sendTask, clientId: clientIdRef.current };
};
