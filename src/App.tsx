import { useCallback, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { KeyboardShortcutsHelp } from "./components/KeyboardShortcutsHelp";
import { SimulationControls } from "./features/controls/components/SimulationControls";
import { GridCanvas } from "./features/grid/components/GridCanvas";
import { useGridStore } from "./features/grid/store/useGridStore";
import { useSimulationStore } from "./features/simulation/store/useSimulationStore";
import { BoardUploader } from "./features/upload/components/BoardUploader";
import { useGlobalKeyboardShortcuts } from "./hooks/useGlobalKeyboardShortcuts";

const AppContent = () => {
  const restoreSession = useSimulationStore((state) => state.restoreSession);
  const reset = useSimulationStore((state) => state.reset);
  const step = useSimulationStore((state) => state.step);
  const setRunning = useSimulationStore((state) => state.setRunning);
  const isRunning = useSimulationStore((state) => state.isRunning);
  const sessionId = useSimulationStore((state) => state.sessionId);
  const adjustZoom = useGridStore((state) => state.adjustZoom);

  useEffect(() => {
    restoreSession().catch(() => {
      toast.error("Failed to restore previous session");
    });
  }, [restoreSession]);

  const handlePlayPause = useCallback(() => {
    if (!sessionId) return;
    setRunning(!isRunning);
  }, [sessionId, isRunning, setRunning]);

  const handleStep = useCallback(async () => {
    if (!sessionId) return;
    await step();
  }, [sessionId, step]);

  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handleZoomIn = useCallback(() => {
    adjustZoom(0.2, window.innerWidth / 2, window.innerHeight / 2);
  }, [adjustZoom]);

  const handleZoomOut = useCallback(() => {
    adjustZoom(-0.2, window.innerWidth / 2, window.innerHeight / 2);
  }, [adjustZoom]);

  useGlobalKeyboardShortcuts({
    onPlayPause: handlePlayPause,
    onStep: handleStep,
    onReset: handleReset,
    onZoomIn: handleZoomIn,
    onZoomOut: handleZoomOut,
    disabled: !sessionId,
  });

  return (
    <div className="flex h-screen flex-col bg-bg-primary">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#2a2a2a",
            color: "#fff",
            border: "1px solid #444",
          },
          success: {
            iconTheme: {
              primary: "#00ff00",
              secondary: "#2a2a2a",
            },
          },
          error: {
            iconTheme: {
              primary: "#ff4444",
              secondary: "#2a2a2a",
            },
          },
        }}
      />

      <header className="border-b-2 border-border bg-bg-secondary p-4">
        <h1 className="m-0 text-center font-mono text-2xl text-primary">
          Conway's Game of Life
        </h1>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <GridCanvas />
        <KeyboardShortcutsHelp />

        <aside className="absolute left-4 top-4 z-10 flex max-h-[calc(100%-32px)] w-[300px] flex-col gap-4 overflow-y-auto rounded-lg border-2 border-border bg-bg-primary/95 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <BoardUploader />
          <SimulationControls />
        </aside>
      </main>
    </div>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};
