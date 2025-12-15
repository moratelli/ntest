import { useSimulationStore } from "@/features/simulation/store/useSimulationStore";
import { useEffect, useRef, useState } from "react";
import { useGridStore } from "../store/useGridStore";

export const GridCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

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

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      setHasMoved(true);
      adjustPan(deltaX, deltaY);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!hasMoved && currentState) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const scaledCellSize = cellSize * zoom;
      const gridX = Math.floor((mouseX - panX) / scaledCellSize);
      const gridY = Math.floor((mouseY - panY) / scaledCellSize);

      toggleCell(gridX, gridY);
    }

    setIsDragging(false);
    setHasMoved(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
    adjustZoom(zoomDelta, mouseX, mouseY);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsDragging(false);
        setHasMoved(false);
      }}
      onWheel={handleWheel}
      className={`h-full w-full touch-none ${
        isDragging ? "cursor-move" : "cursor-pointer"
      }`}
    />
  );
};
