# Skill: Ingest Slack Thread

## Purpose

Parse and structure Slack thread exports into product context documents. Extracts thread participants, timestamps, key decisions, unresolved questions, and emoji reactions.

---

## Input

Receives structured input from `ingest-router`:

```json
{
  "content": "raw Slack thread text",
  "frontmatter": {
    "project_tag": "Thread subject or extracted title",
    "one_line_description": "TBD",
    "doc_type": "slack_thread",
    "date_ingested": "YYYY-MM-DD",
    "related_customers": [],
    "related_jira": [],
    "related_docs": []
  },
  "file_path": "/context/product-context/slack-threads/{slug}-slack-thread-{date}.md",
  "slug": "slugified-thread-name",
  "project_tag": "Human-readable thread name"
}
```

---

## Output

Structured markdown with:
1. Updated frontmatter (filled in `one_line_description`, enhanced `related_*` arrays)
2. Thread metadata section (participants, date range, channel)
3. Key Decisions section
4. Unresolved Questions section
5. Full thread transcript

**Returns to router**:
```json
{
  "frontmatter": { updated frontmatter dict },
  "body": "markdown content",
  "stats": {
    "message_count": N,
    "participant_count": M,
    "decisions_extracted": X,
    "questions_extracted": Y
  }
}
```

---

## Parsing Rules

### Message Structure Detection

Slack exports typically follow this pattern:
```
[Name]
[Timestamp]
[Message body]

[Name] replied to this thread
[Timestamp]
[Message body]
```

Parse each block as a message:
- **Author**: First line before timestamp
- **Timestamp**: Line matching `HH:MM AM/PM` or ISO format
- **Body**: All lines after timestamp until next author/timestamp block
- **Reply indicator**: Line containing "replied to this thread"

### Timestamp Parsing

Accept multiple timestamp formats:
- `9:45 AM`, `2:30 PM` (Slack UI format)
- `2026-02-21T09:45:00Z` (ISO format)
- `Feb 21, 2026 9:45 AM` (export format)

Extract:
- First message timestamp → thread start date
- Last message timestamp → thread end date (if multi-day thread)

### Participant Extraction

Count unique author names. Normalize variations:
- "John Doe" and "john.doe" are the same person
- Handle Slack display names vs. usernames

### Emoji Reactions

Parse patterns like:
- `:white_check_mark: 3` (emoji code + count)
- `👍 2` (Unicode emoji + count)
- `✅ John Doe, Jane Smith` (emoji + reactor names)

Capture in thread transcript but don't treat as decisions unless combined with decision language.

---

## Content Extraction

### Key Decisions

Extract statements that indicate decisions made:
- "Let's go with [option]"
- "We decided to [action]"
- "Agreed, we'll [action]"
- Messages with :white_check_mark: or ✅ reactions + decision language

Format as bulleted list:
```markdown
## Key Decisions

* [Decision statement] — [Author], [date]
* [Decision statement] — [Author], [date]
```

