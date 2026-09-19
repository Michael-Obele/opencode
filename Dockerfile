# Slim Fly.io image for headless `opencode serve` with embedded Solid app.
#
# Multi-stage: builder compiles the app (no sourcemaps, en-only) and installs
# deps; runtime copies only the needed artifacts. Keeps the image small enough
# for the 512MB Fly VM and avoids shipping test/assets bloat.
FROM oven/bun:1-slim AS builder
RUN apt-get update -qq && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
ENV HUSKY=0 BUN_RUNTIME_TRANSPILER_CACHE_PATH=0 NODE_ENV=production
WORKDIR /app
COPY package.json bun.lock ./
COPY patches ./patches
COPY packages/core/script packages/core/script
COPY packages/app/vendor packages/app/vendor
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
# Build the Solid app (en-only, no sourcemaps) and compile the server into a
# single binary that embeds the UI via opencode-web-ui.gen.ts.
RUN bun run --cwd packages/app build
# Merge global skills into the repo skills so they ship in the image
RUN if [ -d .opencode/skills-global ]; then cp -r .opencode/skills-global/* .opencode/skills/ 2>/dev/null || true; fi
RUN OPENCODE_CHANNEL=prod bun run packages/opencode/script/build.ts --single

FROM debian:bookworm-slim
RUN apt-get update -qq && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Compiled binary for the current platform (linux-x64) — no node_modules needed.
COPY --from=builder /app/packages/opencode/dist/opencode-linux-x64/bin/opencode /usr/local/bin/opencode
# Skills/config that should be present on Fly (repo .opencode, not XDG volume)
COPY --from=builder /app/.opencode ./.opencode
EXPOSE 4096
CMD ["opencode", "serve", "--hostname", "0.0.0.0", "--port", "4096"]
