---
name: idea-judge
description: 'Judge a startup or product idea before building. Use when the user asks is this a good idea, is my idea worth building, should I build this, can I sell this, validate my idea, score my idea, pivot or scrap, improve my idea, or wants market validation.'
---

# Idea Judge — Brutally Honest Stress Test (isthisideagood.com-inspired)

A brutally honest stress test for any business idea — inspired by `isthisideagood.com`.
Answers the two questions that transcript nails: **(1) Is the idea actually good?**
and **(2) Is it good for YOU to build?** Those are not the same thing. Then
delivers a swarm-researched verdict: **BUILD / FIX / PIVOT / SCRAP (fun only)**
with a concrete improvement playbook.

> Spirit: "Is this idea good? Nah, generic." — the skill is the antidote to
> vibes. Replace gut with evidence, then tell the founder what to do next.

## When to Use

- "Is this a good idea?", "should I build this?", "can I sell this?"
- User has many ideas and never checks sellability before building
- Pivot / scrap / niche-down decisions, naming a wedge, pre-build validation
- User pasted a transcript, idea dump, or wants the `isthisideagood.com` flow

## When NOT to Use

- User already validated and wants a build plan → plan it, do not re-litigate
- Pure fun/learning project with no commercial intent → say so, skip scoring
- User explicitly says "don't judge, just build" → respect it, offer a 1-line risk flag only

## Core Principle

Conviction without evidence is a coin flip — 42% of startups die from no market
need (CB Insights). The transcript's insight is structural: a good idea can be
a bad idea *for you* (time, skills, distribution). Score both, attack the
weakest dimension first, and end with experiments + kill criteria, not vibes.
Honesty > hype. Disclose flaws rather than concealing them.

## Step 1 — Intake: Idea Type + Questionnaire (The Form)

Like `isthisideagood.com`, start by classifying and interrogating the idea.
Don't score until you have these — ask once, then proceed with explicit
assumptions if the user is terse.

**1a. Idea type** (pick one — it changes the lens):
`software` | `content` | `local business` | `physical product` | `service`
If unclear, default to `software` but note it.

**1b. Questionnaire** — ask in one compact block, accept partial answers:

- What is the idea in one sentence? ("It is X for Y" — YC clarity test)
- Who is the target customer, specifically? (not "everyone" — name the segment)
- What painful, frequent problem does it solve? What ugly workaround do they use today?
- What will you charge, and who pays from which budget?
- How will you reach the first 100 customers? (channel you actually have)
- How serious are you? (weekend experiment vs. 6-month commitment)
- How much time per week, realistically? (hours)
- What is your edge for THIS idea? (domain, audience, skill, unfair access)

Rules:
- If the user cannot write the one-sentence "It is X for Y" so a stranger could
  reproduce the idea, the idea is not ready — ask one clarifying question.
- Classify origin: ORGANIC (lived the pain) vs MANUFACTURED ("app for X"
  brainstorm). Manufactured starts -1 on Problem Severity until evidence says otherwise.
- Never invent answers. Mark every missing field as `ASSUMPTION: <what you assumed>`.

## Step 2 — Swarm Research Workflow (The Trigger.dev Pattern)

This is the crux — the transcript's architecture is the skill's research engine.
Use it whenever you have web search / subagents; without tools, simulate it and
flag every finding as `UNVERIFIED — check X`.

```
Orchestrator (1) — owns plan, never does raw heavy reading itself
  ├─► Research agent — map market + identify 5-10 REAL competitors (with URLs/pricing)
  ├─► Fan-out: per-competitor deep dives (parallel, 1 agent per competitor)
  │     pricing, positioning, strengths/weaknesses, reviews
  ├─► Complaint miner (parallel with fan-out) — mine reviews for common
  │     complaints, praised features, and unmet needs
  └─► Aggregator → Report generator → Notify (email/dashboard save)
```

Implementation:

- **With swarm-orchestration skill available**: delegate exactly as above.
  Use `swarm-orchestration` tiers: Tier A fans out 3-5 deep dives in ONE parallel
  block; Tier B sequential; Tier C writes one file per competitor under
  `./.swarm/<idea>/`. See that skill for handoff contracts, idempotency keys,
  and budget caps.
