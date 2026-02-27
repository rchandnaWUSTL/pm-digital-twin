---
title: "PM Intelligence System"
subtitle: "[PRODUCT] Product Management Automation --- Claude Code Agent Runtime"
date: "February 2026"
geometry: margin=1.8cm
fontsize: 11pt
documentclass: article
header-includes:
  - \usepackage{booktabs}
  - \usepackage{longtable}
  - \usepackage{enumitem}
  - \setlist{nosep}
  - \usepackage{fancyhdr}
  - \pagestyle{fancy}
  - \fancyhead[L]{\small PM Intelligence System}
  - \fancyhead[R]{\small [PRODUCT]}
  - \fancyfoot[C]{\small\thepage}
  - \renewcommand{\headrulewidth}{0.4pt}
  - \usepackage{parskip}
  - \setlength{\parskip}{0.4em}
  - \usepackage{microtype}
  - \tolerance=1000
  - \setlength{\emergencystretch}{3em}
  - \usepackage{array}
  - \renewcommand{\arraystretch}{1.2}
  - \usepackage{etoolbox}
  - "\\AtBeginEnvironment{longtable}{\\small}"
---

# Executive Summary

Product managers drown in unstructured customer feedback. Every customer call generates notes that must be parsed, synthesized, and transformed into structured intelligence---field notes, backlog items, product requirements. This manual process is time-consuming, error-prone, and results in lost signals when important feedback fails to make it into the backlog.

This system automates the transformation of raw customer conversations into actionable product intelligence. Built on Claude Code as the agent runtime, it converts meeting transcripts into formatted field notes, maintains customer profiles, synthesizes insights across conversations, syncs evidence to Jira, and generates PRDs and PRFAQs grounded in customer evidence.

**Key Value Propositions:**

- **Two-Phase Execution:** Phase 1 (analyze) runs autonomously---reading notes, extracting insights, identifying patterns. Phase 2 (act) always requires explicit human approval before writing to external systems like Jira or generating product documents.

- **Graph-Based Knowledge Management:** Wikilinks connect customers, notes, Jira issues, and product context into a traversable graph. Semantic context loading retrieves only relevant background for each task. 1-hop traversal prevents context explosion while enabling rich context retrieval.

- **Composable Skill Architecture:** 25 self-contained skills with JSON schemas compose into pipelines (full-call, PRD, PRFAQ) or run standalone. Each skill is specified in `/skills/{name}/SKILL.md` with explicit input/output contracts and behavior rules.

- **Router-Based Ingestion:** Smart format detection auto-classifies pasted content (Slack threads, RFCs, blog posts, emails) and routes to specialized parsers. Consistent frontmatter metadata across all ingested content enables semantic retrieval.

- **Zero Data Loss:** Every transformation writes intermediate artifacts to the filesystem. Full audit trail from raw notes to formatted notes to insights to Jira. No black-box operations. Complete transparency and debuggability.

**Scale and Maturity:**

- **25 skills** across 6 categories (memory/fetch, extraction, ingestion, merge, output, analysis)
- **4,808 lines** of skill documentation
- **69 context files** across 7 subdirectories
- **[N] customer notes** processed and stored
- **[N] lighthouse customer profiles** with full pipeline treatment
- **[N] Jira issues** in reference snapshot
- **7 active epics** tracked for [PROJECT_KEY] project
- **[N] KB total** repository size ([N] KB skills + [N] KB context)

The system is operational and battle-tested across multiple customer engagements, with an evaluation framework in place to capture failure modes and improve reliability.

# Stats & Scale

## Skills and Documentation

| Metric | Count |
|--------|-------|
| **Total skills** | 25 |
| Memory & fetch tools | [N] |
| Extraction tools (parallel) | [N] |
| Ingestion tools | 4 |
| Merge operations | 1 |
| Output generators | 6 |
| Analysis tools | 3 |
| Refresh utilities | 1 |
| **Skill documentation lines** | 4,808 |

Each skill lives in `/skills/{name}/SKILL.md` with explicit input/output JSON schemas, behavior specifications, and integration contracts.

## Context Storage

| Directory | Files | Purpose |
|-----------|-------|---------|
| `customer-notes/` | [N] | Formatted field notes from calls |
| `customer-profiles/` | [N] | Lighthouse customer profiles (JSON) |
| `product-context/` | 4 | PRDs, Slack threads, Jira snapshot |
| `insights/` | Variable | Synthesized insights per call |
| `pending/` | Variable | Suspended workflow state |
| `system/` | 1 | Learning log (mistake prevention) |
| `templates/` | Variable | Document templates |
| **Total context files** | 69 | |
| **Total context size** | [N] KB | |

## Product Context

| Metric | Count |
|--------|-------|
| **Jira issues tracked** | [N] |
| Active epics ([PROJECT_KEY] project) | 7 |
| PRDs generated | 1 |
| Slack threads ingested | 1 |
| Engineering doc summaries | 0 (infrastructure ready) |
| Prior art analyses | 0 (infrastructure ready) |
| Market signals | 0 (infrastructure ready) |
| Field signals | 0 (infrastructure ready) |
| Engineering signals | 0 (infrastructure ready) |

The system includes placeholder subdirectories for market/field/engineering signals, prior art analyses, and RFC ingestion. These paths are integrated into the semantic context loading system and ready for production use.

## Lighthouse Customers

| Customer | Notes | Profile Status |
|----------|-------|----------------|
| [CUSTOMER_1] | [N] | Active |
| [CUSTOMER_2] | [N] | Active |
| [CUSTOMER_3] | [N] | Active |
| [CUSTOMER_4] | [N] | Active |
| [CUSTOMER_INTERNAL] | [N] | Active |

Lighthouse customers receive full pipeline treatment: extraction, insights synthesis, Jira sync. Non-lighthouse customers get notes formatted and stored only.

## Repository Scale

| Component | Size |
|-----------|------|
| Skills directory | [N] KB |
| Context directory | [N] KB |
| **Total** | **[N] KB** |

Compact, filesystem-based architecture with no external database dependencies.

# Design Principles

## Transparent by Design

Every transformation writes intermediate artifacts to disk. The system produces a complete audit trail:

```
Raw notes → Formatted notes → Customer profile updates →
Insights JSON → Insights one-pager → Jira sync log
```

No black-box operations. Every step is inspectable, reproducible, and debuggable. Users can trace any Jira issue back to the original customer quote and meeting date.

**Why:** Transparency builds trust, enables debugging, and ensures reproducibility. When a PM needs to justify a prioritization decision, the full evidence chain is available.

## Two-Phase Execution Model

**Phase 1 (Analyze):** Read notes, extract themes, synthesize insights, write local files. Safe to run autonomously. No external side effects.

**Phase 2 (Act):** Write to Jira, generate PRDs/PRFAQs. Always requires explicit human approval. Gated by HITL suspend points.

**Why:** This prevents accidental backlog pollution and gives PMs control over what gets written to external systems. The system can autonomously gather intelligence but never acts on it without permission.

## Evidence-Grounded Intelligence

All outputs trace back to customer notes with direct quotes and dates. The system never fabricates customer evidence. When evidence is insufficient for a PRD (fewer than 2 customers or 3 mentions), it explicitly falls back to a signal brief rather than inventing requirements.

**Why:** Credibility with stakeholders depends on traceability. Engineering teams trust PRDs that cite specific customer quotes with dates. Fabricated evidence destroys this trust.

## Resumable Workflows

Workflows suspend at decision points (HITL-1 through HITL-4, HITL-TP). State serializes to `/context/pending/*.pending.json`. Resume commands restore full context and continue execution.

**Why:** Approval workflows are often asynchronous. A PM might review a Jira sync proposal hours or days after the initial analysis. State persistence prevents lost work and enables multi-session workflows.

## Parallel-First Execution

Independent operations MUST run concurrently. The 5 extraction tools operate as a parallel branch---each analyzing the same input, producing disjoint outputs, merging deterministically. Jira write operations run in parallel when approved. Session startup parallelizes 4 file reads.

**Why:** Latency reduction and cost efficiency. Five sequential LLM calls take 5-10 seconds; five parallel calls take 1-2 seconds (dominated by the slowest). Same token cost, 5× faster.

## Skill-Composable Architecture

25 self-contained skills with JSON input/output schemas. Skills compose into pipelines (full-call, PRD, PRFAQ) or run standalone. Each skill specification lives in `/skills/{name}/SKILL.md`.

**Why:** Reusability, testability, maintainability. New workflows can reuse existing skills. Each skill can be tested independently. Improvements to one skill benefit all pipelines that use it.

## Graph-Based Knowledge Management

