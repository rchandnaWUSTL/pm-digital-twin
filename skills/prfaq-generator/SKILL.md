# Skill: PRFAQ Generator

## Purpose

Generate a working-backwards PRFAQ (Press Release / Frequently Asked Questions) document from a PRD or directly from customer evidence. Part of the PRD Pipeline (see CLAUDE.md). Requires HITL-4 approval before the final document is saved.

---

## Input

### Mode A: From PRD

- **PRD file path** or **pasted PRD content**: A completed PRD (from the prd-generator skill or manually authored)
- The PRFAQ extracts problem framing, requirements, customer evidence, and personas from the PRD rather than re-deriving them

### Mode B: Standalone

- **Feature name / topic**: What the PRFAQ is about (e.g. "Vulnerability Scanning Provider Selection")
- **Customer notes**: Either provided directly or gathered from `/context/customer-notes/` and `/context/customer-profiles/`
- **Product context files**: Automatically loaded from `/context/product-context/` based on semantic relevance (see CLAUDE.md Product Context Loading)

Mode detection: If [PM_NAME] provides a PRD path or pastes PRD content, use Mode A. If [PM_NAME] says "Write a PRFAQ for [topic]" without referencing a PRD, use Mode B.

### Graph Traversal (Context Enrichment)

After loading the PRD or semantic matches:

1. **Parse wikilinks and frontmatter**: Extract `related_customers`, `related_jira`, `related_docs` from loaded files and `[[wikilinks]]` from body
2. **Load 1-hop neighbors**: Read wikilinked customer profiles, related product docs (1 hop only, no recursion)
3. **Display traversal log**: Show user which related files were loaded
4. **Enrich PRFAQ generation**: Use the additional context to strengthen Press Release narrative and FAQ answers

See CLAUDE.md Graph Traversal for traversal pattern and resolution rules.

---

## Output

A markdown PRFAQ file with YAML frontmatter.

**File path**: `/context/product-context/prds/{slug}-prfaq-{YYYY-MM-DD}.md`

Slugify the topic: lowercase, spaces to hyphens, strip characters that aren't alphanumeric or hyphens, collapse consecutive hyphens.

**Collision handling**: If the file already exists, append a counter: `-2.md`, `-3.md`, etc. Never overwrite an existing file.

---

## Document Structure

Every PRFAQ includes these sections in order:

1. YAML Frontmatter
2. One-Sentence Summary
3. Problem Statement
4. Press Release
5. External FAQs
6. Internal FAQs
7. Appendix
8. Review Tracking Table

---

## Section-by-Section Rules

### YAML Frontmatter

```yaml
---
project_tag: "Human-readable project name"
one_line_description: "One sentence: what this PRFAQ is and why it matters"
doc_type: prfaq
date_ingested: YYYY-MM-DD
---
```

- `project_tag`: Use the topic name as provided by [PM_NAME]
- `one_line_description`: One sentence capturing the feature and its value
- `doc_type`: Always `prfaq`
- `date_ingested`: Today's date

### One-Sentence Summary

A single sentence (max 30 words) capturing what the feature does and who it's for. This is the first line after the heading. Written for an executive audience -- no jargon.

### Problem Statement

2-3 paragraphs describing:

- The customer problem this feature solves (grounded in evidence)
- Why the problem matters now (market timing, customer urgency, competitive pressure)
- The gap between what customers need and what exists today
- If `/context/product-context/fr-snapshot.json` exists, check for [FR_PROJECT_KEY] issues matching the topic and reference them as real customer triggers (e.g. "Customers have filed [FR_PROJECT_KEY] tickets requesting this capability ([FR_PROJECT_KEY]-XXXX, [FR_PROJECT_KEY]-YYYY)"). If fr-snapshot.json doesn't exist or has no matching issues, include: *[run refresh-fr-snapshot for current FR data]*

In Mode A, derive this from the PRD's Problem and Background sections. In Mode B, synthesize from customer notes. Either way, the problem statement should stand alone -- a reader who skips straight here should understand the motivation.

### Press Release

The press release follows a fixed 8-element structure. Write it as if the feature has already shipped and [COMPANY] is announcing it publicly. Future tense is wrong -- write in past/present tense ("today announced", "customers can now").

#### Heading

A short, punchy headline (max 15 words). Names the product and the capability. No version numbers.

Example: "[PRODUCT] Now Supports [TOOL_A] for Vulnerability Scanning"

#### Subheading

One sentence expanding the headline. Names the target audience and the key benefit.

