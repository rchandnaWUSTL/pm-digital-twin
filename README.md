# PM Digital Twin

A practical system for transforming raw customer conversations into structured product intelligence—formatted field notes, Jira backlog updates, PRDs, and PRFAQs—using Claude Code as the agent runtime.

## What This Is

Product managers drown in unstructured customer feedback. Every customer call generates notes that must be parsed, synthesized, and transformed into actionable intelligence. This system automates that transformation: paste raw meeting notes, get formatted field notes, synthesized insights across conversations, evidence-grounded Jira updates, and PRDs/PRFAQs backed by customer quotes.

The system runs autonomously for analysis (reading notes, extracting themes, identifying patterns) but always requires explicit human approval before writing to external systems like Jira or generating product documents. Built on Claude Code as the runtime, with 25 composable skills organized into three main pipelines.

**Key principle:** Two-phase execution. Phase 1 (analyze) is safe to run autonomously. Phase 2 (act) always requires your approval.

## How It Works

### Two-Phase Execution

**Phase 1 — Analyze (autonomous):** Read notes, format them into standard structure, update customer profiles, extract themes/asks/pain-points, identify patterns, write local files. No external side effects. Safe to run without approval.

**Phase 2 — Act (requires approval):** Create Jira issues, update backlog, generate PRDs/PRFAQs. Always gated by human-in-the-loop suspend points. You must explicitly approve each action.

This prevents accidental backlog pollution and gives you control over what gets written to external systems.

### Skill Architecture

The system uses 25 self-contained skills organized into 6 categories:

- **Memory & Fetch** — Format notes, update customer profiles, search notes by customer or topic
- **Ingestion** — Smart router that auto-detects content format (Slack threads, RFCs, blog posts) and structures it
- **Extraction** — Parallel analysis: extract themes, asks, pain points, tool signals, map to existing Jira issues
- **Merge** — Deterministic combination of extraction outputs (no LLM, pure function)
- **Output** — Generate insights summaries, create/update Jira issues, write PRDs/PRFAQs
- **Analysis** — Review engineering docs, analyze prior art, thought partner framework

Skills compose into pipelines or run standalone. Each skill has explicit input/output contracts defined in `/skills/{name}/SKILL.md`.

### Three Main Pipelines

**1. Full Call Pipeline**

Trigger: Paste raw meeting notes and say `"Run full-call-pipeline for [CUSTOMER_NAME]"`

Transforms meeting transcripts into structured intelligence:
- Formats notes into standard field notes
- Updates customer profile (additive merge, never deletes history)
- Extracts themes, asks, pain points, tool signals (5 parallel operations)
- Maps asks to existing Jira issues
- Generates insights summary
- Proposes Jira creates/updates → **Suspend for approval**
- After approval: writes to Jira in parallel

**2. PRD Pipeline**

Trigger: `"Write a PRD for [topic]"`

Generates Product Requirements Document from customer evidence:
- Searches notes for topic mentions
- Extracts themes, asks, pain points (3 parallel operations)
- Checks evidence threshold (≥2 customers OR ≥3 mentions)
- If insufficient: generates signal brief (preserves weak signal for future)
- If sufficient: loads related product context → **Suspend for approval**
- After approval: generates PRD with customer evidence grounding

**3. PRFAQ Pipeline**

Trigger: `"Write a PRFAQ for [topic]"` or `"Generate a PRFAQ from [PRD]"`

Generates working-backwards Press Release / FAQ document:
- Two modes: from existing PRD (with graph traversal) or from customer evidence
- Follows Amazon's working-backwards format
- Always evidence-grounded with customer quotes → **Suspend for approval**
- After approval: saves PRFAQ to product context

### Graph-Based Knowledge Management

Product context files (PRDs, engineering docs, signals) use wikilinks (`[[target]]` syntax) to connect customers, notes, Jira issues, and related documents. When a skill needs rich context, it follows wikilinks exactly one hop (never recursive) to load immediate neighbors. This prevents context explosion while enabling rich context retrieval.

### Router-Based Ingestion

