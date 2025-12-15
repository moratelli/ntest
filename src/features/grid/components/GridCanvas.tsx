import { useSimulationStore } from "@/features/simulation/store/useSimulationStore";
import { useRef } from "react";
import { useCanvasInteraction } from "../hooks/useCanvasInteraction";
import { useCanvasRenderer } from "../hooks/useCanvasRenderer";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import { useGridStore } from "../store/useGridStore";

export const GridCanvas = () => {
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

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    adjustZoom(zoomDelta, mouseX, mouseY);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      className={`h-full w-full touch-none ${getCursorClass()}`}
    />
  );
};
