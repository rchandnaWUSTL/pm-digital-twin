# Skill: PRD Generator

## Purpose

Generate a Product Requirements Document from customer evidence and product context. Part of the PRD Pipeline (see CLAUDE.md). Requires HITL-4 approval before the final document is saved.

---

## Input

- **Topic**: Feature or capability to write the PRD for (e.g. "Vulnerability Scanning Provider Selection", "Native SBOM Generation")
- **Insights JSON** (optional): Output from merge-insights if the PRD pipeline ran extraction first
- **Matching note files** (optional): From get-notes-by-topic if running standalone
- **Product context files**: Automatically loaded from `/context/product-context/` based on semantic relevance (see CLAUDE.md Product Context Loading)

If invoked from the PRD Pipeline, insights JSON and matching notes are provided by upstream steps. If invoked standalone ("Write a PRD for [topic]"), gather evidence by reading `/context/customer-notes/` and `/context/customer-profiles/` directly.

### Graph Traversal (Context Enrichment)

After loading semantically relevant product context files:

1. **Parse wikilinks and frontmatter**: For each loaded product context file, extract `related_customers`, `related_jira`, `related_docs` from frontmatter and `[[wikilinks]]` from body
2. **Load 1-hop neighbors**: Read wikilinked customer profiles, related product docs (1 hop only, no recursion)
3. **Display traversal log**: Show user which related files were loaded
4. **Enrich PRD generation**: Use the additional context to strengthen Background, Problem, and User Research sections

See CLAUDE.md Graph Traversal for traversal pattern and resolution rules.

---

## Output

A markdown PRD file with YAML frontmatter.

**File path**: `/context/product-context/prds/{slug}-prd-{YYYY-MM-DD}.md`

Slugify the topic: lowercase, spaces to hyphens, strip characters that aren't alphanumeric or hyphens, collapse consecutive hyphens. Example: "Vulnerability Scanning Provider Selection" becomes `vulnerability-scanning-provider-selection`.

**Collision handling**: If the file already exists, append a counter: `-2.md`, `-3.md`, etc. Never overwrite an existing file.

---

## Document Structure

### Canonical Section Order

Every PRD must follow this exact section order. Use these headings verbatim:

1. **YAML Frontmatter** (metadata block)
2. **# [Title]** (H1 heading matching the project_tag)
3. **One-sentence summary** (first paragraph after title, no heading)
4. **## Overview**
5. **## Background**
6. **## Problem**
7. **## Personas**
8. **## Phases & Requirements Table**
9. **## Phase N: [Phase Title]** (repeated for each phase)
   - Each phase contains individual requirements with subheadings at H3 level (`###`)
10. **## User Research**
11. **## Out of Scope**

### Conditional Sections (insert at specific positions)

These sections are optional and insert at specific positions in the canonical order:

- **## Assumptions** -- insert after Problem, before Personas
- **## Rollout Plan** -- insert after all Phase sections, before User Research
- **## Measuring Success** -- insert after all Phase sections, before User Research
- **## Future Possibilities** -- insert after Out of Scope
- **## Analytics Requirements** -- insert after all Phase sections, before User Research
- **## Pricing & Packaging** -- insert after Out of Scope
- **## Breaking Backwards Compatibility** -- insert after Background, before Problem
- **## Appendix** -- always last section

Only include conditional sections when the evidence or topic explicitly warrants them. If you're unsure whether a conditional section is needed, omit it.

### Required Section: Related Context

The **## Related Context** section is always included at the end of every PRD (after Out of Scope and any conditional sections). This section contains wikilinks to customers, Jira issues, and related docs. See details in the "Out of Scope" section above.

### Prohibited Sections

Never include these generic PM template sections. They do not match [PM_NAME]'s PRD format:

- [X] Executive Summary
- [X] Solution Overview
- [X] Technical Considerations
- [X] Risks & Mitigations
- [X] Go-to-Market
- [X] Success Metrics (use "Measuring Success" if needed)
- [X] Open Questions (questions belong inside requirements as "Considerations")
- [X] Dependencies
- [X] Timeline / Milestones
- [X] Resources Required

---

## Section-by-Section Rules

### YAML Frontmatter

```yaml
---
project_tag: "Human-readable project name"
one_line_description: "One sentence: what this PRD is and why it matters"
doc_type: prd
date_ingested: YYYY-MM-DD
related_customers: []  # Array of canonical customer names cited in User Research
related_jira: []       # Array of Jira issue keys referenced in PRD
related_docs: []       # Array of related product context file slugs
---
```

