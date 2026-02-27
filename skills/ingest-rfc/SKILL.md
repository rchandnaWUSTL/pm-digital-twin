# Skill: Ingest RFC

## Purpose

Parse and structure RFC (Request for Comments) and engineering design documents into product context. Extracts design rationale, alternatives considered, open questions, assumptions, and decision records.

Note: This skill saves the **source RFC document** into `/context/product-context/engineering/`. It is distinct from the `review-engineering-doc` skill, which generates **PM-perspective review comments and summaries** of engineering docs.

---

## Input

Receives structured input from `ingest-router`:

```json
{
  "content": "raw RFC text",
  "frontmatter": {
    "project_tag": "RFC title or extracted heading",
    "one_line_description": "TBD",
    "doc_type": "engineering_doc",
    "date_ingested": "YYYY-MM-DD",
    "related_customers": [],
    "related_jira": [],
    "related_docs": []
  },
  "file_path": "/context/product-context/engineering/{slug}-rfc-{date}.md",
  "slug": "slugified-rfc-name",
  "project_tag": "Human-readable RFC title"
}
```

---

## Output

Structured markdown preserving the RFC's original content with enhanced metadata.

**Returns to router**:
```json
{
  "frontmatter": { updated frontmatter dict },
  "body": "markdown content (lightly reformatted RFC)",
  "stats": {
    "sections_found": ["Motivation", "Design", "Alternatives"],
    "decision_records": N,
    "open_questions": M,
    "assumptions": X
  }
}
```

---

## Parsing Rules

### Common RFC Section Patterns

RFCs typically include some or all of these sections (detect by heading text, case-insensitive):

- **Motivation** / **Problem Statement** / **Background** — Why this is needed
- **Design** / **Proposed Solution** / **Architecture** — How it will be built
- **Alternatives Considered** / **Options** / **Trade-offs** — Other approaches evaluated
- **Open Questions** / **Unresolved Questions** / **TBD** — Unknowns remaining
- **Assumptions** / **Dependencies** / **Constraints** — What the design assumes
- **Decision** / **Decisions Made** / **Outcome** — Final decisions (if RFC is resolved)
- **Rollout Plan** / **Migration** / **Deployment** — How to ship it
- **Testing** / **Validation** — How to verify correctness

Not all RFCs have all sections. Parse what's present.

### Decision Records

Extract explicit decision statements:
- "We will use [technology/approach]"
- "Decision: [statement]"
- "After discussion, we decided to [action]"
- Lines with ✅ or ❌ indicating approval/rejection

Format as structured list in a new section at the top (see Body Structure).

### Open Questions

Extract:
- Headings like "## Open Questions", "## TBD"
- Lines with "?" that aren't rhetorical (e.g., "Should we use X or Y?")
- "TBD: [topic]"
- "Still need to figure out [topic]"

Format as list (see Body Structure).

### Trade-offs

From "Alternatives Considered" or similar sections, extract:
- Option A: [description] — Pros: [list], Cons: [list]
- Option B: [description] — Pros: [list], Cons: [list]

If structured comparison exists, preserve it. If prose, leave as-is.

---

## Markdown Body Structure

### Section Order

1. **RFC Metadata** (author, date, status)
2. **Key Decisions** (if RFC is resolved)
3. **Open Questions** (if RFC is unresolved)
4. **Trade-offs Summary** (extracted from Alternatives)
5. **Original RFC Content** (lightly reformatted)

### RFC Metadata Template

```markdown
**Author:** [Name if detectable, otherwise "Unknown"]
**Date:** [RFC creation date if present, otherwise date_ingested]
**Status:** [Draft / Approved / Implemented / Superseded, if detectable]
**Related Jira:** [[PROJECT_KEY]-XXX links if present]
```

### Key Decisions Section (if present)

```markdown
## Key Decisions

* [Decision statement] — [Context or date if available]
* [Decision statement]
```

Omit if RFC is still in draft/discussion phase with no final decisions.

### Open Questions Section (if present)

```markdown
## Open Questions

* [Question text]
* [Question text]
```

Omit if RFC is finalized.

### Trade-offs Summary (if Alternatives section exists)

```markdown
## Trade-offs Considered

**Option A: [Name]**
* Pros: [List]
* Cons: [List]

**Option B: [Name]**
* Pros: [List]
* Cons: [List]

**Chosen approach:** [Which option was selected, if decision made]
```

Omit if no Alternatives section present.

### Original RFC Content