Wikilinks (`[[target]]` syntax) connect customers, notes, Jira issues, and product context. 1-hop traversal loads immediate neighbors but never recurses. Semantic context loading filters product context by relevance judgment, not exhaustive indexing.

**Why:** Bounded token usage. A knowledge base with hundreds of documents becomes unusable if every operation loads everything. Semantic filtering and 1-hop traversal keep context relevant and manageable.

# System Architecture

## 4.1 Memory Model

The system uses a filesystem-based memory architecture. No database---all state lives in files under `/context/`.

### Session Memory (Loaded at Start)

At the beginning of every session, four data sources load into working memory in parallel:

| \# | Action | Source | Purpose |
|----|--------|--------|---------|
| 1 | Read all customer profiles | `customer-profiles/*.json` | Immediate access to customer context |
| [N] | Read Jira issue reference | `product-context/jira-snapshot.json` | Backlog state for matching |
| 3 | Read learning log | `system/learning-log.md` | Mistake prevention patterns |
| 4 | Check suspended workflows | `pending/*.pending.json` | Resumable workflows from prior sessions |

This parallel load happens automatically at session start. The agent has instant access to all customer context, current backlog state, learned patterns, and pending approvals.

### Customer Memory (Profiles)

Each lighthouse customer has a JSON profile that accumulates over time:

- **Stack:** Technologies, tools, integrations the customer uses
- **Top pain points:** Current friction and blockers, updated after each call
- **Open asks:** Feature requests with `first_raised`, `times_mentioned`, `jira_issue` link
- **Key contacts:** Names and roles from calls
- **Relationship summary:** Narrative context about the customer relationship
- **Notes files:** Links to all formatted notes for this customer

Profiles use **additive merge**---`update-customer-profile` never deletes existing data. Each call adds information while preserving full history. This enables trend analysis: "Pain point first raised 3 months ago, mentioned 5 times since."

### Semantic Context Loading

Product context files (PRDs, engineering docs, prior art analyses, signals) use YAML frontmatter for semantic retrieval:

```yaml
---
project_tag: "Human-readable project name"
one_line_description: "What this doc is and why it matters"
doc_type: engineering_doc | prior_art | prd | signal | prfaq | slack_thread
signal_source: market | field | engineering
date_ingested: YYYY-MM-DD
related_customers: []
related_jira: []
related_docs: []
---
```

When a skill needs product context (e.g., `prd-generator` gathering evidence):

1. Read frontmatter (`project_tag` + `one_line_description`) from all `.md` files in `/context/product-context/`
2. Make a semantic judgment about relevance---"MCP Server" and "[PRODUCT_SHORT] MCP" both match an MCP-related task
3. Load only matching files into full context

**Why semantic, not keyword matching?** Handles synonyms, paraphrasing, and contextual relevance. "Vulnerability scanning" matches docs about "CVE detection" or "security posture."

### Learning Log

`/context/system/learning-log.md` records mistakes, corrections, and learned patterns. Loaded at every session start, it prevents the agent from repeating past errors across sessions.

Example entries:
- "Never match to Closed Jira issues---always propose new issue"
- "[CUSTOMER_2] mentions [COMPLIANCE_STANDARD] benchmarks frequently---recognize as compliance ask"
- "When customer says '[TOOL_A] integration,' check if they mean selector or vulnerability data"

## 4.2 Graph Architecture

Product context forms a graph connected by wikilinks. This enables rich context retrieval without loading everything.

### Four Wikilink Target Types

| Target Type | Format | Example |
|-------------|--------|---------|
| Product context | `[[filename-without-extension]]` | `[[cis-benchmark-prd-2026-02-20]]` |
| Customer profile | `[[Canonical Name]]` | `[[[CUSTOMER_1]]]` |
| Jira issue | `[[KEY-NUMBER]]` | `[[[PROJECT_KEY]-002]]` |
| Customer note | `[[canonical-YYYY-MM-DD]]` | `[[[customer-1]-2026-02-15]]` |

**Resolution paths:**
- **Product context** → `/context/product-context/{subdir}/{filename}.md`
- **Customer profile** → `/context/customer-profiles/{canonical}.json`
- **Jira issue** → Display-only hyperlink (not traversable)
- **Customer note** → `/context/customer-notes/{filename}.md`

### 1-Hop Traversal Pattern

When a skill explicitly needs rich context, it follows wikilinks **exactly one hop**:

```
1. Load target file (e.g., PRD)
2. Parse frontmatter: extract related_customers, related_jira, related_docs
3. Parse body: extract [[wikilink]] patterns
4. For each wikilink target:
   a. Resolve target to file path
   b. Read file into context
   c. STOP (no recursion—do NOT follow wikilinks in neighbor)
5. Display traversal log to user
```

**Why 1-hop only?** Prevents context explosion. If PRD A links to Eng Doc B (10 pages), and Eng Doc B links to Prior Art C (15 pages), and Prior Art C links to Competitor Analysis D (20 pages), recursive traversal would load 45 pages. 1-hop loads 10 pages (PRD + Eng Doc).

**Example traversal log:**

```
[Step]  prd-generator — loading product context for "[COMPLIANCE_STANDARD] Benchmarking"...
   [Done] Loaded: [example]-prd-2026-02-20.md
   -> Following wikilinks (1 hop):
      [Done] vulnerability-scanning-v2-eng-doc-2026-01-15.md
      [Done] [CUSTOMER_1] customer profile
      [Done] [PROJECT_KEY]-002 (epic link — display only, not loaded)
   [Done] Context loaded — 3 related files
```

### Frontmatter vs. Body Wikilinks

**Structured (frontmatter):**
```yaml
related_customers: ["[CUSTOMER_1]", "[CUSTOMER_2]"]
related_jira: ["[PROJECT_KEY]-002", "[PROJECT_KEY]-001"]
related_docs: ["vuln-scanning-v2-eng-doc"]
```

**Freeform (body):**
```markdown
## Related Context

**Customer Profiles**: [[[CUSTOMER_1]]] | [[[CUSTOMER_2]]]
**Jira Tracking**: [[[PROJECT_KEY]-002]] (Compliance Reporting epic)
```

Both are valid. Frontmatter enables automation (filtering, queries). Body wikilinks are human-readable and discoverable when reading the document.

### Non-Blocking Resolution

If a wikilink target doesn't resolve, log warning and continue:

```
[Warning]  Wikilink target not found: [[missing-doc]] (skipping)
```

Failed wikilinks never block workflow execution.

## 4.3 Router-Based Ingestion

The system uses a smart router pattern to auto-detect content format and delegate to specialized parsers.

### Three-Stage Detection Funnel

```
User pastes content
    |
    v
[ingest-router: format detection]
    |
    +---[1] Slack thread?
    |   Patterns: "replied to this thread", timestamps (9:45 AM),
    |             emoji reactions ((thumbs up) 2), "View thread"
    |   → ingest-slack-thread
    |
    +---[2] RFC?
    |   Patterns: "Alternatives Considered", "Decision",
    |             "Open Questions", formal architecture language
    |   → ingest-rfc
    |
    +---[3] Signal (catch-all)
        Patterns: Default if no pattern matches
        Sub-classification: market / field / engineering
        → ingest-signal
```

### Signal Subtype Classification

When format = "signal", the router performs a second classification pass:

| Signal Type | Detection Patterns | Confidence |
|-------------|-------------------|------------|
| **Market** | Competitor domains ([competitor-a.com], [competitor-b.com]), keywords "announces"/"press release", blog structure | HIGH if domain + keyword |
| **Field** | Email headers (From:/To:), customer names from profiles, keywords "feedback from"/"customer asked" | HIGH if headers OR name + keyword |
| **Engineering** | Technical jargon "prototype"/"spike"/"POC", code blocks, "design exploration"/"technical debt" | HIGH if code + keyword |

**Decision logic:**
1. Scan for all three pattern types
2. Select highest confidence match
3. If tie OR all LOW → default to `market-signals/`
4. If conflicting HIGH confidence → prompt user

### Router Responsibilities

The `ingest-router` skill handles common logic before delegating:

1. **Project tag extraction** from content (first heading, thread subject, RFC title) or user input
2. **Slug generation:** lowercase, spaces→hyphens, alphanumeric only, collapse consecutive hyphens
3. **Collision detection:** check if file exists, append `-2`, `-3`, etc. if needed
4. **Frontmatter scaffold:** generate YAML with auto-detected `related_customers`, `related_jira`, `related_docs`
5. **Delegation:** route to specialist skill with structured input

### Specialist Skills

Each specialist handles format-specific parsing:

- **ingest-slack-thread:** Parse participants, timestamps, key decisions, unresolved questions, emoji reactions
- **ingest-rfc:** Extract design rationale, alternatives considered, trade-offs, open questions, decision records
- **ingest-signal:** Minimal structure---key takeaways (1-3 sentences), original content preserved

