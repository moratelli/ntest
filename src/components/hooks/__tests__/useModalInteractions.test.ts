import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useModalInteractions } from "../useModalInteractions";

describe("useModalInteractions", () => {
  let modalRef: React.RefObject<HTMLDivElement>;

  beforeEach(() => {
    modalRef = { current: document.createElement("div") };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should not add listeners when modal is closed", () => {
    const onClose = vi.fn();
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    renderHook(() =>
      useModalInteractions({
        isOpen: false,
        onClose,
        modalRef,
      })
    );

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function)
    );
  });

  it("should add listeners when modal is open", () => {
    const onClose = vi.fn();
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");

    renderHook(() =>
      useModalInteractions({
        isOpen: true,
        onClose,
        modalRef,
      })
    );

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function)
    );
  });

  it("should call onClose when Escape key is pressed", () => {
    const onClose = vi.fn();

    renderHook(() =>
      useModalInteractions({
        isOpen: true,
        onClose,
        modalRef,
      })
    );

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.dispatchEvent(event);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not call onClose when other keys are pressed", () => {
    const onClose = vi.fn();

    renderHook(() =>
      useModalInteractions({
        isOpen: true,
        onClose,
        modalRef,
      })
    );

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    document.dispatchEvent(event);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should call onClose when clicking on backdrop", () => {
    const onClose = vi.fn();

    renderHook(() =>
      useModalInteractions({
        isOpen: true,
        onClose,
        modalRef,
      })
    );

    const event = new MouseEvent("mousedown", { bubbles: true });
    Object.defineProperty(event, "target", {
      value: modalRef.current,
      enumerable: true,
    });
    document.dispatchEvent(event);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not call onClose when clicking inside modal", () => {
    const onClose = vi.fn();

    renderHook(() =>
      useModalInteractions({
        isOpen: true,
        onClose,
        modalRef,
      })
    );

    const innerElement = document.createElement("div");
    const event = new MouseEvent("mousedown", { bubbles: true });
    Object.defineProperty(event, "target", {
      value: innerElement,
      enumerable: true,
    });
    document.dispatchEvent(event);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should remove listeners when modal closes", () => {
    const onClose = vi.fn();
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { rerender } = renderHook(
      ({ isOpen }) =>
        useModalInteractions({
          isOpen,
          onClose,
          modalRef,
        }),
      { initialProps: { isOpen: true } }
    );

    rerender({ isOpen: false });

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function)
    );
  });

  it("should cleanup listeners on unmount", () => {
    const onClose = vi.fn();
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() =>
      useModalInteractions({
        isOpen: true,
        onClose,
        modalRef,
      })
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function)
    );
  });
});