- **Without swarm tools**: simulate the same shape — do 3-5 focused searches
  (market size, competitors, reviews) and synthesize. State "solo-simulation mode".
- **Progress UX** (from transcript): emit stage metadata as you go
  (`researching market → deep-diving competitors → mining complaints → generating report`)
  so the user never stares at a blank 5-minute load.
- **Persistence** (dashboard): save each idea + report so the user can reopen
  it. In chat, that means a markdown file per idea under `plans/<idea>/` or
  `./.swarm/<idea>/report.md`.

Guardrail from transcript: yes, this is a "ChatGPT wrapper + notes app" risk.
The defensibility is the *research depth*, not the wrapper. If the report could
be replaced by one ChatGPT prompt, it failed — demand named competitors, cited
numbers, and review-mined gaps.

## Step 3 — Score Two Lenses (Total /100, Backed by 8 Dimensions)

Score like `isthisideagood.com` — a **0-100 scorecard** the user can screenshot,
backed by 8 dimensions (1-10 each, total /80 → scaled to /100). Show math.

**Lens A — Is the IDEA good? (market verdict)**
**Lens B — Is it good FOR YOU? (founder verdict)**
Both matter. A 75/100 idea with a 30/100 founder fit is still a KILL for you.

Score each 1-10 with 1-2 lines of reasoning + cited evidence or flagged assumption.
Use web search when you have it; without tools, mark `ASSUMPTION`.

1. **Problem severity** — frequent, urgent, expensive, mandatory? People already
   hacking workarounds (sheets, manual labor, paying half-solutions)? Painkiller
   (7+) vs vitamin (≤4). Kevin Hale filter: popular, growing, urgent, expensive,
   mandatory, frequent.
2. **Market size** — bottom-up math: buyers × willingness-to-pay = TAM; then SAM
   (reachable) and SOM (year-1 capture). Show arithmetic. Tiny market caps out.