### File Path Mapping

| Content Type | Path |
|--------------|------|
| Slack threads | `/context/product-context/slack-threads/{slug}-slack-thread-{YYYY-MM-DD}.md` |
| RFCs | `/context/product-context/engineering/{slug}-rfc-{YYYY-MM-DD}.md` |
| Market signals | `/context/product-context/market-signals/{slug}-signal-{YYYY-MM-DD}.md` |
| Field signals | `/context/product-context/field-signals/{slug}-signal-{YYYY-MM-DD}.md` |
| Engineering signals | `/context/product-context/engineering-signals/{slug}-signal-{YYYY-MM-DD}.md` |

**Why router pattern?** Centralized logic (slug generation, collision detection, frontmatter) reduces duplication across specialist skills. Consistent metadata across all ingested content enables semantic context loading.

### Manual Override

Users can bypass auto-detection:

```
"Ingest this as market signal: [content]"
"Ingest this as RFC: [content]"
"Ingest this as Slack thread: [content]"
```

## 4.4 Integration Layer

The system connects to external systems via MCP (Model Context Protocol) servers.

### Atlassian MCP Server

**Jira capabilities:**
- Create issues (Story, Task, Bug)
- Add comments with customer evidence
- Update descriptions with customer context
- Query backlog with JQL
- Link issues to parent epics

**Confluence capabilities (planned):**
- Read pages
- Search with CQL

**Why MCP?** Standard protocol for tool access, not custom API wrappers. Declarative tool schemas (JSON-RPC). Composable across Claude Code sessions.

### Snowflake MCP Server (Planned)

**Capabilities:**
- Query product telemetry for usage patterns
- Enrich PRDs with quantitative adoption data
- Identify feature usage correlation with customer segments

**Use case:** "How many customers use channel version pinning?" → SQL query → enrich PRD with usage stats.

# Workflows

## 5.1 Full Call Pipeline

**Trigger:** `"Run full-call-pipeline for [customer]"`

Transforms raw meeting notes into structured intelligence and syncs to Jira.

### Complete Flow

```
--------------- PHASE 1 — ANALYZE (autonomous) ---------------

User pastes raw notes (any format)
    |
    v
[format-field-notes]
    |
    v
{Notes ambiguous?}
    |--- YES --> [PAUSED] HITL-1: "Couldn't identify customer/topic — confirm"
    |               |
    |               v (on resume with confirmed values)
    |--- NO ------> v
                    |
                    v
             {Is customer lighthouse?}
                    |
                    |--- NO --> [update-customer-profile]
                    |                  |
                    |                  v
                    |            [Write notes + STOP]
                    |
                    |--- YES -> [update-customer-profile]
                                       |
                                       v
                         +------------------------------+
                         |  5 PARALLEL EXTRACTIONS    |
                         |  (independent analyses,    |
                         |   deterministic merge)     |
                         +------------------------------+
                                       |
                    +------------------+------------------+
                    |         |         |         |       |
                    v         v         v         v       v
              extract-  extract-  extract-  extract-  map-to-
              themes    asks      pain-pts  tools     jira
                    |         |         |         |       |
                    +----+----+----+----+----+----+
                         |
                         v
                   [merge-insights]
                   (deterministic, no LLM)
                         |
                         v
                   [insights-onepager]
                         |
                         v
                   {Net-new signals exist?}
                    |              |
                    NO             YES
                    |              |
                    v              v
                  STOP   [PAUSED] HITL-2: Jira approval
                   (Phase 1        |
                    complete)      v
                              {Approved?}
                             /      |      \
                          Yes    Partial   Cancel
                           |       |         |
                           v       v         v
--------------- PHASE 2 — ACT (approved only) ---------------
                           |       |
                           v       v
                  +--------------------------+
                  | PARALLEL JIRA WRITES   |
                  | (one per approved act) |
                  +--------------------------+
                           |
            +--------------+---------------+
            |                              |
            v                              v
    [create-jira-issue]          [update-jira-issue]
    (for net-new asks)           (for existing issues)
            |                              |
            +--------------+---------------+
                           |
                           v
                   [jira-sync.json]
                         DONE
```

### Parallel Execution Notes

**5 parallel extractions:** All extraction tools read the same formatted notes simultaneously. Each produces a disjoint output (themes vs. asks vs. pain points vs. tools vs. Jira matches). Merge operation is deterministic---no LLM call, pure function combining JSON arrays.

**Parallel Jira writes:** After approval, all create-issue and update-issue operations run concurrently. No cross-issue dependencies.

### Output Artifacts

| Artifact | Path |
|----------|------|
| Formatted notes | `customer-notes/{customer}-{date}.md` |
| Updated profile | `customer-profiles/{customer}.json` |
| Insights JSON | `insights/{customer}-{date}.json` |
| Insights one-pager | `insights/{customer}-{date}.md` |
| Jira sync log | `insights/{customer}-{date}-jira-sync.json` |

## 5.2 PRD Pipeline

**Trigger:** `"Write a PRD for [topic]"`

Generates a Product Requirements Document from customer evidence and product context. Falls back to signal brief if evidence is insufficient.

### Complete Flow

```
--------------- PHASE 1 — ANALYZE (autonomous) ---------------

"Write a PRD for [topic]"
    |
    v
[get-notes-by-topic] (keyword search across all notes)
    |
    v
+--------------------------+
| 3 PARALLEL EXTRACTIONS |
| (only need themes,     |
|  asks, pain-points     |
|  for PRD—not tools     |
|  or Jira mapping)      |
+--------------------------+
    |
    +--------+---------+
    |        |         |
    v        v         v
extract- extract-  extract-
themes   asks      pain-pts
    |        |         |
    +---+----+----+
        |
        v
  [merge-insights]
        |
        v
  {Sufficient evidence?}
  (>=2 customers OR >=3 mentions)
        |                    |
    < threshold          >= threshold
        |                    |
        v                    v
  [signal-brief]   [PAUSED] HITL-3: Evidence approval
        |                    |
        v                    v
      STOP           [Semantic context loading]
   (preserves               |
    weak signal)            v
                     [Graph traversal: 1-hop]
                            |
                            v
--------------- PHASE 2 — ACT (approved) ---------------
                            |
                            v
                    [prd-generator]
                            |
                            v
                [PAUSED] HITL-4: PRD draft approval
                            |
                            v
                      {Approved?}
                     /      |      \
                  Yes   With edits  Cancel
                   |        |         |
                   v        v         v
             [Save PRD]  [Apply edits  STOP
                 DONE    + save PRD]
                              DONE
```

### Why Only 3 Extractions?

PRDs need themes (patterns), asks (requirements), and pain points (problems). Tool signals and Jira mapping aren't relevant for PRD generation. This optimization reduces latency.

### Evidence Threshold

**Sufficient:** >=2 customers OR >=3 mentions across any number of customers

**Insufficient:** Falls back to signal brief, which preserves the weak signal for future aggregation with additional evidence.

### Semantic Context Loading

After evidence approval, the system:
1. Scans frontmatter of all product context files
2. Identifies semantic matches (e.g., "MCP" matches "[PRODUCT_SHORT] MCP Server" and "Model Context Protocol")
3. Loads matching files + follows 1-hop wikilinks

### Output Artifacts

| Artifact | Path |
|----------|------|
| PRD | `product-context/prds/{slug}-prd-{date}.md` |
| Signal brief (fallback) | `product-context/{subtype}-signals/signal-{topic}-{date}.md` |
| Pending state | `pending/prd-pipeline-{date}.pending.json` |

## 5.3 PRFAQ Pipeline

**Trigger:** `"Write a PRFAQ for [topic]"` or `"Generate a PRFAQ from [PRD]"`

Generates a working-backwards Press Release / FAQ document. Two modes depending on whether a PRD exists.

### Mode A: From Existing PRD

```
"Write a PRFAQ from the [COMPLIANCE_STANDARD] benchmarks PRD"
    |
    v
[Load PRD]
    |
    v
[Graph traversal: 1-hop]
(loads PRD + wikilinked neighbors—
 engineering docs, customer profiles,
 related PRDs)
    |
    v
[prfaq-generator]
    |
    v
[PAUSED] HITL-4: PRFAQ draft approval
    |
    v
{Approved?}
/      |      \
Yes  With edits Cancel
|      |         |
v      v         v
[Save PRFAQ]   STOP
  DONE
```

**Why graph traversal?** PRFAQs need rich context---customer quotes, technical constraints, related initiatives. Loading the PRD + 1-hop neighbors provides this without manual file specification.

### Mode B: Standalone from Evidence