If no clear decisions found, omit this section entirely (don't include "None").

### Unresolved Questions

Extract questions that didn't receive definitive answers:
- Lines ending with `?`
- "Open question: [question]"
- "Still need to figure out [topic]"
- "TBD: [topic]"

Format as bulleted list:
```markdown
## Unresolved Questions

* [Question text] — raised by [Author], [date]
* [Question text] — raised by [Author], [date]
```

If all questions were answered in-thread, omit this section.

### Context Links

Extract URLs mentioned in the thread:
- Jira links ([PROJECT_KEY]-XXX, [FR_PROJECT_KEY]-XXX)
- GitHub PRs/issues
- Google Docs / Confluence pages
- Other Slack thread links

Add to `related_jira` frontmatter if Jira issue detected.

---

## Markdown Body Structure

### Section Order

1. **Thread metadata** (participants, date, message count)
2. **Key Decisions** (if any)
3. **Unresolved Questions** (if any)
4. **Full Thread Transcript**

### Thread Metadata Template

```markdown
**Participants:** [List of names, comma-separated]
**Date:** [Start date] (or [Start] to [End] for multi-day threads)
**Messages:** [N]
**Channel:** [If detectable from export, otherwise omit]
```

### Full Thread Transcript Template

```markdown
## Thread Transcript

---

**[Author Name]** — [Timestamp]

[Message body, preserving line breaks]

[Emoji reactions if present: ✅ 3, 👍 2]

---

**[Next Author]** — [Timestamp]

[Message body]

---
```

Use horizontal rules (`---`) to separate messages for readability.

---

## Enhanced Frontmatter

Update the frontmatter received from router:

### `one_line_description`

Generate a concise summary:
- Template: "Slack thread discussing [main topic] [with whom/for what]"
- Examples:
  - "Slack thread discussing [TOOL_A] integration requirements for [PRODUCT]"
  - "Slack thread about compliance benchmark prioritization with [CUSTOMER_1] context"
  - "Slack thread exploring MCP server authentication options"

Extract main topic from:
1. Thread subject (if present in first message)
2. Most frequently mentioned technical terms
3. Jira issue titles if linked

### `related_customers`

Scan message bodies for customer mentions:
- Match against `/context/customer-profiles/*.json` canonical names
- Common patterns: "[CUSTOMER_1] asked for this", "[CUSTOMER_2] needs", "feedback from UWM"
- Add to array if found

### `related_jira`

Extract Jira issue keys:
- Pattern: `[PROJECT_KEY]-\d+`, `[FR_PROJECT_KEY]-\d+`
- Include issues mentioned in URLs: `https://[company].atlassian.net/browse/[PROJECT_KEY]-001`
- Add to array (unique values only)

---

## Edge Cases

### Single-Message Thread
If only one message (no replies):
- Still save as thread document
- Omit "Unresolved Questions" section (no back-and-forth)
- Include in metadata: `Messages: 1 (no replies)`

### Truncated Export
If thread appears incomplete (e.g., "Show more messages" indicator):
- Add note at end: `*[Thread may be truncated — full export not available]*`
- Flag in stats: `"truncated": true`

### Non-English Content
Preserve original language, no translation. If thread is entirely non-English:
- Note in `one_line_description`: "Slack thread discussing [topic] (language: [code])"

### Mixed Thread + Channel Export
If export contains multiple threads:
- Parse only the first thread
- Warn user: "Export contains multiple threads — ingested first thread only. Run ingestion separately for each thread."

---

## Progress Signals

```
⚙️  ingest-slack-thread — parsing thread structure...
   ✓ Parsed 12 messages from 5 participants
   ✓ Extracted 3 key decisions
   ✓ Found 2 unresolved questions
   ✓ Detected related context: [CUSTOMER_1], [PROJECT_KEY]-001
   ✓ Generated one-line description
```

---

## Worked Example (abbreviated)

**Input content**:
```
Product Sync - [TOOL_A] Integration
Feb 20, 2026

John Doe
9:45 AM
We need to prioritize [TOOL_A] integration for [PRODUCT]. [CUSTOMER_1] is blocked on this — they can't use [PRODUCT]'s vuln scanning without [TOOL_A] support.

Jane Smith replied to this thread
9:47 AM
Agreed. This ties into [PROJECT_KEY]-001 (Vulnerability Data epic). Should we support [TOOL_A] + [DEFAULT_SCANNER] side-by-side or make it a toggle?

John Doe
9:50 AM
Let's start with a toggle at the registry level. Dual-provider mode can be Phase 2.
✅ 3

Jane Smith
9:52 AM
Sounds good. One open question: do we need [TOOL_A] API credentials or can customers push pre-scanned results?
```

**Output frontmatter**:
```yaml
---
project_tag: "[TOOL_A] Integration"
one_line_description: "Slack thread discussing [TOOL_A] integration requirements for [PRODUCT] registry-level scanning"
doc_type: slack_thread
date_ingested: 2026-02-21
related_customers: ["[CUSTOMER_1]"]
related_jira: ["[PROJECT_KEY]-001"]
related_docs: []
---
```

**Output body** (abbreviated):
```markdown
# [TOOL_A] Integration

**Participants:** John Doe, Jane Smith
**Date:** Feb 20, 2026
**Messages:** 4

## Key Decisions

* Start with registry-level toggle between [TOOL_A] and [DEFAULT_SCANNER]; defer dual-provider mode to Phase 2 — John Doe, 9:50 AM

## Unresolved Questions

* Do we need [TOOL_A] API credentials or can customers push pre-scanned results? — raised by Jane Smith, 9:52 AM

## Thread Transcript

---

**John Doe** — 9:45 AM

We need to prioritize [TOOL_A] integration for [PRODUCT]. [CUSTOMER_1] is blocked on this — they can't use [PRODUCT]'s vuln scanning without [TOOL_A] support.

---

**Jane Smith** — 9:47 AM

Agreed. This ties into [PROJECT_KEY]-001 (Vulnerability Data epic). Should we support [TOOL_A] + [DEFAULT_SCANNER] side-by-side or make it a toggle?

---

**John Doe** — 9:50 AM

Let's start with a toggle at the registry level. Dual-provider mode can be Phase 2.

✅ 3

---

**Jane Smith** — 9:52 AM

Sounds good. One open question: do we need [TOOL_A] API credentials or can customers push pre-scanned results?

---
```

---

## Notes

- Preserve all original content (don't summarize or paraphrase messages)
- Timestamps are kept as-is from the export (no timezone conversion)
- If a thread references other threads, note the links but don't fetch them
- Emoji reactions are preserved for context but not analyzed further
