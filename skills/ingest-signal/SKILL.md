# Skill: Ingest Signal

## Purpose

Minimal ingestion handler for unstructured or informal content that doesn't fit Slack thread or RFC patterns. Signals capture lightweight context: blog posts, competitor docs, email threads, informal notes, or any content worth saving without heavy structural parsing.

---

## Input

Receives structured input from `ingest-router`:

```json
{
  "content": "raw text (any format)",
  "frontmatter": {
    "project_tag": "Extracted or provided title",
    "one_line_description": "TBD",
    "doc_type": "signal",
    "signal_source": "market | field | engineering",
    "date_ingested": "YYYY-MM-DD",
    "related_customers": [],
    "related_jira": [],
    "related_docs": []
  },
  "file_path": "/context/product-context/{signal_subdir}/{slug}-signal-{date}.md",
  "slug": "slugified-title",
  "project_tag": "Human-readable title"
}
```

**Note**: `signal_source` is provided by `ingest-router` based on content classification. `ingest-signal` preserves this value in the output frontmatter.

---

## Output

Lightly structured markdown with:
1. Updated frontmatter (filled in `one_line_description`, enhanced `related_*` arrays)
2. Signal metadata (source, type, date)
3. Key takeaways (1-3 sentences)
4. Original content (minimally reformatted)

**Returns to router**:
```json
{
  "frontmatter": { updated frontmatter dict },
  "body": "markdown content",
  "stats": {
    "content_type": "blog" | "email" | "competitor_doc" | "informal_notes" | "unknown",
    "word_count": N,
    "links_found": M
  }
}
```

---

## Content Type Detection (best effort)

Classify signal by scanning for patterns:

### Blog Post
- Contains author byline, publication date, article structure
- Pattern: "By [Name]", "Posted on", headings + paragraphs

### Email Thread
- Contains "From:", "To:", "Subject:", email headers
- Pattern: timestamp in header, quoted replies (`> `)

### Competitor Documentation
- Contains product names ([VULN_PLATFORM_A], [VULN_SCANNER_A], [VULN_SCANNER_C], [VULN_SCANNER_B], etc.)
- Pattern: "Feature: [name]", structured sections, marketing language

### Informal Notes
- Unstructured, no clear format
- Pattern: bullet points, short sentences, no formal headings

### Unknown
- Catch-all if no pattern matches

Content type is for metadata only -- doesn't change processing logic.

---

## Markdown Body Structure

### Section Order

1. **Signal Metadata** (source, type, date)
2. **Key Takeaways** (1-3 sentences)
3. **Original Content** (lightly reformatted)

### Signal Metadata Template

```markdown
**Source:** [URL if provided via source_url, otherwise "Unknown"]
**Type:** [Blog / Email / Competitor Doc / Informal Notes / Unknown]
**Date:** [Original publication/creation date if detectable, otherwise date_ingested]
```

### Key Takeaways

Generate 1-3 bullet points summarizing:
- What this signal is about
- Why it matters to [PRODUCT] or [PM_NAME]'s product work
- Any actionable insight

**Examples**:
```markdown
## Key Takeaways

* [VULN_PLATFORM_A] now offers compliance benchmark scanning as part of their vulnerability platform -- relevant to [PROJECT_KEY]-002 (Compliance Reporting epic)
* Competitor feature parity: [VULN_PLATFORM_A] supports multi-cloud image scanning ([CLOUD_PROVIDER_A], [CLOUD_PROVIDER_B], [CLOUD_PROVIDER_C]) with unified dashboard
* Customer ask alignment: [CUSTOMER_1] uses [VULN_PLATFORM_A] for compliance benchmarks, this confirms market demand
```

If content is too vague to extract takeaways:
```markdown
## Key Takeaways

* [Brief description of content and why it was saved]
```

### Original Content

Preserve original content with minimal reformatting:
- Add markdown headings if obvious structure exists (e.g., email subject -> H2)
- Convert plaintext URLs to markdown links: `https://example.com` -> `[https://example.com](https://example.com)`
- Preserve code blocks, lists, quotes
- Add horizontal rule (`---`) to separate takeaways from original content

```markdown
---

[Original content follows, lightly formatted]
```

---

## Enhanced Frontmatter

Update the frontmatter received from router:

### `one_line_description`

Generate a concise summary:
- Template: "[Content type] about [topic] and its relevance to [PRODUCT] context"
- Examples:
  - "Blog post about [VULN_PLATFORM_A]'s new compliance benchmark scanning feature and alignment with [PRODUCT] compliance work"
  - "Email thread discussing [CUSTOMER_1]'s vulnerability scanning requirements"
  - "Competitor analysis of [VULN_SCANNER_B]'s image scanning offering compared to [PRODUCT]"

Extract from:
1. First paragraph or sentence
2. Blog post title
3. Email subject line
4. First heading

### `related_customers`

Scan for customer mentions:
- Match against `/context/customer-profiles/*.json` canonical names
- Common patterns: "feedback from [Customer]", "[Customer] uses [tool]", "per [Customer] call"

### `related_jira`

