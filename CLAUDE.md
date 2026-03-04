# PM Intelligence System — [PRODUCT]

[PM_NAME] is a Product Manager for [PRODUCT] at [COMPANY]. This system turns customer and stakeholder calls into structured product intelligence — formatted field notes, Jira backlog updates, PRDs, and PRFAQs — using Claude Code as the agent runtime.

---

## Session Start

At the beginning of every session:
1. Read all files in `/context/customer-profiles/` into context (working memory)
2. Read `/context/product-context/jira-snapshot.json` into context ([PROJECT_KEY] issue reference — chunk if needed)
3. Read `/context/system/learning-log.md` into context (mistake prevention and learned patterns)
4. Check `/context/pending/` for any suspended workflows awaiting approval

---

## Product Context Loading

Markdown files in `/context/product-context/` may include YAML frontmatter with structured metadata. When any skill needs context from this directory (e.g. `prd-generator` gathering evidence, or any future skill that builds on prior analysis):

1. Read the frontmatter (`project_tag` + `one_line_description`) from all `.md` files in `/context/product-context/`
2. Make a **semantic judgment** about relevance to the current task — "MCP Server" and "[PRODUCT_SHORT] MCP" should both match an MCP-related task; "Vulnerability Scanning v2" should match a vuln-related PRD
3. Load only the relevant files into full context
4. Non-frontmatter files (like `jira-snapshot.json`) use their existing loading rules from Session Start

### Canonical Frontmatter Schema

```yaml
---
project_tag: "Human-readable project name"
one_line_description: "One sentence: what this doc is and why it matters"
doc_type: engineering_doc | prior_art | prd | signal | prfaq | slack_thread
signal_source: market | field | engineering  # Only present when doc_type=signal
date_ingested: YYYY-MM-DD
related_customers: []  # Array of canonical customer names (auto-populated by ingest-router)
related_jira: []       # Array of Jira issue keys ([PROJECT_KEY]-XXX, [FR_PROJECT_KEY]-XXX) (auto-populated)
related_docs: []       # Array of related product context file slugs (manual or auto-populated)
---
```

Not all product-context files have frontmatter yet. Skills that produce frontmatter-tagged files: `review-engineering-doc`, `analyze-prior-art`. Future skills (`prd-generator`, `signal-brief`) can adopt it when they run.

---

## Router-Based Ingestion

The system uses a smart router pattern to auto-detect content format and delegate to specialized ingestion skills. This enables [PM_NAME] to paste any content (Slack threads, RFCs, blog posts, informal notes) and have it automatically structured and saved.

### Ingestion Flow

```
User pastes content → ingest-router detects format
                            ↓
                ┌───────────┴────────────┐
                │                        │
         Slack thread?              RFC?              Signal (catch-all)
                ↓                        ↓                      ↓
      ingest-slack-thread     ingest-rfc            ingest-signal
                │                        │                      │
                └────────────┬───────────┘
                             ↓
               File saved to /context/product-context/{subdir}/
```

### Detection Heuristics

| Format | Detection Patterns | Priority |
|---|---|---|
| **Slack thread** | "replied to this thread", timestamps (9:45 AM), emoji reactions (`:emoji:` or "thumbs-up 2"), "View thread" | Check first |
| **RFC** | Section headings ("Alternatives Considered", "Decision", "Open Questions", "Motivation"), formal architecture language | Check second |
| **Signal** | Default if no pattern matches (blog posts, emails, informal notes, competitor docs) | Fallback |

### Signal Subtype Classification

When `ingest-router` detects format = "signal", it performs a second classification pass to determine the signal source: **market**, **field**, or **engineering**.

#### Detection Patterns

| Signal Type | Patterns | Confidence |
|---|---|---|
| **Market** | Competitor domains ([competitor-a.com], [competitor-b.com], [competitor-c.com]), keywords: "announces" / "press release", blog structure (author + date), competitor product names | HIGH if domain + 1 keyword |
| **Field** | Email headers (From:/To:/Subject:), customer names from profiles, keywords: "feedback from" / "customer asked", SA/SE names ([ENGINEER_NAME]), @customer.com domains | HIGH if email headers OR customer name + feedback keyword |
| **Engineering** | Technical jargon: "prototype" / "spike" / "POC", code blocks, architecture language: "design exploration" / "technical debt", @[company-domain.com] (non-GTM), @eng-team mentions | HIGH if code + technical keyword |

