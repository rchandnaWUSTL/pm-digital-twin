# Skill: Ingest Router

## Purpose

Smart router that auto-detects content format (Slack thread, RFC, historical PRD, signal) and delegates to specialized ingestion skills. Handles common logic: frontmatter generation, slug collision checks, and file path construction.

---

## Input

- **content**: Raw text to ingest (required)
- **project_name**: Optional human-readable project name (e.g. "[TOOL_A] Integration", "MCP Server Support")
- **source_url**: Optional URL where this content originated

If `project_name` is not provided, the router attempts to extract it from the content (e.g., Slack thread subject, RFC title, document heading).

---

## Output

A markdown file with YAML frontmatter, saved to the appropriate subdirectory in `/context/product-context/`.

**File path structure**:
- Slack threads: `/context/product-context/slack-threads/{slug}-slack-thread-{YYYY-MM-DD}.md`
- RFCs: `/context/product-context/engineering/{slug}-rfc-{YYYY-MM-DD}.md`
- Signals: `/context/product-context/{signal_subdir}/{slug}-signal-{YYYY-MM-DD}.md`
  where signal_subdir = market-signals | field-signals | engineering-signals

**Returns to caller**:
```json
{
  "file_path": "/context/product-context/{subdir}/{filename}.md",
  "detected_format": "slack_thread" | "rfc" | "signal",
  "project_tag": "Human-readable project name",
  "slug": "slugified-name",
  "specialist_skill_used": "ingest-slack-thread" | "ingest-rfc" | "ingest-signal"
}
```

---

## Detection Heuristics

The router scans the content for format-specific patterns:

### Slack Thread Detection
Match ANY of these patterns:
- Contains "replied to this thread" (verbatim Slack UI text)
- Contains timestamps in format "9:45 AM", "2:30 PM" (Slack message timestamps)
- Contains emoji reactions pattern: `:emoji_name:` or "thumbs-up 2" (reaction counts)
- Contains "View message" or "View thread" (Slack export links)
- Contains multiple consecutive lines with "Name\nTimestamp\nMessage" structure

**Priority**: Check first (most distinctive pattern)

