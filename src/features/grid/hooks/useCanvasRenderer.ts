import type { BoardState } from "@/engine/types";
import { useEffect } from "react";
import {
  calculateVisibleBounds,
  clearCanvas,
  renderCells,
  renderEmptyState,
  renderGrid,
  type RenderConfig,
} from "../utils/canvasRenderer";

interface UseCanvasRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentState: BoardState | null;
  panX: number;
  panY: number;
  zoom: number;
  cellSize: number;
}

/**
 * Custom hook to handle canvas rendering with proper separation of concerns
 */
export const useCanvasRenderer = ({
  canvasRef,
  currentState,
  panX,
  panY,
  zoom,
  cellSize,
}: UseCanvasRendererProps): void => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Setup high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Create render configuration
    const config: RenderConfig = {
      panX,
      panY,
      zoom,
      cellSize,
      width: rect.width,
      height: rect.height,
    };

    // Clear canvas
    clearCanvas(ctx, rect.width, rect.height);

    // Render empty state if no board
    if (!currentState) {
      renderEmptyState(ctx, rect.width, rect.height);
      return;
    }

    // Calculate visible bounds for culling
    const bounds = calculateVisibleBounds(config);

    // Render grid and cells
    renderGrid(ctx, bounds, config);
    renderCells(ctx, currentState, config);
  }, [canvasRef, currentState, panX, panY, zoom, cellSize]);
};
