# Slim Fly.io image for headless `opencode serve`.
#
# Runs from source rather than shipping a pre-compiled binary: `dist/` is
# gitignored and building it locally would mean a full `bun install` on the
# workstation. Here the entire install happens on Fly's remote builder, so a
# deploy never downloads packages locally — only the (trimmed) build context is
# uploaded. See .dockerignore for the exclusions that keep that context small.
FROM oven/bun:1-slim

# Husky has no .git directory inside the image, and the runtime transpiler cache
# is pointless on an ephemeral container.
ENV HUSKY=0 \
    BUN_RUNTIME_TRANSPILER_CACHE_PATH=0 \
    NODE_ENV=production

WORKDIR /app

# Workspace manifests and lockfile first. Bun validates the whole workspace
# graph against the lockfile, so every member's package.json must be present
# before install; copying only manifests here also caches the dependency layer
# across deploys.
COPY package.json bun.lock ./
# patchedDependencies in the root manifest point at these files, and Bun needs
# them while resolving — so they must land before the install, not with the
# bulk source copy below.
COPY patches ./patches
# The root `postinstall` runs `bun run --cwd packages/core fix-node-pty`, so that
# script has to exist before the install too.
COPY packages/core/script packages/core/script
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
COPY packages/tui/package.json packages/tui/

# Deliberately not --frozen-lockfile: the slimmed workspace list diverges from
# the upstream lockfile, and re-resolving here costs no local bandwidth.
RUN bun install

COPY . .

EXPOSE 4096

# `serve` defaults to 127.0.0.1:0, which is unreachable from Fly's proxy.
CMD ["bun", "run", "packages/opencode/src/index.ts", "serve", "--hostname", "0.0.0.0", "--port", "4096"]