- `project_tag`: Use the topic name as provided by [PM_NAME]
- `one_line_description`: One sentence capturing the feature and its value to [PRODUCT] customers
- `doc_type`: Always `prd`
- `date_ingested`: Today's date
- `related_customers`: Extract from User Research section -- list canonical customer names
- `related_jira`: Extract from Background and throughout PRD -- Jira issue keys ([PROJECT_KEY]-XXX pattern)
- `related_docs`: Empty initially (can be manually populated later)

### One-Sentence Summary

A single sentence (max 30 words) that captures what the feature does and why it matters. This is the first line after the frontmatter heading. It should be understandable by someone with no context on [PRODUCT].

### Overview

2-4 paragraphs covering:

- What the feature is at a high level
- Why it matters to [PRODUCT] customers (ground in evidence)
- How it fits into the broader product vision
- What's in scope for this PRD (if the topic is broad)

Write in plain language. Avoid jargon unless it's domain-standard (CIS, SBOM, CVE). Reference customer evidence naturally -- "Customers with existing [TOOL_A] deployments have asked for..." not "Per the insights JSON..."

### Background

Context a reader needs to understand the problem space:

- Current state of the relevant feature area in [PRODUCT]
- How customers solve this problem today (workarounds, third-party tools, manual processes)
- Relevant industry context (standards, competitor capabilities, market trends)
- Any prior internal work (engineering docs, spikes, previous PRDs)

Load relevant product context files from `/context/product-context/` using semantic matching. Reference engineering docs and prior art summaries if they exist for this topic.

### Problem

Structure as Jobs To Be Done (JTBD). For each distinct problem:

```
**When** [situation the user is in],
**I want** [action they want to take],
**so that** [outcome they're trying to achieve].
```

Each JTBD should be grounded in real customer evidence. After the JTBD statement, include a brief narrative (1-2 sentences) connecting it to observed customer behavior.

Aim for 3-6 JTBDs depending on topic complexity. Group related JTBDs under sub-headings if the problem space has distinct facets.

### Personas

For each persona:

- **Name**: Role title (e.g. "Platform Engineer", "Security Architect", "DevOps Team Lead")
- **Description**: 2-3 sentences covering what this persona does, what they care about, and how they interact with [PRODUCT]
- **Key needs**: Bulleted list of what this persona specifically needs from the feature

Ground personas in real customer roles observed in notes. [CUSTOMER_1]'s security architect [CONTACT_NAME], [CUSTOMER_2]'s multi-cloud platform team, [CUSTOMER_4]'s compliance-focused DevOps team -- abstract from these to general personas without naming specific individuals.

### Phases & Requirements Table

A summary table showing all phases and their requirements at a glance:

```markdown
| Phase | Requirement | Description |
|-------|-------------|-------------|
| Phase 1 | [Req title] | [One-line description] |
| Phase 1 | [Req title] | [One-line description] |
| Phase 2 | [Req title] | [One-line description] |
```

Phase 1 is the minimum viable scope that addresses the core JTBD. Phase 2+ are incremental expansions. If the evidence only supports one phase, that's fine -- don't invent phases for completeness.

### Phase Requirements (repeated per phase)

For each phase, a section heading (`## Phase N: [Phase Title]`) followed by individual requirements.

Each requirement gets:

#### Requirement Title

A descriptive title in sentence case (e.g. "Support [TOOL_A] as a vulnerability data provider"). This is an H3 heading (`###`).

#### Narrative

A paragraph explaining what this requirement is, why it matters, and how it connects to the broader feature. Write for a reader who hasn't seen the rest of the PRD -- each requirement narrative should stand on its own.

#### Acceptance Criteria

Bulleted list using "must" language. These are pass/fail conditions for the requirement being complete:

```markdown
**Acceptance Criteria**
- Administrators must be able to [specific action]
- The system must [specific behavior] when [specific condition]
- [Feature] must [specific outcome] for all [scope boundary]
```

Aim for 3-6 acceptance criteria per requirement. Each criterion should be testable -- "must be fast" is not testable; "must return results within 5 seconds for registries with up to 10,000 artifacts" is.

