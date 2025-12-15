import { useEffect } from "react";

interface KeyboardShortcuts {
  onPlayPause?: () => void;
  onStep?: () => void;
  onReset?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  disabled?: boolean;
}

export const useGlobalKeyboardShortcuts = ({
  onPlayPause,
  onStep,
  onReset,
  onZoomIn,
  onZoomOut,
  disabled = false,
}: KeyboardShortcuts) => {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          onPlayPause?.();
          break;
        case "s":
          e.preventDefault();
          onStep?.();
          break;
        case "r":
          e.preventDefault();
          onReset?.();
          break;
        case "=":
        case "+":
          e.preventDefault();
          onZoomIn?.();
          break;
        case "-":
          e.preventDefault();
          onZoomOut?.();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onPlayPause, onStep, onReset, onZoomIn, onZoomOut, disabled]);
};