Extract Jira issue keys:
- Pattern: `[PROJECT_KEY]-\d+`, `[FR_PROJECT_KEY]-\d+`
- URLs: Jira links
- Add to array (unique values only)

### `related_docs`

Attempt to match references to existing product context:
- "Related PRD: [title]"
- "See RFC: [title]"
- Match against existing files in `/context/product-context/` and add slugs to array

---

## Minimal Reformatting Rules

Signals should preserve original content as much as possible. Only apply these transformations:

1. **Headings**: If content has all-caps lines or clear heading structure, convert to markdown headings
2. **Links**: Convert plaintext URLs to markdown links (for clickability)
3. **Code blocks**: If content has indented code or obvious code snippets, wrap in ``` fences
4. **Lists**: If content has bullet points using `*`, `-`, or bullet characters, normalize to markdown `*` bullets
5. **Whitespace**: Collapse excessive blank lines (more than 2 consecutive -> 2)

Do NOT:
- Summarize or paraphrase the original content
- Remove sections
- Reorder content
- Fix grammar or spelling (preserve original)

---

## Edge Cases

### Empty or Very Short Content
If content is < 100 characters:
- Still save (may be a short note or link)
- Key Takeaways: Just one line summarizing what it is
- Note in stats: `"content_length": "short"`

### Content Already in Markdown
If content is already well-formatted markdown:
- Preserve as-is
- Just add metadata and Key Takeaways sections at top

### Content with Embedded Images
If content references images (e.g., `![alt](url)`):
- Preserve image markdown
- Note: Images won't be downloaded or embedded; just preserve the markdown reference

### Non-English Content
Preserve original language. If content is entirely non-English:
- Note in `one_line_description`: "[Content type] about [topic] (language: [code])"
- Key Takeaways: Summarize in English if possible, otherwise note: "Non-English content -- manual review needed"

---

## Progress Signals

```
[GEAR]  ingest-signal — processing content...
   [OK] Detected content type: Blog post
   [OK] Extracted key takeaways
   [OK] Detected related context: [CUSTOMER_1], [PROJECT_KEY]-002
   [OK] Generated one-line description
```

---

## Worked Example (abbreviated)

**Input content** (blog post excerpt):
```
[VULN_PLATFORM_A] Announces Compliance Benchmark Scanning for Cloud Workloads

By [VULN_PLATFORM_A] Security Team
Posted on February 15, 2026

[VULN_PLATFORM_A] is excited to announce support for compliance benchmark scanning across [CLOUD_PROVIDER_A], [CLOUD_PROVIDER_B], and [CLOUD_PROVIDER_C] machine images. Security teams can now validate their golden images against compliance profiles directly in the [VULN_PLATFORM_A] platform.

Key features:
- Support for compliance Level 1 and Level 2 profiles
- Automated remediation suggestions
- Integration with existing vulnerability scanning workflows

This complements our existing CVE scanning and misconfiguration detection...
```

**Output frontmatter**:
```yaml
---
project_tag: "[VULN_PLATFORM_A] Compliance Benchmark Scanning Announcement"
one_line_description: "Blog post about [VULN_PLATFORM_A]'s new compliance benchmark scanning feature and alignment with [PRODUCT] compliance work"
doc_type: signal
date_ingested: 2026-02-21
related_customers: []
related_jira: ["[PROJECT_KEY]-002"]
related_docs: []
---
```

**Output body** (abbreviated):
```markdown
# [VULN_PLATFORM_A] Compliance Benchmark Scanning Announcement

**Source:** Unknown
**Type:** Blog
**Date:** February 15, 2026

## Key Takeaways

* [VULN_PLATFORM_A] now offers compliance benchmark scanning (Level 1 & 2) for [CLOUD_PROVIDER_A], [CLOUD_PROVIDER_B], [CLOUD_PROVIDER_C] machine images -- directly competitive with [PRODUCT] compliance roadmap
* [VULN_PLATFORM_A] integrates compliance scanning with CVE scanning in a unified workflow -- aligns with [PROJECT_KEY]-002 (Compliance Reporting epic)
* Market signal: Compliance benchmarks for machine images are becoming table stakes for vulnerability platforms

---

## [VULN_PLATFORM_A] Announces Compliance Benchmark Scanning for Cloud Workloads

By [VULN_PLATFORM_A] Security Team
Posted on February 15, 2026

[VULN_PLATFORM_A] is excited to announce support for compliance benchmark scanning across [CLOUD_PROVIDER_A], [CLOUD_PROVIDER_B], and [CLOUD_PROVIDER_C] machine images. Security teams can now validate their golden images against compliance profiles directly in the [VULN_PLATFORM_A] platform.

Key features:
- Support for compliance Level 1 and Level 2 profiles
- Automated remediation suggestions
- Integration with existing vulnerability scanning workflows

This complements our existing CVE scanning and misconfiguration detection...
```

---

## Notes

- Signals are deliberately lightweight -- minimal structure, maximal preservation
- If content later proves valuable, it can be promoted to a PRD or analyzed further
- Signals are search-optimized: customer names, Jira issues, and topic keywords are captured in frontmatter
- No sophisticated parsing -- this is the "catch-all" ingestion path
