# Skill: Get Untracked Asks

## Purpose
Scan all customer profiles for open asks that have no linked Jira issue (jira_issue is null). Surfaces gaps in backlog coverage.

---

## Input

None — reads all profiles in `/context/customer-profiles/`.

---

## Output Schema (Untracked Asks)

```json
{
  "generated_at": "YYYY-MM-DD",
  "untracked_asks": [
    {
      "ask": "string — the feature request",
      "customer": "string — customer name",
      "first_raised": "YYYY-MM-DD",
      "times_mentioned": "number",
      "evidence": "string — supporting context"
    }
  ],
  "total_count": "number"
}
```

---

## Instructions

1. Read all JSON files in `/context/customer-profiles/`
2. For each profile, check the `open_asks` array
3. Collect any ask where `jira_issue` is `null`
4. For each untracked ask, pull evidence from the customer's notes if available
5. Order by times_mentioned (highest first), then by first_raised (oldest first)
6. Return the full list with total count

---

## Progress Signals

```
⚙️  get-untracked-asks — scanning profiles for asks without Jira issues...
   ✓ get-untracked-asks — N untracked asks found across M customers
```
