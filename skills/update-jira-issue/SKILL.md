# Skill: Update Jira Issue with New Customer Evidence

## Purpose
Add a comment to an existing [PROJECT_KEY] issue with new customer evidence from a recent call. Called in parallel for each approved high-confidence match after HITL-2 approval. One LLM call per issue — never batch multiple issues in one call.

This skill only runs after explicit human approval at HITL-2. Never update issues autonomously.

---

## Input
```json
{
  "jira_issue": "[PROJECT_KEY]-001",
  "jira_title": "Vulnerability Data in [PRODUCT]",
  "ask": "[TOOL_A] integration as vulnerability scanning option",
  "customer": "[CUSTOMER_1]",
  "new_evidence": "Already [TOOL_A] customers — required for certain scan types. Security architect [CONTACT_NAME] confirmed [TOOL_A] is mandatory in their stack.",
  "call_date": "2026-02-19",
  "times_mentioned_total": 3,
  "all_customers_mentioning": ["[CUSTOMER_1]", "[CUSTOMER_2]"]
}
```

---

## Output Schema
```json
{
  "action": "updated",
  "jira_issue": "[PROJECT_KEY]-001",
  "jira_title": "Vulnerability Data in [PRODUCT]",
  "url": "https://[company].atlassian.net/browse/[PROJECT_KEY]-001",
  "comment_added": true,
  "comment_preview": "New customer evidence — [CUSTOMER_1], Feb 19..."
}
```

---

## What to Update

### Always: Add a comment
New customer evidence goes in a comment, not in the description body (which may have existing formatting you shouldn't overwrite).

### Optionally: Add labels
If the issue doesn't already have `form` and `intake` labels, add them.

### Never:
- Change status
- Change assignee
- Change priority
- Change title/summary
- Edit existing description content
- Set due date, sprint, or story points
- Resolve or close the issue

---

## Comment Template

```
**New customer evidence — [Customer], [call date]**

[Customer] raised this in a [call type: design review / discovery call / check-in] on [date].

> "[Direct quote or paraphrase from notes]"

**Signal strength update:**
This ask has now been raised [N] times total by [customer list].

[Any new urgency, context, or nuance not captured in the original issue]

---
*Added by PM Intelligence System from field notes dated [date]*
```

---

## Tone and Content Rules

- Be specific — include actual quotes or close paraphrases from the notes
- Note if urgency has increased ("now a blocker", "blocked their compliance audit")
- Note new contacts who raised it ("security architect [CONTACT_NAME] now involved")
- Do not repeat information already in the issue description unless adding new context
- Keep it concise — 3-6 sentences of evidence, not a full summary

---

## Worked Example

**Input ask:** "[TOOL_A] integration as vulnerability scanning option" — [CUSTOMER_1], Feb 19
**Target issue:** [PROJECT_KEY]-001 "Vulnerability Data in [PRODUCT]"
**Previous evidence:** [CUSTOMER_1] raised this in November

**Comment to add:**
```
**New customer evidence — [CUSTOMER_1], Feb 19, 2026**

[CUSTOMER_1] raised [TOOL_A] integration again in a design review on Feb 19. Security architect [CONTACT_NAME]
(now joining calls) confirmed [TOOL_A] is mandatory in their security stack and they cannot use
[DEFAULT_SCANNER]-only scanning for compliance reasons.

> "We're already paying for [TOOL_A] — we need it to be the scanner, not an add-on"

**Signal strength update:**
This ask has now been raised 3 times total by [CUSTOMER_1] (Nov 2025, Jan 2026, Feb 2026)
and once by [CUSTOMER_2] (Jan 2026). 2 lighthouse customers, 4 total mentions.

New urgency: [CONTACT_NAME]'s involvement suggests this is now a security team requirement, not just
a PM preference.

---
*Added by PM Intelligence System from field notes dated 2026-02-19*
```

---

## Atlassian MCP Call

Use the Atlassian MCP `add_comment` tool:
```json
{
  "issue_key": "[PROJECT_KEY]-001",
  "body": "[formatted comment]"
}
```

If labels need updating, use `update_issue` separately:
```json
{
  "issue_key": "[PROJECT_KEY]-001",
  "labels": ["form", "intake"]
}
```

---

## Progress Signal
```
⚙️  update-jira-issue — adding evidence to [PROJECT_KEY]-001 "Vulnerability Data in [PRODUCT]"...
✓ Updated [PROJECT_KEY]-001 — comment added → https://[company].atlassian.net/browse/[PROJECT_KEY]-001
```