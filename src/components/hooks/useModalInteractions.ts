import { useEffect } from "react";

interface UseModalInteractionsProps {
  isOpen: boolean;
  onClose: () => void;
  modalRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Custom hook to manage modal keyboard and click-outside interactions
 * Handles ESC key and backdrop click to close modal
 */
export const useModalInteractions = ({
  isOpen,
  onClose,
  modalRef,
}: UseModalInteractionsProps): void => {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && e.target === modalRef.current) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, modalRef]);
};