#### Decision Logic

1. Scan for all three pattern types
2. Select highest confidence match
3. If tie OR all LOW → default to `market-signals/`
4. If conflicting HIGH confidence → prompt user

#### Manual Override

Users can specify signal subtype explicitly:
```
"Ingest this as market signal: [content]"
"Ingest this as field signal: [content]"
"Ingest this as engineering signal: [content]"
```

#### File Path Selection

Based on detected/specified signal source:
- Market signals: `/context/product-context/market-signals/{slug}-signal-{YYYY-MM-DD}.md`
- Field signals: `/context/product-context/field-signals/{slug}-signal-{YYYY-MM-DD}.md`
- Engineering signals: `/context/product-context/engineering-signals/{slug}-signal-{YYYY-MM-DD}.md`

### Router Responsibilities

The `ingest-router` skill handles common logic before delegating:

1. **Project tag extraction** — From content (first heading, thread subject, RFC title) or provided by user
2. **Slug generation** — Lowercase, spaces→hyphens, alphanumeric only, collapse consecutive hyphens
3. **Collision detection** — Check if file exists, append `-2`, `-3`, etc. if needed
4. **Frontmatter scaffold** — Generate YAML with auto-detected `related_customers`, `related_jira`, `related_docs`
5. **Delegation** — Route to specialist skill with structured input

### Specialist Skills

Each specialist handles format-specific parsing:

- **ingest-slack-thread** — Parse participants, timestamps, key decisions, unresolved questions, emoji reactions
- **ingest-rfc** — Extract design rationale, alternatives considered, trade-offs, open questions, decision records
- **ingest-signal** — Minimal structure: key takeaways (1-3 sentences), original content preserved

### Manual Override

Users can bypass auto-detection:
```
"Ingest this as RFC: [content]"
"Ingest this as signal: [content]"
"Ingest this as Slack thread: [content]"
```

### File Paths

| Content Type | Path |
|---|---|
| Slack threads | `/context/product-context/slack-threads/{slug}-slack-thread-{YYYY-MM-DD}.md` |
| RFCs | `/context/product-context/engineering/{slug}-rfc-{YYYY-MM-DD}.md` |
| Market signals | `/context/product-context/market-signals/{slug}-signal-{YYYY-MM-DD}.md` |
| Field signals | `/context/product-context/field-signals/{slug}-signal-{YYYY-MM-DD}.md` |
| Engineering signals | `/context/product-context/engineering-signals/{slug}-signal-{YYYY-MM-DD}.md` |

---

## Wikilinks

Product context files use wikilinks (Obsidian-style `[[target]]` syntax) to reference related content. Wikilinks enable graph traversal — when a skill loads a file, it can automatically load 1-hop neighbors.

### Wikilink Syntax

Use double brackets with the target identifier (no file extensions):

```markdown
[[compliance-benchmark-integration-prd-2026-02-20]]  → product context file
[[[CUSTOMER_1]]]                          → customer profile
[[[PROJECT_KEY]-002]]                                   → Jira issue
[[[customer-1]-2026-02-15]]              → customer note
```

**Rules**:
- Product context files: Use filename without extension and without subdirectory
- Customer profiles: Use canonical name (e.g., "[CUSTOMER_1]", not "[customer-1]")
- Jira issues: Use issue key ([PROJECT_KEY]-XXX, [FR_PROJECT_KEY]-XXX)
- Customer notes: Use filename without extension

### Frontmatter vs. Body Wikilinks

**Structured (frontmatter)**:
```yaml
related_customers: ["[CUSTOMER_1]", "[CUSTOMER_2]"]
related_jira: ["[PROJECT_KEY]-002", "[PROJECT_KEY]-001"]
related_docs: ["vuln-scanning-v2-eng-doc"]
```