```
"Write a PRFAQ for vulnerability scanning"
    |
    v
[get-notes-by-topic]
    |
    v
[3 parallel extractions + merge]
    |
    v
{Sufficient evidence?}
    |              |
    NO             YES
    |              |
    v              v
  [signal-brief] [PAUSED] HITL-3: Evidence approval
    |              |
    v              v
  STOP       [Semantic context loading]
                   |
                   v
             [prfaq-generator]
                   |
                   v
             [PAUSED] HITL-4: PRFAQ draft
                   |
                   v
             [Save PRFAQ -- Done]
```

Mode B follows the same evidence threshold as PRD pipeline. Falls back to signal brief if insufficient.

### PRFAQ Sections

The generated PRFAQ follows Amazon's working-backwards format:

1. **Summary** (one paragraph, no jargon)
2. **Problem statement** (customer pain, current alternatives)
3. **Press release** (launch announcement, customer quotes)
4. **External FAQ** (customer-facing questions)
5. **Internal FAQ** (business, technical, operational)
6. **Appendix** (supporting evidence, data)
7. **Review tracking** (stakeholder sign-off)
8. **Related context** (wikilinks to PRD, customers, Jira)

### Output Artifacts

| Artifact | Path |
|----------|------|
| PRFAQ | `product-context/prds/{slug}-prfaq-{date}.md` |

## 5.4 Ingestion Workflows

The router-based ingestion system handles three content types: Slack threads, RFCs, and signals.

### Workflow A: Slack Thread Ingestion

```
User pastes Slack thread export
    |
    v
[ingest-router: format detection]
    |
    v
Patterns detected:
  - Timestamps (9:45 AM)
  - Emoji reactions ((thumbs up) 2)
  - "replied to this thread"
    |
    v
Format = Slack thread
    |
    v
[Router responsibilities]
  1. Extract project tag from thread subject
  2. Generate slug: "[product-short]-cli-[platform]-auth-reuse"
  3. Check collision: no existing file
  4. Scaffold frontmatter with auto-detected
     related_customers, related_jira
    |
    v
[Delegate to ingest-slack-thread]
    |
    v
Parse:
  - Participants ([ENGINEER_NAME], [ENGINEER_NAME_2])
  - Key decisions made in thread
  - Unresolved questions
  - Emoji reactions indicating consensus
    |
    v
Save to:
  /context/product-context/slack-threads/
  [product-short]-cli-[platform]-auth-reuse-slack-thread-2026-02-15.md
    |
    v
DONE (now discoverable by semantic context loading)
```

### Workflow B: RFC Ingestion

```
User pastes engineering RFC
    |
    v
[ingest-router: format detection]
    |
    v
Patterns detected:
  - Section headings: "Alternatives Considered",
    "Decision", "Open Questions"
  - Formal architecture language
    |
    v
Format = RFC
    |
    v
[Router responsibilities]
  1. Extract project tag from RFC title
  2. Generate slug: "channel-immutability-rfc"
  3. Check collision, scaffold frontmatter
    |
    v
[Delegate to ingest-rfc]
    |
    v
Extract:
  - Design rationale
  - Alternatives considered with trade-offs
  - Open questions and risks
  - Decision records
    |
    v
Save to:
  /context/product-context/engineering/
  channel-immutability-rfc-2026-02-15.md
    |
    v
DONE
```

### Workflow C: Signal Ingestion with Subtyping

```
User pastes competitor blog post
    |
    v
[ingest-router: format detection]
    |
    v
No Slack or RFC patterns detected
    |
    v
Format = Signal
    |
    v
[Signal subtype classification]
    |
    v
Scan for patterns:
  - Market: [competitor-a.com] domain + "announces" → HIGH confidence
  - Field: no email headers → LOW confidence
  - Engineering: no code blocks → LOW confidence
    |
    v
Highest confidence: MARKET
    |
    v
[Router responsibilities]
  1. Extract project tag: "[TOOL_A] Vulnerability Selector"
  2. Generate slug: "wiz-vuln-selector-announcement"
  3. Scaffold frontmatter:
       signal_source: market
    |
    v
[Delegate to ingest-signal]
    |
    v
Extract:
  - Key takeaways (1-3 sentences)
  - Original content preserved
    |
    v
Save to:
  /context/product-context/market-signals/
  wiz-vuln-selector-announcement-signal-2026-02-15.md
    |
    v
DONE
```

### Manual Override Examples

```
"Ingest this as market signal: [Qualys press release]"
→ Bypasses auto-detection, routes directly to ingest-signal
   with signal_source = market

"Ingest this as RFC: [informal design doc]"
→ Bypasses auto-detection, routes to ingest-rfc even though
   formal section headings are missing
```

## 5.5 Standalone Workflows

Individual skills can be invoked without pipelines:

| Workflow | Trigger | Output |
|----------|---------|--------|
| **Format notes only** | "Format these notes for [customer]" | Formatted markdown note file |
| **Get untracked asks** | "Get untracked asks" or "List untracked customer asks" | JSON of open asks with no Jira issue |
| **Get notes by customer** | "Get all notes for [CUSTOMER_1]" | List of note file paths |
| **Get notes by topic** | "Find notes about SBOM" | Matching excerpts across all notes |
| **Refresh FR snapshot** | "Refresh FR snapshot" | Updated `fr-snapshot.json` with [FR_PROJECT_KEY] issues |
| **Review eng doc** | "Review this engineering doc for [project]" | 5-15 PM review comments + saved summary |
| **Analyze prior art** | "Analyze prior art for [project]" | Reusable patterns + gaps + saved summary |
| **Thought partner** | "Think through [topic]" or `--think` flag | 5-stage analysis + recommendation |

### Review Engineering Doc Flow

```
User pastes engineering RFC/proposal
    |
    v
[review-engineering-doc]
    |
    v
Generate 5-15 PM review comments:
  - Missing customer evidence
  - Undefined success metrics
  - Scope concerns (too broad/narrow?)
  - Dependency risks
  - Edge cases not considered
  - Alternative approaches
    |
    v
Display comments to user
    |
    v
Save summary with frontmatter to:
  /context/product-context/engineering/
  {slug}-eng-doc-{date}.md
    |
    v
DONE (now discoverable by semantic loading)
```

### Analyze Prior Art Flow

```
User pastes competitor/reference doc
    |
    v
[analyze-prior-art]
    |
    v
Numbered analysis:
  1. Reusable elements (patterns to adopt)
  2. Contextual differences (why their
     approach may not apply to [PRODUCT])
  3. Gaps (what they missed, what we do better)
  4. Open questions (for further investigation)
    |
    v
Display analysis to user
    |
    v
Save summary with frontmatter to:
  /context/product-context/prior-art/
  {slug}-prior-art-{date}.md
    |
    v
DONE
```

### Thought Partner Modifier

The `--think` flag invokes the thought partner as a pre-step:

```
"Write a PRD for X --think"
    |
    v
[thought-partner: 5-stage analysis]
  1. JTBD Clarity
  2. Friction Diagnosis
  3. Nudge Design
  4. Satisfaction Prediction
  5. SCAMPER (Substitute, Combine, Adapt,
              Modify, Put to other use,
              Eliminate, Reverse)
    |
    v
[PAUSED] HITL-TP: Analysis + 3 alternatives + recommendation
    |
    v
{User decision}
/       |         \
Proceed  Explore   Stop
|        alt       |
v        |         v
[PRD     |      STOP
pipeline v
with     [Re-run thought-partner
constraint] with new angle]
```

The thought partner always runs **before** the downstream task and always suspends for approval. Never runs automatically.

# Execution Model

## 6.1 Two-Phase Pattern

### Phase 1: Analyze (Autonomous)

**Operations:**
- Read notes from filesystem
- Format and normalize field notes
- Update customer profiles (additive merge)
- Extract themes, asks, pain points, tool signals
- Map asks to existing Jira issues
- Merge extraction outputs (deterministic)
- Write JSON and markdown locally
- No external side effects

**Why autonomous?** All operations are read-only or write to local filesystem. No risk of polluting external systems. Worst case: bad data written locally, easy to delete and re-run.

### Phase 2: Act (Requires Approval)

**Operations:**
- Create new Jira issues in [PROJECT_KEY] project
- Add evidence comments to existing issues
- Update Jira issue descriptions
- Generate PRDs from evidence
- Generate PRFAQs from evidence
- Always gated by HITL suspend point
- User must explicitly approve each action

**Why gated?** External writes have lasting effects. Creating a Jira issue pollutes the backlog if wrong. Generating a PRD without approval wastes engineering review time. Human-in-the-loop prevents these failure modes.

## 6.2 Parallel vs Sequential Analysis

### Always Parallel

