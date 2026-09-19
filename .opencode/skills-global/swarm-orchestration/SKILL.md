---
name: swarm-orchestration
description: 'Use when the user wants parallel agents, a swarm, multi-agent orchestration, fan-out research, coordinator with workers, subagents, handoffs, or says swarm this, run agents in parallel, orchestrate agents in any AI or environment. Use with subagent-driven-development for disciplined plan execution.'
---

# Swarm Orchestration (Universal — Any AI, Any Environment)

Run any task as a disciplined agent swarm — whether your environment has true
parallel subagents or is a single chat window with no tools. Inspired by
`subagent-driven-development`: **fresh subagent per subtask + review gate after each + broad final review**.

## When to Use

- User says "swarm", "multi-agent", "parallel agents", "fan out", "coordinate workers", "handoff", "orchestrate"
- Task has 2+ independent chunks that can run concurrently (research N sources, analyze N files, compare N options)
- Task needs distinct expertise in one run (researcher + coder + reviewer)
- User wants the swarm *capability itself* installed in any AI
- You have an implementation plan with independent tasks — pair with `subagent-driven-development` for execution discipline

## When NOT to Use

- Single-domain, linear task one agent can do. Default to solo — a swarm costs
  ~10-15x tokens (Anthropic measured ~15x for multi-agent research, ~80% of the
  performance gain was just extra token budget). Only swarm when the value covers the bill.
- Subtasks that must talk mid-flight (not truly isolated). That is one conversation
  passed around a table, not parallelism — use solo or a sequential pipeline.
- Tasks are tightly coupled with shared mutable state — use `subagent-driven-development` sequential task loop instead.

## Core Principle

**Fresh subagent per subtask + task review (spec + quality) + broad final review = high quality, fast iteration.**

One coordinator owns the plan. Workers own isolated contexts. Control moves by
explicit, versioned handoffs. Results merge through files, not telephone.
Workers never inherit your session's history — you construct exactly what they need.

```
Coordinator reads plan → Pre-flight check → Dispatch fresh worker per subtask
  → Worker implements + self-reviews → Reviewer checks spec + quality
  → Fix loop if needed → Mark complete in ledger → Next subtask
  → Broad final review after all subtasks
```

**Continuous execution:** Do not pause to check in between subtasks. Execute all
without stopping. Only stop for BLOCKED you cannot resolve or genuine ambiguity.

## Step 1 — Detect Your Environment Tier

Do this first. It decides everything downstream.

| Tier | Capability | How to tell |
|------|------------|-------------|
| A — Parallel subagents | Launch 2+ agents in one turn, isolated contexts | You have a subagent/Task/background-agent tool that accepts parallel calls |
| B — Sequential subagents | One subagent at a time, isolated contexts | Subagent tool exists but runs serially, or parallelism is unreliable |
| C — Solo simulation | No subagent tool at all | Plain chat, no delegation primitives |

Rules:
- Tier A: fan out 3-5 workers in a SINGLE turn (same block), then wait for all before synthesizing.
- Tier B: same swarm protocol, but dispatch one worker at a time; still use files + handoff contracts so the pattern holds.
- Tier C: simulate the swarm — create one scratchpad file per role under `./.swarm/<task>/`, write each role's brief + output as a file, never blend roles in one unbroken reasoning blob. The discipline, not the tooling, is the swarm.

## Step 2 — Pick the Topology

```
Single context + no validation between steps? → SEQUENTIAL pipeline (+ terminal reviewer)
Need dynamic routing / validation / ordered execution? → SUPERVISOR (hub-and-spoke)
Conversation should live with whichever specialist fits, weak observability OK? → SWARM/HANDOFF (peer-to-peer)
5+ roles with independent sub-teams + saturating coordinator context? → HYBRID (supervisor plans, parallel teams execute)
```

Sizing guide:
- 1-3 roles → sequential pipeline + terminal reviewer. Do not build a swarm.
- 3-5 roles → flat supervisor (one coordinator, workers never talk to each other).
- 5+ roles with parallel sub-teams → hybrid with nested leads. Only level of delegation is ONE — a worker never spawns its own workers (prevents runaway recursion).