**Freeform (body)**:
```markdown
## Related Context

**Customer Profiles**: [[[CUSTOMER_1]]] | [[[CUSTOMER_2]]]
**Jira Tracking**: [[[PROJECT_KEY]-002]] (Compliance Reporting epic)
```

Both approaches are valid. Frontmatter enables automation (filtering, queries), body wikilinks are human-readable.

### Wikilink Target Types

| Target Type | Format | Example | Resolves To |
|---|---|---|---|
| Product context | `[[filename-without-extension]]` | `[[compliance-benchmark-prd-2026-02-20]]` | `/context/product-context/{subdir}/{filename}.md` |
| Customer profile | `[[Canonical Name]]` | `[[[CUSTOMER_1]]]` | `/context/customer-profiles/[customer-1].json` |
| Jira issue | `[[KEY-NUMBER]]` | `[[[PROJECT_KEY]-002]]` | Jira link (display only, not traversable) |
| Customer note | `[[canonical-YYYY-MM-DD]]` | `[[[customer-1]-2026-02-15]]` | `/context/customer-notes/{filename}.md` |

### When to Generate Wikilinks

Skills that produce product context should generate wikilinks when:
- **Customer names detected**: Add to `related_customers` frontmatter and link in Related Context section
- **Jira issues mentioned**: Add to `related_jira` frontmatter and link in Related Context section
- **Related product context**: Add to `related_docs` frontmatter if detectable

Skills that auto-generate wikilinks:
- `prd-generator` — Generates Related Context section with customer + Jira wikilinks
- `ingest-router` — Auto-populates `related_*` frontmatter fields during ingestion
- `signal-brief` — Links to customer notes mentioned in evidence

---

## Graph Traversal

When a skill loads a product context file with wikilinks or `related_*` frontmatter, it can automatically load 1-hop neighbors to enrich context. Graph traversal is **always limited to 1 hop** — never recursive.

### When to Traverse

Use graph traversal when a skill explicitly needs rich context:
- `prd-generator` — After loading semantic matches, follow wikilinks to related docs, customers
- `prfaq-generator` — Load PRD + its wikilinked neighbors
- `thought-partner` — Optionally load related product context for deeper analysis

Do NOT traverse for:
- Simple file reads
- Skills that only need the target file (e.g., `format-field-notes`)
- Skills that already load all relevant context explicitly

### Traversal Pattern

```
1. Load target file (e.g., PRD)
2. Parse frontmatter: extract related_customers, related_jira, related_docs
3. Parse body: extract [[wikilink]] patterns
4. For each wikilink target:
   a. Resolve target to file path
   b. Read file into context
   c. Stop (no recursion — do NOT follow wikilinks in the neighbor file)
5. Display traversal log to user
```

### Traversal Log Format

```
prd-generator — loading product context for "Compliance Benchmarking"...
   Loaded: compliance-benchmark-integration-prd-2026-02-20.md
   Following wikilinks (1 hop):
      vulnerability-scanning-v2-eng-doc-2026-01-15.md
      [CUSTOMER_1] customer profile
      [PROJECT_KEY]-002 (epic link — display only, not loaded)
   Context loaded — 3 related files

[Skill proceeds with enriched context]
```

### Resolution Rules

| Wikilink Target | Resolution Logic |
|---|---|
| `[[product-context-file]]` | Search `/context/product-context/` subdirectories for `{target}.md` |
| `[[Customer Name]]` | Map canonical name to `/context/customer-profiles/{canonical}.json` |
| `[[[PROJECT_KEY]-XXX]]` | Jira issue — do NOT load (display as link only) |
| `[[customer-date]]` | Resolve to `/context/customer-notes/{target}.md` |

**File not found**: If wikilink target doesn't resolve, log warning and continue (non-blocking):
```
   Wikilink target not found: [[missing-doc]] (skipping)
```

### Traversal Depth Limit

**Always 1 hop. Never recursive.**

Example:
- PRD A links to Engineering Doc B
- Engineering Doc B links to Prior Art C
- When generating PRFAQ from PRD A:
  - Load: PRD A + Engineering Doc B (1 hop)
  - Do NOT load: Prior Art C (2 hops)

