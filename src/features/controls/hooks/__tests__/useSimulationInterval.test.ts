import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSimulationInterval } from "../useSimulationInterval";

describe("useSimulationInterval", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not start interval when not running", () => {
    const onTick = vi.fn();

    renderHook(() =>
      useSimulationInterval({
        isRunning: false,
        sessionId: "test-session",
        speedDelayMs: 100,
        onTick,
      })
    );

    vi.advanceTimersByTime(200);

    expect(onTick).not.toHaveBeenCalled();
  });

  it("should not start interval when no session", () => {
    const onTick = vi.fn();

    renderHook(() =>
      useSimulationInterval({
        isRunning: true,
        sessionId: null,
        speedDelayMs: 100,
        onTick,
      })
    );

    vi.advanceTimersByTime(200);

    expect(onTick).not.toHaveBeenCalled();
  });

  it("should call onTick at correct intervals when running", () => {
    const onTick = vi.fn();

    renderHook(() =>
      useSimulationInterval({
        isRunning: true,
        sessionId: "test-session",
        speedDelayMs: 100,
        onTick,
      })
    );

    expect(onTick).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(onTick).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(onTick).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(100);
    expect(onTick).toHaveBeenCalledTimes(3);
  });

  it("should stop interval when isRunning changes to false", () => {
    const onTick = vi.fn();

    const { rerender } = renderHook(
      ({ isRunning }) =>
        useSimulationInterval({
          isRunning,
          sessionId: "test-session",
          speedDelayMs: 100,
          onTick,
        }),
      { initialProps: { isRunning: true } }
    );

    vi.advanceTimersByTime(100);
    expect(onTick).toHaveBeenCalledTimes(1);

    rerender({ isRunning: false });

    vi.advanceTimersByTime(200);
    expect(onTick).toHaveBeenCalledTimes(1); // No new calls
  });

  it("should adjust speed when speedDelayMs changes", () => {
    const onTick = vi.fn();

    const { rerender } = renderHook(
      ({ speedDelayMs }) =>
        useSimulationInterval({
          isRunning: true,
          sessionId: "test-session",
          speedDelayMs,
          onTick,
        }),
      { initialProps: { speedDelayMs: 100 } }
    );

    vi.advanceTimersByTime(100);
    expect(onTick).toHaveBeenCalledTimes(1);

    rerender({ speedDelayMs: 200 });

    vi.advanceTimersByTime(100);
    expect(onTick).toHaveBeenCalledTimes(1); // Still 1, new interval needs 200ms

    vi.advanceTimersByTime(100);
    expect(onTick).toHaveBeenCalledTimes(2); // Now called at 200ms
  });

  it("should cleanup interval on unmount", () => {
    const onTick = vi.fn();

    const { unmount } = renderHook(() =>
      useSimulationInterval({
        isRunning: true,
        sessionId: "test-session",
        speedDelayMs: 100,
        onTick,
      })
    );

    vi.advanceTimersByTime(100);
    expect(onTick).toHaveBeenCalledTimes(1);

    unmount();

    vi.advanceTimersByTime(200);
    expect(onTick).toHaveBeenCalledTimes(1); // No new calls after unmount
  });
});
