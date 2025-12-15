import { Modal } from "@/components/Modal";
import { BoardStateSchema } from "@/engine/types";
import { useGridStore } from "@/features/grid/store/useGridStore";
import { useSimulationStore } from "@/features/simulation/store/useSimulationStore";
import { useState } from "react";

export const BoardUploader = () => {
  const {
    uploadState,
    downloadState,
    copyStateToClipboard,
    currentState,
    reset,
  } = useSimulationStore();
  const resetGrid = useGridStore((state) => state.reset);
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const validated = BoardStateSchema.parse(parsed);
      await uploadState(validated);
      setJsonInput("");
      setIsUploadModalOpen(false);
    } catch {
      setError("Invalid JSON format. Please check your file and try again.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleTextSubmit = async () => {
    if (!jsonInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const parsed = JSON.parse(jsonInput);
      const validated = BoardStateSchema.parse(parsed);
      await uploadState(validated);
      setJsonInput("");
      setIsUploadModalOpen(false);
    } catch {
      setError("Invalid JSON format. Please check your input and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await copyStateToClipboard();
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setError("Failed to copy to clipboard");
    }
  };

  const handleReset = async () => {
    await reset();
    resetGrid();
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg bg-bg-secondary p-4">
      <h3 className="m-0 font-mono text-lg text-white">Board State</h3>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="cursor-pointer rounded border-none bg-gray-700 px-4 py-2 font-mono text-sm text-white hover:bg-gray-600 focus:ring-2 focus:ring-primary"
        >
          📥 Import State
        </button>

        <button
          onClick={() => setIsExportModalOpen(true)}
          disabled={!currentState}
          className="cursor-pointer rounded border-none bg-gray-700 px-4 py-2 font-mono text-sm text-white hover:bg-gray-600 focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          📤 Export State
        </button>

        <button
          onClick={handleReset}
          className="cursor-pointer rounded border-none bg-gray-700 px-4 py-2 font-mono text-sm text-white hover:bg-gray-600 focus:ring-2 focus:ring-primary"
        >
          🔄 Reset State
        </button>
      </div>

      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setError(null);
          setJsonInput("");
        }}
        title="Import Board State"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-mono text-sm text-white">
              Upload JSON File:
              <input
                type="file"
                accept="application/json"
                onChange={handleFileUpload}
                disabled={loading}
                className="mt-2 font-mono text-sm text-white"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-mono text-sm text-white">
              Or paste JSON:
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder='{"alive": [[0,1], [1,2], [2,0], [2,1], [2,2]]}'
              disabled={loading}
              className="min-h-[100px] resize-y rounded border border-border-light bg-bg-tertiary p-2 font-mono text-sm text-white focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleTextSubmit}
              disabled={loading || !jsonInput.trim()}
              className="cursor-pointer rounded border-none bg-gray-700 px-4 py-2 font-mono text-sm text-white hover:bg-gray-600 focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {error && (
            <div className="rounded bg-red-600 p-2 font-mono text-sm text-white">
              {error}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setCopySuccess(false);
          setError(null);
        }}
        title="Export Board State"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCopyToClipboard}
              className="cursor-pointer rounded border-none bg-gray-700 px-4 py-2 font-mono text-sm text-white hover:bg-gray-600 focus:ring-2 focus:ring-primary"
            >
              {copySuccess ? "Copied!" : "Copy to Clipboard"}
            </button>

            <button
              onClick={downloadState}
              className="cursor-pointer rounded border-none bg-gray-700 px-4 py-2 font-mono text-sm text-white hover:bg-gray-600 focus:ring-2 focus:ring-primary"
            >
              Download JSON File
            </button>
          </div>

          {error && (
            <div className="rounded bg-red-600 p-2 font-mono text-sm text-white">
              {error}
            </div>
          )}

          {currentState && (
            <div className="flex flex-col gap-2">
              <label className="font-mono text-sm text-white">Preview:</label>
              <textarea
                value={JSON.stringify(currentState, null, 2)}
                readOnly
                className="min-h-[200px] resize-y rounded border border-border-light bg-bg-tertiary p-2 font-mono text-sm text-white"
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
