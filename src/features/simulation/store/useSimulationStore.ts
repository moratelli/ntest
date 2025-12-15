import { GLIDER } from "@/engine/examples";
import type { BoardState } from "@/engine/types";
import { sessionManager } from "@/persistence/SessionManager";
import { workerBridge } from "@/services/WorkerBridge";
import toast from "react-hot-toast";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface SimulationState {
  sessionId: string | null;
  currentState: BoardState | null;
  generation: number;
  isRunning: boolean;
  speedDelayMs: number;
  isResolving: boolean;
}

interface SimulationActions {
  uploadState: (state: BoardState) => Promise<void>;
  step: () => Promise<void>;
  jump: (generations: number) => Promise<void>;
  resolve: () => Promise<void>;
  setRunning: (isRunning: boolean) => void;
  setSpeedDelay: (delayMs: number) => void;
  reset: () => Promise<void>;
  restoreSession: () => Promise<void>;
  downloadState: () => void;
  copyStateToClipboard: () => Promise<void>;
  toggleCell: (x: number, y: number) => void;
}

type SimulationStore = SimulationState & SimulationActions;

export const useSimulationStore = create<SimulationStore>()(
  devtools(
    (set, get) => ({
      sessionId: null,
      currentState: null,
      generation: 0,
      isRunning: false,
      speedDelayMs: 100,
      isResolving: false,

      uploadState: async (state: BoardState) => {
        try {
          const response = await workerBridge.upload(state);
          set({
            sessionId: response.sessionId,
            currentState: response.state,
            generation: 0,
            isRunning: false,
          });

          sessionManager.saveNow({
            sessionId: response.sessionId,
            state: response.state,
            generation: 0,
            timestamp: Date.now(),
          });
        } catch (error) {
          toast.error("Failed to upload state. Please try again.");
          console.error("Upload failed:", error);
          throw error;
        }
      },

      step: async () => {
        const { sessionId } = get();
        if (!sessionId) {
          toast.error("No active session. Please upload a state first.");
          return;
        }

        try {
          const response = await workerBridge.step(sessionId);
          set({
            currentState: response.state,
            generation: response.generation,
          });

          sessionManager.scheduleSave({
            sessionId,
            state: response.state,
            generation: response.generation,
            timestamp: Date.now(),
          });
        } catch (error) {
          toast.error("Failed to advance simulation. Please try again.");
          console.error("Step failed:", error);
          throw error;
        }
      },

      jump: async (generations: number) => {
        const { sessionId } = get();
        if (!sessionId) {
          toast.error("No active session. Please upload a state first.");
          return;
        }

        try {
          const response = await workerBridge.jump(sessionId, generations);
          set({
            currentState: response.state,
            generation: response.generation,
          });

          sessionManager.scheduleSave({
            sessionId,
            state: response.state,
            generation: response.generation,
            timestamp: Date.now(),
          });
        } catch (error) {
          toast.error(
            `Failed to jump ${generations} generations. Please try again.`
          );
          console.error("Jump failed:", error);
          throw error;
        }
      },

      resolve: async () => {
        const { sessionId } = get();
        if (!sessionId) {
          toast.error("No active session. Please upload a state first.");
          return;
        }

        set({ isResolving: true, isRunning: false });

        try {
          const result = await workerBridge.resolve(sessionId);
          const { generation } = get();
          const newGeneration = generation + result.generationsElapsed;

          set({
            currentState: result.finalState,
            generation: newGeneration,
            isResolving: false,
          });

          sessionManager.scheduleSave({
            sessionId,
            state: result.finalState,
            generation: newGeneration,
            timestamp: Date.now(),
          });

          toast.success(
            `Resolved to ${result.status} after ${result.generationsElapsed} generations`
          );
        } catch (error) {
          set({ isResolving: false });
          toast.error("Failed to resolve pattern. Please try again.");
          console.error("Resolve failed:", error);
          throw error;
        }
      },

      setRunning: (isRunning: boolean) => {
        set({ isRunning });
      },

      setSpeedDelay: (delayMs: number) => {
        set({ speedDelayMs: delayMs });
      },

      reset: async () => {
        try {
          const { sessionId } = get();
          if (sessionId) {
            workerBridge.deleteSession(sessionId);
          }

          // Clear all sessions from IndexedDB to ensure clean slate
          await sessionManager.deleteAllSessions();

          const response = await workerBridge.upload(GLIDER);
          set({
            sessionId: response.sessionId,
            currentState: GLIDER,
            generation: 0,
            isRunning: false,
            isResolving: false,
          });

          await sessionManager.saveNow({
            sessionId: response.sessionId,
            state: GLIDER,
            generation: 0,
            timestamp: Date.now(),
          });

          toast.success("Simulation reset to glider pattern");
        } catch (error) {
          toast.error("Failed to reset simulation. Please try again.");
          console.error("Reset failed:", error);
          throw error;
        }
      },

      restoreSession: async () => {
        const persisted = await sessionManager.loadLatestSession();
        if (persisted) {
          const response = await workerBridge.upload(persisted.state);
          set({
            sessionId: response.sessionId,
            currentState: persisted.state,
            generation: persisted.generation,
            isRunning: false,
          });
        } else {
          const response = await workerBridge.upload(GLIDER);
          set({
            sessionId: response.sessionId,
            currentState: GLIDER,
            generation: 0,
            isRunning: false,
          });
        }
      },

      downloadState: () => {
        const { currentState } = get();
        if (!currentState) return;

        const dataStr = JSON.stringify(currentState, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `gol-state-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
      },

      copyStateToClipboard: async () => {
        const { currentState } = get();
        if (!currentState) return;

        const dataStr = JSON.stringify(currentState, null, 2);
        await navigator.clipboard.writeText(dataStr);
      },

      toggleCell: (x: number, y: number) => {
        const { currentState, sessionId, isRunning } = get();
        if (!currentState || !sessionId) {
          toast.error("No active session. Please upload a state first.");
          return;
        }

        const cellExists = currentState.alive.some(
          ([cx, cy]) => cx === x && cy === y
        );

        const newAlive = cellExists
          ? currentState.alive.filter(([cx, cy]) => !(cx === x && cy === y))
          : [...currentState.alive, [x, y] as [number, number]];

        const newState: BoardState = { alive: newAlive };

        // Reuse existing sessionId to prevent bloat
        workerBridge
          .updateSession(sessionId, newState)
          .then((response) => {
            set({
              currentState: response.state,
              generation: 0,
            });

            const saveData = {
              sessionId: sessionId, // Use existing sessionId
              state: response.state,
              generation: 0,
              timestamp: Date.now(),
            };

            if (isRunning) {
              sessionManager.scheduleSave(saveData, 500);
            } else {
              sessionManager.saveNow(saveData);
            }
          })
          .catch((error) => {
            toast.error("Failed to update cell. Please try again.");
            console.error("Toggle cell failed:", error);
          });
      },
    }),
    { name: "SimulationStore" }
  )
);