| Operation Pair | Reasoning |
|----------------|-----------|
| **5 extraction tools** | Disjoint outputs (themes vs. asks vs. pain vs. tools vs. jira), same input, deterministic merge |
| **Session start (4 file reads)** | Independent I/O operations, no cross-dependencies |
| **Phase 2 Jira writes** | Independent API calls, no cross-issue dependencies |
| **Product context frontmatter scan** | Independent file reads for semantic filtering |

**Latency impact:**
- 5 serial extractions: 5-10 seconds
- 5 parallel extractions: 1-2 seconds (dominated by slowest call)
- **Result:** 5× faster, same token cost

### Always Sequential

| Operation Pair | Reasoning |
|----------------|-----------|
| **format-notes → ambiguity check → lighthouse check → profile update** | State dependency chain—profile needs formatted customer identity |
| **merge-insights → insights-onepager** | One-pager consumes merged JSON as input |
| **Phase 1 → HITL-2 → Phase 2** | Hard requirement—human approval must occur before external writes |
| **get-notes-by-topic → extractions** | Extractions operate on filtered note set from topic search |

### Decision Matrix

To determine parallel vs. sequential, ask:

1. **Do operations share state?** If yes → sequential
2. **Does one output feed another's input?** If yes → sequential
3. **Are outputs disjoint?** If yes AND same input → parallel
4. **Independent API calls?** If yes AND no cross-dependencies → parallel

## 6.3 HITL Suspend and Resume

### All Suspend Points

| Point | Trigger | What User Sees | Resume Options |
|-------|---------|----------------|----------------|
| **HITL-1** | Can't identify customer or topic | Clarification request | Confirm or correct |
| **HITL-2** | Net-new signals found after merge | Proposed Jira creates + updates | Approve all / subset / skip |
| **HITL-3** | Sufficient evidence for PRD/PRFAQ | Evidence summary | Approve or signal-brief |
| **HITL-4** | PRD/PRFAQ draft complete | Full document draft | Approve / edit / cancel |
| **HITL-TP** | Thought partner analysis complete | Analysis + alternatives + rec | Proceed / explore / stop |

### State Serialization Format

On suspend, the system writes to `/context/pending/{pipeline}-{date}.pending.json`:

```json
{
  "pipeline": "full-call-pipeline",
  "started_at": "2026-02-20T14:30:00Z",
  "suspended_at": "2026-02-20T14:32:15Z",
  "suspend_point": "HITL-2",
  "suspend_reason": "awaiting_jira_approval",
  "completed_steps": [
    "format-field-notes",
    "update-customer-profile",
    "extract-themes",
    "extract-open-asks",
    "extract-pain-points",
    "extract-tool-signals",
    "map-to-existing-jira",
    "merge-insights",
    "insights-onepager"
  ],
  "next_step": "create-jira-issue",
  "awaiting_approval": {
    "prompt": "Ready to sync to Jira [PROJECT_KEY]. Please review:",
    "proposed_actions": [
      {
        "action": "create",
        "title": "[COMPLIANCE_STANDARD] Benchmark Integration for Compliance Reporting",
        "evidence_count": 3,
        "customers": ["[CUSTOMER_1]", "[CUSTOMER_2]"],
        "approved": null
      },
      {
        "action": "update",
        "jira_issue": "[PROJECT_KEY]-001",
        "title": "Vulnerability Data in [PRODUCT]",
        "new_evidence": "[CUSTOMER_1] raised [TOOL_A] integration again on 2026-02-15",
        "approved": null
      }
    ]
  },
  "context": {
    "insights_file": "insights/[customer-1]-2026-02-15.json",
    "customer_profile": "customer-profiles/[customer-1].json"
  }
}
```

### Resume Commands

| Command | Effect |
|---------|--------|
| `"What workflows are waiting?"` | Read `pending/*.pending.json`, summarize each |
| `"Approve the [CUSTOMER_1] Jira sync"` | Set `approved: true` on all actions, resume pipeline, delete `.pending.json` |
| `"Approve [TOOL_A] but skip [COMPLIANCE_STANDARD]"` | Selective approval: approved on [TOOL_A] action only, resume with amended plan |
| `"Cancel the [CUSTOMER_1] Jira sync"` | Delete `.pending.json`, no Jira writes made |
| `"Resume PRD with changes: [edits]"` | Apply edits to draft, save to `/context/product-context/`, close pending |

### Multi-Session Resume

Pending state persists across sessions. A PM can:
1. Run full-call-pipeline on Monday
2. Suspend at HITL-2 (Jira approval)
3. Review proposed actions offline Tuesday
4. Resume Wednesday with approval

Full context preserved in `.pending.json`.

# Memory & Retrieval Patterns

## 7.1 Session Bootstrap Pattern

At every session start, four parallel file reads populate working memory:

```
Session start
    |
    +--[1] Read all customer profiles ----> customer-profiles/*.json
    |
    +--[2] Read Jira snapshot ------------> product-context/jira-snapshot.json
    |
    +--[3] Read learning log --------------> system/learning-log.md
    |
    +--[4] Check suspended workflows ------> pending/*.pending.json
    |
    v
Working memory populated
(instant access for queries)
```

**Why preload?** Common queries like "Has customer X mentioned Y?" need instant access without per-query file reads. Preloading enables zero-latency lookup.

## 7.2 Semantic Context Loading

Product context uses frontmatter-based semantic retrieval:

```
Skill requests product context
(e.g., prd-generator for "MCP integration")
    |
    v
[1] Scan frontmatter of all .md files in /context/product-context/
    Read: project_tag, one_line_description
    |
    v
[2] Semantic judgment: Does this file relate to MCP?
    "MCP Server" → YES
    "[PRODUCT_SHORT] MCP" → YES
    "Model Context Protocol" → YES
    "Vulnerability Scanning v2" → NO
    "[COMPLIANCE_STANDARD] Benchmarks" → NO
    |
    v
[3] Load only matching files into full context
    |
    v
Skill proceeds with relevant background
```

**Why semantic, not keyword?** Handles synonyms and paraphrasing. "Vulnerability scanning" matches docs about "CVE detection" or "security posture." Keyword matching would miss these.

**Why not load everything?** Token limits. A knowledge base with 100 docs × 10 pages = 1,000 pages. Loading everything for every task is infeasible. Semantic filtering keeps context bounded and relevant.

## 7.3 Graph Traversal Pattern

On-demand neighbor loading (not preload):

```
Skill explicitly needs rich context
(e.g., prfaq-generator from PRD)
    |
    v
[1] Load target file (PRD)
    |
    v
[2] Parse frontmatter: extract related_customers, related_jira, related_docs
    |
    v
[3] Parse body: extract [[wikilink]] patterns
    |
    v
[4] For each wikilink target:
        Resolve target to file path
        Read file into context
        STOP (no recursion—do NOT follow wikilinks in neighbor)
    |
    v
[5] Display traversal log to user
    |
    v
Skill proceeds with enriched context
(target + 1-hop neighbors)
```

**Why on-demand?** Most operations don't need neighbor context. Only skills like `prd-generator` and `prfaq-generator` that explicitly need rich context traverse the graph.

**Why 1-hop only?** Bounded traversal prevents context explosion. 2-hop could load 50+ pages. 1-hop loads 5-10 pages.

**Non-blocking:** If wikilink target doesn't resolve, log warning and continue. Failed resolution never blocks execution.

## 7.4 Additive Customer Profiles

Customer profiles use append-only semantics:

```
[update-customer-profile]
    |
    v
Read existing profile + new formatted notes
    |
    v
For each field:
    - Stack: append new tools (deduplicate)
    - Pain points: append new pain points, update priority
    - Open asks: append new asks OR increment times_mentioned
    - Contacts: append new names
    - Relationship summary: extend narrative
    - Notes files: append new note filename
    - last_call: update to current date
    |
    v
Write updated profile (never delete data)
```

**Why additive?** Preserves full history. Trends become visible: "Pain point first raised 3 months ago, mentioned 5 times since, now top priority."

**Example:** Customer mentions "[COMPLIANCE_STANDARD] benchmarks" in January, March, and May. Profile tracks:

```json
{
  "open_asks": [
    {
      "ask": "[COMPLIANCE_STANDARD] benchmark integration for compliance reporting",
      "first_raised": "2026-01-15",
      "times_mentioned": 3,
      "jira_issue": null
    }
  ]
}
```

After Jira sync, `jira_issue` updates to "[PROJECT_KEY]-XXX".

## 7.5 Jira Snapshot Caching

Jira snapshot is a static file, not live API:

```
[map-to-existing-jira]
    |
    v
Read /context/product-context/jira-snapshot.json
(contains [N] [PROJECT_KEY] issues)
    |
    v
For each extracted ask:
    Match against snapshot issues by:
      - Keyword overlap in summary/description
      - Epic parent match
      - Tool/vendor name match
    |
    v
Output: matched[] (existing issues to update)
        unmatched[] (net-new asks to create)
```

