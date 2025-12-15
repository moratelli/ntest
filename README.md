# Conway's Game of Life

**Live Demo**: https://ntest-xi.vercel.app/

React implementation with Web Worker-based simulation, cycle detection, and persistent sessions.

## Quick Start

```bash
npm install
npm run dev
```

## Architecture

**Engine** (`src/engine/`)

- Pure TypeScript, zero React dependencies
- Sparse grid (`Set<string>`) for unbounded patterns
- O(n) where n = alive cells + neighbors
- FNV-1a hashing for cycle detection (2000-state circular buffer)

**Worker** (`src/workers/`)

- Comlink for type-safe RPC
- Session-based: `upload() → step()/jump()/resolve()`
- Non-blocking UI during heavy computation

**Persistence** (`src/persistence/`)

- IndexedDB with localStorage fallback
- Debounced auto-save (500ms)
- Stores cell state + viewport (zoom/pan)

**State** (Zustand)

- `useSimulationStore`: session, generation, running state
- `useGridStore`: viewport (decoupled to prevent render cascades)

## Key Decisions

**Why Web Workers?**
Prevents UI blocking during 10k+ generation jumps. Main thread stays 60fps.

**Why sparse grid?**
Most Conway patterns are <1% density. `Set<"x,y">` beats 2D arrays for memory and iteration.

**Why FNV-1a hashing?**
100x memory reduction vs storing full board history. Detects oscillators without false positives (1 in 4B collision rate).

**Why Zustand?**
90% less boilerplate than Redux, 1.3KB vs 7.2KB. No provider hell, works outside React.

## Testing

```bash
npm test              # 54 unit tests (94% coverage)
npm run test:e2e      # 12 Playwright E2E tests
npm run typecheck     # TypeScript strict mode
npm run lint          # ESLint + pre-commit hooks
```

## API

```typescript
// Upload new board, get session ID
const { sessionId } = await workerBridge.upload({
  alive: [
    [0, 1],
    [1, 2],
  ],
});

// Advance one generation
const { state, generation } = await workerBridge.step(sessionId);

// Jump N generations
const { state } = await workerBridge.jump(sessionId, 100);

// Resolve to final state (timeout after 50k gens / 10s)
const { status, finalState } = await workerBridge.resolve(sessionId);
// status: "stable" | "oscillator" | "timeout"
```

## Production

**Deploy:**

```bash
vercel --prod  # Zero config, includes Analytics + Speed Insights
```

**CI:** GitHub Actions runs tests, lint, typecheck, and build on all PRs.

**Branch Protection:** Require PR reviews + CI checks on `main`.

## Tech Stack

React 19 • TypeScript (strict) • Vite 7 • Zustand • Comlink • Zod • IndexedDB • Tailwind • Vitest • Playwright

## License

MIT
