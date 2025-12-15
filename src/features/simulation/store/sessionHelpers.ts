import type { BoardState } from "@/engine/types";
import { useGridStore } from "@/features/grid/store/useGridStore";
import type { PersistedState } from "@/persistence/IndexedDBAdapter";

/**
 * Gets current grid state (zoom, pan) for persistence
 */
export const getGridStateForSave = () => {
  const gridState = useGridStore.getState();
  return {
    panX: gridState.panX,
    panY: gridState.panY,
    zoom: gridState.zoom,
  };
};

/**
 * Creates session data object for saving
 */
export const createSessionData = (
  sessionId: string,
  state: BoardState,
  generation: number
): PersistedState => ({
  sessionId,
  state,
  generation,
  timestamp: Date.now(),
  gridState: getGridStateForSave(),
});

/**
 * Restores grid state from persisted session
 */
export const restoreGridState = (
  gridState: { panX: number; panY: number; zoom: number } | undefined
) => {
  if (gridState) {
    const gridStore = useGridStore.getState();
    gridStore.setPan(gridState.panX, gridState.panY);
    gridStore.setZoom(gridState.zoom);
  }
};