Paste any content (Slack threads, RFCs, blog posts, emails) and the ingest-router auto-detects format and routes to specialized parsers. Consistent frontmatter metadata across all ingested content enables semantic retrieval later.

## Prerequisites

Before setup, you'll need:

- **Claude Code v0.1+** installed ([installation guide](https://docs.anthropic.com/claude/docs/claude-code))
- **Node.js/npm** (for MCP server)
- **Atlassian MCP server** package (`@modelcontextprotocol/server-atlassian`)
- **Jira Cloud account** with project admin access to your project
- **Git** for cloning the repository
- **Basic terminal comfort** — you'll run commands and paste content via CLI

## Setup

### 1. Clone Repository

```bash
git clone [your-repo-url] pm-digital-twin
cd pm-digital-twin
```

### 2. Install Atlassian MCP Server

```bash
npm install -g @modelcontextprotocol/server-atlassian
```

Follow the [Atlassian MCP server configuration guide](https://github.com/modelcontextprotocol/servers/tree/main/src/atlassian) to set up authentication.

### 3. Configure Claude Code Settings

Add the Atlassian MCP server to your Claude Code settings:

```json
{
  "mcpServers": {
    "atlassian": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-atlassian"],
      "env": {
        "ATLASSIAN_OAUTH_CLIENT_ID": "your-client-id",
        "ATLASSIAN_OAUTH_CLIENT_SECRET": "your-client-secret",
        "ATLASSIAN_OAUTH_REDIRECT_URI": "http://localhost:3000/oauth/callback"
      }
    }
  }
}
```

### 4. Create Context Directories

```bash
mkdir -p context/{customer-notes,customer-profiles,insights,pending,product-context,system,templates}
mkdir -p context/product-context/{prds,market-signals,field-signals,engineering-signals,engineering,slack-threads,prior-art}
```

### 5. Configure Jira Project

Edit `CLAUDE.md` to configure your Jira project:

```markdown
**Project**: [YOUR_JIRA_PROJECT] (Your Product Name)
**Atlassian Cloud ID**: `[your-cloud-id-here]`
```

To find your Atlassian Cloud ID, run:
```bash
# After configuring MCP server
claude code
> Use the mcp__atlassian__getAccessibleAtlassianResources tool
```

### 6. Initialize Learning Log

```bash
echo "# Learning Log\n\nMistakes and learned patterns from production runs.\n" > context/system/learning-log.md
```

### 7. Define Lighthouse Customers

Edit `CLAUDE.md` to define your lighthouse customers (customers that get full pipeline treatment with Jira sync):

```markdown
## Lighthouse Customers

These customers get full pipeline treatment (extraction, insights, Jira sync):
1. [Customer A]
2. [Customer B]
3. [Customer C]
4. [Customer D]
5. [Customer E]

All other customers get notes formatted and stored but no profile, insights, or Jira sync.
```

## Onboarding Your Own Context

### Add Existing Product Docs

If you have existing PRDs, RFCs, or product context documents, add frontmatter to make them discoverable:

```yaml
---
project_tag: "Human-readable project name"
one_line_description: "One sentence: what this doc is and why it matters"
doc_type: prd | engineering_doc | prior_art | signal
date_ingested: YYYY-MM-DD
related_customers: []  # Array of customer names
related_jira: []       # Array of Jira issue keys
related_docs: []       # Array of related doc filenames
---
```

Save to appropriate subdirectory:
- PRDs → `/context/product-context/prds/`
- Engineering docs → `/context/product-context/engineering/`
- Signals → `/context/product-context/{market,field,engineering}-signals/`

### Ingest Slack Threads

Have a Slack thread with product decisions? Paste it and let the router auto-detect:

```bash
claude code
> [Paste Slack thread export]
> "Ingest this content"
```

The ingest-router will:
1. Detect it's a Slack thread (timestamps, emoji reactions, thread markers)
2. Extract participants, key decisions, unresolved questions
3. Generate frontmatter with auto-detected related customers/Jira
4. Save to `/context/product-context/slack-threads/`

Now that thread is part of your knowledge base—future PRD generation will automatically load it as related context.

### Configure CLAUDE.md for Your Product

Edit `CLAUDE.md` to replace generic placeholders:

- Replace `[YOUR_PRODUCT]` with your product name
- Replace `[YOUR_JIRA_PROJECT]` with your Jira project key
- Replace `[YOUR_COMPANY]` with your company name
- Update active epics list with your Jira epics
- Update lighthouse customer list
- Add product-specific abbreviations

The `CLAUDE.md` file serves as the persona configuration—it tells the agent about your product, your Jira structure, your customers, and your workflow preferences.

## Your First Run

Let's walk through a simple full-call-pipeline run.

### Step 1: Start Claude Code

```bash
cd pm-digital-twin
claude code
```

At session start, the agent automatically loads:
- All customer profiles
- Jira snapshot
- Learning log
- Pending workflows (if any)

### Step 2: Paste Meeting Notes

Copy your raw meeting notes (any format—transcript, bullet points, informal notes) and paste into Claude Code:

```
Meeting with [CUSTOMER_NAME] - 2024-03-15

Discussed their current image compliance workflow. They're manually generating
CIS benchmark reports using external tools, then correlating with their Packer
builds. Takes 2-3 hours per image. Asked if we could integrate CIS scanning
directly into HCP Packer channel view.

Also raised concerns about Wiz vulnerability data—need it visible in Packer
for STIG compliance audits.
```

### Step 3: Run Pipeline

```
Run full-call-pipeline for [CUSTOMER_NAME]
```

### What Happens Next

**Phase 1 (automatic):**

```
⚙️  format-field-notes — normalizing raw notes ([CUSTOMER_NAME])
   ✓ Customer identified: [CUSTOMER_NAME] (lighthouse)
   ✓ Topic identified: Compliance reporting
   ✓ Notes saved: customer-notes/[customer-name]-2024-03-15.md

⚙️  update-customer-profile — merging into existing profile
   ✓ Added "CIS benchmarks" to open asks (times_mentioned: 1)
   ✓ Profile updated: customer-profiles/[customer-name].json

🔀 Branching into 5 parallel extractions...
   → extract-themes
   → extract-open-asks
   → extract-pain-points
   → extract-tool-signals
   → map-to-existing-jira

   ✓ extract-themes — 2 themes found
   ✓ extract-open-asks — 2 asks found
   ✓ extract-pain-points — 1 pain point found
   ✓ extract-tool-signals — 1 tool signal found
   ✓ map-to-existing-jira — 0 matched, 2 unmatched

⚙️  merge-insights — deterministic merge (no LLM)
   ✓ Insights saved: insights/[customer-name]-2024-03-15.json

⚙️  insights-onepager — generating markdown summary
   ✓ One-pager saved: insights/[customer-name]-2024-03-15.md
```

**Phase 2 (requires approval):**

```
⏸  PAUSED — Jira sync ready for approval ([CUSTOMER_NAME], 2024-03-15)

   CREATE  "CIS Benchmark Integration for Compliance Reporting"
           Evidence: [CUSTOMER_NAME] (×1)
           Epic: [YOUR_EPIC_KEY] (Compliance epic)

   CREATE  "Wiz Vulnerability Data in Channel View"
           Evidence: [CUSTOMER_NAME] (×1)
           Epic: [YOUR_EPIC_KEY] (Vulnerability epic)

   Run: "approve [customer-name] Jira sync" to proceed
        "approve [customer-name] Jira sync except CIS" for partial
        "cancel [customer-name] Jira sync" to discard
```

### Step 4: Review and Approve

Review the proposed Jira creates. When ready:

```
approve [customer-name] Jira sync
```

Or for partial approval:

```
approve [customer-name] Jira sync except Wiz
```

**After approval:**

```
⚙️  Resuming Jira sync with 2 approved actions...

🔀 Parallel Jira writes (2 operations)...
   → create-jira-issue: "CIS Benchmark Integration..."
   → create-jira-issue: "Wiz Vulnerability Data..."

   ✓ Created: [YOUR_JIRA_PROJECT]-1234 "CIS Benchmark Integration"
   ✓ Created: [YOUR_JIRA_PROJECT]-1235 "Wiz Vulnerability Data"

⚙️  Jira sync log written
   ✓ File: insights/[customer-name]-2024-03-15-jira-sync.json

✅ full-call-pipeline complete — [CUSTOMER_NAME], 2024-03-15

   Notes saved:     customer-notes/[customer-name]-2024-03-15.md
   Profile updated: customer-profiles/[customer-name].json
   Insights saved:  insights/[customer-name]-2024-03-15.md

   Top signals found:
     • Compliance reporting (1 customer, new)
     • Vulnerability scanning (1 customer, new)

   Jira: 2 issues created
```

### Step 5: Review Output

Check the files written:

```bash
# Formatted field notes
cat context/customer-notes/[customer-name]-2024-03-15.md

# Customer profile (updated)
cat context/customer-profiles/[customer-name].json

# Insights summary
cat context/insights/[customer-name]-2024-03-15.md

# Jira sync log
cat context/insights/[customer-name]-2024-03-15-jira-sync.json
```

You now have:
- Formatted notes with customer context
- Updated customer profile tracking this ask
- Synthesized insights across patterns
- Jira backlog updated with evidence
- Full audit trail from notes → Jira

## Skill Reference

### Memory & Fetch Tools

| Skill | Purpose | Input → Output |
|-------|---------|----------------|
| `format-field-notes` | Normalize raw notes into standard format | Raw notes (any format) → Formatted markdown |
| `update-customer-profile` | Update customer profile after a call | Formatted notes + existing profile → Updated profile JSON |
| `get-notes-by-customer` | List note files for a customer | Customer name → List of note file paths |
| `get-notes-by-topic` | Keyword search across all notes | Keyword → Matching excerpts |
| `get-untracked-asks` | Find open asks with no Jira issue | None → JSON of untracked asks |

### Ingestion Tools

| Skill | Purpose | Input → Output |
|-------|---------|----------------|
| `ingest-router` | Smart router that auto-detects content format | Pasted content → Delegates to specialist |
| `ingest-slack-thread` | Parse and structure Slack thread exports | Slack thread text → Structured markdown |
| `ingest-rfc` | Parse and structure RFC/engineering design docs | RFC document → Structured markdown |
| `ingest-signal` | Minimal ingestion for unstructured content | Blog posts, emails, informal notes → Markdown with takeaways |

### Extraction Tools (Parallel)

| Skill | Purpose | Input → Output |
|-------|---------|----------------|
| `extract-themes` | Identify recurring themes and frequency | Formatted notes → JSON array of themes |
| `extract-open-asks` | Identify explicit feature requests | Formatted notes → JSON array of asks |
| `extract-pain-points` | Identify friction, blockers, workarounds | Formatted notes → JSON array of pain points |
| `extract-tool-signals` | Identify tools, integrations, competitors | Formatted notes → JSON array of tools |
| `map-to-existing-jira` | Match asks against known Jira issues | Asks + Jira snapshot → JSON: matched[], unmatched[] |

### Merge

| Skill | Purpose | Input → Output |
|-------|---------|----------------|
| `merge-insights` | Deterministic merge of extraction outputs | 5 extraction outputs → Unified Insights JSON |

### Output Tools

| Skill | Purpose | Input → Output |
|-------|---------|----------------|
| `insights-onepager` | Formatted markdown summary from Insights JSON | Insights JSON → Markdown one-pager |
| `signal-brief` | Lightweight signal doc for insufficient-evidence topics | Insights JSON → Markdown signal doc |
| `create-jira-issue` | Create one new Jira issue (requires approval) | Ask + evidence → Jira issue |
| `update-jira-issue` | Add evidence to existing Jira issue (requires approval) | Jira issue + new evidence → Updated issue |
| `prd-generator` | Generate PRD from customer evidence (requires approval) | Insights + product context → PRD markdown |
| `prfaq-generator` | Generate PRFAQ working-backwards doc (requires approval) | PRD or insights + context → PRFAQ markdown |

### Analysis Tools

| Skill | Purpose | Input → Output |
|-------|---------|----------------|
| `review-engineering-doc` | PM-perspective review comments + summary | Engineering doc → 5-15 review comments + saved summary |
| `analyze-prior-art` | Prior art analysis with reusable patterns and gaps | Competitor/reference doc → Reusable patterns + gaps + saved summary |
| `thought-partner` | Optional product thinking framework | Topic or downstream task → 5-stage analysis + recommendation |

### Refresh Tools

| Skill | Purpose | Input → Output |
|-------|---------|----------------|
| `refresh-fr-snapshot` | Fetch current Jira Feature Request Board issues | None → Updated fr-snapshot.json |

## Usage Patterns

### Standalone Skills

You can invoke individual skills without pipelines:

```bash
# Format notes only (no Jira sync)
"Format these notes for [CUSTOMER_NAME]"

# Find untracked customer asks
"Get untracked asks"

# Search notes by topic
"Find notes about SBOM"

# Review an engineering doc
"Review this engineering doc for [project]"
[Paste doc]

# Analyze competitor documentation
"Analyze prior art for [project]"
[Paste competitor doc]
```

### Thought Partner Modifier

Add `--think` or `with thought partner` to any task for structured product thinking before execution:

```bash
"Write a PRD for SBOM generation --think"
```

This invokes a 5-stage product thinking framework:
1. **JTBD Clarity** — What job is the customer hiring this feature to do?
2. **Friction Diagnosis** — Where does the current experience break down?
3. **Nudge Design** — How do we encourage adoption?
4. **Satisfaction Prediction** — Will this fully satisfy the need?
5. **SCAMPER** — Alternative approaches (Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse)

The thought partner always suspends for approval before proceeding with the downstream task.

### Resuming Suspended Workflows

Check for pending workflows:

```bash
"What workflows are waiting for my approval?"
```

Resume with approval:

```bash
"Approve the [customer-name] Jira sync"
"Approve the PRD for [topic]"
```

Partial approval:

```bash
"Approve [customer-name] Jira sync except [issue-title]"
```

Cancel:

```bash
"Cancel the [customer-name] Jira sync"
```

## Key Concepts

### Lighthouse vs. Non-Lighthouse Customers

**Lighthouse customers** (defined in `CLAUDE.md`) get full pipeline treatment:
- Formatted notes
- Customer profile updates
- Extraction (themes, asks, pain points, tools)
- Insights synthesis
- Jira sync proposals

**Non-lighthouse customers** get:
- Formatted notes only
- No profile, no extraction, no Jira sync

This lets you focus Jira sync effort on strategic customers while still preserving notes from all customers.

### Evidence Threshold

PRDs and PRFAQs require sufficient evidence:
- **Sufficient:** ≥2 customers OR ≥3 mentions
- **Insufficient:** Falls back to signal brief

Signal briefs preserve weak signals for future aggregation. When additional customers mention the topic, you can re-run PRD generation with combined evidence.

### Additive Customer Profiles

Customer profiles use append-only semantics—never delete data, only add:
- **Stack:** Append new tools (deduplicate)
- **Open asks:** Append new OR increment `times_mentioned`
- **Pain points:** Append new, update priority
- **Contacts:** Append new names
- **Notes files:** Append new note filenames

This preserves full history: "Pain point first raised 3 months ago, mentioned 5 times since, now top priority."

### Wikilinks

Product context files use Obsidian-style wikilinks (`[[target]]`) to reference related content:

```markdown
[[cis-benchmark-prd-2024-03-15]]        → Product context file
[[Customer Name]]                       → Customer profile
[[YOUR_JIRA_PROJECT-1234]]              → Jira issue
[[customer-name-2024-03-15]]            → Customer note
```

Skills that need rich context follow wikilinks exactly one hop (never recursive) to load immediate neighbors.

### File Path Conventions

| Content | Path |
|---------|------|
| Customer notes | `/context/customer-notes/{customer-name}-{YYYY-MM-DD}.md` |
| Customer profiles | `/context/customer-profiles/{customer-name}.json` |
| Insights JSON | `/context/insights/{customer-name}-{date}.json` |
| Insights summary | `/context/insights/{customer-name}-{date}.md` |
| Jira sync log | `/context/insights/{customer-name}-{date}-jira-sync.json` |
| Pending workflows | `/context/pending/{pipeline}-{date}.pending.json` |
| PRDs | `/context/product-context/prds/{slug}-prd-{YYYY-MM-DD}.md` |
| PRFAQs | `/context/product-context/prds/{slug}-prfaq-{YYYY-MM-DD}.md` |
| Slack threads | `/context/product-context/slack-threads/{slug}-slack-thread-{YYYY-MM-DD}.md` |
| RFCs | `/context/product-context/engineering/{slug}-rfc-{YYYY-MM-DD}.md` |
| Market signals | `/context/product-context/market-signals/{slug}-signal-{YYYY-MM-DD}.md` |
| Field signals | `/context/product-context/field-signals/{slug}-signal-{YYYY-MM-DD}.md` |
| Engineering signals | `/context/product-context/engineering-signals/{slug}-signal-{YYYY-MM-DD}.md` |

## Jira Permissions

The system has limited Jira permissions to prevent accidents:

| Operation | Allowed |
|-----------|---------|
| Create new Story/Task/Bug | ✅ |
| Add comment with evidence | ✅ |
| Update description | ✅ |
| Add labels (`form`, `intake`) | ✅ |
| Link to parent epic | ✅ |
| Change issue status | ❌ Never |
| Assign to someone | ❌ Never |
| Set/change priority | ❌ Never |
| Set due dates | ❌ Never |
| Close or resolve issues | ❌ Never |
| Modify sprint/story points | ❌ Never |

This prevents the agent from making workflow decisions (status changes, assignments, priorities) while allowing it to add customer evidence to the backlog.

## Troubleshooting

### "Customer couldn't be identified"

The system suspends at HITL-1 when notes are ambiguous. It will ask you to confirm:
- Customer name
- Topic/context

Provide clarification and the pipeline continues.

### "Evidence insufficient for PRD"

When evidence doesn't meet threshold (≥2 customers OR ≥3 mentions), the system generates a signal brief instead. This preserves the weak signal for future aggregation.

To override, you can manually create a PRD by providing additional context or lowering your internal threshold.

### "Wikilink target not found"

Non-blocking warning when a wikilink can't resolve to a file. The pipeline continues, just skips loading that neighbor. Verify:
- File exists at expected path
- Filename matches wikilink target exactly (case-sensitive)
- File has correct extension (.md for product context, .json for profiles)

### "No net-new signals found"

If all extracted asks match existing Jira issues, Phase 2 is skipped (no creates, only updates possible). This is expected behavior—prevents duplicate issues.

### Session context not loading

If customer profiles or Jira snapshot aren't available at session start:
- Verify files exist in `/context/customer-profiles/` and `/context/product-context/`
- Check file permissions (readable)
- Review learning log for any recorded issues

## Next Steps

**After your first run:**

1. **Review output quality** — Are formatted notes accurate? Are Jira issue descriptions clear?
2. **Tune CLAUDE.md** — Add learned patterns to learning log, refine lighthouse customer list
3. **Batch process notes** — Have 10 unprocessed customer calls? Run full-call-pipeline on each
4. **Generate your first PRD** — Pick a topic with ≥2 customer mentions, run PRD pipeline
5. **Ingest product context** — Add existing PRDs, RFCs, Slack threads to knowledge base
6. **Review customer profiles** — Check what's being tracked, validate open asks

**Ongoing usage:**

- Run full-call-pipeline after every lighthouse customer call
- Run PRD pipeline when evidence crosses threshold
- Ingest Slack threads with product decisions
- Review engineering docs for PM perspective
- Use thought partner for major product decisions

## Contributing

Feedback and improvements welcome. The system is designed to be customized:

- Add new skills in `/skills/{name}/SKILL.md`
- Modify pipeline logic in `CLAUDE.md`
- Extend frontmatter schema for your domain
- Add custom analysis patterns

## License

[Your license here]

---

**Questions?** Check the architecture document (`pm-agent-architecture.md`) for complete technical details.
