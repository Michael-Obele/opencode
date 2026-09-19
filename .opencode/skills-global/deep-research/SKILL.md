---
name: deep-research
description: Force multi-source deep research with opposing viewpoint analysis. Use this skill whenever the user asks about any topic that requires verified information — research, investigation, comparison, "is it true that", "what does the evidence say", "pros and cons", "compare X vs Y", fact-checking, literature review, market analysis, technology evaluation, or any question where relying on model knowledge alone is insufficient. Also trigger on phrases like "deep dive", "thorough analysis", "what are the arguments for/against", "is there consensus on", or when the user explicitly says "research this" or "look this up". When in doubt, trigger — it is better to over-research than to present unverified claims.
---

# Deep Research

This skill forces a structured, multi-source research process that treats model knowledge as **unreliable** and requires external verification for every factual claim. The goal is not to find one answer — it is to map the full landscape of perspectives, including views that contradict the apparent consensus.

## Why This Exists

Language models have training data that may be outdated, biased toward majority views, or confidently wrong on niche topics. This skill ensures that every claim presented to the user is backed by real, citable sources — and that opposing views are actively sought out, not ignored.

## Research Depth Levels

Before starting, assess which depth the user needs. Default to **Standard** unless the user specifies otherwise or the topic is high-stakes (medical, legal, financial, security).

| Level | Sources per claim | Opposing views | When to use |
|-------|-------------------|----------------|-------------|
| Quick | 1-2 | At least 1 | Simple factual lookups, "what is X" |
| Standard | 3-5 | At least 2 | Most research questions, comparisons |
| Deep | 5-10+ | At least 3-4 | High-stakes, controversial, or complex topics |

If the user says "deep dive", "thorough", "exhaustive", or "comprehensive", use **Deep**.

---

## Phase 1: Decompose

Break the research question into sub-questions. This prevents shallow answers and ensures coverage.

1. **Write down the core question** the user is asking
2. **Identify 3-6 sub-questions** that together would answer the core question. Think about:
   - What factual claims need verification?
   - What are the key terms or concepts that need definition?
   - What comparisons or trade-offs are involved?
   - What historical context is relevant?
   - What does the user likely already believe, and what might challenge that?
3. **For each sub-question, note the type of source most likely to answer it** (academic paper, news article, official docs, expert blog, primary data, etc.)

Output a brief research plan before proceeding. This makes the research auditable and helps the user course-correct.

---

## Phase 2: Search and Gather

Use the best available tools for each sub-question. **Do not rely on model knowledge for factual claims.** Every claim must come from an external source found during this phase.

### Tool Selection Guide

Use these tools in order of preference based on what's available:

| Tool | Best for | Notes |
|------|----------|-------|
| `firecrawl_search` | Broad web searches, finding multiple sources on a topic | Start here for most queries |
| `firecrawl_scrape` | Deep-reading a specific page you found | Use after search to get full content |
| `firecrawl_agent` | Complex multi-page research, autonomous browsing | Use for deep dives requiring navigation across sites |
| `firecrawl_extract` | Structured data extraction from known pages | Use when you need specific fields (prices, specs, etc.) |
| `fetch_webpage` | Simple page reads when you have a URL | Lightweight alternative to scrape |
| `mcp_exa_web_search_exa` | Targeted semantic search | Good for finding high-quality sources |
| `mcp_exa_web_fetch_exa` | Reading specific URLs found via Exa | Follow-up to Exa search |
| Domain-specific MCPs | Svelte docs, Neon docs, etc. | Use when the topic falls in a specific domain |

### Search Strategy

For each sub-question:

1. **Start broad** — search the general topic to understand the landscape
2. **Narrow down** — search for specific claims, data points, or expert opinions
3. **Cross-reference** — verify important claims across at least 2 independent sources
4. **Check recency** — prefer recent sources; note dates and flag stale information

**Important**: Run multiple searches. A single search is not deep research. Use different query phrasings to surface different perspectives.

### Source Quality Tiers

Rate each source you find:

- **Tier 1 — Primary/Authoritative**: Official docs, peer-reviewed papers, government data, first-party announcements
- **Tier 2 — Expert/Reputable**: Established publications, recognized experts, well-maintained references
- **Tier 3 — Community/Opinion**: Blog posts, forum discussions, social media, personal experience
- **Tier 4 — Unverified**: Random websites, AI-generated content, sources without citations

Prefer Tier 1-2 sources. Always note the tier when citing.

---

## Phase 3: Seek Opposing Views

This is the critical differentiator. After gathering initial sources, **actively search for perspectives that contradict your findings.**

