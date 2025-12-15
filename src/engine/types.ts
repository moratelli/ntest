import { z } from "zod";

export const CoordinateSchema = z.tuple([z.number().int(), z.number().int()]);

export const BoardStateSchema = z.object({
  alive: z.array(CoordinateSchema),
});

export type Coordinate = z.infer<typeof CoordinateSchema>;
export type BoardState = z.infer<typeof BoardStateSchema>;

export type ResolveStatus = "stable" | "oscillator" | "timeout";

export interface ResolveResult {
  status: ResolveStatus;
  finalState: BoardState;
  generationsElapsed: number;
  oscillatorPeriod?: number;
}

export interface UploadResponse {
  sessionId: string;
  state: BoardState;
}

export interface StepResponse {
  state: BoardState;
  generation: number;
}

export interface JumpResponse {
  state: BoardState;
  generation: number;
}

export type WorkerRequest =
  | { type: "UPLOAD"; payload: BoardState }
  | { type: "STEP"; payload: { sessionId: string } }
  | { type: "JUMP"; payload: { sessionId: string; generations: number } }
  | { type: "RESOLVE"; payload: { sessionId: string } };

export type WorkerResponse =
  | { type: "UPLOAD"; success: true; data: UploadResponse }
  | { type: "STEP"; success: true; data: StepResponse }
  | { type: "JUMP"; success: true; data: JumpResponse }
  | { type: "RESOLVE"; success: true; data: ResolveResult }
  | { type: "ERROR"; success: false; error: string };
