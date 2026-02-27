# Skill: Create Jira Issue for Customer Ask

## Purpose
Create a single new [PROJECT_KEY] Jira issue for one customer ask that has no matching existing issue. Called in parallel for each approved unmatched ask after HITL-2 approval. One LLM call per issue.

This skill only runs after explicit human approval at HITL-2. Never create issues autonomously.

---

## Input
```json
{
  "ask": "Fixed version column in vulnerability table",
  "customer": "[CUSTOMER_1]",
  "evidence": "Requested for SLA tracking — needs to know what version fixes each CVE",
  "first_raised": "2025-11-12",
  "times_mentioned": 2,
  "customers_mentioning": ["[CUSTOMER_1]"],
  "suggested_epic": "[PROJECT_KEY]-001",
  "suggested_title": "Add fixed version column to vulnerability table"
}
```

---

## Output Schema
```json
{
  "action": "created",
  "jira_issue": "[PROJECT_KEY]-XXXX",
  "title": "Add fixed version column to vulnerability table",
  "url": "https://[company].atlassian.net/browse/[PROJECT_KEY]-XXXX",
  "status": "Pending Triage",
  "epic_linked": "[PROJECT_KEY]-001"
}
```

---

## Issue Construction Rules

### Always set:
- `project`: `[PROJECT_KEY]`
- `issuetype`: `Story` (default for feature/enhancement asks from customers)
- `labels`: `["form", "intake"]`
- `status`: Leave as `Pending Triage` — never set programmatically
- `assignee`: Leave unassigned — never set
- `priority`: Leave as default `"New - Needs Prioritization"` — never set
- `[CUSTOM_FIELD_CUSTOMER_NAME]` (Customer Name): Set to canonical customer name

### Set when available:
- `parent`: Link to relevant epic if one clearly applies (use suggested_epic from map-to-existing-jira)
- `[CUSTOM_FIELD_TICKET_NUMBER]` (Zendesk Ticket): Set if Zendesk ticket number is in the evidence
- `components`: Set to `[PLATFORM] BE`, `[PLATFORM] FE`, or `Core` only if clearly implied by the ask

### Never set:
- Status (leave as Pending Triage)
- Assignee
- Priority
- Due date
- Sprint
- Story points

---

## Title Construction

Use descriptive, clear titles. No strict verb/noun convention — match the style of existing [PROJECT_KEY] issues.

Good examples from [PROJECT_KEY]:
- "Add fixed version column to vulnerability table"
- "[PRODUCT_SHORT] Multi-Region Support"
- "Vuln Scanning Enhancements"
- "Add Build Version filter dropdown"

Prefix with scope when clear:
- `[PLATFORM]:` for cloud-only features
- `Core:` for CLI features
- `Backend:` / `Frontend:` for layer-specific work

---

## Description Template

```
## Customer Request

**Customer:** [canonical customer name]
**Date raised:** [YYYY-MM-DD]
**Times mentioned:** [N] ([customer names])

## What they asked for

[Plain language description of the ask — 2-4 sentences]

## Evidence

> "[Direct quote or paraphrase from notes]" — [Customer], [date]

## Context

[Relevant background: stack, use case, why they need this, any urgency signals]

---
*Created by PM Intelligence System from field notes dated [date]*
```

---

## Epic Matching Reference

Use this to pick the right parent epic when `suggested_epic` is provided:

| Epic | Title | Use for |
|---|---|---|
| [PROJECT_KEY]-001 | Vulnerability Data in [PRODUCT] | Vuln scanning, [DEFAULT_SCANNER], [TOOL_A], CVE data |
| [PROJECT_KEY]-002 | Image Compliance Reporting & Governance | CIS benchmarks, compliance reporting |
| [PROJECT_KEY]-003 | Enterprise Readiness | Auth, SSO, enterprise security |
| [PROJECT_KEY]-004 | Enforced Provisioners - Phase 1 | Provisioner control |
| [PROJECT_KEY]-005 | Channel Assignment Management | Channel/version management |
| [PROJECT_KEY]-006 | Native SBOM Generation | SBOM |

If no epic clearly applies, leave `parent` unset and note it in the description.

---

## Atlassian MCP Call

Use the Atlassian MCP `create_issue` tool with this structure:
```json
{
  "project": { "key": "[PROJECT_KEY]" },
  "summary": "[constructed title]",
  "issuetype": { "name": "Story" },
  "description": "[formatted description]",
  "labels": ["form", "intake"],
  "[CUSTOM_FIELD_CUSTOMER_NAME]": "[customer name]",
  "parent": { "key": "[epic key if applicable]" }
}
```

---

## Progress Signal
```
⚙️  create-jira-issue — creating: "[title]"...
✓ Created [PROJECT_KEY]-XXXX — "[title]" → https://[company].atlassian.net/browse/[PROJECT_KEY]-XXXX
```