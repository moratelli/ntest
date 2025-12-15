import { memo, useRef } from "react";
import { useModalInteractions } from "./hooks/useModalInteractions";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = memo(
  ({ isOpen, onClose, title, children }: ModalProps) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useModalInteractions({ isOpen, onClose, modalRef });

    if (!isOpen) return null;

    return (
      <div
        ref={modalRef}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70"
      >
        <div className="flex max-h-[80vh] w-[90%] max-w-[600px] flex-col rounded-lg border-2 border-border bg-bg-secondary">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h3 className="m-0 font-mono text-lg text-white">{title}</h3>
            <button
              onClick={onClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center border-none bg-transparent p-0 text-[32px] leading-none text-white hover:text-gray-300 focus:ring-2 focus:ring-primary"
            >
              ×
            </button>
          </div>
          <div className="overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    );
  }
);

Modal.displayName = "Modal";