User can manually specify additional context if needed ("also load [file]").

---

## Named Pipelines

### Full Call Pipeline

Triggered by: [PM_NAME] pasting raw notes (any format) and saying "Run full-call-pipeline for [customer]"

```
PHASE 1 — ANALYZE (autonomous)

[CHAIN] format-field-notes  <- input: pasted raw notes (any format)
        | {note_file_path, customer, tier}

[CONDITION] Notes ambiguous?
        YES -> SUSPEND HITL-1: "Couldn't identify customer/topic — confirm"
                 -> on resume: continue with confirmed values
        NO  -> continue

[CONDITION] Is customer lighthouse?
        YES -> continue full pipeline
        NO  -> update-customer-profile -> write notes -> STOP

        |
[CHAIN] update-customer-profile
        | {customer_profile.json updated}

        |
[BRANCH — 5 parallel extractions]
        extract-themes          -> {themes[]}
        extract-open-asks       -> {open_asks[]}
        extract-pain-points     -> {pain_points[]}
        extract-tool-signals    -> {tools[]}
        map-to-existing-jira    -> {matched[], unmatched[]}

        |
[MERGE] -> unified Insights JSON (deterministic, no LLM call)
        | written to /context/insights/{customer}-{date}.json

        |
[CHAIN] insights-onepager
        | written to /context/insights/{customer}-{date}.md

[CONDITION] Net-new signals exist?
        NO  -> STOP (Phase 1 complete, no Jira needed)
        YES -> SUSPEND HITL-2: show proposed Jira creates + updates

PHASE 2 — ACT (requires approval)

        | (on resume from HITL-2, approved actions only)
[BRANCH — parallel Jira writes, one per approved action]
        create-jira-issue (for each approved net-new ask)
        update-jira-issue (for each approved existing issue update)

        |
[MERGE] -> Jira sync JSON written to /context/insights/{customer}-{date}-jira-sync.json
```

### PRD Pipeline

Triggered by: "Write a PRD for [topic]"

```
PHASE 1 — ANALYZE (autonomous)

[CHAIN] get-notes-by-topic(keyword)
        | {matching_note_files[]}

[BRANCH — parallel extraction]
        extract-themes
        extract-open-asks
        extract-pain-points

        |
[MERGE] -> unified Insights JSON

[CONDITION] Sufficient evidence? (>=2 customers OR >=3 mentions)
        NO  -> signal-brief -> STOP
        YES -> SUSPEND HITL-3: show evidence summary

PHASE 2 — ACT (requires approval)

        | (on resume from HITL-3)
[CHAIN] prd-generator
        | PRD draft generated

        |
SUSPEND HITL-4: show full PRD draft

        | (on resume from HITL-4)
[CHAIN] save approved PRD to /context/product-context/prd-{topic}.md -> DONE
```

### Thought Partner Flag

The `--think` flag and `with thought partner` phrase are equivalent modifiers that can be appended to any task request. They invoke the `thought-partner` skill as a pre-step before the downstream task.

- `"Write a PRD for X --think"` and `"Write a PRD for X with thought partner"` both trigger thought-partner → HITL-TP suspend → downstream task on resume
- The thought partner always runs **before** the downstream task and always suspends for approval (HITL-TP)
- Can also be invoked standalone with no downstream task: `"Run thought partner on [topic]"`
- **Never runs automatically** — [PM_NAME] must explicitly opt in with the flag or a direct invocation

---

## HITL Suspend/Resume

### Suspend Points

| Point | Trigger | What [PM_NAME] sees | Resume |
|---|---|---|---|
| **HITL-1** | format-field-notes can't identify customer/topic | "Couldn't identify — confirm" | Confirm or correct |
| **HITL-2** | merge-insights finds net-new signals | Proposed Jira creates + updates | Approve all/subset/skip |
| **HITL-3** | PRD pipeline has sufficient evidence | Evidence summary | Approve PRD or signal-brief |
| **HITL-4** | prd-generator/prfaq-generator completes | Full draft | Approve/edit/cancel |
| **HITL-TP** | thought-partner analysis complete | Analysis + alternatives + recommendation | Proceed/explore alternative/stop |