3. **Competition & wedge** — name 3-6 REAL competitors with pricing + weakness.
   No competition can mean no demand. Heavy competition needs a sharp wedge: ONE
   thing you do that incumbent does not. "Better UX" is not a wedge. State wedge
   in one sentence or score ≤4. (This is where transcript's 10/100 differentiation killed the idea.)
4. **Monetization & willingness to pay** — do customers already pay for analogous
   solutions? Who pays, how much, from which budget? Desire ≠ willingness to pay.
5. **Distribution & acquisition** — which channels reach THESE buyers with YOUR
   resources? Paid CAC vs price, organic readiness, founder's channel muscles.
   No channel = no business.
6. **Defensibility & moat** — what stops a fast follower copying the wedge in a
   quarter? Network effects, data loops, switching costs, regulatory barriers score
   high. Pure features ≤4.
7. **Timing (why now)** — trigger making now different from 2 years ago?
   Regulation, tech shift, behavior change, cost collapse. No trigger ≤4.
8. **Founder-market fit** — domain expertise, customer relationships, distribution
   advantage, sustainable energy for years. Strongest predictor of PMF (2-3x).

Feasibility gate (pass/fail, unscored): can the wedge ship as manual/concierge
MVP in ≤8 weeks given the user's stated hours/week? If no, scope must shrink
before any verdict above PIVOT.

Scale: `score_100 = round(total_80 / 80 * 100)`. Report both (e.g. "57/100 — 46/80").

## Step 4 — Kill-Filters (Say Them Out Loud)

- **Tarpit check**: feels exciting but has quietly killed hundreds (social network
  for X, marketplace with no supply, "AI for Y" with no wedge)? Name it.
- **SISP check** (solution in search of a problem): started from tech ("I want to
  use AI/blockchain") then shoehorned a problem? Flag it.
- **Vitamin check**: if you must convince prospects they have the problem, or
  every polite "that's cool" excites you — vitamin. Polite interest = NO. Only
  strong emotion + past workaround behavior counts.
- **Wrapper check** (transcript-specific): is this just "ChatGPT wrapper + notes"?
  If the only moat is "we save your ideas on a dashboard," score defensibility ≤3
  and force a wedge rewrite.

## Step 5 — Dual Verdict (Total Determines It)

| Total /80 | /100 | Verdict | Meaning |
|-----------|------|---------|---------|
| 58+ | 72+ | **BUILD** | Strong fundamentals. Proceed to waitlist + interviews. |
| 42-57 | 52-71 | **CONDITIONAL** | Merit, but fix the 1-2 weakest dimensions first. |
| 26-41 | 32-51 | **PIVOT** | Fundamental flaw. Pivot angles below, do not build as-is. |
| <26 | <32 | **SCRAP (fun only)** | Do not build for sale. Build for fun/learning only if joy justifies it. |

Always include:
- **Market verdict** (is the idea good?) and **Founder verdict** (is it good for YOU?)
  — they can diverge. Example: "Market: CONDITIONAL 58/100, Founder: SCRAP 28/100 → overall SCRAP for you."
- **What would change the verdict** — the ONE dimension that flips it.
- Transcript honesty: if SCRAP, say plainly "kill it" and give explicit permission
  to build for fun if the joy justifies it (like the video's "we're keeping it anyway").

## Step 6 — Improvement Playbook (Always Include — This Is the Skill's Job)

1. **Top 3 fixes** — concrete, ordered by weakest dimension. Each: what to change,
   why, how to test in days not months.
2. **Niche-down option** — smallest segment where pain is most acute
   (e.g. "dentists with 2-5 chairs" not "healthcare"). Niches make wedges sharp.
3. **2-3 pivot angles** — adjacent ideas preserving founder's edge while attacking
   a sorer pain or clearer channel.
4. **Wedge sharpening** — rewrite the one-sentence wedge until an incumbent user
   would switch for THAT reason alone. If you cannot, the wedge does not exist.

If SCRAP: still deliver this playbook — the user learns more from a killed idea
with pivots than from a vague "bad idea."

## Step 7 — Next Experiments + Kill Criteria (Riskiest First)

Order by riskiest assumption (usually willingness-to-pay or distribution).
Each experiment: hypothesis, method, sample size, pass/fail number, timebox.

- **Mom Test interviews (10-20)**: talk about THEIR life, not your idea. Ask past
  behavior ("what did you do last time X happened? what did it cost?"), never
  hypotheticals ("would you use...?"). Compliments are not data — dig for
  commitment (money, time, reputation, data shared).
- **Demand capture**: landing page + waitlist BEFORE building; price test
  ("$X/mo, card to join beta" beats "would you pay?").
- **Manual-first MVP**: deliver outcome by hand (concierge). Watch for genuine
  emotion — polite "cool" is failure.
- **Kill criteria with numbers + dates**: e.g. "fewer than 10 paying customers by
  day 60 → pause; 40+ → accelerate." Set them NOW while honest.
- **Re-score trigger**: re-run this skill when anything material changes.

## Report Template (ALWAYS Use This Exact Structure)

```markdown
# Idea Verdict: <one-sentence "It is X for Y">
## Verdict: <BUILD / CONDITIONAL / PIVOT / SCRAP (fun only)> — <score>/100 (<total>/80)
### Market verdict: _/100 | Founder verdict: _/100
## Scores (evidence each, flag assumptions)
1. Problem severity: _/10 — ...
... (all 8 + feasibility gate pass/fail)
## Kill-filters: tarpit / SISP / vitamin / wrapper — ...
## What would change the verdict: ...
## Competitors named (with pricing + weakness):
- ...
## Market math: TAM $X = ... | SAM $Y | SOM $Z (show arithmetic)
## Complaint mining: top complaints / praised features / gaps
## Improvement playbook
### Top 3 fixes / Niche-down / Pivot angles / Sharpened wedge
## Next experiments (riskiest first + kill criteria)
## Dashboard: saved to <path> — reopen anytime
```

Rules: be direct, never cruel. A low score indicts the IDEA's commercial math,
not the founder. Cite sources or mark UNVERIFIED. Never invent prices, TAM, or
competitor claims — write "unverified, check X" instead. If the idea is
`isthisideagood.com` itself, be extra brutal (transcript scored it 57/100, 10/100
differentiation — crowded, no clear mechanism).

## Companion Skills

- **swarm-orchestration**: use for Step 2 fan-out. This skill defines WHAT to
  research; that skill defines HOW to orchestrate it across any AI/environment.
