# Cubik CRM — Case Study

> Editable copy extracted from [src/pages/work/cubik-crm.astro](src/pages/work/cubik-crm.astro).
> Hand back when revised and I'll apply the changes to the page.
>
> Formatting conventions:
> - `**X**` → dark text emphasis (one short phrase per phase)
> - `` `X` `` → inline code / monospace (component / file / command names)
> - `==X==` → orange accent (used sparingly for key metrics in Phase 04)

---

## Meta sidebar

**Project name:** Cubik CRM
**Project slug:** cubik-crm
**Prev project:** cubik-ai
**Next project:** —

### Summary

Most CRMs track current stage. Cubik CRM surfaces temporal urgency — brokers see which deals entered Contacted yesterday vs two weeks ago through pure-function heat scoring, eliminating manual date-checking to find stale opportunities.

### Timeline

Solo build, integrated with existing quote engine

### Tools

Figma, Claude Code, Next.js 14, TypeScript, @dnd-kit, Upstash Redis, Neon Postgres, Drizzle ORM

### Outcome

Production admin suite with 5-stage pipeline kanban, auto-promotion from leads, configurable heat curves

### Key metrics

Sub-200ms optimistic drag, pure-function heat scoring, float-based position reordering

---

## 01 — Discover

### Phase title

Surfacing temporal urgency in pipeline tracking

### Problem

Brokers track deal pipelines across spreadsheets, sticky notes, and email folders. They can see current stage — but not which deals entered Qualified yesterday vs two weeks ago. A deal sitting in Proposal for 10 days is stale, but spreadsheets don't surface that without manual date-checking.

### Prose

Despite sophisticated quoting tools, **pipeline management remained stuck in the 1990s**: Excel with color-coded rows, physical sticky notes, email folder organization. Brokers knew this was fragile — spreadsheets weren't collaborative, sticky notes couldn't alert, email folders provided no urgency signaling.

Traditional CRMs either over-engineered (enterprise tools requiring IT integration) or under-engineered (contact managers that didn't understand property finance stages). The insight: brokers needed visual, temporal, and kinesthetic management — see all deals at once, understand urgency at a glance, physically move cards through stages.

### What I learned

The problem wasn't tracking current state — it was surfacing temporal urgency (how long has this deal been here?) and providing a kinesthetic interface that matched brokers' mental models of "moving deals forward."

---

## 02 — Define

### Phase title

Heat scoring as pure function of time-in-stage

### Problem

Build a visual kanban that surfaces temporal urgency through pure-function heat scoring, integrates with the quote engine via auto-promotion, and provides drag-and-drop stage management without sacrificing data integrity or admin query capabilities.

### Prose

The kanban structure was straightforward — five columns (Contacted → Qualified → Proposal → Won → Lost). But static boards don't convey urgency. **Core innovation: heat scoring as pure function** of `(stage, stageEnteredAt, today)` rather than stored score. Each stage has a decay curve: Contacted defaults to 5 bars day 0, dropping to 1 bar at 4+ days. Won and Lost are terminal (no heat bar). Curves configurable per-stage in code via `STAGE_CURVES` functions.

Integration was critical: when a broker changes lead status to `contacted`, the system fires `promoteLeadToCase` — quote generation and pipeline tracking become one workflow. Storage: Redis canonical, Postgres mirror.

### What I learned

Heat scoring works as a pure function rather than stored state — recalculating on every render from `stageEnteredAt` + today eliminates drift and allows tuning curves without data migrations.

---

## 03 — Develop

### Phase title

Optimistic updates hide API latency for perceived instant response

### Problem

Implement `@dnd-kit` drag-and-drop with optimistic updates, build float-based reordering without race conditions, integrate auto-promotion from leads, design heat bar UI that communicates urgency without clutter, and ensure Postgres mirror writes never block operations.

### Prose

Drag-and-drop used `@dnd-kit` with three critical details: **optimistic UI updates** (card moves immediately, API call in background), float-based `position` recalculation (dropping between 1.0 and 2.0 creates position 1.5 — no re-indexing), and "pointerWithin" collision detection for overlapping cards.

Auto-promotion spliced into `PATCH /api/leads/[id]`: status flip to `contacted` fires `promoteLeadToCase`, creates a Redis case with `PIPE-XXXXXX` ID, captures the quote snapshot, writes a Postgres mirror with failure tolerance. Heat renders as 5 compact bars — filled orange, empty grey, none for Won/Lost. Click-to-email on the leads table opens a pre-composed mailto with quote context.

### What I learned

Optimistic updates for drag-and-drop are essential for perceived performance — API latency is hidden when the UI responds instantly, even if server round-trip takes 150–200ms to persist position changes.

---

## 04 — Deliver

### Phase title

Visual anomalies became data quality feedback signals

### Problem

Deploy production kanban, validate auto-promotion reliability, measure drag-and-drop performance (optimistic vs actual persist times), and confirm heat scoring surfaces actionable urgency signals for brokers.

### Prose

Deployment followed standard protocol: `vercel --prod --yes`, manual migration post-deploy, row-count parity checks. Auto-promotion validation: create a test lead via chat, change status to `contacted` in `/admin/leads`, confirm disappearance from the leads table and appearance in Contacted with 5 bars. Performance landed on ==optimistic UI <50ms== and ==server persist 150–200ms==.

Heat scoring effectiveness emerged through real usage — brokers reported **3-bar and below cards immediately stood out** as "I need to follow up today." Unexpected: visual anomalies (5-bar Won cards, 1-bar Contacted cards) became conversation triggers, surfacing process issues beyond just urgency.

### What I learned

Visual anomalies (5-bar Won cards, 1-bar Contacted cards) became conversation triggers — heat scoring wasn't just urgency signaling, it was data quality feedback that surfaced process issues.
