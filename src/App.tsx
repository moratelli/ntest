import { useEffect } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SimulationControls } from "./features/controls/components/SimulationControls";
import { GridCanvas } from "./features/grid/components/GridCanvas";
import { useSimulationStore } from "./features/simulation/store/useSimulationStore";
import { BoardUploader } from "./features/upload/components/BoardUploader";

const AppContent = () => {
  const restoreSession = useSimulationStore((state) => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <div className="flex h-screen flex-col bg-bg-primary">
      <header className="border-b-2 border-border bg-bg-secondary p-4">
        <h1 className="m-0 text-center font-mono text-2xl text-primary">
          Conway's Game of Life
        </h1>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <GridCanvas />

        <aside className="absolute left-4 top-4 z-10 flex w-[300px] max-h-[calc(100%-32px)] flex-col gap-4 overflow-y-auto rounded-lg border-2 border-border bg-bg-primary/95 p-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
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
