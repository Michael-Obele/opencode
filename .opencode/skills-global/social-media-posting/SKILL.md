---
name: social-media-posting
description: Draft, review, and publish authentic, high-engagement social media posts through the Aghara MCP (Bluesky, LinkedIn, Mastodon, Threads, Telegram, Discord). Use this skill for ANY social media request — "post this", "draft a post", "share this on Bluesky", "schedule a post/thread", "write a LinkedIn post", "promote my app", "announce a launch", "share a build", "write something for my followers" — even if the user doesn't explicitly say "social media." Applies research-backed psychology of posting: hooks, emotion, audience targeting, tone consistency, anti-repetition rules, dosed (never overdone) playfulness, and platform-correct hashtag usage. Prevents the classic mistakes: generic tone, repetitive phrasing, wrong hashtag counts, overdone jokes, and posts aimed at nobody.
---

# Social Media Posting (via Aghara)

Draft and publish social posts that people actually engage with — using the psychology of why people share, stop scrolling, and trust a voice. This skill covers the full flow: understanding the audience, choosing the right hook, calibrating tone, avoiding repetition, using hashtags correctly per platform, and sending through Aghara.

## When to use

Any time the user asks you to write or publish social media content — a post, thread, announcement, update, share, or "something for my followers." Also when they hand you content ("here's my new app / article / milestone") and want it turned into a post.

## The four failure modes this skill prevents

1. **Wrong tone** — corporate-speak, hype, or robotic phrasing that no real person would say.
2. **Repetition** — posting the same hook, angle, or hashtag set over and over until followers tune out.
3. **No audience** — writing to "everyone" (i.e., nobody) instead of one specific imagined reader.
4. **Hashtag mistakes** — dumping hashtags where they don't belong (Bluesky) or skipping them where they do (LinkedIn).

## Mandatory workflow

Follow these steps in order. Do NOT skip the pre-flight or the self-check gate.

### Step 1 — Pre-flight (before writing anything)

1. **Check the tool state**: call `aghara_accounts` (action=list) to see connected accounts and `aghara_platforms` to get per-channel character limits. If no account is connected for the target platform, tell the user and stop.
2. **Clarify the goal** (ask if not obvious): inform / entertain / promote / connect / celebrate. One post = one goal.
3. **Define the audience** — write one sentence: "I'm posting for [specific person type] who [cares about X] and [is deciding/feeling Y]." Speak to ONE imagined reader, not a crowd. If the user doesn't specify, infer from the content and their account (e.g., a developer account → other developers, indie hackers, Svelte folks).
4. **Check the platform** — the same idea needs different treatment on Bluesky (300 chars, casual, minimal hashtags) vs LinkedIn (3000 chars, professional, hashtags expected). See `references/platforms.md`.

### Step 2 — Draft

Apply the psychology (`references/psychology.md` for the "why"):

1. **Hook first.** The opening line decides whether anyone reads on. Use one of: a specific surprising fact, a bold-but-true claim, a question that creates a curiosity gap, a small confession, or a concrete number. No throat-clearing ("Excited to announce...", "Just wanted to share...").
2. **One idea per post.** If there are two ideas, that's two posts (or a thread).
3. **High-arousal emotion.** People share what makes them feel something strongly — awe, amusement, excitement, curiosity, sometimes righteous frustration. Pick the emotion that fits the content honestly. Don't manufacture drama.
4. **Specificity beats adjectives.** "Cut our API latency from 900ms to 40ms" beats "made things way faster." Concrete details are what make a post feel real and credible.
5. **First person, simple words.** Write as the person, not the brand. Use the simplest words that say what you mean; never pick a big word to sound smart. Short sentences. Contractions. Always capitalize "I" (never lowercase "i"). No buzzwords ("leverage", "synergy", "revolutionary", "game-changing"). Never use em dashes (—) or en dashes (–) as punctuation; use a semicolon, period, or comma instead. Then strip every AI-writing tell (significance inflation, "It's not just X, it's Y", rule of three, decorative emojis — see `references/tone.md`). Sincerity + expertise + a specific point of view = trust.
6. **Respect the platform length.** Bluesky: aim for 150–280 chars (leave headroom). LinkedIn: 1200–1600 chars is the sweet spot. See `references/platforms.md`.
7. **Playfulness (optional, dosed).** A little goofy-but-grounded humor is welcome — but check recent posts first (`aghara_posts` action=list, or ask the user) and follow the dose rules in `references/playfulness.md`. Max 1 playful beat; never two playful posts in a row.

### Step 3 — Self-check gate (run BEFORE sending)

Read your draft and verify every line:

- [ ] **Tone**: Would a real person say this out loud? Are the words simple and everyday; no big words used to sound smart? No corporate-speak, no hype, no AI-sounding filler ("In today's fast-paced digital world")? No AI-writing tells ("It's not just X, it's Y", rule of three, "testament/landscape/showcasing", decorative emojis)? No em dashes (—) or en dashes (–); use semicolon, period, or comma instead. Is "I" always capitalized (never "i")? If it sounds like a press release or a smart-sounding essay, rewrite.
- [ ] **Playfulness**: Checked recent posts before adding humor? If the last post was playful, this one is grounded. Max 1 playful beat. Humor in the situation, not the words. Self-deprecating only. See `references/playfulness.md`.
- [ ] **Hook**: Does the first line make you want to read the second? If the first line is generic, rewrite it.
- [ ] **Repetition**: Is this the same angle/hook/structure as the last post on this topic? Vary it. Don't reuse the same hashtag set verbatim. If you can't tell, assume yes and change the opening.
- [ ] **Audience**: Read it back as the imagined reader — would THEY care? If it's about you without a reason for them to care, add the "why it matters" line.
- [ ] **Hashtags**: Correct count for the platform (Bluesky 0–3, LinkedIn 2–5, Mastodon/Threads 1–3, Telegram/Discord 0). Relevant, not generic (#dev ≠ #svelte unless the audience actually searches it).
- [ ] **Length**: Under the platform limit with headroom. If over on Bluesky, cut, don't cram.
- [ ] **One idea**: If it does two things, split it.

### Step 4 — Deliver

1. Call `aghara_platforms` to confirm limits (required before creating).
2. Call `aghara_posts` (action=create) with the post body and targets (the connected account id from `aghara_accounts`).
   - If over the channel limit on a thread-capable channel (Bluesky/Mastodon/Threads/Telegram/Discord), pass explicit `segments[]` (each ≤2000) to make a thread.
   - LinkedIn does NOT split — if over 3000, cut the post down.
3. If the user wants it live now, use action=publish_now. If they want it later, pass `runAt` (ISO time).

## Tone calibration

Your default voice for this account (Michael Obele — SvelteCore Systems Ltd, Bluesky svelte-apps.me, X @Dev_Obele): a working developer who ships things. First person, plain and simple — say complex things with the simplest words. Never try to sound smart. Goofy but grounded — a little dry, self-deprecating playfulness, dosed. See `references/tone.md` for calibration and `references/playfulness.md` for the playfulness rules.

## References

- `references/psychology.md` — the research behind the rules (why emotion, hooks, and authenticity work)
- `references/platforms.md` — per-channel limits, hashtag rules, and format guidance
- `references/tone.md` — voice calibration, the AI-writing-tells checklist, and before/after examples
- `references/playfulness.md` — the goofy-but-grounded playfulness rules (Duolingo-inspired, dosed), including how to check previous posts