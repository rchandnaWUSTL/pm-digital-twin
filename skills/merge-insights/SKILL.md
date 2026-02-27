# Skill: Merge Insights

## Purpose
Deterministic merge of all branch extraction outputs into a unified Insights JSON. No LLM call -- this is a structured data merge operation.

---

## Input

The outputs from all five parallel extraction tools:
- `extract-themes` output
- `extract-open-asks` output
- `extract-pain-points` output
- `extract-tool-signals` output
- `map-to-existing-jira` output

Plus metadata:
- Source note file path(s)
- Customer name(s)
- Date

---

## Output Schema (Insights JSON)

```json
{
  "generated_at": "YYYY-MM-DD",
  "source_calls": ["customer-date.md"],
  "source_customers": ["Customer Name"],
  "themes": [
    {
      "title": "string",
      "frequency": "number",
      "customers_mentioning": ["string"],
      "evidence": ["string"],
      "jira_issue": "[PROJECT_KEY]-XXX or null",
      "recommended_action": "update_existing | create_new | none"
    }
  ],
  "open_asks": [
    {
      "ask": "string",
      "customer": "string",
      "times_mentioned": "number",
      "jira_issue": "[PROJECT_KEY]-XXX or null",
      "recommended_action": "update_existing | create_new"
    }
  ],
  "pain_points": [
    {
      "description": "string",
      "severity": "high | medium | low",
      "workaround": "string or null",
      "customer": "string"
    }
  ],
  "tool_signals": [
    {
      "name": "string",
      "context": "string",
      "sentiment": "string",
      "customer": "string"
    }
  ],
  "jira_matches": {
    "matched": [
      { "ask": "string", "jira_issue": "[PROJECT_KEY]-XXX", "confidence": "high | medium" }
    ],
    "unmatched": [
      { "ask": "string", "reason": "string" }
    ],
    "flagged_for_review": [
      { "ask": "string", "candidate_issue": "[PROJECT_KEY]-XXX", "reason": "string" }
    ]
  },
  "net_new_signals": ["string — signals with no existing Jira issue"]
}
```

---

## Merge Rules

1. Copy `themes` directly from extract-themes output
2. Copy `open_asks` from extract-open-asks output, enriching each with jira matching info from map-to-existing-jira
3. Copy `pain_points` from extract-pain-points output
4. Copy `tool_signals` from extract-tool-signals output
5. Copy `jira_matches` from map-to-existing-jira output
6. Compute `net_new_signals`: any open_asks or themes where jira_issue is null
7. Set `recommended_action` on each ask/theme based on jira matching:
   - Matched with high confidence -> `update_existing`
   - Unmatched -> `create_new`
   - Flagged for review -> leave for HITL-2

---

## Output Path

Write to `/context/insights/{customer}-{date}.json`

---

## Progress Signals

```
[DONE] All 5 extractions complete — merging insights...
[DONE] Insights written to /context/insights/{customer}-{date}.json
```
