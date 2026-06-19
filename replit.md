# ReviewGenie

An AI-Powered Review Reply Generator that helps businesses respond to Google and Facebook reviews professionally and quickly.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/review-genie run dev` — run the frontend (port 22547)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `GROQ_API_KEY` — Groq API key for AI reply generation (llama-3.3-70b-versatile)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Shadcn UI + Framer Motion + Wouter + TanStack React Query
- API: Express 5 + Groq SDK
- DB: None (localStorage for history and business profile)
- Validation: Zod (`zod/v4`)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle for API), Vite (frontend)
- Font: Plus Jakarta Sans (Google Fonts)
- Theme: Dark mode forced by default, warm amber/gold accent

## Where things live

- `lib/api-spec/openapi.yaml` — API contract source of truth
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/api-server/src/routes/reply.ts` — Groq AI reply + sentiment routes
- `artifacts/review-genie/src/` — React frontend (5 pages)
- `artifacts/review-genie/src/lib/storage.ts` — localStorage utilities for history + profile

## Architecture decisions

- No database: history and business profile stored in localStorage for zero-friction setup
- Groq llama-3.3-70b-versatile for both reply generation and sentiment detection
- Sentiment detection is debounced (~800ms) and runs automatically when auto-detect toggle is ON
- Sentiment JSON parsing has fallback defaults (neutral/Professional/3 stars) if LLM output is malformed
- Star rating can be set manually or inferred from sentiment analysis

## Product

5-page app: Generator (main reply flow with auto-sentiment detection), History (saved replies with search/filter), Analytics (Recharts charts over history data), Business Profile (localStorage settings), and Pro Tips (static best practices content).

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `GROQ_API_KEY` must be set as a secret — the API server will crash without it
- Sentiment detection endpoint returns `suggestedTone` which the frontend uses to auto-select tone
- `GenerateReplyBody` and `DetectSentimentBody` are the Zod schema names (not the entity-shaped names — these are auto-derived by Orval from the operationId)
- When adding `@import url(...)` to index.css, it MUST be the very first line before `@import "tailwindcss"`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
