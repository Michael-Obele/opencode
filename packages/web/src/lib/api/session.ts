export type SessionStatus = "active" | "idle" | "running" | "archived" | "error"
export type MessageRole = "user" | "assistant" | "system"
export type PartType = "text" | "tool" | "reasoning" | "diff"

export type SessionPart = {
  id: string
  type: PartType
  text?: string
  tool?: string
  input?: Record<string, unknown>
  output?: string
  file?: string
  additions?: number
  deletions?: number
}

export type SessionMessage = {
  id: string
  role: MessageRole
  content: string
  parts?: SessionPart[]
  createdAt: number
  model?: string
  tokens?: number
}

export type Session = {
  id: string
  title: string
  status: SessionStatus
  directory: string
  createdAt: number
  updatedAt: number
  messageCount: number
  model?: string
}

const mockSessions: Session[] = [
  {
    id: "sess_01h9k2a3b4c5d6e7f8g9h0j1k",
    title: "Refactor auth middleware to use Better Auth",
    status: "active",
    directory: "~/projects/opencode",
    createdAt: Date.now() - 1000 * 60 * 23,
    updatedAt: Date.now() - 1000 * 60 * 2,
    messageCount: 12,
    model: "claude-4-opus",
  },
  {
    id: "sess_02h9k2a3b4c5d6e7f8g9h0j1l",
    title: "Fix timeline virtualizer scroll jump",
    status: "running",
    directory: "~/projects/opencode",
    createdAt: Date.now() - 1000 * 60 * 60 * 3,
    updatedAt: Date.now() - 1000 * 30,
    messageCount: 8,
    model: "claude-4-sonnet",
  },
  {
    id: "sess_03h9k2a3b4c5d6e7f8g9h0j1m",
    title: "Add session export to markdown",
    status: "idle",
    directory: "~/projects/my-app",
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 60 * 5,
    messageCount: 24,
    model: "gpt-5",
  },
  {
    id: "sess_04h9k2a3b4c5d6e7f8g9h0j1n",
    title: "Investigate flaky TUI rendering",
    status: "archived",
    directory: "~/projects/opencode",
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    messageCount: 5,
    model: "claude-4-opus",
  },
]

const mockMessages: Record<string, SessionMessage[]> = {
  sess_01h9k2a3b4c5d6e7f8g9h0j1k: [
    {
      id: "msg_001",
      role: "user",
      content:
        "Can you help me refactor the auth middleware to use Better Auth? The current implementation is using a custom JWT handler.",
      createdAt: Date.now() - 1000 * 60 * 22,
    },
    {
      id: "msg_002",
      role: "assistant",
      content:
        "I'll help you refactor the auth middleware. Let me first examine the current implementation and then migrate it to Better Auth.",
      parts: [
        {
          id: "p1",
          type: "reasoning",
          text: "Need to check current auth flow, identify JWT usage, then plan Better Auth integration.",
        },
        {
          id: "p2",
          type: "tool",
          tool: "read",
          input: { path: "src/middleware/auth.ts" },
          output: "Found 142 lines, uses jsonwebtoken + custom session store",
        },
        {
          id: "p3",
          type: "tool",
          tool: "read",
          input: { path: "src/lib/auth.ts" },
          output: "Better Auth already configured with drizzle adapter",
        },
      ],
      createdAt: Date.now() - 1000 * 60 * 21,
      model: "claude-4-opus",
      tokens: 1240,
    },
    {
      id: "msg_003",
      role: "user",
      content:
        "Also make sure we keep the existing role-based access control. Admins should still be able to bypass rate limiting.",
      createdAt: Date.now() - 1000 * 60 * 18,
    },
    {
      id: "msg_004",
      role: "assistant",
      content:
        "Got it — preserving RBAC. I've updated the middleware to delegate to Better Auth's `auth.api.getSession` and wrapped it with your existing `requireRole` helper. Rate-limit bypass for admins is kept via the `isAdmin` check.",
      parts: [
        {
          id: "p4",
          type: "diff",
          file: "src/middleware/auth.ts",
          additions: 24,
          deletions: 38,
          text: "Migrated to Better Auth session + preserved RBAC",
        },
        {
          id: "p5",
          type: "tool",
          tool: "write",
          input: { path: "src/middleware/auth.ts" },
          output: "Written successfully",
        },
      ],
      createdAt: Date.now() - 1000 * 60 * 15,
      model: "claude-4-opus",
      tokens: 2100,
    },
    {
      id: "msg_005",
      role: "user",
      content: "Looks good! Can you also add a test for the admin bypass?",
      createdAt: Date.now() - 1000 * 60 * 5,
    },
  ],
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

export async function fetchSessions(): Promise<Session[]> {
  await delay(320)
  return mockSessions
}

export async function fetchSession(id: string): Promise<Session> {
  await delay(280)
  const found = mockSessions.find((s) => s.id === id)
  if (found) return found
  return {
    id,
    title: `Session ${id.slice(0, 8)}`,
    status: "active",
    directory: "~/projects/opencode",
    createdAt: Date.now() - 1000 * 60 * 30,
    updatedAt: Date.now(),
    messageCount: 2,
    model: "claude-4-opus",
  }
}

export async function fetchMessages(sessionId: string): Promise<SessionMessage[]> {
  await delay(350)
  return (
    mockMessages[sessionId] ?? [
      { id: "m1", role: "user", content: "Hello, start a new session", createdAt: Date.now() - 1000 * 60 * 10 },
      {
        id: "m2",
        role: "assistant",
        content: "Hi! How can I help you today?",
        createdAt: Date.now() - 1000 * 60 * 9,
        model: "claude-4-opus",
      },
    ]
  )
}

export async function sendMessage(sessionId: string, content: string): Promise<SessionMessage> {
  await delay(600)
  return {
    id: `msg_${Date.now()}`,
    role: "assistant",
    content: `Echo: ${content.slice(0, 120)} — this is a mock response. Wire this to your real API at \`/api/session/\${sessionId}/message\`.`,
    createdAt: Date.now(),
    model: "claude-4-opus",
    tokens: Math.floor(content.length * 1.3),
  }
}
