import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGlobalKeyboardShortcuts } from "../useGlobalKeyboardShortcuts";

describe("useGlobalKeyboardShortcuts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call onPlayPause when Space is pressed", () => {
    const onPlayPause = vi.fn();

    renderHook(() =>
      useGlobalKeyboardShortcuts({
        onPlayPause,
      })
    );

    const event = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(event);

    expect(onPlayPause).toHaveBeenCalledTimes(1);
  });

  it("should call onStep when S is pressed", () => {
    const onStep = vi.fn();

    renderHook(() =>
      useGlobalKeyboardShortcuts({
        onStep,
      })
    );

    const event = new KeyboardEvent("keydown", { key: "s" });
    document.dispatchEvent(event);

    expect(onStep).toHaveBeenCalledTimes(1);
  });

  it("should call onReset when R is pressed", () => {
    const onReset = vi.fn();

    renderHook(() =>
      useGlobalKeyboardShortcuts({
        onReset,
      })
    );

    const event = new KeyboardEvent("keydown", { key: "r" });
    document.dispatchEvent(event);

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("should call onZoomIn when + or = is pressed", () => {
    const onZoomIn = vi.fn();

    renderHook(() =>
      useGlobalKeyboardShortcuts({
        onZoomIn,
      })
    );

    let event = new KeyboardEvent("keydown", { key: "+" });
    document.dispatchEvent(event);
    expect(onZoomIn).toHaveBeenCalledTimes(1);

    event = new KeyboardEvent("keydown", { key: "=" });
    document.dispatchEvent(event);
    expect(onZoomIn).toHaveBeenCalledTimes(2);
  });

  it("should call onZoomOut when - is pressed", () => {
    const onZoomOut = vi.fn();

    renderHook(() =>
      useGlobalKeyboardShortcuts({
        onZoomOut,
      })
    );

    const event = new KeyboardEvent("keydown", { key: "-" });
    document.dispatchEvent(event);

    expect(onZoomOut).toHaveBeenCalledTimes(1);
  });

  it("should not call handlers when disabled", () => {
    const onPlayPause = vi.fn();
    const onStep = vi.fn();

    renderHook(() =>
      useGlobalKeyboardShortcuts({
        onPlayPause,
        onStep,
        disabled: true,
      })
    );

    const event1 = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(event1);

    const event2 = new KeyboardEvent("keydown", { key: "s" });
    document.dispatchEvent(event2);

    expect(onPlayPause).not.toHaveBeenCalled();
    expect(onStep).not.toHaveBeenCalled();
  });

  it("should ignore events from input elements", () => {
    const onStep = vi.fn();
    const input = document.createElement("input");
    document.body.appendChild(input);

    renderHook(() =>
      useGlobalKeyboardShortcuts({
        onStep,
      })
    );

    const event = new KeyboardEvent("keydown", {
      key: "s",
      bubbles: true,
    });
    Object.defineProperty(event, "target", {
      value: input,
      enumerable: true,
    });
    document.dispatchEvent(event);

    expect(onStep).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it("should cleanup listeners on unmount", () => {
    const onPlayPause = vi.fn();
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() =>
      useGlobalKeyboardShortcuts({
        onPlayPause,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
  });

  it("should handle uppercase keys", () => {
    const onStep = vi.fn();

    renderHook(() =>
      useGlobalKeyboardShortcuts({
        onStep,
      })
    );

    const event = new KeyboardEvent("keydown", { key: "S" });
    document.dispatchEvent(event);

    expect(onStep).toHaveBeenCalledTimes(1);
  });
});