Example: "Enterprise customers can now use their existing [TOOL_A] deployment as the vulnerability data source in [PRODUCT], eliminating parallel scanning workflows."

#### Dateline Paragraph

Opens with the dateline format and announces the feature. One paragraph, 3-5 sentences.

**Dateline format**: `[CITY], [Month Day, Year] ([WIRE_SERVICE]) -- [COMPANY], [company description], today announced...`

The dateline paragraph should:
- Name the feature
- State what it enables at a high level
- Reference the target audience (e.g. "enterprise platform teams", "security-conscious organizations")
- Mention one concrete benefit

#### Problem Paragraph

One paragraph describing the problem customers faced before this feature. Write from the customer perspective. Reference real pain points from notes without naming specific customers.

#### Solution Paragraph

One paragraph describing how the feature works at a high level. Focus on customer outcomes, not technical architecture. What can customers do now that they couldn't before?

#### Customer Quote

Customer quotes must follow the Pixar story structure:

- "Every day..." -- establishes the status quo and normal routine
- "Until one day..." -- the inciting incident (something changes or goes wrong)
- "Because of that..." -- consequence; the hero takes action or deals with the problem (can repeat this beat to build tension)
- "Until finally..." -- the climax and resolution
- "And ever since that day..." -- the new normal; how things have changed

The quote should feel like a natural customer voice telling a before/after story -- not a formal testimonial. It does not need to follow the structure word-for-word, but the narrative arc must be present: status quo -> disruption -> action -> resolution -> new normal.

Example (from Vulnerability Scanning PRFAQ, already follows this structure):

```markdown
> "We used to joke that a new CVE meant canceling your day. Security would flag it, then we'd scramble to locate that package. Even after updates, we never knew which images remained vulnerable. Now I open [PRODUCT], search the CVE, and instantly see affected images and where they're running. I can create tickets, assign owners, update definitions, and coordinate deployments with real confidence. It's transformed how we handle security as a platform team. I can't imagine going back."
>
> -- Jimmy Buffett, Director of Platform Engineering at Margaritaville
```

**Default placeholder**: Use "Jimmy Buffett, Director of Platform Engineering at Margaritaville" as the fictional customer. Only replace with a real customer name if [PM_NAME] explicitly confirms the customer has agreed to be quoted.

Reference actual workarounds from customer notes as the "status quo" and "disruption" beats to ground the story in real pain points.

#### Exec Quote

The exec quote must lead with demonstrated empathy for the user's pain -- showing that [COMPANY] deeply understands what customers are going through -- before pivoting to the product announcement.

Structure:

1. Acknowledge the pain ("We've heard from customers that...")
2. Show you understand why it's hard ("This is a real problem because...")
3. Then announce the solution as the natural response to that pain ("That's why we built...")

The quote should feel like a leader who has been listening to customers, not a leader announcing a press release. The reader should feel understood before they feel sold to.

Example pattern:

```markdown
> "We've heard from platform teams that [specific pain in their words]. We know that [why this is genuinely hard -- operational reality, not marketing speak]. That's why we built [feature] -- to give teams [specific relief]. This is exactly the kind of problem [COMPANY] exists to solve."
>
> -- [Exec Name], [Exec Title] at [COMPANY]
```

**Default exec**: [Exec Name], [Exec Title] at [COMPANY] (unless [PM_NAME] specifies otherwise)

#### CTA

A single sentence directing readers to learn more. Reference the documentation or product page.

Example: "To learn more about vulnerability scanning provider selection in [PRODUCT], visit the [[PRODUCT] documentation](https://developer.[company-domain.com]/[platform-path]/docs/[product-path])."

### External FAQs

8-12 Q&A pairs written for customers and prospects. These are questions a customer reading the press release would ask.

**Guidelines:**
- Ground answers in customer notes where possible -- if a customer asked exactly this question, the answer should address their specific concern
- Plain language, action-oriented -- "How do I..." not "What is the theoretical framework for..."
- Cover: how to get started, compatibility with existing setup, migration path, pricing (if known), limitations, timeline
- Order from most likely question to least
- Each answer should be 2-5 sentences. Longer answers suggest the question should be split

### Internal FAQs

Questions that internal stakeholders (engineering, sales, support, leadership) would ask. These are not customer-facing.

