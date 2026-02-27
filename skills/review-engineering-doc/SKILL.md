# Skill: Review Engineering Doc

## Purpose

Generate PM-perspective review comments and a structured summary for an engineering document. Standalone skill — not part of any pipeline, invoked by direct request. No Jira writes, no HITL suspend points.

---

## Input

- Pasted engineering document text (any format — RFC, design doc, tech spec, proposal)
- Project name (e.g. "MCP Server", "Vulnerability Scanning v2")

---

## Output

Two parts:

### 1. PM Comments (displayed to user, not saved)

Numbered list of questions, concerns, and gaps from a PM perspective. [PM_NAME] copy-pastes these back to the doc author as review comments.

### 2. Summary File (saved)

Written to `/context/product-context/engineering/{slug}-eng-doc-{YYYY-MM-DD}.md`

---

## Output Format — Summary File

```markdown
---
project_tag: "Human-readable project name"
one_line_description: "One sentence: what this doc is and why it matters"
doc_type: engineering_doc
date_ingested: YYYY-MM-DD
---

# Engineering Doc Summary — {Project Name}

**Source:** Engineering doc reviewed {date}

## What Engineering Is Proposing

{2-4 sentence summary of the core proposal — what gets built, how it works at a high level}

## Key Decisions Made

{Bulleted list of decisions already locked in the doc — architecture choices, technology selections, scope boundaries}

## Key Decisions Still Open

{Bulleted list of open questions or TBDs called out in the doc}

## Assumptions Being Made

{Bulleted list of implicit or explicit assumptions — about customer needs, infrastructure, timeline, dependencies}

## Dependencies

{Bulleted list of external dependencies — other teams, services, APIs, third-party tools}

## PM Input Needed

{Bulleted list of areas where product input is required before engineering can proceed — requirements clarification, prioritization, customer validation}
```

---

## Instructions

1. Read the pasted document carefully and completely. Do not skim.
2. Identify what engineering is proposing — the core deliverable, approach, and scope.
3. Generate PM comments as a numbered list. Focus on the concerns described in Comment Generation Guidelines below. Aim for 5-15 comments depending on doc length and complexity. Each comment should be specific and actionable — not vague.
4. Generate the structured summary following the Output Format above. Every section must have content; use "None identified" if a section is genuinely empty.
5. Write the YAML frontmatter:
   - `project_tag`: Use the project name as provided by [PM_NAME]
   - `one_line_description`: One sentence capturing what the doc proposes and why it matters to [PRODUCT]
   - `doc_type`: Always `engineering_doc`
   - `date_ingested`: Today's date in YYYY-MM-DD format
6. Slugify the project name for the filename: lowercase, spaces to hyphens, strip characters that aren't alphanumeric or hyphens, collapse consecutive hyphens. Example: "MCP Server" → `mcp-server`, "Vuln Scanning v2.0" → `vuln-scanning-v20`.
7. Check for existing files before writing. The target path is `/context/product-context/engineering/{slug}-eng-doc-{YYYY-MM-DD}.md`. If that file already exists, append a counter: `{slug}-eng-doc-{YYYY-MM-DD}-2.md`, `-3.md`, etc. Never overwrite an existing file.
8. Save the summary file to the resolved path.
9. Display the PM comments to [PM_NAME] (not saved to a file — he'll copy-paste them into the doc).

---

## Comment Generation Guidelines

When generating PM review comments, look for:

- **Missing customer evidence** — Does the doc reference actual customer asks or pain points? If not, flag it.
- **Unclear success metrics** — How will we know this works? What does "done" look like from a customer perspective?
- **Scope ambiguity** — Are there areas where scope could expand or contract? Are boundaries clearly defined?
- **Dependency risks** — Are there dependencies on other teams, services, or timelines that could slip?
- **Missing error/edge cases** — What happens when things go wrong? Are failure modes addressed?
- **Customer-facing impact** — How does this change the user experience? Is migration needed? Breaking changes?
- **Missing alternatives** — Were other approaches considered? Why was this one chosen?
- **Assumptions that need validation** — What's being assumed about customer behavior, scale, or usage patterns?
- **Integration gaps** — How does this interact with existing features? Are there cross-product considerations?
- **Things that need clarification before a PRD can be written** — If [PM_NAME] needs to write a PRD for this, what's still unclear?

Comments should be direct and specific. Not "consider edge cases" but "What happens if a user has 500+ images and triggers a full rescan? Is there a pagination or rate-limiting strategy?"

---

## Progress Signals

```
⚙️  review-engineering-doc — reading doc for [project name]...
   ✓ Comments generated — [N] items
   ✓ Summary saved → /context/product-context/[filename]
```
