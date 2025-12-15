import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface GridState {
  panX: number;
  panY: number;
  zoom: number;
  minZoom: number;
  cellSize: number;
}

interface GridActions {
  setPan: (x: number, y: number) => void;
  adjustPan: (deltaX: number, deltaY: number) => void;
  setZoom: (zoom: number) => void;
  adjustZoom: (delta: number, centerX: number, centerY: number) => void;
  reset: () => void;
}

type GridStore = GridState & GridActions;

const INITIAL_STATE: GridState = {
  panX: 400,
  panY: 250,
  zoom: 1,
  minZoom: 0.1,
  cellSize: 20,
};

export const useGridStore = create<GridStore>()(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,

      setPan: (x: number, y: number) => {
        set({ panX: x, panY: y });
      },

      adjustPan: (deltaX: number, deltaY: number) => {
        set((state) => ({
          panX: state.panX + deltaX,
          panY: state.panY + deltaY,
        }));
      },

      setZoom: (zoom: number) => {
        const { minZoom } = get();
        set({ zoom: Math.max(minZoom, Math.min(zoom, 4)) });
      },

      adjustZoom: (delta: number, centerX: number, centerY: number) => {
        const { zoom, minZoom, panX, panY } = get();
        const oldZoom = zoom;
        const newZoom = Math.max(minZoom, Math.min(oldZoom + delta, 4));

        if (newZoom !== oldZoom) {
          const zoomRatio = newZoom / oldZoom;
          const newPanX = centerX - (centerX - panX) * zoomRatio;
          const newPanY = centerY - (centerY - panY) * zoomRatio;

          set({
            zoom: newZoom,
            panX: newPanX,
            panY: newPanY,
          });
        }
      },

      reset: () => {
        set(INITIAL_STATE);
      },
    }),
    { name: "GridStore" }
  )
);
