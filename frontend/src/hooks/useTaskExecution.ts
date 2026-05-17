import { useCallback } from "react";
import { useStore } from "../store/taskStore";
import { useWebSocket } from "./useWebSocket";

export const useTaskExecution = () => {
  const { sendTask } = useWebSocket();
  const {
    currentExecution,
    setCurrentExecution,
    clearStreamingOutput,
    resetExecution,
  } = useStore();

  const executeTask = useCallback(
    async (input: string) => {
      if (!input.trim()) {
        setCurrentExecution({ error: "Please enter a task" });
        return;
      }

      clearStreamingOutput();
      resetExecution();
      setCurrentExecution({ isRunning: true });

      try {
        sendTask(input);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        setCurrentExecution({
          error: errorMsg,
          isRunning: false,
        });
      }
    },
    [sendTask, setCurrentExecution, clearStreamingOutput, resetExecution]
  );

  const cancelTask = useCallback(() => {
    setCurrentExecution({ isRunning: false });
  }, [setCurrentExecution]);

  return {
    ...currentExecution,
    executeTask,
    cancelTask,
  };
};
