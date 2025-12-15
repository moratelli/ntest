import { useSimulationStore } from "@/features/simulation/store/useSimulationStore";
import { memo, useCallback, useMemo, useRef } from "react";
import { useCanvasInteraction } from "../hooks/useCanvasInteraction";
import { useCanvasRenderer } from "../hooks/useCanvasRenderer";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { useGridStore } from "../store/useGridStore";

export const GridCanvas = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const currentState = useSimulationStore((state) => state.currentState);
  const toggleCell = useSimulationStore((state) => state.toggleCell);
  const { panX, panY, zoom, cellSize, adjustPan, adjustZoom } = useGridStore();

  const { isSpacePressed } = useKeyboardControls();

  useCanvasRenderer({
    canvasRef,
    currentState,
    panX,
    panY,
    zoom,
    cellSize,
  });

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    getCursorClass,
  } = useCanvasInteraction({
    canvasRef,
    isSpacePressed,
    panX,
    panY,
    zoom,
    cellSize,
    onPan: adjustPan,
    onCellToggle: toggleCell,
  });

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      const rect = canvasRef.current!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
      adjustZoom(zoomDelta, mouseX, mouseY);
    },
    [adjustZoom]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      e.preventDefault();
    },
    []
  );

  const aliveCount = useMemo(
    () => currentState?.alive.length || 0,
    [currentState]
  );

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={`Conway's Game of Life grid with ${aliveCount} alive cells`}
      aria-live="polite"
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      className={`size-full touch-none ${getCursorClass()}`}
    />
  );
});

GridCanvas.displayName = "GridCanvas";
