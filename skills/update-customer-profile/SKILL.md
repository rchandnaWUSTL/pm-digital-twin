# Skill: Update Customer Profile

## Purpose
Read the latest formatted field notes and the customer's existing profile, then output an updated profile JSON. Preserves all existing correct data while incorporating new information from the call.

---

## Input

1. Path to the new formatted field notes file
2. Path to the existing customer profile JSON (or null if first call)

---

## Output Schema (Customer Profile)

```json
{
  "customer": "string — canonical customer name",
  "tier": "lighthouse | standard",
  "last_call": "YYYY-MM-DD",
  "stack": ["string — tools and products in their stack"],
  "top_pain_points": ["string — current top pain points"],
  "open_asks": [
    {
      "ask": "string — feature request or ask",
      "first_raised": "YYYY-MM-DD",
      "times_mentioned": "number",
      "jira_issue": "[PROJECT_KEY]-XXX or null"
    }
  ],
  "jira_issues": ["[PROJECT_KEY]-XXX — all linked [PROJECT_KEY] issues"],
  "notes_files": ["filename.md — all note files for this customer"],
  "key_contacts": ["Name (role)"],
  "relationship_summary": "string — 1-2 sentence relationship overview"
}
```

---

## Instructions

1. Read the existing profile (if any) -- this is the baseline
2. Read the new notes file
3. Update the profile:
   - **last_call**: Set to the date of the new notes
   - **stack**: Add any new tools/products mentioned; do NOT remove existing entries
   - **top_pain_points**: Update based on latest call -- replace resolved pain points, add new ones
   - **open_asks**: Add new asks, increment times_mentioned for repeated asks, preserve first_raised dates and jira_issue links
   - **notes_files**: Append the new note filename (do NOT remove existing entries)
   - **key_contacts**: Add any new contacts mentioned; do NOT remove existing entries
   - **relationship_summary**: Update to reflect the latest state of the relationship
4. **Never overwrite correct existing data** -- this is an additive update, not a replacement
5. If this is the first call (no existing profile), create the profile from scratch

---

## Output Path

Write to `/context/customer-profiles/{canonical}.json`

---

## Progress Signals

```
[GEAR]  update-customer-profile — updating [customer] profile with [date] call data...
   [OK] Profile updated — [what changed summary]
```