**Why snapshot, not live API?** Matching logic needs full backlog visibility. Live API pagination is slow ([N] issues = 8 API calls at 50 issues/page). Snapshot enables single file read.

**Refresh cadence:** On-demand via `refresh-jira-snapshot` skill. Not automatic. Typical refresh: weekly or before large Jira sync operations.

# Real-World Examples

## Example 1: Full Call Pipeline ([CUSTOMER_1])

**Input:** Raw meeting transcript (500 words) mentioning [COMPLIANCE_STANDARD] benchmarks and STIG compliance.

**Execution trace:**

```
[Step]  format-field-notes — normalizing raw notes ([CUSTOMER_1])
   [Done] Customer identified: [CUSTOMER_1] (lighthouse)
   [Done] Topic identified: Compliance reporting
   [Done] Notes saved: customer-notes/[customer-1]-2026-02-15.md

[Step]  update-customer-profile — merging into existing profile
   [Done] Added "[COMPLIANCE_STANDARD] benchmarks" to open asks (times_mentioned: 2 → 3)
   [Done] Profile updated: customer-profiles/[customer-1].json

[Parallel] Branching into 5 parallel extractions on [customer-1]-2026-02-15.md...
   → extract-themes
   → extract-open-asks
   → extract-pain-points
   → extract-tool-signals
   → map-to-existing-jira

   [Done] extract-themes — 2 themes found
   [Done] extract-open-asks — 3 asks found
   [Done] extract-pain-points — 2 pain points found
   [Done] extract-tool-signals — 1 tool signal found
   [Done] map-to-existing-jira — 1 matched, 2 unmatched

[Step]  merge-insights — deterministic merge (no LLM)
   [Done] Insights saved: insights/[customer-1]-2026-02-15.json

[Step]  insights-onepager — generating markdown summary
   [Done] One-pager saved: insights/[customer-1]-2026-02-15.md

[PAUSED]  PAUSED — Jira sync ready for approval ([CUSTOMER_1], 2026-02-15)

   CREATE  "[COMPLIANCE_STANDARD] Benchmark Integration for Compliance Reporting"
           Evidence: [CUSTOMER_1] (×3), [CUSTOMER_2] (×1)
           Epic: [PROJECT_KEY]-002 (Compliance Reporting & Governance)

   UPDATE  [PROJECT_KEY]-001 "Vulnerability Data in [PRODUCT]"
           New evidence: [CUSTOMER_1] 2026-02-15: "Need [TOOL_A] vuln
           data visible in [PRODUCT_SHORT] channel view for STIG compliance"

   Run: "approve [CUSTOMER_1] Jira sync" to proceed
        "approve [CUSTOMER_1] Jira sync except [COMPLIANCE_STANDARD]" for partial
        "cancel [CUSTOMER_1] Jira sync" to discard
```

**User approves:** `"Approve [CUSTOMER_1] Jira sync"`

```
[Step]  Resuming Jira sync with 2 approved actions...

[Parallel] Parallel Jira writes (2 operations)...
   → create-jira-issue: "[COMPLIANCE_STANDARD] Benchmark Integration..."
   → update-jira-issue: [PROJECT_KEY]-001 with new evidence

   [Done] Created: [PROJECT_KEY]-XXX "[COMPLIANCE_STANDARD] Benchmark Integration for Compliance Reporting"
   [Done] Updated: [PROJECT_KEY]-001 with comment

[Step]  Jira sync log written
   [Done] File: insights/[customer-1]-2026-02-15-jira-sync.json

[Complete] full-call-pipeline complete — [CUSTOMER_1], 2026-02-15

   Notes saved:     customer-notes/[customer-1]-2026-02-15.md
   Profile updated: customer-profiles/[customer-1].json
   Insights saved:  insights/[customer-1]-2026-02-15.md

   Top signals found:
     • Compliance reporting (3 customers, high priority)
     • [TOOL_A] integration (2 customers, medium priority)

   Jira: 1 issue created, 1 issue updated
```

**Output artifacts:** 5 files written, 1 Jira issue created, 1 issue updated, full audit trail.

## Example 2: PRD Pipeline with Signal-Brief Fallback

**Input:** `"Write a PRD for channel version immutability"`

**Execution trace:**

```
[Step]  get-notes-by-topic — searching for "channel version immutability"
   [Done] Found 1 note: [customer-3]-2026-02-10.md

[Parallel] Branching into 3 parallel extractions (PRD-optimized)...
   → extract-themes
   → extract-open-asks
   → extract-pain-points

   [Done] extract-themes — 1 theme found
   [Done] extract-open-asks — 1 ask found
   [Done] extract-pain-points — 1 pain point found

[Step]  merge-insights — deterministic merge
   [Done] Insights JSON ready

[Step]  Evidence threshold check
   - Customers: 1 ([CUSTOMER_3])
   - Mentions: 1
   - Threshold: >=2 customers OR >=3 mentions
   [FAILS] FAILS threshold

[Step]  signal-brief — generating lightweight signal doc
   [Done] Signal preserved: product-context/field-signals/
                       channel-immutability-signal-2026-02-15.md

[Complete] PRD pipeline complete (signal-brief fallback)

   Evidence insufficient for full PRD. Signal brief created to preserve
   the ask for future aggregation when more customers mention it.
```

**Output:** Signal brief (not PRD) because only 1 customer mentioned it once. Weak signal preserved for future.

## Example 3: Ingestion Router (Slack Thread → Product Context)

**Input:** User pastes Slack thread about [PRODUCT_SHORT] CLI auth reuse.

**Execution trace:**

```
[Step]  ingest-router — detecting content format...
   - Scanning for Slack patterns: timestamps, emoji, "replied to this thread"
   [Done] Pattern match: Slack thread (HIGH confidence)
   - Timestamps found: 9:45 AM, 10:12 AM, 11:03 AM
   - Emoji reactions: (thumbs up) 2, (target) 1
   - Thread marker: "replied to this thread"

[Step]  ingest-router — pre-processing...
   - Extracting project tag: "[PRODUCT_SHORT] CLI [PLATFORM] Auth Reuse"
   - Generating slug: "[product-short]-cli-[platform]-auth-reuse"
   - Checking collision: no existing file
   - Scaffolding frontmatter...
     * related_customers: ["[CUSTOMER_INTERNAL]"] (detected: [ENGINEER_NAME])
     * related_jira: ["[PROJECT_KEY]-004"] (detected: mention of Enforced Provisioners)
     * related_docs: [] (none detected)

[Step]  ingest-router — delegating to ingest-slack-thread...

[Step]  ingest-slack-thread — parsing thread structure...
   - Participants: [ENGINEER_NAME], [ENGINEER_NAME_2], [PM_NAME]
   - Key decisions:
     1. Reuse [PLATFORM] token from CLI auth for provisioner execution
     2. Avoid forcing users to auth twice
   - Unresolved questions:
     1. Token expiration handling during long builds?
     2. Scope restrictions for provisioner context?
   - Consensus signals: (thumbs up) 2 on "reuse token" proposal

[Step]  Saving to /context/product-context/slack-threads/
   [Done] File: [product-short]-cli-[platform]-auth-reuse-slack-thread-2026-02-15.md
   [Done] Frontmatter: doc_type=slack_thread, related_jira=["[PROJECT_KEY]-004"]

[Complete] Ingestion complete

   Slack thread now discoverable by semantic context loading.
   Future PRD or PRFAQ generation for "[PRODUCT_SHORT] CLI auth" will
   automatically load this thread as related context.
```

**Output:** Structured Slack thread summary with frontmatter, wikilinks, and key decisions. Now part of knowledge base.

## Example 4: Thought Partner Modifier

**Input:** `"Write a PRD for SBOM generation --think"`

**Execution trace:**