Preserve the RFC's original sections with minimal reformatting:
- Ensure headings are properly formatted (##, ###)
- Preserve code blocks, diagrams, lists
- Add horizontal rule (`---`) to separate metadata/summaries from original content:

```markdown
---

## [Original RFC Title]

[Original content follows]
```

---

## Enhanced Frontmatter

Update the frontmatter received from router:

### `one_line_description`

Generate a concise summary:
- Template: "RFC for [feature/system] covering [main design decision]"
- Examples:
  - "RFC for [TOOL_A] integration provider abstraction layer in [PRODUCT]"
  - "RFC for multi-region artifact replication design and trade-offs"
  - "RFC for SBOM generation pipeline architecture"

Extract from:
1. RFC title (first H1)
2. First paragraph of Motivation/Background
3. Design section heading

### `related_customers`

Scan for customer mentions:
- "Based on feedback from [Customer]"
- "Requested by [Customer]"
- Match against `/context/customer-profiles/*.json` canonical names

### `related_jira`

Extract Jira issue keys:
- Pattern: `[PROJECT_KEY]-\d+`, `[FR_PROJECT_KEY]-\d+`
- URLs: `https://[company].atlassian.net/browse/[PROJECT_KEY]-XXXX`
- Add to array (unique values only)

### `related_docs`

Extract references to other product context:
- "See PRD: [title]"
- "Related to [other RFC]"
- "Prior art: [document]"

Match against existing files in `/context/product-context/` and add slugs to array.

---

## Edge Cases

### RFC Without Formal Structure
If content doesn't follow standard RFC format (no clear sections):
- Still save as `engineering_doc`
- Minimal reformatting: just add metadata block at top
- Omit empty sections (Key Decisions, Trade-offs)
- Note in stats: `"structured": false`

### RFC in Non-Markdown Format
If content is plaintext (no markdown headings):
- Convert obvious patterns:
  - All-caps lines → ## Headings
  - Numbered lists → Markdown lists
  - Code blocks (indented 4+ spaces) → ``` fenced blocks
- Preserve original as much as possible

### Multi-RFC Document
If content contains multiple RFCs:
- Parse only the first RFC
- Warn user: "Document contains multiple RFCs — ingested first RFC only. Run ingestion separately for each."

### RFC Superseded by Another
If RFC indicates it's obsolete:
- Still ingest (historical context is valuable)
- Add to metadata: `**Status:** Superseded by [reference]`

---

## Progress Signals

```
⚙️  ingest-rfc — parsing RFC structure...
   ✓ Found sections: Motivation, Design, Alternatives Considered, Open Questions
   ✓ Extracted 4 key decisions
   ✓ Extracted 3 open questions
   ✓ Detected related context: [PROJECT_KEY]-001 (Jira)
   ✓ Generated one-line description
```

---

## Worked Example (abbreviated)

**Input content**:
```
# RFC: Vulnerability Provider Abstraction Layer

Author: Engineering Team
Date: 2026-01-15
Status: Draft

## Motivation

[PRODUCT] currently hardcodes [DEFAULT_SCANNER] as the vulnerability data provider. To support [TOOL_A] integration (requested by [CUSTOMER_1], tracked in [PROJECT_KEY]-001), we need an abstraction layer.

## Design

Introduce a `VulnerabilityProvider` interface with implementations for [DEFAULT_SCANNER] and [TOOL_A].

## Alternatives Considered

**Option A: Direct [TOOL_A] integration (no abstraction)**
Pros: Faster to ship
Cons: Hard to add future providers

**Option B: Plugin architecture**
Pros: Maximum flexibility
Cons: Over-engineered for 2 providers

**Chosen approach:** Option A rejected, Option B deferred to Phase 2. Going with interface-based abstraction.

## Open Questions

- Should providers be tenant-scoped or organization-scoped?
- How do we handle provider-specific severity models?
```

**Output frontmatter**:
```yaml
---
project_tag: "Vulnerability Provider Abstraction Layer"
one_line_description: "RFC for [TOOL_A] integration provider abstraction layer in [PRODUCT]"
doc_type: engineering_doc
date_ingested: 2026-02-21
related_customers: ["[CUSTOMER_1]"]
related_jira: ["[PROJECT_KEY]-001"]
related_docs: []
---
```

**Output body** (abbreviated):
```markdown
# Vulnerability Provider Abstraction Layer

**Author:** Engineering Team
**Date:** 2026-01-15
**Status:** Draft
**Related Jira:** [PROJECT_KEY]-001

## Key Decisions

* Use interface-based abstraction layer; reject direct [TOOL_A] integration (no abstraction) and defer plugin architecture to Phase 2

## Open Questions

* Should providers be tenant-scoped or organization-scoped?
* How do we handle provider-specific severity models?

## Trade-offs Considered

**Option A: Direct [TOOL_A] integration (no abstraction)**
* Pros: Faster to ship
* Cons: Hard to add future providers

**Option B: Plugin architecture**
* Pros: Maximum flexibility
* Cons: Over-engineered for 2 providers

**Chosen approach:** Option A rejected, Option B deferred to Phase 2. Going with interface-based abstraction.

---

## Motivation

[PRODUCT] currently hardcodes [DEFAULT_SCANNER] as the vulnerability data provider. To support [TOOL_A] integration (requested by [CUSTOMER_1], tracked in [PROJECT_KEY]-001), we need an abstraction layer.

## Design

Introduce a `VulnerabilityProvider` interface with implementations for [DEFAULT_SCANNER] and [TOOL_A].

[Rest of original RFC content follows...]
```

---

## Notes

- This skill saves the **source RFC**, not a PM summary (use `review-engineering-doc` for PM analysis)
- Preserve technical detail — don't simplify or abstract away engineering content
- If the RFC references other docs, capture those in `related_docs` but don't fetch them
- RFCs can be updated over time — collision handling (via router) appends `-2`, `-3` for versioning
