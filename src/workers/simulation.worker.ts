import { expose } from "comlink";
import { GameOfLifeEngine } from "../engine/GameOfLifeEngine";
import { resolvePattern } from "../engine/resolver";
import type {
  BoardState,
  JumpResponse,
  ResolveResult,
  StepResponse,
  UploadResponse,
} from "../engine/types";

class SimulationWorker {
  private sessions: Map<
    string,
    { engine: GameOfLifeEngine; generation: number }
  > = new Map();

  public upload(state: BoardState): UploadResponse {
    const sessionId = crypto.randomUUID();
    const engine = new GameOfLifeEngine(state);

    this.sessions.set(sessionId, {
      engine,
      generation: 0,
    });

    return {
      sessionId,
      state: engine.getState(),
    };
  }

  public step(sessionId: string): StepResponse {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const state = session.engine.calculateNextGeneration();
    session.generation++;

    return {
      state,
      generation: session.generation,
    };
  }

  public jump(sessionId: string, generations: number): JumpResponse {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const state = session.engine.jump(generations);
    session.generation += generations;

    return {
      state,
      generation: session.generation,
    };
  }

  public resolve(sessionId: string): ResolveResult {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const currentState = session.engine.getState();
    const result = resolvePattern(currentState);

    session.engine = new GameOfLifeEngine(result.finalState);
    session.generation += result.generationsElapsed;

    return result;
  }

  public deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}

const worker = new SimulationWorker();
expose(worker);
