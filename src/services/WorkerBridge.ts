import { wrap, type Remote } from "comlink";
import type {
  BoardState,
  JumpResponse,
  ResolveResult,
  StepResponse,
  UploadResponse,
} from "../engine/types";

type SimulationWorkerAPI = {
  upload(state: BoardState): Promise<UploadResponse>;
  updateSession(sessionId: string, state: BoardState): Promise<UploadResponse>;
  step(sessionId: string): Promise<StepResponse>;
  jump(sessionId: string, generations: number): Promise<JumpResponse>;
  resolve(sessionId: string): Promise<ResolveResult>;
  deleteSession(sessionId: string): Promise<void>;
};

class WorkerBridge {
  private worker: Worker | null = null;
  private api: Remote<SimulationWorkerAPI> | null = null;

  private initializeWorker(): void {
    if (this.worker) return;

    this.worker = new Worker(
      new URL("../workers/simulation.worker.ts", import.meta.url),
      {
        type: "module",
      }
    );

    this.api = wrap<SimulationWorkerAPI>(this.worker);
  }

  public async upload(state: BoardState): Promise<UploadResponse> {
    this.initializeWorker();
    if (!this.api) {
      throw new Error("Worker failed to initialize");
    }
    return this.api.upload(state);
  }

  public async updateSession(
    sessionId: string,
    state: BoardState
  ): Promise<UploadResponse> {
    this.initializeWorker();
    if (!this.api) {
      throw new Error("Worker failed to initialize");
    }
    return this.api.updateSession(sessionId, state);
  }

  public async step(sessionId: string): Promise<StepResponse> {
    this.initializeWorker();
    if (!this.api) {
      throw new Error("Worker failed to initialize");
    }
    return this.api.step(sessionId);
  }

  public async jump(
    sessionId: string,
    generations: number
  ): Promise<JumpResponse> {
    this.initializeWorker();
    if (!this.api) {
      throw new Error("Worker failed to initialize");
    }
    return this.api.jump(sessionId, generations);
  }

  public async resolve(sessionId: string): Promise<ResolveResult> {
    this.initializeWorker();
    if (!this.api) {
      throw new Error("Worker failed to initialize");
    }
    return this.api.resolve(sessionId);
  }

  public async deleteSession(sessionId: string): Promise<void> {
    this.initializeWorker();
    if (!this.api) {
      throw new Error("Worker failed to initialize");
    }
    return this.api.deleteSession(sessionId);
  }

  public terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.api = null;
    }
  }
}

export const workerBridge = new WorkerBridge();
