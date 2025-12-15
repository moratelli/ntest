import { useState } from "react";
import { screenToGrid, type RenderConfig } from "../utils/canvasRenderer";

interface UseCanvasInteractionProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isSpacePressed: boolean;
  panX: number;
  panY: number;
  zoom: number;
  cellSize: number;
  onPan: (deltaX: number, deltaY: number) => void;
  onCellToggle: (x: number, y: number) => void;
}

interface UseCanvasInteractionResult {
  isDragging: boolean;
  isPanning: boolean;
  isDrawing: boolean;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: () => void;
  handleMouseLeave: () => void;
  getCursorClass: () => string;
}

/**
 * Custom hook to manage canvas mouse interactions (drawing, panning)
 */
export const useCanvasInteraction = ({
  canvasRef,
  isSpacePressed,
  panX,
  panY,
  zoom,
  cellSize,
  onPan,
  onCellToggle,
}: UseCanvasInteractionProps): UseCanvasInteractionResult => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastDrawnCell, setLastDrawnCell] = useState<[number, number] | null>(
    null
  );

  const getCellAtPosition = (
    clientX: number,
    clientY: number
  ): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const config: RenderConfig = {
      panX,
      panY,
      zoom,
      cellSize,
      width: rect.width,
      height: rect.height,
    };

    return screenToGrid(mouseX, mouseY, config);
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
    else if (e.button === 0 && !isSpacePressed) {
      setIsDrawing(true);
      setIsPanning(false);

      const cell = getCellAtPosition(e.clientX, e.clientY);
      if (cell) {
        setLastDrawnCell(cell);
        onCellToggle(cell[0], cell[1]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    if (isPanning) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      onPan(deltaX, deltaY);
      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isDrawing) {
      const cell = getCellAtPosition(e.clientX, e.clientY);

      if (cell && lastDrawnCell) {
        const [lastX, lastY] = lastDrawnCell;
        const [currentX, currentY] = cell;

        // Only toggle if we moved to a different cell
        if (lastX !== currentX || lastY !== currentY) {
          onCellToggle(currentX, currentY);
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

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsPanning(false);
    setIsDrawing(false);
    setLastDrawnCell(null);
  };

  const getCursorClass = () => {
    if (isSpacePressed || isPanning) return "cursor-move";
    if (isDrawing) return "cursor-crosshair";
    return "cursor-crosshair";
  };

  return {
    isDragging,
    isPanning,
    isDrawing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    getCursorClass,
  };
};