### How to Find Opposing Views

1. **Invert the query** — If you searched "benefits of X", also search "problems with X", "X criticism", "X debunked", "against X"
2. **Search for dissent** — Add terms like "controversial", "debate", "criticism", "limitations", "risks", "alternatives"
3. **Check different communities** — Search in communities that might have different priors (e.g., if researching a tech topic, check what non-technical or critical voices say)
4. **Look for retraction/correction** — Search for "[topic] retracted", "[topic] corrected", "[topic] debunked"
5. **Find the strongest version of the opposition** — Don't strawman. Find the most thoughtful, well-argued case against the position you're leaning toward

### Opposing View Protocol

For each major claim in your research:
- State the claim
- List supporting sources (with quality tier)
- List opposing or qualifying sources (with quality tier)
- Note where the disagreement exists and what each side cites as evidence
- Rate the strength of the consensus: **Strong consensus** / **Moderate consensus** / **Active debate** / **No consensus**

---

## Phase 4: Synthesize

Combine all findings into a structured response.

### Output Format

Use this structure:

```
# [Research Topic]

## Research Plan
[Brief summary of sub-questions investigated]

## Key Findings

### Finding 1: [Title]
**Claim**: [The factual claim]
**Confidence**: High / Medium / Low
**Consensus**: Strong consensus / Moderate consensus / Active debate / No consensus

**Supporting evidence**:
- [Source 1] (Tier X) — [What it says]
- [Source 2] (Tier X) — [What it says]

**Opposing/qualifying evidence**:
- [Source 3] (Tier X) — [What it says]
- [Source 4] (Tier X) — [What it says]

**Assessment**: [Your synthesis of what the evidence says and where uncertainty remains]

### Finding 2: [Title]
[Same structure]

## Areas of Disagreement
[Where sources conflict and what each side argues]

## Gaps and Unknowns
[What you couldn't find good sources on, and what would need further research]

## Sources
[Full list of sources used, with URLs and quality tiers]
```

### Confidence Ratings

- **High**: Multiple Tier 1-2 sources agree, no credible opposition found
- **Medium**: Sources agree but are Tier 2-3, or opposition exists but is weaker
- **Low**: Only Tier 3-4 sources, significant disagreement, or topic is niche/understudied

---

## Phase 5: Quality Check

Before presenting results, verify:

- [ ] Every factual claim has at least one external source citation
- [ ] Opposing views were actively sought (not just passively noted if encountered)
- [ ] Source quality tiers are noted
- [ ] Confidence levels reflect the actual strength of evidence
- [ ] You have not presented model knowledge as fact without verification
- [ ] Dates of sources are noted where relevance depends on recency
- [ ] Areas of uncertainty are explicitly called out, not glossed over

If any check fails, go back and do more research before presenting.

---

## Anti-Patterns to Avoid

1. **"As of my knowledge cutoff"** — Never use this phrase. Research the current state instead.
2. **Single-source claims** — Find at least 2 sources for important claims.
3. **Cherry-picking** — If 7 of 10 sources say X and 3 say Y, mention both proportions, not just X.
4. **Ignoring weak opposition** — Even weak opposing arguments should be noted; the reader can judge their weight.
5. **Confident hedging** — Don't say "It is generally accepted that..." unless you have sources. Don't say "Some argue that..." without citing who.
6. **Research theater** — Don't do 1 search and call it deep research. Multiple searches with different angles are required.
7. **Skipping the oppose phase** — This is the most common failure. Always spend time explicitly looking for views against the grain.

---

## Quick Reference: Research Prompts

When searching, vary your queries to get different perspectives:

| Goal | Example queries |
|------|----------------|
| Broad overview | `"[topic] overview"`, `"[topic] guide"` |
| Specific claims | `"[topic] statistics"`, `"[topic] data"`, `"[topic] evidence"` |
| Expert views | `"[topic] expert opinion"`, `"[topic] analysis"` |
| Criticism | `"[topic] criticism"`, `"[topic] problems"`, `"[topic] debunked"` |
| Alternatives | `"[topic] alternatives"`, `"[topic] vs"`, `"better than [topic]"` |
| Recency | `"[topic] 2024"`, `"[topic] latest"`, `"[topic] update"` |

---

## When to Stop

Stop researching when:
1. You've addressed all sub-questions from Phase 1
2. You've found opposing views for every major claim
3. Additional searches are returning the same sources (diminishing returns)
4. The user asks you to wrap up

If you can't find good sources for something, say so explicitly rather than presenting weak evidence as strong.