### Pending State

On suspend, write state to `/context/pending/{pipeline}-{date}.pending.json`:
```json
{
  "pipeline": "full-call-pipeline",
  "started_at": "ISO timestamp",
  "suspended_at": "ISO timestamp",
  "suspend_point": "HITL-2",
  "suspend_reason": "awaiting_jira_approval",
  "completed_steps": ["format-field-notes", "update-customer-profile", "..."],
  "next_step": "create-jira-issue",
  "awaiting_approval": {
    "prompt": "Ready to sync to Jira [PROJECT_KEY]. Please review:",
    "proposed_actions": [
      { "action": "create", "title": "...", "evidence_count": N, "customers": [], "approved": null },
      { "action": "update", "jira_issue": "[PROJECT_KEY]-XXX", "title": "...", "new_evidence": "...", "approved": null }
    ]
  },
  "context": {
    "insights_file": "insights/{customer}-{date}.json",
    "customer_profile": "customer-profiles/{customer}.json"
  }
}
```

### Resume Commands

```
"What workflows are waiting for my approval?"
-> reads /context/pending/*.pending.json, summarizes each

"Approve the [CUSTOMER_1] Jira sync"
-> sets approved: true on all actions, resumes pipeline, deletes .pending.json

"Approve the [TOOL_A] selector issue but skip the compliance benchmark update"
-> sets approved selectively, resumes with amended plan

"Cancel the [CUSTOMER_1] Jira sync"
-> deletes .pending.json, no Jira writes made

"Resume the [TOOL_A] integration PRD with these changes: [edits]"
-> applies edits to draft, saves to /context/product-context/, closes pending
```

---

## File Path Conventions

| Content | Path | Format |
|---|---|---|
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
| Call plans | `/context/call-plans/{slug}-call-plan-{YYYY-MM-DD}.md` | Markdown |

Canonical customer names use lowercase, hyphenated form: `[customer-1]`, `[customer-4]`, `[customer-2]`, `[customer-3]`, `[customer-internal]`.

---

## Agent Rules

### Phase Split
- **Phase 1 (Analyze)**: Read notes, format, extract insights, write local files — safe to run autonomously
- **Phase 2 (Act)**: Write to Jira, generate PRDs/PRFAQs — always requires explicit human approval

### Plan Mode Usage
Use plan mode proactively for complex multi-step tasks:
- **Full-call-pipeline on ambiguous notes** — customer unclear, multiple topics mixed, unusual structure
- **Multi-customer PRD/PRFAQ synthesis** — 3+ customers with conflicting requirements
- **Large Jira sync proposals** — 5+ proposed actions requiring matching strategy
- **Any uncertainty about approach** — better to plan and get approval than guess wrong
- **General rule:** If you would need to ask clarifying questions mid-execution, enter plan mode first

### Jira Permissions ([PROJECT_KEY] Project)
| Operation | Allowed |
|---|---|
| Create new Story/Task/Bug | Yes |
| Add comment with customer evidence | Yes |
| Update description with customer context | Yes |
| Add `form` + `intake` labels | Yes |
| Link to parent epic | Yes |
| Change issue status | Never |
| Assign to someone | Never |
| Set/change priority | Never |
| Set due dates | Never |
| Close or resolve issues | Never |
| Modify sprint/story points | Never |

### Execution Rules
- **Parallel tool calls**: All independent operations MUST run in parallel (customer profile reads, branch extractions, Jira queries)
- **Branch extractions**: The 5 extraction tools (themes, asks, pain-points, tool-signals, jira-mapping) are always parallel — never sequential
- **Progress signaling**: Use the formatting conventions in Progress Signaling section for all pipeline runs

### Output Rules
- All inter-tool data must be valid JSON matching the schemas defined in the architecture doc
- Tools that produce human-readable artifacts (field notes, PRDs, PRFAQs, one-pagers) output markdown
- Always confirm with [PM_NAME] before any Jira write operation
- Never overwrite existing customer notes — each call gets its own dated file

