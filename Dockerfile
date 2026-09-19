# Slim Fly.io image for headless `opencode serve` with embedded Solid app.
#
# Multi-stage: builder compiles the app (no sourcemaps, en-only) and installs
# deps; runtime copies only the needed artifacts. Keeps the image small enough
# for the 512MB Fly VM and avoids shipping test/assets bloat.
FROM oven/bun:1-slim AS builder
ENV HUSKY=0 BUN_RUNTIME_TRANSPILER_CACHE_PATH=0 NODE_ENV=production
WORKDIR /app
COPY package.json bun.lock ./
COPY patches ./patches
COPY packages/core/script packages/core/script
COPY packages/app/package.json packages/app/
COPY packages/client/package.json packages/client/
COPY packages/codemode/package.json packages/codemode/
COPY packages/core/package.json packages/core/
COPY packages/effect-drizzle-sqlite/package.json packages/effect-drizzle-sqlite/
COPY packages/effect-sqlite-node/package.json packages/effect-sqlite-node/
COPY packages/http-recorder/package.json packages/http-recorder/
COPY packages/httpapi-codegen/package.json packages/httpapi-codegen/
COPY packages/llm/package.json packages/llm/
COPY packages/opencode/package.json packages/opencode/
COPY packages/plugin/package.json packages/plugin/
COPY packages/protocol/package.json packages/protocol/
COPY packages/schema/package.json packages/schema/
COPY packages/script/package.json packages/script/
COPY packages/sdk/js/package.json packages/sdk/js/
COPY packages/sdk-next/package.json packages/sdk-next/
COPY packages/server/package.json packages/server/
COPY packages/session-ui/package.json packages/session-ui/
COPY packages/tui/package.json packages/tui/
COPY packages/ui/package.json packages/ui/
RUN bun install
COPY . .
# Build the Solid app with no sourcemaps (vite.config.ts already disables them)
# and embed it into the opencode binary via opencode-web-ui.gen.ts
RUN bun run --cwd packages/app build

FROM oven/bun:1-slim
ENV HUSKY=0 BUN_RUNTIME_TRANSPILER_CACHE_PATH=0 NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/package.json /app/bun.lock ./
COPY --from=builder /app/patches ./patches
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
# Ensure the built app dist is present for the embedded UI
COPY --from=builder /app/packages/app/dist ./packages/app/dist
EXPOSE 4096
CMD ["bun", "run", "packages/opencode/src/index.ts", "serve", "--hostname", "0.0.0.0", "--port", "4096"]
