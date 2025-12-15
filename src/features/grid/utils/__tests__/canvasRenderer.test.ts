import type { BoardState } from "@/engine/types";
import { describe, expect, it, vi } from "vitest";
import {
  calculateVisibleBounds,
  isCellVisible,
  renderCells,
  renderGrid,
  screenToGrid,
  type RenderConfig,
} from "../canvasRenderer";

describe("canvasRenderer", () => {
  const mockConfig: RenderConfig = {
    panX: 0,
    panY: 0,
    zoom: 1,
    cellSize: 20,
    width: 800,
    height: 600,
  };

  describe("calculateVisibleBounds", () => {
    it("should calculate correct bounds at origin", () => {
      const bounds = calculateVisibleBounds(mockConfig);

      expect(bounds).toEqual({
        startX: -1,
        endX: 41,
        startY: -1,
        endY: 31,
      });
    });

    it("should adjust bounds when panned", () => {
      const config = { ...mockConfig, panX: 100, panY: 50 };
      const bounds = calculateVisibleBounds(config);

      expect(bounds.startX).toBeLessThan(0);
      expect(bounds.endX).toBeGreaterThan(0);
    });

    it("should adjust bounds when zoomed", () => {
      const config = { ...mockConfig, zoom: 2 };
      const bounds = calculateVisibleBounds(config);

      // At 2x zoom, fewer cells are visible
      expect(bounds.endX - bounds.startX).toBeLessThan(
        41 - -1 // Original bounds at 1x zoom
      );
    });
  });

  describe("isCellVisible", () => {
    it("should return true for cells within viewport", () => {
      expect(isCellVisible(10, 10, mockConfig)).toBe(true);
    });

    it("should return false for cells far outside viewport", () => {
      expect(isCellVisible(1000, 1000, mockConfig)).toBe(false);
      expect(isCellVisible(-1000, -1000, mockConfig)).toBe(false);
    });

    it("should handle edge cases at viewport boundaries", () => {
      expect(isCellVisible(0, 0, mockConfig)).toBe(true);
      expect(isCellVisible(39, 29, mockConfig)).toBe(true);
    });
  });

  describe("screenToGrid", () => {
    it("should convert screen coordinates to grid at origin", () => {
      const [gridX, gridY] = screenToGrid(100, 100, mockConfig);

      expect(gridX).toBe(5); // 100 / 20 = 5
      expect(gridY).toBe(5);
    });

    it("should handle panning offset", () => {
      const config = { ...mockConfig, panX: 50, panY: 50 };
      const [gridX, gridY] = screenToGrid(100, 100, config);

      expect(gridX).toBe(2); // (100 - 50) / 20 = 2.5 -> floor = 2
      expect(gridY).toBe(2);
    });

    it("should handle zoom scaling", () => {
      const config = { ...mockConfig, zoom: 2 };
      const [gridX, gridY] = screenToGrid(100, 100, config);

      // At 2x zoom, cells are 40px, so 100/40 = 2.5 -> floor = 2
      expect(gridX).toBe(2);
      expect(gridY).toBe(2);
    });

    it("should handle negative coordinates", () => {
      const config = { ...mockConfig, panX: -100, panY: -100 };
      const [gridX, gridY] = screenToGrid(50, 50, config);

      expect(gridX).toBe(7); // (50 - (-100)) / 20 = 7.5 -> floor = 7
      expect(gridY).toBe(7);
    });
  });

  describe("renderGrid", () => {
    it("should call correct canvas methods", () => {
      const mockCtx = {
        strokeStyle: "",
        lineWidth: 0,
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      const bounds = { startX: 0, endX: 10, startY: 0, endY: 10 };

      renderGrid(mockCtx, bounds, mockConfig);

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalled();
      expect(mockCtx.lineTo).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
      expect(mockCtx.strokeStyle).toBe("#333");
      expect(mockCtx.lineWidth).toBe(1);
    });
  });

  describe("renderCells", () => {
    it("should only render visible cells", () => {
      const mockCtx = {
        fillStyle: "",
        fillRect: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      const state: BoardState = {
        alive: [
          [0, 0], // Visible
          [10, 10], // Visible
          [1000, 1000], // Not visible
        ],
      };

      renderCells(mockCtx, state, mockConfig);

      // Should only call fillRect for visible cells
      expect(mockCtx.fillRect).toHaveBeenCalledTimes(2);
      expect(mockCtx.fillStyle).toBe("#00ff00");
    });

    it("should handle empty state", () => {
      const mockCtx = {
        fillStyle: "",
        fillRect: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      const state: BoardState = { alive: [] };

      renderCells(mockCtx, state, mockConfig);

      expect(mockCtx.fillRect).not.toHaveBeenCalled();
    });
  });
});
