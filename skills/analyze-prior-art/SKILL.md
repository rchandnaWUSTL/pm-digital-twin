# Skill: Analyze Prior Art

## Purpose

Analyze a prior art document (competitor spec, industry standard, similar product's feature doc, internal precedent) through the lens of what [PM_NAME] is currently building. Identifies reusable patterns, contextual differences, and gaps. Standalone skill — not part of any pipeline, invoked by direct request. No Jira writes, no HITL suspend points.

---

## Input

- Pasted prior art document text (any format — competitor docs, specs, blog posts, internal docs from other products)
- Project name (e.g. "[PRODUCT_SHORT] MCP Server")
- What [PM_NAME] is working on (e.g. "writing a PRD for [PRODUCT_SHORT] MCP Server", "designing vulnerability scanning v2")

---

## Output

Two parts:

### 1. Prior Art Analysis (displayed to user, not saved)

Four sections:

#### What's Directly Reusable
Patterns, framing, sections, terminology, or structural approaches [PM_NAME] can adapt. Not just content — look for structural patterns (how they organized their spec, what sections they included, how they framed trade-offs).

#### What's Different About Our Context
Why this isn't a copy-paste job. [PRODUCT]'s customers, architecture, constraints, and market position likely differ. Call out the specific divergences.

#### Gaps This Prior Art Reveals
Things the prior art covers that [PM_NAME] hasn't considered yet — features, edge cases, failure modes, user flows, or integration points that should at least be addressed (even if the answer is "not applicable").

#### Open Questions for [PM_NAME]
Questions that arose from the analysis that [PM_NAME] should resolve before proceeding. These should be specific and actionable.

### 2. Summary File (saved)

Written to `/context/product-context/prior-art/{slug}-prior-art-{YYYY-MM-DD}.md`

---

## Output Format — Summary File

```markdown
---
project_tag: "Human-readable project name"
one_line_description: "One sentence: what this prior art is and why it's relevant"
doc_type: prior_art
date_ingested: YYYY-MM-DD
---

# Prior Art Summary — {Project Name}

**Source:** {Brief description of what the prior art document is — e.g. "Terraform MCP Server specification", "AWS AMI Builder compliance framework"}
**Analyzed for:** {What [PM_NAME] is working on}

## What It Covers

{2-4 sentence summary of the prior art's scope and purpose}

## Key Reusable Elements

{Bulleted list of patterns, structures, or approaches worth adapting}

## Key Differences

{Bulleted list of where [PRODUCT]'s context diverges from this prior art}
```

---

## Instructions

1. Read the pasted prior art document carefully and completely.
2. Understand what [PM_NAME] is building — use the stated context plus knowledge of [PRODUCT], its customers, and its architecture from the system context.
3. Analyze through the lens of [PM_NAME]'s specific context, not generically. "This is a good pattern" is useless; "This pagination approach maps directly to [PRODUCT]'s artifact list API which has the same N+1 query problem" is useful.
4. Identify reusable elements at multiple levels:
   - **Content**: Specific features, requirements, or specs that transfer
   - **Structure**: How they organized their doc, what sections they included, how they sequenced information
   - **Framing**: How they positioned trade-offs, communicated constraints, or justified decisions
   - **Patterns**: Architectural patterns, API design patterns, workflow patterns
5. Identify where [PM_NAME]'s context diverges — [PRODUCT]'s customer base (FSI-heavy, compliance-focused), multi-cloud architecture, [COMPANY]'s product ecosystem, and current product maturity all create differences.
6. Surface gaps the prior art reveals — things it addresses that [PM_NAME] should at least consider, even if the answer is "not applicable to us."
7. Slugify the project name for the filename: lowercase, spaces to hyphens, strip characters that aren't alphanumeric or hyphens, collapse consecutive hyphens.
8. Check for existing files before writing. The target path is `/context/product-context/prior-art/{slug}-prior-art-{YYYY-MM-DD}.md`. If that file already exists, append a counter: `{slug}-prior-art-{YYYY-MM-DD}-2.md`, `-3.md`, etc. Never overwrite an existing file.
9. Save the summary file to the resolved path.

---

## Progress Signals

```
⚙️  analyze-prior-art — reading [doc type] for [project name]...
   ✓ Prior art analysis complete — [N] reusable elements, [N] gaps identified
   ✓ Summary saved → /context/product-context/[filename]
```