**Guidelines:**
- **Pricing**: Always "TBD in partnership with business planning" if pricing hasn't been determined. Never guess at pricing.
- **Demand sizing**: Must cite actual evidence from customer notes and profiles. "N lighthouse customers have asked for this" with specific names. Additionally, check `/context/product-context/fr-snapshot.json` for [FR_PROJECT_KEY] issues matching the topic -- count matching issues, name customers where `customer_name` is populated, and cite specific asks. Format: "N [FR_PROJECT_KEY] tickets filed ([FR_PROJECT_KEY]-XXXX: [customer] -- [ask], ...)". If fr-snapshot.json doesn't exist or has no matching issues, include: *[run refresh-fr-snapshot for current FR data]*
- **Engineering effort**: Reference engineering docs and spikes if available. Otherwise "TBD -- engineering spike needed to estimate."
- **Competitive positioning**: Ground in what we know from customer notes about competitor usage, not speculation.
- **For unknowns**: Use "TBD -- [what's needed to answer this]" rather than leaving answers blank or guessing. Every TBD should say what would resolve it.

Cover at minimum:
- Demand / customer evidence
- Pricing impact
- Engineering scope / effort
- Competitive landscape
- Support implications
- Risk / dependencies

### Appendix

Reference materials that support the PRFAQ but don't belong inline:

- Links to related Jira epics (e.g. [PROJECT_KEY]-001)
- Links to engineering docs or prior art summaries in `/context/product-context/`
- Customer evidence files consulted
- Related PRDs

If no appendix material exists, include the section with "No appendix materials at this time." rather than omitting it -- readers expect to find it.

### Review Tracking Table

A fixed 8-row table tracking review status across stakeholders. This is always included and always has the same structure:

```markdown
## Review Tracking

| Reviewer | Role | Status | Date | Notes |
|----------|------|--------|------|-------|
| | Engineering | Not Started | | |
| | Product Design | Not Started | | |
| | Product Marketing | Not Started | | |
| | Platform PM | Not Started | | |
| | Support Enablement | Not Started | | |
| | Technical Interlock - Product SME | Not Started | | |
| | Security | Not Started | | |
| | Partner Alliances | Not Started | | |
```

Leave the Reviewer name column blank unless [PM_NAME] provides specific names. Status values: `Not Started`, `In Review`, `Approved`, `Changes Requested`.

---

## Voice & Style Rules

1. **Press release tone**: Professional but not stiff. Write like a real product announcement, not a template fill-in. Avoid superlatives ("revolutionary", "groundbreaking") -- let the feature speak for itself.
2. **Customer-centric framing**: Every section should center on what the customer can do, not what [COMPANY] built. "Customers can now choose their scanning provider" not "We built a provider abstraction layer."
3. **Evidence-grounded**: Customer quotes (even fictional ones) should reflect real workarounds and pain points from notes. FAQs should anticipate real questions based on what customers have actually asked.
4. **Honest about unknowns**: Internal FAQs must use "TBD -- [what's needed]" for anything unresolved. Never present guesses as decisions.
5. **Consistent formatting**: Use `*` for top-level bullets, `   *` for sub-bullets (3-space indent). Blockquotes for all quotes. Tables use standard markdown.
6. **No filler**: If an FAQ answer is "we don't know yet", say that specifically with what would resolve it, rather than padding with vague language.

---

## Insufficient Evidence Handling

If running in Mode B (standalone) and evidence is insufficient (fewer than 2 customers OR fewer than 3 total mentions):

1. Do NOT generate a PRFAQ
2. Instead, invoke the `signal-brief` skill with the available evidence
3. Return a message: "Insufficient evidence for a PRFAQ -- generated a signal brief instead. [N] customers, [M] mentions found."

If running in Mode A (from PRD), the PRD has already passed the evidence threshold -- proceed with PRFAQ generation.

---

## HITL Suspend Behavior

The PRFAQ generator triggers **HITL-4** after generating the full draft.

### On suspend:

1. Generate the complete PRFAQ draft
2. Display the full draft to [PM_NAME]
3. Write pending state to `/context/pending/prfaq-pipeline-{date}.pending.json`:

```json
{
  "pipeline": "prfaq-pipeline",
  "started_at": "ISO timestamp",
  "suspended_at": "ISO timestamp",
  "suspend_point": "HITL-4",
  "suspend_reason": "awaiting_prfaq_approval",
  "completed_steps": ["prd-loaded or evidence-gathered", "prfaq-generator"],
  "next_step": "save-approved-prfaq",
  "awaiting_approval": {
    "prompt": "PRFAQ draft ready for review — [topic]",
    "draft_topic": "[topic]",
    "draft_content": "[full markdown content]",
    "mode": "from_prd | standalone",
    "evidence_summary": {
      "customers_cited": ["Customer A", "Customer B"],
      "total_mentions": N,
      "source_prd": "[path if Mode A, null if Mode B]"
    }
  },
  "context": {
    "source_prd": "[path if Mode A]",
    "notes_used": ["list of note file paths consulted"]
  }
}
```

