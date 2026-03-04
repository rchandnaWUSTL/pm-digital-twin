# Skill: Get Notes by Topic

## Purpose
Search across all customer notes for a given keyword or topic. Returns matching note files with relevant excerpts. Used by the PRD pipeline and ad-hoc queries.

---

## Input

A keyword or topic string (e.g. "compliance benchmarks", "[TOOL_A]", "vulnerability scanning").

---

## Output Schema (Topic Search)

```json
{
  "query": "string — the search keyword/topic",
  "generated_at": "YYYY-MM-DD",
  "matches": [
    {
      "file": "string — note filename",
      "customer": "string — customer name",
      "call_date": "YYYY-MM-DD",
      "excerpts": ["string — relevant passages from the note"]
    }
  ],
  "total_matches": "number — count of matching files"
}
```

---

## Instructions

1. Search all files in `/context/customer-notes/` for the given keyword/topic
2. Use semantic matching, not just exact string matching — "vuln scanning" should match "vulnerability scanning"
3. For each matching file:
   - Extract the customer name and date from the filename
   - Pull 1–3 relevant excerpts (direct quotes or key passages)
4. Order results by relevance (most relevant first), then by date (most recent first)
5. If no matches found, return an empty matches array with total_matches: 0

---

## Progress Signals

```
⚙️  get-notes-by-topic — searching notes for "[query]"...
   ✓ get-notes-by-topic — N matches across M customers
```