---

## Jira Reference — [PROJECT_KEY] Project

**Project**: [PROJECT_KEY] ([PRODUCT]), board [BOARD_ID]
**Atlassian Cloud ID**: `[ATLASSIAN_CLOUD_ID]`

### Hierarchy
```
Epic (level 1)
  └── Story / Task / Bug / Support Request (level 0)
        └── Sub-task (level -1)
```

### Active Epics (as of Feb 2026)
| Epic | Title | Relevant to |
|---|---|---|
| [PROJECT_KEY]-001 | [Epic 1: Vulnerability Data Integration] | Vuln scanning, vulnerability signals |
| [PROJECT_KEY]-002 | [Epic 2: Image Compliance Reporting & Governance] | Compliance benchmarks, compliance asks |
| [PROJECT_KEY]-003 | [Epic 3: Enterprise Readiness] | Auth, enterprise asks |
| [PROJECT_KEY]-004 | [Epic 4: Enforced Provisioners - Phase 1] | Provisioner control |
| [PROJECT_KEY]-005 | [Epic 5: Channel Assignment Management - Phase 1] | Channel management |
| [PROJECT_KEY]-006 | [Epic 6: Native SBOM Generation] | SBOM |
| [PROJECT_KEY]-007 | [Epic 7: Unified Payments] | Billing/payments |

### Issue Fields for Customer-Sourced Issues
- `summary` — issue title
- `project` — always `[PROJECT_KEY]`
- `issuetype` — `Story` for feature/enhancement asks, `Bug` for defects
- `labels` — always `["form", "intake"]`
- `status` — leave as `Pending Triage` (never set programmatically)
- `assignee` — leave unassigned
- `priority` — leave as default `"New - Needs Prioritization"` (never set)
- `[CUSTOM_FIELD_CUSTOMER_NAME]` — Customer Name (e.g. "[CUSTOMER_1]")
- `parent` — link to relevant epic if one clearly applies
- `description` — customer evidence (see template)
- `[CUSTOM_FIELD_TICKET_NUMBER]` — Zendesk Ticket Number (if available)
- `components` — `Core`, `[PLATFORM] BE`, or `[PLATFORM] FE` (leave blank if unclear)

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

### Matching Rules for map-to-existing-jira
- **Match when**: Core functionality overlap AND similar scope; specific tool/vendor name in both; same epic parent AND similar description
- **Create new when**: Different scope; existing issue is Closed; materially different requirements; existing issue is a sub-task
- **When in doubt**: Flag for human review, do not auto-match

### Status Flow (read-only)
`Pending Triage` → `To Do` → `In Progress` → `In Review` → `Blocked` / `Closed`

### FR Board ([FR_PROJECT_KEY] Project)

The [FR_PROJECT_KEY] (Feature Request Board) is a separate Jira project from [PROJECT_KEY]. It contains customer feature requests across all [COMPANY] products — not just [PRODUCT].

- [PRODUCT] issues in [FR_PROJECT_KEY] are identified by a `[PRODUCT_SHORT]:` prefix in the issue summary
- Non-Closed [PRODUCT_SHORT] [FR_PROJECT_KEY] issues are stored locally in `/context/product-context/fr-snapshot.json` — run `refresh-fr-snapshot` to update this file with current data
- [FR_PROJECT_KEY] issues are **not** linked to [PROJECT_KEY] issues in Jira. The agent should suggest likely [PROJECT_KEY] matches based on content similarity but never assert a link that doesn't exist in Jira.

---

## Progress Signaling

### Step Start
```
[tool-name] — [what it's doing] ([input context])
```

### Branch Fan-out
```
Branching into N parallel extractions on [input]...
   -> extract-themes
   -> extract-open-asks
   -> extract-pain-points
   -> extract-tool-signals
   -> map-to-existing-jira
```

### Branch Completion
```
   extract-themes — N themes found
   extract-open-asks — N asks found
```