Trade-off (state it to the user when it matters):
- Supervisor: legible, controllable, validatable — but the center re-reads the growing transcript every hop, so cost fans out with run length.
- Swarm/handoff: flatter cost, looser coupling — but no single place owns the plan, so tracing and guarantees are weaker.

## Step 3 — Pre-Flight Decomposition Review

Before dispatching Worker 1, scan the decomposition once for conflicts — the cheapest fix is before any worker runs:

- Subtasks that contradict each other or global constraints
- Anything the plan mandates that the review rubric would treat as a defect (e.g., a test that asserts nothing, verbatim duplication)
- Missing interfaces between subtasks (worker B needs output worker A hasn't been told to produce)

Present everything you find as one batched question — each finding beside the plan text that mandates it, asking which governs — before execution begins, not one interrupt per discovery mid-swarm. If clean, proceed without comment. The review loop remains the net for conflicts that only emerge from implementation.

## Step 4 — Define the Roster (Before Dispatching Anything)

Write a roster card per role. Keep capability descriptions razor-specific — vague
descriptions produce random routing.

```markdown
## Roster: <task-name>
- coordinator: owns plan, merges results, NEVER does raw heavy reading itself
- worker:<name> (1-5): objective, tools/sources allowed, output file path, model tier
- reviewer: spec-compliance + quality gate, runs after each worker batch
- Budget: max N workers, max M rounds. Stop and report when hit.
```

Each worker brief MUST contain: objective (one sentence), output format (exact
schema or template), allowed tools/sources, task boundaries ("do NOT do X —
that belongs to worker Y"), done-criteria, and report file path. Anthropic's lesson: vague briefs
like "research the semiconductor shortage" cause duplicated work and gaps.

### Model Selection (from subagent-driven-development)

Use the least powerful model that can handle each role — turn count beats token price.

| Role | When to use cheap/fast | When to use standard | When to use most capable |
|------|------------------------|----------------------|--------------------------|
| Mechanical worker (1-2 files, complete spec) | ✅ transcription + testing | — | — |
| Integration worker (multi-file, pattern matching) | — | ✅ | — |
| Architecture / synthesis / final review | — | — | ✅ |
| Reviewer | Small diff → cheap | Subtle concurrency → standard | — |

Always specify the model explicitly when dispatching. An omitted model silently inherits the session's most expensive one. The cheapest models take 2-3× the turns on multi-step work — costing more overall — so use mid-tier as floor for reviewers and for workers with prose specs.

## Step 5 — Handoff Contract (Every Transfer Uses This)

Treat every handoff as a versioned API. Free-text handoffs are the #1 source of
context loss. Use this shape whether you pass it as JSON, a tool argument, or a
markdown file header in Tier C.

```markdown
## Handoff v1 — trace: <unique-id>
- from: <role> → to: <role>
- objective: <one sentence, verifiable>
- context_summary: <3-6 lines distilled, NOT full history>
- inputs: <file paths or exact data, not "see above">
- output_format: <exact template or schema>
- boundaries: <explicitly out of scope>
- done_criteria: <how the receiver knows it is finished>
- idempotency_key: <unique per task — receiver returns cached result on retry, never re-executes side effects>
- brief_file: <path to task brief — single source of requirements>
- report_file: <path where worker writes full report>
```

Rules:
- Validate BEFORE executing: required fields present, types sane, values in range. On failure, auto-repair once, then escalate to the user — never let a malformed handoff cascade.
- Context filtering: send distilled summaries + file pointers, never full conversation history. Full history explodes cost and confuses specialists.
- Artifacts over telephone: workers write large outputs (code, reports, data) to files and return lightweight references. The coordinator reads the files — nothing big is ever re-typed through the coordinator's context.
- Provenance: record which role produced which fact and when. You need this audit trail when debugging "why did it end up over there?"
- Dispatch prompts contain ONLY: (1) where this subtask fits, (2) brief path ("read this first — it is your requirements"), (3) interfaces from earlier subtasks, (4) your resolution of any ambiguity, (5) report file path. Exact values (numbers, strings, signatures) live only in the brief — never duplicate them in the dispatch.

## Step 6 — Execute (Continuous Loop)

1. Coordinator writes the plan + roster to `./.swarm/<task>/plan.md` (Tier C) or its working memory (Tiers A/B). Create ledger at `./.swarm/<task>/progress.md` (or `.superpowers/sdd/progress.md` if using SDD layout).
2. Fan out: Tier A launches 3-5 workers in ONE parallel block. Tier B launches sequentially. Tier C writes one brief file per worker and executes them as separated passes.
3. Workers run with parallel tool calls inside their own context (3+ parallel searches/reads where independent — this alone cut Anthropic's research time ~90%). Workers self-review before reporting (completeness, quality, discipline, testing).
4. Coordinator WAITS for all workers (the `wait_for_agents` moment) before drawing any conclusion. No partial synthesis mid-flight.
5. Follow-ups go back to the SAME worker/thread when possible (threads are persistent — the worker retains prior turns). Infrastructure errors (rate limit, timeout) → re-assign the same sub-question to a FRESH worker, never retry blindly in place.
6. Synthesize: coordinator merges worker files into one answer, then hands the diff to the reviewer.

### Handling Worker Status (from subagent-driven-development)

Workers report one of four statuses — handle each:

- **DONE:** Generate review package (diff file with commit list + stat + full diff), dispatch reviewer with brief + report + diff paths.
- **DONE_WITH_CONCERNS:** Read concerns before proceeding. Correctness/scope doubts → address before review. Observations ("file getting large") → note and proceed.
- **NEEDS_CONTEXT:** Provide missing context and re-dispatch same worker.
- **BLOCKED:** Assess: (1) context problem → provide more + re-dispatch same model, (2) needs more reasoning → re-dispatch more capable model, (3) task too large → split it, (4) plan wrong → escalate to human. Never ignore escalation or force same model to retry unchanged.

Guardrails:
- Budget cap: set one upfront (N workers / M rounds / token ceiling). A bad decomposition that spawns workers without end must hit the cap and pause, not the bill.
- Drift watch: quality degrades measurably past 8-10 sequential handoffs and past 8-12 supervisor round-trips (context saturation). If you approach either, summarize/compress state or split into sub-teams — prompt tuning will not save you.
- One level only: coordinator → workers. Workers never delegate.

## Step 7 — Review Gate (Non-Negotiable)

After each worker batch: reviewer checks **two verdicts** — spec compliance AND quality. Both required.

- **Spec compliance:** Missing / Extra / Misunderstood vs the brief. If a requirement cannot be verified from the diff alone (lives in unchanged code or spans tasks), report as `⚠️ Cannot verify from diff` — you (coordinator) must resolve it using cross-task context before marking complete. If you confirm a gap, treat as failed spec → fix loop.
- **Quality:** Clean separation, error handling, DRY without premature abstraction, edge cases, test hygiene.

Reviewer rules (from SDD):
- Do not add open-ended directives ("check all uses") without concrete reason.
- Do not re-run tests the worker already ran — the worker's report carries evidence. Run a focused test only on specific doubt.
- Never pre-judge for the reviewer ("do not flag", "at most Minor", "the plan chose") — let them raise it, adjudicate in the loop.
- Hand reviewer the diff as a file (commit list + stat + full diff), not pasted history. Use the BASE you recorded before dispatching — never `HEAD~1` which truncates multi-commit tasks.
- Dispatch fix subagent for Critical/Important findings. Record Minor in ledger for final review to triage.

Fix loop: send failures back to the SAME worker with corrected brief → worker appends fix report (with test results) to same report file → re-review. After final merge: one broad whole-run review (correctness, provenance, cost sanity) — dispatch ONE fixer with complete findings list, not one per finding.

## Step 8 — File Handoffs & Durable Progress

Everything pasted into a dispatch stays resident and is re-read every later turn. Hand artifacts as files:

- **Task brief:** before dispatching, extract subtask's full text to a uniquely named file (`task-N-brief.md`). Dispatch says "read this first — it is your requirements, with exact values to use verbatim."
- **Report file:** `task-N-report.md` (named after brief). Worker writes full report there, returns only status + commits + one-line test summary + concerns.
- **Review package:** diff file with commit list, stat, full diff. Reviewer gets brief + report + diff + global constraints.
- **Ledger:** `./.swarm/<task>/progress.md` — append `Task N: complete (commits <base>..<head>, review clean)` when review passes. After compaction/resume, trust ledger + `git log` over recollection. `git clean -fdx` destroys git-ignored ledgers — recover from `git log` if needed.

## Failure Modes (Memorize These)

| Failure | Symptom | Fix |
|---------|---------|-----|
| Premature complexity | Swarm for a 1-agent task | Drop to solo + reviewer |
| Vague briefs | Two workers return the same work | Rewrite briefs with boundaries + output schemas |
| Telephone game | Coordinator re-types worker outputs, facts mutate | Workers write files; coordinator cites file paths |
| Retry storm | Duplicate side effects after timeout | Idempotency keys; fresh worker on infra errors |
| Cascading failure | One bad output poisons everything downstream | Supervisor validates before forwarding; circuit-break failing worker after 1 bad output |
| Swarm fog | "Why did it go there?" unanswerable | Trace IDs + provenance log on every handoff |
| Context pollution | Worker inherits session history, gets confused | Fresh subagent per subtask, brief is single source |
| Skipped review | Bugs reach final merge | Never skip task review; both verdicts required |

## Prompt Templates

Adapt from `subagent-driven-development`:

- **Worker dispatch:** description `Implement Subtask N: [name]`, model per Step 4, prompt with Context + Before You Begin (ask questions!) + Your Job (implement → test → verify → commit → self-review → report) + Code Organization + Escalation rules. See `~/.agents/skills/subagent-driven-development/implementer-prompt.md`.
- **Reviewer dispatch:** description `Review Subtask N (spec + quality)`, prompt with What Was Requested (brief + global constraints) + What Worker Claims + Diff Under Review + Do Not Trust Report + Tests + Part 1 Spec + Part 2 Quality. See `task-reviewer-prompt.md`.
- **Final review:** use `superpowers:requesting-code-review` template for whole-branch review.

## Environment Notes

- VS Code Copilot / any `runSubagent` host: dispatch all workers in one turn as parallel tool calls; construct each dispatch with task + interfaces + global constraints ONLY (no pasted session history — one real dispatch hit 42k chars of 99% pasted history).
- Claude Code (`Task` tool): same pattern — one message, multiple `Task` calls, then synthesize.
- No-tool chat (Tier C): say so explicitly ("running in solo-simulation mode"), use `./.swarm/<task>/` files as the shared state, and keep each role-pass visibly separated with its handoff header.

## Minimal Example

User: "Compare auth providers A, B, C on pricing, DX, and lock-in."
Coordinator: roster = 3 workers (one provider each) + reviewer. Brief per worker: objective, output template (pricing table rows, DX notes, lock-in risks), sources allowed, boundaries, report path. Fan out 3 in parallel. Workers write `.swarm/auth/{a,b,c}.md` + self-review. Coordinator waits, merges into comparison table, reviewer checks spec + quality (each claim has source), fix loop if needed, ledger updated, final broad review.

## Red Flags (Never Do These)

- Start on main/master without explicit consent
- Skip task review or accept report missing either verdict
- Proceed with unfixed Critical/Important issues
- Dispatch multiple implementation workers that touch same files in parallel (conflicts)
- Make a worker read the whole plan (hand it its brief instead)
- Skip scene-setting context
- Ignore worker questions
- Accept "close enough" on spec compliance
- Let self-review replace actual review (both needed)
- Tell reviewer what not to flag or pre-rate severity
- Dispatch reviewer without diff file
- Re-dispatch a task the ledger already marks complete

## Companion Skill

- **subagent-driven-development**: use when you have a written implementation plan with independent tasks. This swarm skill provides the orchestration mechanics; that skill provides the plan-execution discipline. They pair: swarm for research/fan-out, SDD for build tasks.