```
[Step]  thought-partner — 5-stage product thinking framework...

[Stage 1] JTBD Clarity
  Job: "I need to know what software components are in my golden images
        so I can track CVEs and comply with software supply chain mandates."

[Stage 2] Friction Diagnosis
  Current experience breaks down when:
  - Users manually parse build logs to extract dependencies
  - No standard format across builders (Docker vs. AMI vs. Azure)
  - SBOM generation is post-build, disconnected from image metadata

[Stage 3] Nudge Design
  Behavioral nudges for adoption:
  - Auto-generate SBOM by default (opt-out, not opt-in)
  - Surface SBOM in channel view UI (visibility = validation)
  - Warn when SBOM missing or incomplete

[Stage 4] Satisfaction Prediction
  Will this satisfy? Partially.
  - Solves tracking problem [Done]
  - Solves compliance mandate [Done]
  - Does NOT solve: dependency update notifications, CVE correlation

[Stage 5] SCAMPER
  - Substitute: Use SPDX format instead of CycloneDX?
  - Combine: Merge SBOM with vulnerability scan results?
  - Adapt: Reuse Terraform's SBOM logic for [PRODUCT_SHORT]?
  - Modify: Generate SBOM incrementally during build, not post-build?
  - Put to other use: SBOM as input to drift detection?
  - Eliminate: Skip SBOM for non-production images?
  - Reverse: Let users upload external SBOMs instead of generating?

[Step]  thought-partner — synthesis complete

Recommendation: **Inline SBOM generation with caching**

Approach: Generate SBOM during build (not post-build) by instrumenting
provisioners to report installed packages. Cache by layer hash to avoid
re-generating for unchanged layers. Default to CycloneDX format (wider
tool ecosystem), with SPDX export option.

Alternative 1: Post-build SBOM (simpler, but disconnected from metadata)
Alternative 2: On-demand SBOM (lower overhead, but poor adoption)
Alternative 3: Bring-your-own SBOM (flexibility, but complexity)

[PAUSED]  PAUSED — Thought partner analysis complete

   Recommendation: Inline SBOM with caching
   Reasoning: Balances adoption (auto-generated) with performance (cached)

   Options:
   - "Proceed with recommendation" → Use inline approach for PRD
   - "Explore Alternative 1" → Re-run with post-build focus
   - "Stop" → Skip PRD generation

   Your choice?
```

**User:** `"Proceed with recommendation"`

```
[Step]  Resuming PRD pipeline with constraint: "inline SBOM with caching"...

[Step]  get-notes-by-topic — searching for "SBOM"
   [Done] Found 4 notes across 3 customers

[Parallel] 3 parallel extractions...
   [continues with standard PRD flow]

[Step]  prd-generator — incorporating thought-partner constraint...
   - Requirement 1: Generate SBOM during build (not post-build)
   - Requirement 2: Cache by layer hash
   - Requirement 3: Default CycloneDX, support SPDX export

[PAUSED]  HITL-4: PRD draft approval
   [PRD shown to user]
```

**Output:** PRD informed by structured product thinking, not just customer evidence aggregation. Thought partner analysis shaped the solution approach.

# Evaluation Framework

## 9.1 Failure Taxonomy

**Location:** `/evals/failure-taxonomy.md`

The failure taxonomy uses axial coding to categorize failure modes across two dimensions: **failure category** (rows) and **skill or transition** (columns).

### Failure Categories (Rows)

1. **Data Quality:** Incorrect customer identification, mismatched Jira issue, fabricated evidence
2. **Reasoning:** Wrong evidence threshold judgment, poor semantic match for context loading
3. **Integration:** Jira API error, MCP connection failure, malformed JSON schema
4. **Control Flow:** Skipped HITL suspend, ran Phase 2 without approval, infinite loop
5. **Output Quality:** Incoherent PRD, missing sections in PRFAQ, poor evidence grounding

### Skill/Transition Matrix (Columns)

- **Per-skill failures:** `format-field-notes`, `map-to-existing-jira`, `prd-generator`, etc.
- **Transition failures:** `merge-insights → insights-onepager`, `HITL-2 → Phase 2`, etc.

### Current Status

Template prepared. Awaiting 20+ production pipeline runs for population. Each failure gets tagged with category + skill/transition, enabling pattern identification.

## 9.2 Evaluation Dimensions

### Accuracy

**Metrics:**
- **Customer identity resolution:** Did `format-field-notes` identify the correct customer?
- **Jira matching:** Did `map-to-existing-jira` match to the right existing issue vs. propose new?
- **Evidence grounding:** Do PRD requirements trace back to actual customer quotes?

**Eval method:** Manual review of 20 full-call pipeline runs. Tag errors by failure category.

### Completeness

**Metrics:**
- **Extraction coverage:** Did all customer asks get extracted? (compare against human annotation)
- **Wikilink resolution:** Were all traversable wikilinks successfully loaded?
- **Frontmatter population:** Are `related_customers`, `related_jira`, `related_docs` correctly auto-populated?

**Eval method:** Sample 10 ingested docs, verify frontmatter accuracy against ground truth.

### Safety

**Metrics:**
- **Phase 1 autonomy:** Did it stop before external writes without approval?
- **Jira permissions:** Did it avoid prohibited operations (status changes, assignments, priority)?
- **Evidence fabrication:** Did it ever invent customer quotes not in notes?

**Eval method:** Exhaustive scan of Jira sync logs. Zero tolerance for unauthorized writes.

### Latency

**Metrics:**
- **Parallel execution:** Are independent operations running concurrently? (check for sequential anti-patterns)
- **Graph traversal:** Is 1-hop loading bounded (not recursive)?
- **Session startup:** Are 4 initial reads parallelized?

**Eval method:** Instrument execution logs with timestamps. Measure parallel vs. sequential durations.

## 9.3 Evaluation Methodology

### Unit Evals (Per-Skill)

- **Input fixtures** with known-good outputs
- **Schema validation:** JSON output matches declared schema
- **Deterministic operations:** `merge-insights` gets exact-match assertions (no LLM = no variance)

### Integration Evals (Full Pipeline)

- **End-to-end trace:** Raw notes → Jira sync
- **Human judgment:** PRD quality (coherence, evidence grounding, clarity)
- **Comparison:** Generated PRDs vs. human-written PRDs (time saved, quality delta)

### Ongoing Monitoring

- **Learning log:** Captures real-world failures as they occur
- **Failure taxonomy:** Updated when new error modes discovered
- **Skill failure matrix:** Populated over time, identifies high-risk skills

## 9.4 Results to Date

**Current maturity:** System operational but evals not yet populated.

**Verified:**
- [N] customer notes processed (`format-field-notes` 100% success rate)
- 5 lighthouse profiles maintained (`update-customer-profile` additive merge verified)
- 1 PRD generated (`[example]-prd-2026-02-20.md`)
- 1 Slack thread ingested (`[product-short]-cli-[platform]-auth-reuse-slack-thread-2026-02-15.md`)
- 0 Phase 1 → Phase 2 violations (no unauthorized Jira writes)

**Planned:** 20+ supervised pipeline runs with failure tagging → populate failure taxonomy → generate eval report.

# Appendices

## Jira Integration --- [PROJECT_KEY] Project

**Project:** [PROJECT_KEY] ([PRODUCT]), Board [BOARD_ID]
**Atlassian Cloud ID:** `[ATLASSIAN_CLOUD_ID]`

### Permissions

| Operation | Allowed |
|-----------|---------|
| Create new Story/Task/Bug | [Complete] |
| Add comment with customer evidence | [Complete] |
| Update description with customer context | [Complete] |
| Add `form` + `intake` labels | [Complete] |
| Link to parent epic | [Complete] |
| Change issue status | No Never |
| Assign to someone | No Never |
| Set/change priority | No Never |
| Set due dates | No Never |
| Close or resolve issues | No Never |
| Modify sprint/story points | No Never |

### Issue Hierarchy

```
Epic (level 1)
  +-- Story / Task / Bug / Support Request (level 0)
        +-- Sub-task (level -1)
```

### Matching Rules

**Match when:**
- Core functionality overlap AND similar scope
- Specific tool/vendor name in both
- Same epic parent AND similar description

**Create new when:**
- Different scope or requirements
- Existing issue is Closed
- Materially different use case
- Existing issue is a sub-task

**When in doubt:** Flag for human review, do not auto-match.

### Active Epics (as of Feb 2026)

| Epic | Title | Relevant To |
|------|-------|-------------|
| [PROJECT_KEY]-001 | Vulnerability Data in [PRODUCT] | Vuln scanning, [DEFAULT_SCANNER], [TOOL_A] signals |
| [PROJECT_KEY]-002 | Image Compliance Reporting & Governance | [COMPLIANCE_STANDARD] benchmarks, compliance asks |
| [PROJECT_KEY]-003 | Strengthen Enterprise Readiness | AAP auth, enterprise asks |
| [PROJECT_KEY]-004 | Enforced Provisioners --- Phase 1 | Provisioner control |
| [PROJECT_KEY]-005 | Channel Assignment Management --- Phase 1 | Channel management |
| [PROJECT_KEY]-006 | Native SBOM Generation | SBOM |
| [PROJECT_KEY]-007 | Unified Payments for [PRODUCT] and Terraform | Billing/payments |

### Issue Fields for Customer-Sourced Issues

