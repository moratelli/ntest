import { useSimulationStore } from "@/features/simulation/store/useSimulationStore";
import { useEffect, useRef, useState } from "react";
import { useGridStore } from "../store/useGridStore";

export const GridCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastDrawnCell, setLastDrawnCell] = useState<[number, number] | null>(
    null
  );

  const currentState = useSimulationStore((state) => state.currentState);
  const toggleCell = useSimulationStore((state) => state.toggleCell);
  const { panX, panY, zoom, cellSize, adjustPan, adjustZoom } = useGridStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, rect.width, rect.height);

    if (!currentState) {
      ctx.fillStyle = "#666";
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        "Upload a board state to begin",
        rect.width / 2,
        rect.height / 2
      );
      return;
    }

    const scaledCellSize = cellSize * zoom;

    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;

    const startX = Math.floor(-panX / scaledCellSize) - 1;
    const endX = Math.ceil((rect.width - panX) / scaledCellSize) + 1;
    const startY = Math.floor(-panY / scaledCellSize) - 1;
    const endY = Math.ceil((rect.height - panY) / scaledCellSize) + 1;

    for (let x = startX; x <= endX; x++) {
      const screenX = panX + x * scaledCellSize;
      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, rect.height);
      ctx.stroke();
    }

    for (let y = startY; y <= endY; y++) {
      const screenY = panY + y * scaledCellSize;
      ctx.beginPath();
      ctx.moveTo(0, screenY);
      ctx.lineTo(rect.width, screenY);
      ctx.stroke();
    }

    ctx.fillStyle = "#00ff00";

    for (const [x, y] of currentState.alive) {
      const screenX = panX + x * scaledCellSize;
      const screenY = panY + y * scaledCellSize;

      if (
        screenX + scaledCellSize >= 0 &&
        screenX <= rect.width &&
        screenY + scaledCellSize >= 0 &&
        screenY <= rect.height
      ) {
        ctx.fillRect(screenX, screenY, scaledCellSize, scaledCellSize);
      }
    }
  }, [currentState, panX, panY, zoom, cellSize]);

  // Keyboard handlers for spacebar panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isSpacePressed) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isSpacePressed]);

  const getCellAtPosition = (
    clientX: number,
    clientY: number
  ): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const scaledCellSize = cellSize * zoom;
    const gridX = Math.floor((mouseX - panX) / scaledCellSize);
    const gridY = Math.floor((mouseY - panY) / scaledCellSize);

    return [gridX, gridY];
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });

    // Right-click or Space+Left-click = Pan mode
    if (e.button === 2 || (e.button === 0 && isSpacePressed)) {
      setIsPanning(true);
      setIsDrawing(false);
    }
    // Left-click without Space = Draw mode
    else if (e.button === 0 && !isSpacePressed && currentState) {
      setIsDrawing(true);
      setIsPanning(false);

      const cell = getCellAtPosition(e.clientX, e.clientY);
      if (cell) {
        setLastDrawnCell(cell);
        toggleCell(cell[0], cell[1]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    if (isPanning) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      adjustPan(deltaX, deltaY);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDrawing && currentState) {
      const cell = getCellAtPosition(e.clientX, e.clientY);

      if (cell && lastDrawnCell) {
        const [lastX, lastY] = lastDrawnCell;
        const [currentX, currentY] = cell;

        // Only toggle if we moved to a different cell
        if (lastX !== currentX || lastY !== currentY) {
          toggleCell(currentX, currentY);
          setLastDrawnCell(cell);
        }
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPanning(false);
    setIsDrawing(false);
    setLastDrawnCell(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    adjustZoom(zoomDelta, mouseX, mouseY);
  };

  // Prevent context menu on right-click
  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  };

  // Determine cursor based on mode
  const getCursorClass = () => {
    if (isSpacePressed || isPanning) return "cursor-move";
    if (isDrawing) return "cursor-crosshair";
    return "cursor-crosshair";
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDragging(false);
        setIsPanning(false);
        setIsDrawing(false);
        setLastDrawnCell(null);
      }}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      className={`h-full w-full touch-none ${getCursorClass()}`}
    />
  );
};