### RFC Detection
Match ANY of these patterns:
- Contains section headings: "Alternatives Considered", "Decision", "Open Questions", "Motivation"
- Contains "RFC" or "Request for Comments" in title or first paragraph
- Contains formal architecture language: "Design", "Trade-offs", "Assumptions", "Dependencies"
- Structured sections with formal headings (## Motivation, ## Design, ## Alternatives)

**Priority**: Check second

### Signal (Catch-All)
If no specific pattern matches, classify as **signal**. Signals are the default format for:
- Blog posts
- Email threads
- Competitor documentation
- Informal notes
- Unstructured content

**Priority**: Fallback (always matches)

### Signal Subtype Classification

When format = "signal", perform a second classification pass to determine signal source: **market**, **field**, or **engineering**.

#### Detection Patterns

| Signal Type | Patterns | Confidence |
|---|---|---|
| **Market** | Competitor domains ([competitor-a.com], [competitor-b.com], [competitor-c.com]), keywords: "announces" / "press release", blog structure (author + date), competitor product names | HIGH if domain + 1 keyword |
| **Field** | Email headers (From:/To:/Subject:), customer names from profiles, keywords: "feedback from" / "customer asked", SA/SE names, @customer.com domains | HIGH if email headers OR customer name + feedback keyword |
| **Engineering** | Technical jargon: "prototype" / "spike" / "POC", code blocks, architecture language: "design exploration" / "technical debt", @[company-domain.com] (non-GTM), @eng-team mentions | HIGH if code + technical keyword |

#### Decision Logic

1. Scan for all three pattern types
2. Select highest confidence match
3. If tie OR all LOW -> default to `market-signals/`
4. If conflicting HIGH confidence -> prompt user

#### Manual Override

Users can specify signal subtype:
```
"Ingest this as market signal: [content]"
"Ingest this as field signal: [content]"
"Ingest this as engineering signal: [content]"
```

#### Subdirectory Selection

Based on detected/specified signal source:
- Market signals: `market-signals/`
- Field signals: `field-signals/`
- Engineering signals: `engineering-signals/`

---

## Common Processing (Router Responsibility)

Before delegating to a specialist skill, the router performs:

### 1. Project Tag Extraction

If `project_name` is provided, use it verbatim as `project_tag`.

If not provided, extract from content:
- Slack threads: First non-timestamp line (usually the thread subject)
- RFCs: First H1 heading or "RFC: [Title]" pattern
- Signals: First H1 heading or first sentence (truncate to 60 chars)

### 2. Slug Generation

Transform `project_tag` into a filesystem-safe slug:
- Lowercase
- Replace spaces with hyphens
- Strip all characters except alphanumeric, hyphens
- Collapse consecutive hyphens into one
- Remove leading/trailing hyphens

**Examples**:
- "[TOOL_A] Integration" -> `tool-a-integration`
- "MCP Server: Jira Support" -> `mcp-server-jira-support`
- "Vulnerability Scanning (Phase 2)" -> `vulnerability-scanning-phase-2`

### 3. Collision Detection

Check if a file with the same slug already exists in the target subdirectory:
```bash
ls /context/product-context/{subdir}/{slug}-*.md
```

If collision found:
- **Slack threads**: Always unique (includes date in filename, thread IDs in frontmatter)
- **RFCs**: Append counter `-2`, `-3`, etc.
- **Signals**: Append counter `-2`, `-3`, etc.

### 4. Frontmatter Scaffold

Generate YAML frontmatter with:
```yaml
---
project_tag: "Human-readable project name"
one_line_description: "TBD — [specialist skill fills this in]"
doc_type: slack_thread | engineering_doc | signal
date_ingested: YYYY-MM-DD (today's date)
related_customers: []  # Auto-populated if detectable
related_jira: []       # Auto-populated if detectable ([PROJECT_KEY]-XXX pattern)
related_docs: []       # Empty, user can add manually
---
```

**Auto-population rules**:
- `related_customers`: Scan content for customer names matching `/context/customer-profiles/*.json` canonical names
- `related_jira`: Scan content for `[PROJECT_KEY]-\d+` pattern
- `related_docs`: Leave empty (specialists may populate)

### 5. Delegation

Call the appropriate specialist skill with:
- **content**: Original raw content
- **frontmatter**: Pre-generated YAML frontmatter (as dict, not serialized)
- **file_path**: Target file path (router decides this)
- **slug**: Generated slug
- **project_tag**: Extracted or provided project name

---

## Specialist Skill Contract

Each specialist skill receives:
```json
{
  "content": "raw text",
  "frontmatter": {
    "project_tag": "...",
    "one_line_description": "TBD",
    "doc_type": "...",
    "signal_source": "market | field | engineering",  // Only when doc_type=signal
    "date_ingested": "YYYY-MM-DD",
    "related_customers": [],
    "related_jira": [],
    "related_docs": []
  },
  "file_path": "/context/product-context/{subdir}/{filename}.md",
  "slug": "slugified-name",
  "project_tag": "Human-readable name"
}
```

Specialist responsibilities:
1. Parse content (extract structure, key information)
2. Fill in `one_line_description` in frontmatter
3. Optionally enhance `related_*` arrays if more context found during parsing
4. Generate markdown body (formatted content)
5. Return final markdown + updated frontmatter to router

The router then:
1. Combines frontmatter + body
2. Writes to `file_path`
3. Returns summary to user

---

## User Confirmation (Override Detection)

If the detected format seems ambiguous (e.g., content has Slack patterns but also formal structure), the router MAY ask for confirmation:

```
[GEAR]  ingest-router — detected format: Slack thread

   Confidence: medium (found Slack timestamps but also formal headings)

   Proceed with Slack thread ingestion, or override?
   - "proceed" to continue
   - "ingest as RFC" to override
   - "ingest as signal" to override
```

**Rule**: Only ask if confidence is "medium" (conflicting patterns). If confidence is "high" (clear pattern match), proceed automatically.

---

## Error Handling

### Empty Content
If content is empty or < 50 characters:
```
[ERROR] ingest-router — content too short to classify (< 50 chars)
   Provide more content or specify format manually: "ingest this as [signal/rfc/slack-thread]"
```

### Project Name Extraction Failure
If `project_name` not provided and extraction fails:
- Use first 60 characters of content as fallback `project_tag`
- Slug from that
- Proceed with warning:
```
[WARNING]  Could not extract project name — using content preview as slug
   You can rename the file after ingestion if needed
```

### Specialist Skill Error
If the specialist skill fails (e.g., parsing error):
- Return error to user with specialist's error message
- Do NOT write file
- Log error to `/context/pending/ingest-error-{date}.log`

---

## Progress Signals

```
[GEAR]  ingest-router — analyzing content...
   [OK] Detected format: Slack thread (confidence: high)
   [OK] Project tag: "[TOOL_A] Integration Discussion"
   [OK] Slug: tool-a-integration-discussion
   [OK] Target path: /context/product-context/slack-threads/tool-a-integration-discussion-slack-thread-2026-02-21.md

   Delegating to ingest-slack-thread...

   [OK] Parsed thread — 12 messages, 5 participants
   [OK] Extracted 3 key decisions
   [OK] Found 2 unresolved questions
   [OK] File saved

[DONE] Ingestion complete — Slack thread saved

   File: /context/product-context/slack-threads/tool-a-integration-discussion-slack-thread-2026-02-21.md
   Format: slack_thread
   Auto-detected: [CUSTOMER_1] (customer), [PROJECT_KEY]-001 (Jira)
```

---

## Manual Override Syntax

Users can bypass detection by specifying the format explicitly:

```
"Ingest this as RFC: [content]"
"Ingest this as signal: [content]"
"Ingest this as Slack thread: [content]"
```

When format is explicitly provided, skip detection heuristics entirely.

---

## Worked Example (abbreviated)

**User input**: Pastes Slack thread export containing:
```
John Doe
9:45 AM
Hey team, we need to discuss [TOOL_A] integration for [PRODUCT]...

Jane Smith replied to this thread
9:47 AM
Agreed, [CUSTOMER_1] has been asking for this. [PROJECT_KEY]-001 tracks this.
```

**Router processing**:
1. Detection: Finds "replied to this thread" + "9:45 AM" -> **Slack thread (high confidence)**
2. Project tag: Extracts first line after timestamps -> "[TOOL_A] integration for [PRODUCT]"
3. Slug: `tool-a-integration-for-product`
4. Collision check: No existing file
5. Frontmatter: Generates scaffold, detects "[CUSTOMER_1]" and "[PROJECT_KEY]-001"
6. Delegate to `ingest-slack-thread`

**Specialist (`ingest-slack-thread`) processing**:
- Parses 2 messages, 2 participants
- Extracts decision: "Need to support [TOOL_A] integration"
- Fills `one_line_description`: "Slack thread discussing [TOOL_A] integration requirements for [PRODUCT]"
- Generates markdown body with structured thread format

**Router post-processing**:
- Writes file to `/context/product-context/slack-threads/tool-a-integration-for-product-slack-thread-2026-02-21.md`
- Returns summary to user

---

## Notes

- The router does NOT parse content semantics (that's the specialist's job)
- The router DOES handle all filesystem operations (collision checks, writes)
- Specialists return structured data; the router handles serialization
- If a new content format needs support in the future (e.g., Confluence pages), add detection heuristics here and create a new specialist skill