### HITL-2 Jira Sync Approval
```
PAUSED — Jira sync ready for approval ([Customer], [date])

   CREATE  "[ask title]"
           Evidence: [Customer A] (xN), [Customer B] (xN)

   UPDATE  [[PROJECT_KEY]-XXX] "[issue title]"
           New evidence: [Customer] [date]: [quote]

   Run: "approve [customer] Jira sync" to proceed
        "approve [customer] Jira sync except [item]" for partial
        "cancel [customer] Jira sync" to discard
```

### Pipeline Completion
```
full-call-pipeline complete — [Customer], [date]

   Notes saved:     /context/customer-notes/[filename].md
   Profile updated: /context/customer-profiles/[customer].json
   Insights saved:  /context/insights/[filename].md

   Top signals found:
     [Theme] ([N] customers, [priority])
     [Ask] ([N] mentions, untracked)

   Jira: pending approval / [N] issues updated / skipped
```

---

## Abbreviations

| Abbreviation | Meaning |
|---|---|
| [PLATFORM] | [Your Cloud Platform] |
| Core | [Product] CLI / OSS core functionality |
| Vuln | Vulnerability scanning |
| SBOM | Software Bill of Materials |
| VMP | Validated Management Packs |
| CV | Channel Versions |
| AAP | [CONFIG_MGMT_TOOL] Automation Platform |
| FSI | Financial Services Industry |

---

## Skill Inventory

All skills live in `/skills/{name}/SKILL.md`. Read the SKILL.md for detailed input/output schemas and behavior.

### Memory & Fetch Tools
- `format-field-notes` — normalize raw notes into standard field notes format
- `update-customer-profile` — update customer profile JSON after a call
- `get-notes-by-customer` — list note files for a given customer
- `get-notes-by-topic` — keyword search across all notes
- `get-untracked-asks` — find open asks with no Jira issue

### Ingestion Tools
- `ingest-router` — smart router that auto-detects content format and delegates to specialists
- `ingest-slack-thread` — parse and structure Slack thread exports
- `ingest-rfc` — parse and structure RFC/engineering design documents
- `ingest-signal` — minimal ingestion for unstructured content (blog posts, emails, informal notes)

### Extraction Tools (branched, parallel)
- `extract-themes` — identify recurring themes and frequency
- `extract-open-asks` — identify explicit feature requests
- `extract-pain-points` — identify friction, blockers, workarounds
- `extract-tool-signals` — identify tools, integrations, competitors mentioned
- `map-to-existing-jira` — match asks against known [PROJECT_KEY] issues

### Merge
- `merge-insights` — deterministic merge of all branch outputs into Insights JSON

### Output Tools
- `insights-onepager` — formatted markdown summary from Insights JSON
- `signal-brief` — lightweight signal doc for insufficient-evidence topics
- `create-jira-issue` — create one new [PROJECT_KEY] issue (requires HITL-2 approval)
- `update-jira-issue` — add evidence to one existing [PROJECT_KEY] issue (requires HITL-2 approval)
- `prd-generator` — generate PRD from customer evidence and product context (requires HITL-4 approval)
- `prfaq-generator` — generate PRFAQ working-backwards document from PRD or customer evidence (requires HITL-4 approval)

### Analysis Tools
- `review-engineering-doc` — PM-perspective review comments + summary for engineering docs
- `analyze-prior-art` — prior art analysis identifying reusable elements and gaps
- `thought-partner` — optional product thinking framework; invoke with `--think` or `with thought partner` flag on any task
- `call-planner` — generate Mom Test research questions for upcoming customer calls; three modes: by customer, by topic, by meeting context

### Refresh Tools
- `refresh-fr-snapshot` — fetches current non-Closed [PRODUCT] [FR_PROJECT_KEY] issues and overwrites fr-snapshot.json; run before FR-related work

---

## Lighthouse Customers

These five customers get full pipeline treatment (extraction, insights, Jira sync):
1. [CUSTOMER_1]
2. [CUSTOMER_2]
3. [CUSTOMER_3]
4. [CUSTOMER_4]
5. [CUSTOMER_INTERNAL]

All other customers get notes formatted and stored but no profile, insights, or Jira sync.