- `summary` --- issue title
- `project` --- always `[PROJECT_KEY]`
- `issuetype` --- `Story` for feature/enhancement, `Bug` for defects
- `labels` --- always `["form", "intake"]`
- `status` --- leave as `Pending Triage` (never set programmatically)
- `assignee` --- leave unassigned
- `priority` --- leave as default (never set)
- `[CUSTOM_FIELD_CUSTOMER_NAME]` --- Customer Name (e.g., "[CUSTOMER_1]")
- `parent` --- link to relevant epic if one clearly applies
- `description` --- customer evidence (see template)
- `[CUSTOM_FIELD_TICKET_NUMBER]` --- Zendesk Ticket Number (if available)
- `components` --- `Core`, `[PLATFORM] BE`, or `[PLATFORM] FE` (leave blank if unclear)

### Description Template (New Issues)

```
## Customer Request

**Customer:** [Customer Name]
**Date raised:** [YYYY-MM-DD]
**Times mentioned:** [N] ([customer list])

## What they asked for

[Plain language description of the ask]

## Evidence

> "[Direct quote or paraphrase from notes]" — [Customer], [date]

## Context

[Any relevant background — stack, use case, why they need this]
```

### Comment Template (Existing Issues)

```
**New customer evidence — [Customer], [date]**

[Customer] raised this again in a [call type] on [date].

> "[Quote or paraphrase]"

Context: [any new nuance or urgency]
Times this ask has now been raised: [N total] ([customer list])
```

### FR Board ([FR_PROJECT_KEY] Project)

The [FR_PROJECT_KEY] (Feature Request Board) is a separate Jira project. It contains customer feature requests across all [COMPANY] products.

- [PRODUCT] issues in [FR_PROJECT_KEY] are identified by `[PRODUCT_SHORT]:` prefix in summary
- Non-Closed [PRODUCT_SHORT] [FR_PROJECT_KEY] issues stored in `/context/product-context/fr-snapshot.json`
- Run `refresh-fr-snapshot` to update this file
- [FR_PROJECT_KEY] issues are **not** linked to [PROJECT_KEY] issues in Jira. Agent suggests matches based on content similarity but never asserts a link.

## File Path Conventions

| Content | Path | Format |
|---------|------|--------|
| Customer notes | `/context/customer-notes/{canonical}-{YYYY-MM-DD}.md` | Markdown |
| Customer profiles | `/context/customer-profiles/{canonical}.json` | JSON |
| Insights JSON | `/context/insights/{customer}-{date}.json` | JSON |
| Insights one-pager | `/context/insights/{customer}-{date}.md` | Markdown |
| Jira sync log | `/context/insights/{customer}-{date}-jira-sync.json` | JSON |
| Pending state | `/context/pending/{pipeline}-{date}.pending.json` | JSON |
| Jira snapshot | `/context/product-context/jira-snapshot.json` | JSON |
| FR snapshot | `/context/product-context/fr-snapshot.json` | JSON |
| Product context index | `/context/product-context/index.md` | Markdown (MOC) |
| PRDs | `/context/product-context/prds/{slug}-prd-{YYYY-MM-DD}.md` | Markdown + frontmatter |
| Market signals | `/context/product-context/market-signals/{slug}-signal-{YYYY-MM-DD}.md` | Markdown + frontmatter |
| Field signals | `/context/product-context/field-signals/{slug}-signal-{YYYY-MM-DD}.md` | Markdown + frontmatter |
| Engineering signals | `/context/product-context/engineering-signals/{slug}-signal-{YYYY-MM-DD}.md` | Markdown + frontmatter |
| PRFAQs | `/context/product-context/prds/{slug}-prfaq-{YYYY-MM-DD}.md` | Markdown + frontmatter |
| Eng doc summaries | `/context/product-context/engineering/{slug}-eng-doc-{YYYY-MM-DD}.md` | Markdown + frontmatter |
| RFCs (ingested) | `/context/product-context/engineering/{slug}-rfc-{YYYY-MM-DD}.md` | Markdown + frontmatter |
| Prior art summaries | `/context/product-context/prior-art/{slug}-prior-art-{YYYY-MM-DD}.md` | Markdown + frontmatter |
| Slack threads | `/context/product-context/slack-threads/{slug}-slack-thread-{YYYY-MM-DD}.md` | Markdown + frontmatter |
| Templates | `/context/templates/` | Markdown |

**Canonical customer names:** Lowercase, hyphenated form (e.g., `[customer-1]`, `[customer-4]`, `[customer-2]`, `[customer-3]`, `[customer-internal]`).

## Lighthouse Customers

These five customers get full pipeline treatment (extraction, insights, Jira sync):

1. [CUSTOMER_1]
2. [CUSTOMER_2]
3. [CUSTOMER_3]
4. [CUSTOMER_4]
5. [CUSTOMER_INTERNAL]

All other customers get notes formatted and stored but no profile, insights, or Jira sync.

## Execution Rules

**Parallelism:** Independent operations MUST run in parallel. Examples: 5 extraction tools (branch pattern), all customer profile reads at session start, all Jira write operations, multiple file reads.

**Determinism:** Merge operations are pure functions. `merge-insights` has no LLM call, fixed logic for combining outputs, no hallucination risk in merge layer. All inter-tool data is valid JSON.

**Safety:** Never overwrite existing customer notes. Always confirm before Jira writes. Phase 1 is always safe to run autonomously. Phase 2 always requires explicit approval.

**Plan Mode:** Enter plan mode proactively for: ambiguous notes with unclear customer, multi-customer PRD synthesis (3+), large Jira sync proposals (5+ actions), any uncertainty about approach.

## Glossary

| Term | Definition |
|------|------------|
| **HITL** | Human-in-the-loop. Suspend point requiring explicit user approval before continuing. |
| **Lighthouse customer** | One of 5 strategic customers receiving full pipeline treatment (extraction, insights, Jira sync). |
| **Canonical name** | Lowercase, hyphenated customer identifier (e.g., `[customer-1]`). |
| **Slug** | URL-safe identifier derived from project tag (lowercase, spaces→hyphens, alphanumeric only). |
| **Frontmatter** | YAML metadata block at top of markdown files, enables semantic context loading. |
| **1-hop traversal** | Graph traversal that loads immediate neighbors but never recurses. Prevents context explosion. |
| **Additive merge** | Update operation that appends new data but never deletes existing data. Preserves full history. |
| **Signal brief** | Lightweight document for insufficient-evidence topics (< 2 customers, < 3 mentions). Preserves weak signals. |
| **Phase 1** | Autonomous analyze phase. Read-only operations, safe to run without approval. |
| **Phase 2** | Gated act phase. External writes (Jira, PRD generation), always requires approval. |

## Skill Quick Reference

| Skill | Category | Input | Output |
|-------|----------|-------|--------|
| `format-field-notes` | Memory/Fetch | Raw notes (any format) | Formatted markdown note |
| `update-customer-profile` | Memory/Fetch | Formatted notes + existing profile | Updated profile JSON |
| `get-notes-by-customer` | Memory/Fetch | Customer name | List of note file paths |
| `get-notes-by-topic` | Memory/Fetch | Keyword | Matching excerpts across notes |
| `get-untracked-asks` | Memory/Fetch | (none) | JSON of asks with no Jira issue |
| `ingest-router` | Ingestion | Pasted content | Delegates to specialist |
| `ingest-slack-thread` | Ingestion | Slack thread text | Structured markdown summary |
| `ingest-rfc` | Ingestion | RFC document | Structured markdown summary |
| `ingest-signal` | Ingestion | Unstructured content | Minimal markdown with takeaways |
| `extract-themes` | Extraction | Formatted notes | JSON array of themes |
| `extract-open-asks` | Extraction | Formatted notes | JSON array of asks |
| `extract-pain-points` | Extraction | Formatted notes | JSON array of pain points |
| `extract-tool-signals` | Extraction | Formatted notes | JSON array of tools mentioned |
| `map-to-existing-jira` | Extraction | Asks + Jira snapshot | JSON: matched[], unmatched[] |
| `merge-insights` | Merge | 5 extraction outputs | Unified Insights JSON |
| `insights-onepager` | Output | Insights JSON | Markdown one-pager |
| `signal-brief` | Output | Insights JSON | Markdown signal doc |
| `create-jira-issue` | Output | Ask + evidence | Jira issue (requires approval) |
| `update-jira-issue` | Output | Jira issue + new evidence | Updated issue (requires approval) |
| `prd-generator` | Output | Insights + product context | PRD markdown (requires approval) |
| `prfaq-generator` | Output | PRD or insights + context | PRFAQ markdown (requires approval) |
| `review-engineering-doc` | Analysis | Engineering doc | PM review comments + summary |
| `analyze-prior-art` | Analysis | Competitor/reference doc | Reusable patterns + gaps + summary |
| `thought-partner` | Analysis | Topic or downstream task | 5-stage analysis + recommendation |
| `refresh-fr-snapshot` | Refresh | (none) | Updated fr-snapshot.json |
