import { GLIDER } from "@/engine/examples";
import type { BoardState } from "@/engine/types";
import { sessionManager } from "@/persistence/SessionManager";
import { workerBridge } from "@/services/WorkerBridge";
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
      },

      step: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

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
      },

      jump: async (generations: number) => {
        const { sessionId } = get();
        if (!sessionId) return;

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
      },

      resolve: async () => {
        const { sessionId } = get();
        if (!sessionId) return;

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
        } catch (error) {
          set({ isResolving: false });
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
        if (!currentState || !sessionId) return;

        const cellExists = currentState.alive.some(
          ([cx, cy]) => cx === x && cy === y
        );

        const newAlive = cellExists
          ? currentState.alive.filter(([cx, cy]) => !(cx === x && cy === y))
          : [...currentState.alive, [x, y] as [number, number]];

        const newState: BoardState = { alive: newAlive };

        workerBridge.upload(newState).then((response) => {
          set({
            sessionId: response.sessionId,
            currentState: response.state,
            generation: 0,
          });

          const saveData = {
            sessionId: response.sessionId,
            state: response.state,
            generation: 0,
            timestamp: Date.now(),
          };

          if (isRunning) {
            sessionManager.scheduleSave(saveData, 500);
          } else {
            sessionManager.saveNow(saveData);
          }
        });
      },
    }),
    { name: "SimulationStore" }
  )
);
