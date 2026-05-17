import { useEffect, useCallback } from "react";
import { apiClient } from "../services/api";
import { useStore } from "../store/taskStore";

export const useTaskHistory = () => {
  const { taskHistory, loadHistory, addTaskToHistory } = useStore();

  const fetchHistory = useCallback(async (skip: number = 0, limit: number = 50) => {
    try {
      const response = await apiClient.getHistory(skip, limit);
      loadHistory(response.tasks);
      return response;
    } catch (error) {
      console.error("Error fetching history:", error);
      throw error;
    }
  }, [loadHistory]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await apiClient.deleteTask(taskId);
      // Refresh history after deletion
      await fetchHistory();
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }, [fetchHistory]);

  const clearAllHistory = useCallback(async () => {
    try {
      await apiClient.clearHistory();
      loadHistory([]);
    } catch (error) {
      console.error("Error clearing history:", error);
      throw error;
    }
  }, [loadHistory]);

  // Load history on component mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    taskHistory,
    fetchHistory,
    deleteTask,
    clearAllHistory,
  };
};