**Depth Rule**: Acceptance criteria must describe **behavioral requirements** (what the user can do or observe), not implementation details (how it's built). This is a PRD, not an engineering design doc.

**What belongs in AC:**
- User-visible actions ("Administrators must be able to select their scanning provider in registry settings")
- System behavior from the user's perspective ("The system must apply the new provider to all scans started after the change")
- Observable outcomes ("Vulnerability data must be stored with full provider attribution")
- Non-functional requirements at a product level ("Scan results must be displayed within 5 seconds for registries with up to 10,000 artifacts")

**What does NOT belong in AC (these are engineering design doc concerns):**
- [X] API endpoint specs ("POST /api/v1/registries/{id}/scanning-provider")
- [X] Database schemas ("Add provider_id column to vulnerabilities table")
- [X] React component names ("Create ProviderSelectorDropdown component")
- [X] Architecture diagrams or data flow specifics ("Ingestion service polls [TOOL_A] API every 15 minutes")
- [X] Implementation technology choices ("Use PostgreSQL foreign keys to link scan results to providers")
- [X] Internal service boundaries ("ScanningService calls ProviderRegistry to fetch credentials")

If you find yourself writing implementation details, you've gone too deep. Stop and reframe at the behavioral level.

#### Considerations

Bulleted list of genuine open questions, trade-offs, or decisions that engineering and product need to resolve during implementation:

```markdown
**Considerations**
- Should [option A] or [option B]? [Brief context for the trade-off]
- How does this interact with [existing feature]?
- What is the expected [metric] at scale?
```

**Important**: Considerations live **inside each requirement** as a subsection, not as a separate top-level section in the PRD. Each requirement should have its own Considerations section. Considerations are THE MOST IMPORTANT SECTION. They are meant to surface out risks, unknowns, and debates early. Each requirement should have AT LEAST ONE consideration in the initial draft.

These are not risks or caveats -- they are honest questions that don't have answers yet. Don't fabricate questions for completeness.

### User Research

Named customers with evidence supporting the PRD. For each customer:

```markdown
### [Customer Name]

**Tier:** [Lighthouse / Non-lighthouse]
**Calls referencing this topic:** [N]
**[FR_PROJECT_KEY] ticket:** [number if known, otherwise omit]

[Summary of what this customer has said about the topic, with dates and paraphrased quotes from notes]
```

Pull from `/context/customer-notes/` and `/context/customer-profiles/`. Never fabricate customer evidence. If a customer's name appears in the notes, include them. If evidence is thin, say so -- "Mentioned once in passing on [date]; no detailed requirements discussed."

Additionally, check `/context/product-context/fr-snapshot.json` for [FR_PROJECT_KEY] issues whose summary matches the PRD topic. For each matching [FR_PROJECT_KEY] issue, include it in the customer evidence section using the format: `[FR_PROJECT_KEY]-XXXX: [customer name] -- [one-sentence ask]`. This populates the `**[FR_PROJECT_KEY] ticket:**` field in each customer's subsection. If the [FR_PROJECT_KEY] issue has no customer name (`null`), use the format: `[FR_PROJECT_KEY]-XXXX: [one-sentence ask]`.

If `fr-snapshot.json` doesn't exist or contains no issues matching the PRD topic, include a note: *[run refresh-fr-snapshot for current FR data]*

### Out of Scope

Bulleted list of things that are explicitly not part of this PRD. Each item should be specific enough that a reader knows exactly what's excluded:

```markdown
- [Specific capability] -- [brief reason why it's out of scope]
- [Specific capability] -- deferred to Phase N / separate PRD
- [Specific capability] -- not supported in current architecture
```

Aim for 5-10 items. Include things that a reader might reasonably expect to be in scope but aren't.

### Related Context (Generated Section)

At the end of every PRD, after Out of Scope (and after any conditional sections), generate a "Related Context" section with wikilinks:

```markdown
---

## Related Context

**Customer Profiles**: [[Customer A]] | [[Customer B]] | [[Customer C]]

**Jira Tracking**: [[[PROJECT_KEY]-XXX]] (epic name) | [[[PROJECT_KEY]-YYY]] (issue title)
```

**Rules**:
- Use double-bracket wikilink syntax: `[[Target]]`
- Customer names: Use canonical names from `/context/customer-profiles/*.json` (e.g., "[CUSTOMER_1]", "[CUSTOMER_4]")
- Jira issues: Include key + brief description in parentheses
- Omit lines if no content (e.g., if no related Jira, omit that line)
- Separator: Use ` | ` (space-pipe-space) between multiple items

This section enables graph traversal (see CLAUDE.md Graph Traversal).

---

## Voice & Style Rules

1. **Plain language**: Write for an audience of PMs, engineers, and designers. Avoid marketing language. Use domain terms (CIS, SBOM, CVE, JTBD) without defining them -- the audience knows.
2. **Evidence-grounded**: Every major claim should trace back to customer evidence, engineering constraints, or industry standards. "Customers want X" must have a source.
3. **Default state OFF**: For any new feature, rule, toggle, or configuration -- default state is off/disabled unless there's a compelling reason otherwise. This matches [PRODUCT]'s pattern of opt-in behavior.
4. **Specific over vague**: "Support [TOOL_A] vulnerability database as a scanning provider" not "Support additional vulnerability scanning options." Name the thing.
5. **Honest about unknowns**: Use "TBD -- [what's needed to resolve]" rather than guessing. Blank fields are worse than acknowledged unknowns.
6. **No filler sections**: If a conditional section has no real content, omit it entirely rather than including a section with "N/A" or "None at this time."
7. **Consistent formatting**: Use `*` for top-level bullets, `   *` for sub-bullets (3-space indent). Section headings in title case. Requirement titles in sentence case.

---

## Insufficient Evidence Handling

If evidence is insufficient (fewer than 2 customers OR fewer than 3 total mentions):

1. Do NOT generate a PRD
2. Instead, invoke the `signal-brief` skill with the available evidence
3. Return a message: "Insufficient evidence for a full PRD -- generated a signal brief instead. [N] customers, [M] mentions found."

This check happens before any PRD content is generated. The PRD Pipeline handles this at the merge step (see CLAUDE.md).

---

## HITL Suspend Behavior

The PRD generator triggers **HITL-4** after generating the full draft.

### On suspend:

1. Generate the complete PRD draft
2. Display the full draft to [PM_NAME]
3. Write pending state to `/context/pending/prd-pipeline-{date}.pending.json`:

```json
{
  "pipeline": "prd-pipeline",
  "started_at": "ISO timestamp",
  "suspended_at": "ISO timestamp",
  "suspend_point": "HITL-4",
  "suspend_reason": "awaiting_prd_approval",
  "completed_steps": ["get-notes-by-topic", "extract-themes", "extract-open-asks", "extract-pain-points", "merge-insights", "prd-generator"],
  "next_step": "save-approved-prd",
  "awaiting_approval": {
    "prompt": "PRD draft ready for review — [topic]",
    "draft_topic": "[topic]",
    "draft_content": "[full markdown content]",
    "evidence_summary": {
      "customers_cited": ["Customer A", "Customer B"],
      "total_mentions": N,
      "jira_issues_referenced": ["[PROJECT_KEY]-XXX"]
    }
  },
  "context": {
    "insights_file": "insights/{path if applicable}",
    "notes_used": ["list of note file paths consulted"]
  }
}
```

### On resume (approved):

Save the PRD (with any edits [PM_NAME] provided) to `/context/product-context/prds/{slug}-prd-{YYYY-MM-DD}.md`.

### On resume (with edits):

Apply [PM_NAME]'s edits to the draft, then save.

### On resume (cancelled):

Delete the pending file. No PRD saved.

---

## Worked Example (abbreviated)

Topic: "Vulnerability Scanning Provider Selection"

This example shows every section with representative content but is deliberately shorter than a real PRD would be.

---

```markdown
---
project_tag: "Vulnerability Scanning Provider Selection"
one_line_description: "PRD for letting [PRODUCT] customers choose between [DEFAULT_SCANNER] and [TOOL_A] as their vulnerability scanning data provider"
doc_type: prd
date_ingested: 2026-02-20
---

# Vulnerability Scanning Provider Selection

[PRODUCT] should let customers choose which vulnerability scanning provider supplies their image vulnerability data, starting with [TOOL_A] alongside the existing [DEFAULT_SCANNER] default.

## Overview

[PRODUCT]'s vulnerability scanning currently uses [DEFAULT_SCANNER] as the sole data provider. Multiple lighthouse customers -- particularly those in financial services with existing [TOOL_A] deployments -- have asked for the ability to use [TOOL_A] as an alternative or complementary vulnerability data source.

This matters because enterprise customers often have organizational mandates requiring specific scanning tools. When [PRODUCT] only supports [DEFAULT_SCANNER], customers must run parallel scanning workflows outside the product, losing the value of centralized vulnerability visibility in the registry.

This PRD covers the provider selection mechanism, [TOOL_A] integration, and the data normalization layer needed to support multiple providers with a consistent UX. It does not cover adding providers beyond [TOOL_A] (Phase 2+).

## Background

[PRODUCT] shipped vulnerability scanning in 2025 using [DEFAULT_SCANNER] as the data provider. [DEFAULT_SCANNER] is open-source and provides broad CVE coverage across common package ecosystems.

Customers with enterprise security tooling -- particularly in FSI -- use commercial scanning platforms like [TOOL_A] that provide broader coverage including compliance benchmarks, misconfigurations, and license compliance beyond CVE scanning. These customers currently run [TOOL_A] CLI inside [PRODUCT_SHORT] provisioners at build time as a workaround, but results aren't visible in the [PRODUCT] registry UI.

Engineering completed an initial spike on provider abstraction (ref: [PROJECT_KEY]-001 -- Vulnerability Data in [PRODUCT]).

## Problem

**When** my organization mandates [TOOL_A] for all vulnerability scanning,
**I want** [PRODUCT] to use [TOOL_A] as its vulnerability data source,
**so that** I don't have to maintain parallel scanning workflows outside the registry.

[CUSTOMER_1] runs [TOOL_A] CLI inside their [PRODUCT_SHORT] provisioners today because [PRODUCT] only supports [DEFAULT_SCANNER]. This means vulnerability data is split between two systems with no unified view.

**When** I'm evaluating vulnerability scan results for an image,
**I want** results from my chosen provider displayed consistently in the [PRODUCT] UI,
**so that** I can make promotion decisions using familiar severity ratings and remediation guidance.

Customers reviewing scan results expect the UI to reflect their provider's severity model. [DEFAULT_SCANNER] and [TOOL_A] score vulnerabilities differently -- a unified display layer is needed.

**When** I'm configuring vulnerability scanning for my registry,
**I want** to select my scanning provider at the registry level with a simple toggle,
**so that** I don't need to reconfigure individual buckets or artifacts.

Customers expect organization-wide policy, not per-artifact configuration.

## Personas

### Platform Engineer

Manages the [PRODUCT] registry, configures scanning settings, and owns the image build pipeline. Cares about integration simplicity -- wants provider selection to be a one-time configuration, not an ongoing maintenance burden.

**Key needs:**
* Registry-level provider configuration (set once, applies everywhere)
* Clear documentation for connecting [TOOL_A] credentials
* No disruption to existing [DEFAULT_SCANNER]-based workflows during migration

### Security Architect

Defines which scanning tools are approved for use across the organization. Does not interact with [PRODUCT] daily but needs assurance that the product meets compliance requirements.

**Key needs:**
* Confidence that the chosen provider's full vulnerability database is used (not a subset)
* Audit trail showing which provider produced each scan result
* Ability to enforce a single provider across the organization (no mixed-provider registries)

## Phases & Requirements Table

| Phase | Requirement | Description |
|-------|-------------|-------------|
| Phase 1 | Support [TOOL_A] as a vulnerability data provider | Ingest and display [TOOL_A] vulnerability data alongside existing [DEFAULT_SCANNER] support |
| Phase 1 | Registry-level provider selection | Allow administrators to choose their scanning provider at the registry level |
| Phase 1 | Normalized vulnerability display | Display vulnerability data from any provider in a consistent UI format |
| Phase 2 | Dual-provider mode | Allow customers to run both [DEFAULT_SCANNER] and [TOOL_A] simultaneously and compare results |
| Phase 2 | Compliance benchmark integration via [TOOL_A] | Surface [TOOL_A] compliance benchmark results in the [PRODUCT] compliance view |

## Phase 1: Provider Selection Foundation

### Support [TOOL_A] as a vulnerability data provider

[PRODUCT] must be able to ingest vulnerability data from [TOOL_A] in addition to [DEFAULT_SCANNER]. This means accepting [TOOL_A] scan results -- either via API integration or by consuming [TOOL_A] CLI output generated during builds -- and mapping them to the existing vulnerability data model.

[TOOL_A] structures vulnerability data differently from [DEFAULT_SCANNER]: different severity scales, different package identification, and richer metadata around remediation. The integration must preserve [TOOL_A]-native data while mapping it to [PRODUCT]'s display model.

**Acceptance Criteria**
* [PRODUCT] must accept vulnerability scan results from [TOOL_A] for any artifact version
* [TOOL_A] vulnerability data must be stored with full provider attribution (source, scan timestamp, provider version)
* Existing [DEFAULT_SCANNER]-based scanning must continue to function with no changes for customers who don't enable [TOOL_A]
* The [TOOL_A] integration must support both API-based ingestion and [TOOL_A] CLI output parsing

**Considerations**
* Should the [TOOL_A] integration require customers to provide [TOOL_A] API credentials, or should it accept pre-scanned results pushed from the build pipeline?
* How does [TOOL_A]'s severity model (Critical/High/Medium/Low/Informational) map to the existing [DEFAULT_SCANNER]-based display? Is a direct mapping sufficient or do we need a normalization layer?

### Registry-level provider selection

Administrators must be able to select their vulnerability scanning provider at the registry level. The default provider is [DEFAULT_SCANNER]. Selecting [TOOL_A] replaces [DEFAULT_SCANNER] as the active provider for all new scans.

**Acceptance Criteria**
* A provider selection control must be available in registry settings
* The default provider must be [DEFAULT_SCANNER] (default state off for [TOOL_A])
* Changing the provider must apply to all new scans going forward; existing scan results must not be deleted or re-processed
* Only users with registry admin permissions must be able to change the provider setting

**Considerations**
* Should provider selection be at the registry level or the organization level? Registry-level is more flexible but organization-level matches how enterprises typically enforce security tooling.
* What happens to in-flight scans when the provider is switched mid-build?

## User Research

### [CUSTOMER_1]

**Tier:** Lighthouse
**Calls referencing this topic:** 3

[CUSTOMER_1] has been the most vocal proponent of [TOOL_A] integration. Their security architect is "heavily focused on compliance benchmarks for AWS/Azure" and the organization already uses [TOOL_A] for compliance benchmark scanning via machine config scan type (Nov 2025). They currently run [TOOL_A] CLI inside [PRODUCT_SHORT] provisioners at build time -- a workaround that works but keeps vulnerability data outside [PRODUCT]'s UI. They explicitly asked for "a selector option between [DEFAULT_SCANNER] and [TOOL_A] databases" (Dec 2025).

### [CUSTOMER_4]

**Tier:** Lighthouse
**Calls referencing this topic:** 2

[CUSTOMER_4] follows compliance Level 2 profile via [CONFIG_MGMT_TOOL] for Linux servers and has expressed interest in template-level security compliance (Dec 2025). While they haven't specifically asked for [VULN_PLATFORM_A], their preference for "template scanning over runtime scanning" and need for PDF vulnerability reports (Nov 2025) indicate they would benefit from richer provider options.

## Out of Scope

* Adding providers beyond [TOOL_A] (e.g., [VULN_SCANNER_A], [VULN_SCANNER_C], [VULN_SCANNER_B]) -- deferred to Phase 2+ based on customer demand
* Compliance benchmark display in the [PRODUCT] UI -- covered under [PROJECT_KEY]-002, separate PRD
* Vulnerability remediation automation (auto-patching, playbook triggers) -- separate feature area
* Changes to the [PRODUCT_SHORT] CLI or build-time scanning behavior -- this PRD covers the registry-side data and display only
* [TOOL_A] license management or billing integration -- customers bring their own [TOOL_A] subscription
```

---

## Progress Signals

```
[GEAR]  prd-generator — gathering evidence for "[topic]"...
   [OK] Product context loaded — [N] relevant files
   -> Following wikilinks (1 hop):
      [OK] [related-doc-1].md
      [OK] [Customer Name] customer profile
      [OK] [PROJECT_KEY]-XXX (Jira link)
   [OK] Context loaded — [N] primary + [M] related files
   [OK] Customer evidence found — [N] customers, [M] mentions
   [OK] PRD draft generated — [N] phases, [M] requirements

[PAUSED]  PAUSED — PRD draft ready for review ([topic])

   Phases: [N]
   Requirements: [M]
   Customers cited: [list]
   Jira issues referenced: [list]

   Run: "approve the [topic] PRD" to save
        "approve the [topic] PRD with these changes: [edits]" to save with edits
        "cancel the [topic] PRD" to discard
```
