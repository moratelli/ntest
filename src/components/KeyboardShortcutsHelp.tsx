import { memo, useState } from "react";

export const KeyboardShortcutsHelp = memo(() => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-10 flex size-10 items-center justify-center rounded-full border-2 border-border bg-bg-secondary text-white hover:bg-bg-tertiary focus:ring-2 focus:ring-primary"
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts"
      >
        ⌨️
      </button>

      {isOpen && (
        <div className="fixed bottom-16 right-4 z-10 w-[280px] rounded-lg border-2 border-border bg-bg-secondary p-4 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="m-0 font-mono text-sm font-bold text-white">
              Keyboard Shortcuts
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="size-6 border-none bg-transparent text-xl leading-none text-white hover:text-gray-300"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col gap-2 font-mono text-xs text-white">
            <div className="flex justify-between">
              <kbd className="rounded bg-bg-tertiary px-2 py-1">Space</kbd>
              <span>Play / Pause</span>
            </div>
            <div className="flex justify-between">
              <kbd className="rounded bg-bg-tertiary px-2 py-1">S</kbd>
              <span>Step forward</span>
            </div>
            <div className="flex justify-between">
              <kbd className="rounded bg-bg-tertiary px-2 py-1">R</kbd>
              <span>Reset grid</span>
            </div>
            <div className="flex justify-between">
              <kbd className="rounded bg-bg-tertiary px-2 py-1">+</kbd>
              <span>Zoom in</span>
            </div>
            <div className="flex justify-between">
              <kbd className="rounded bg-bg-tertiary px-2 py-1">-</kbd>
              <span>Zoom out</span>
            </div>
            <div className="mt-2 border-t border-border pt-2 text-gray-400">
              <div className="flex justify-between">
                <span>Left drag</span>
                <span>Draw cells</span>
              </div>
              <div className="flex justify-between">
                <span>Space + drag</span>
                <span>Pan view</span>
              </div>
              <div className="flex justify-between">
                <span>Right click</span>
                <span>Pan view</span>
              </div>
              <div className="flex justify-between">
                <span>Scroll wheel</span>
                <span>Zoom</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

KeyboardShortcutsHelp.displayName = "KeyboardShortcutsHelp";