### On resume (approved):

Save the PRFAQ to `/context/product-context/prds/{slug}-prfaq-{YYYY-MM-DD}.md`.

### On resume (with edits):

Apply [PM_NAME]'s edits to the draft, then save.

### On resume (cancelled):

Delete the pending file. No PRFAQ saved.

---

## Worked Example (abbreviated)

Topic: "Vulnerability Scanning Provider Selection"
Mode: A (from PRD)

This example shows every section with representative content but is deliberately shorter than a real PRFAQ would be.

---

```markdown
---
project_tag: "Vulnerability Scanning Provider Selection"
one_line_description: "PRFAQ for [PRODUCT]'s support of [TOOL_A] as a vulnerability scanning provider alongside [DEFAULT_SCANNER]"
doc_type: prfaq
date_ingested: 2026-02-20
---

# Vulnerability Scanning Provider Selection — PRFAQ

Enterprise customers can now use their preferred vulnerability scanning provider -- starting with [TOOL_A] -- in [PRODUCT] instead of being locked to [DEFAULT_SCANNER].

## Problem Statement

Enterprise organizations with mature security tooling don't get to choose which vulnerability scanner they use. Compliance frameworks, security team mandates, and existing vendor contracts dictate which scanning platform is authoritative. When [PRODUCT] only supports [DEFAULT_SCANNER] for vulnerability data, these organizations are forced to run parallel scanning workflows: one inside [PRODUCT] ([DEFAULT_SCANNER], for registry visibility) and one outside (their mandated tool, for compliance).

This isn't a theoretical concern. Lighthouse customers in financial services already run [TOOL_A] CLI inside [PRODUCT_SHORT] provisioners at build time, then manually cross-reference results against [PRODUCT]'s [DEFAULT_SCANNER]-based vulnerability tab. The data lives in two places, neither complete, with no unified view for promotion decisions.

The gap is clear: [PRODUCT] needs to support the scanning providers that enterprise customers already use, starting with the one they've asked for most -- [TOOL_A].

## Press Release

### [PRODUCT] Now Supports [TOOL_A] for Vulnerability Scanning

Enterprise customers can now use their existing [TOOL_A] deployment as the vulnerability data source in [PRODUCT], eliminating parallel scanning workflows.

[CITY], March 15, 2026 ([WIRE_SERVICE]) -- [COMPANY], [company description], today announced vulnerability scanning provider selection for [PRODUCT]. Enterprise platform teams can now choose [TOOL_A] as their vulnerability data source alongside the existing [DEFAULT_SCANNER] default, bringing their organization's mandated scanning tool directly into the image registry. This eliminates the need for parallel scanning workflows and gives security and platform teams a single place to review vulnerability data before promoting images to production.

Organizations with existing [TOOL_A] deployments have long struggled with fragmented vulnerability data. Security teams require [TOOL_A] for compliance reporting, but [PRODUCT]'s vulnerability tab only showed [DEFAULT_SCANNER] results. Platform engineers were left running [TOOL_A] CLI inside [PRODUCT_SHORT] provisioners and manually reconciling results across two systems -- a brittle, error-prone process that slowed image promotion decisions.

With provider selection, administrators configure their preferred scanning provider at the registry level -- a one-time setting that applies to all new scans. [TOOL_A] vulnerability data flows directly into the [PRODUCT] UI with full severity ratings, affected package details, and remediation guidance. Existing [DEFAULT_SCANNER]-based workflows continue unchanged for customers who don't opt in.

> "Before provider selection, we were running [TOOL_A] CLI inside our [PRODUCT_SHORT] provisioners and then cross-referencing those results against the [DEFAULT_SCANNER] data in [PRODUCT]. Now we configure [TOOL_A] once at the registry level and everything flows through automatically. Our security team gets the [TOOL_A] data they need, and our platform team sees it all in one place."
>
> -- Jimmy Buffett, Director of Platform Engineering at Margaritaville

> "Image security is table stakes for enterprise customers, but forcing them into a single scanning provider creates unnecessary friction. Provider selection meets customers where they are -- with the tools their security teams have already approved and deployed."
>
> -- [Exec Name], [Exec Title] at [COMPANY]

To learn more about vulnerability scanning provider selection in [PRODUCT], visit the [[PRODUCT] documentation](https://developer.[company-domain.com]/[platform-path]/docs/[product-path]).

## External FAQs

**Q: Which vulnerability scanning providers are supported?**
A: At launch, [PRODUCT] supports [DEFAULT_SCANNER] (the existing default) and [TOOL_A]. Additional providers will be evaluated based on customer demand. [DEFAULT_SCANNER] remains the default for all registries.

**Q: How do I switch my registry from [DEFAULT_SCANNER] to [TOOL_A]?**
A: Navigate to your registry settings, select "Vulnerability Scanning", and choose [TOOL_A] as your provider. You'll need to provide [TOOL_A] API credentials. The change applies to all new scans going forward -- existing scan results are preserved.

**Q: What happens to my existing [DEFAULT_SCANNER] scan results if I switch to [TOOL_A]?**
A: Existing [DEFAULT_SCANNER] results remain visible and are not deleted. New scans will use [TOOL_A]. Historical data retains its original provider attribution so you can always see which provider generated each result.

**Q: Can I run both [DEFAULT_SCANNER] and [TOOL_A] simultaneously?**
A: Dual-provider mode is planned for a future release. At launch, you select one active provider per registry.

**Q: Does this change how vulnerability data appears in the UI?**
A: The vulnerability tab displays data from your selected provider using a normalized format. Severity levels, affected packages, and remediation guidance are presented consistently regardless of provider. Provider-specific metadata (like [TOOL_A]'s compliance benchmark data) is preserved in detail views.

## Internal FAQs

**Q: What is the customer demand for this feature?**
A: Three lighthouse customers have directly raised vulnerability scanning provider needs. [CUSTOMER_1] has explicitly asked for a "selector option between [DEFAULT_SCANNER] and [TOOL_A] databases" across 3 calls (Nov 2025, Dec 2025, Feb 2026). [CUSTOMER_4] has expressed interest in template-level scanning with richer provider options across 2 calls. [CUSTOMER_2] has discussed security scanning but has not specifically requested [TOOL_A].

**Q: What is the pricing impact?**
A: TBD in partnership with business planning. Key question: does provider selection gate on [PRODUCT] tier (Plus vs Standard), or is it available to all paid customers? [TOOL_A] is a bring-your-own-license integration -- [COMPANY] does not resell [TOOL_A].

**Q: What is the engineering effort?**
A: Engineering completed an initial spike under [PROJECT_KEY]-001 (Vulnerability Data in [PRODUCT]). The provider abstraction layer and [TOOL_A] API integration are the primary new work. TBD -- engineering spike needed to estimate Phase 1 scope in sprints.

**Q: How does this affect our competitive positioning?**
A: Most competing image registry products (AWS ECR, Azure ACR) use built-in scanning with no provider choice. Supporting customer-chosen providers is a differentiator for [PRODUCT] in the enterprise segment where scanning tool mandates are common.

## Appendix

* Related Jira epic: [PROJECT_KEY]-001 -- Vulnerability Data in [PRODUCT]
* Related Jira epic: [PROJECT_KEY]-002 -- Image Compliance Reporting & Governance (compliance benchmarks, adjacent scope)
* Customer evidence: `/context/customer-profiles/[customer-1].json`, `/context/customer-profiles/[customer-4].json`

## Review Tracking

| Reviewer | Role | Status | Date | Notes |
|----------|------|--------|------|-------|
| | Engineering | Not Started | | |
| | Product Design | Not Started | | |
| | Product Marketing | Not Started | | |
| | Platform PM | Not Started | | |
| | Support Enablement | Not Started | | |
| | Technical Interlock - Product SME | Not Started | | |
| | Security | Not Started | | |
| | Partner Alliances | Not Started | | |
```

---

## Progress Signals

```
[GEAR]  prfaq-generator — generating PRFAQ for "[topic]" (mode: [from_prd | standalone])...
   [OK] Source loaded — [PRD path | N customer notes]
   -> Following wikilinks (1 hop):
      [OK] [related-doc-1].md
      [OK] [Customer Name] customer profile
   [OK] Context loaded — enriched with [N] related files
   [OK] PRFAQ draft generated — [N] external FAQs, [N] internal FAQs

[PAUSED]  PAUSED — PRFAQ draft ready for review ([topic])

   Mode: [From PRD | Standalone]
   Customers cited: [list]
   External FAQs: [N]
   Internal FAQs: [N]

   Run: "approve the [topic] PRFAQ" to save
        "approve the [topic] PRFAQ with these changes: [edits]" to save with edits
        "cancel the [topic] PRFAQ" to discard
```
