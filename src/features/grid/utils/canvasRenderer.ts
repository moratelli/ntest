import type { BoardState } from "@/engine/types";

export interface RenderConfig {
  panX: number;
  panY: number;
  zoom: number;
  cellSize: number;
  width: number;
  height: number;
}

export interface VisibleBounds {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
}

/**
 * Calculate visible grid bounds for viewport culling
 */
export const calculateVisibleBounds = (config: RenderConfig): VisibleBounds => {
  const scaledCellSize = config.cellSize * config.zoom;

  return {
    startX: Math.floor(-config.panX / scaledCellSize) - 1,
    endX: Math.ceil((config.width - config.panX) / scaledCellSize) + 1,
    startY: Math.floor(-config.panY / scaledCellSize) - 1,
    endY: Math.ceil((config.height - config.panY) / scaledCellSize) + 1,
  };
};

/**
 * Check if cell is within visible viewport
 */
export const isCellVisible = (
  x: number,
  y: number,
  config: RenderConfig
): boolean => {
  const scaledCellSize = config.cellSize * config.zoom;
  const screenX = config.panX + x * scaledCellSize;
  const screenY = config.panY + y * scaledCellSize;

  return (
    screenX + scaledCellSize >= 0 &&
    screenX <= config.width &&
    screenY + scaledCellSize >= 0 &&
    screenY <= config.height
  );
};

/**
 * Convert screen coordinates to grid coordinates
 */
export const screenToGrid = (
  screenX: number,
  screenY: number,
  config: RenderConfig
): [number, number] => {
  const scaledCellSize = config.cellSize * config.zoom;
  const gridX = Math.floor((screenX - config.panX) / scaledCellSize);
  const gridY = Math.floor((screenY - config.panY) / scaledCellSize);

  return [gridX, gridY];
};

/**
 * Render grid lines for visible area
 */
export const renderGrid = (
  ctx: CanvasRenderingContext2D,
  bounds: VisibleBounds,
  config: RenderConfig
): void => {
  const scaledCellSize = config.cellSize * config.zoom;

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;

  // Vertical lines
  for (let x = bounds.startX; x <= bounds.endX; x++) {
    const screenX = config.panX + x * scaledCellSize;
    ctx.beginPath();
    ctx.moveTo(screenX, 0);
    ctx.lineTo(screenX, config.height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = bounds.startY; y <= bounds.endY; y++) {
    const screenY = config.panY + y * scaledCellSize;
    ctx.beginPath();
    ctx.moveTo(0, screenY);
    ctx.lineTo(config.width, screenY);
    ctx.stroke();
  }
};

/**
 * Render alive cells with viewport culling
 */
export const renderCells = (
  ctx: CanvasRenderingContext2D,
  state: BoardState,
  config: RenderConfig
): void => {
  const scaledCellSize = config.cellSize * config.zoom;

  ctx.fillStyle = "#00ff00";

  for (const [x, y] of state.alive) {
    if (!isCellVisible(x, y, config)) continue;

    const screenX = config.panX + x * scaledCellSize;
    const screenY = config.panY + y * scaledCellSize;

    ctx.fillRect(screenX, screenY, scaledCellSize, scaledCellSize);
  }
};

/**
 * Render empty state message
 */
export const renderEmptyState = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  ctx.fillStyle = "#666";
  ctx.font = "16px monospace";
  ctx.textAlign = "center";
  ctx.fillText("Upload a board state to begin", width / 2, height / 2);
};

/**
 * Clear and prepare canvas with background
 */
export const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): void => {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, width, height);
};
