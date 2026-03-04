# Skill: Map Customer Asks to Existing Jira Issues

## Purpose
Given a list of customer asks from `extract-open-asks`, determine for each ask whether a matching [PROJECT_KEY] issue already exists, or whether a new issue should be created. Be conservative — when in doubt, flag for human review rather than auto-matching.

This is a single focused LLM call. It runs in parallel with other extraction tools during the branch phase.

---

## Input
```json
{
  "asks": [
    {
      "ask": "[TOOL_A] integration as vulnerability scanning option",
      "customer": "[CUSTOMER_1]",
      "evidence": "Already [TOOL_A] customers — required for certain scan types",
      "first_raised": "2026-01-15"
    }
  ],
  "open_issues_snapshot": "path to /context/product-context/jira-snapshot.json"
}
```

The `open_issues_snapshot` is a JSON file containing all non-Closed [PROJECT_KEY] issues, fetched via Atlassian MCP at session start and cached locally. Do not make live Jira calls during this step.

---

## Output Schema
```json
{
  "matched": [
    {
      "ask": "[TOOL_A] integration as vulnerability scanning option",
      "customer": "[CUSTOMER_1]",
      "jira_issue": "[PROJECT_KEY]-001",
      "jira_title": "Vulnerability Data in [PRODUCT]",
      "match_confidence": "low",
      "match_reason": "Both concern vulnerability scanning but [PROJECT_KEY]-001 is broad — flagging for human review",
      "recommended_action": "review"
    }
  ],
  "unmatched": [
    {
      "ask": "Fixed version column in vulnerability table",
      "customer": "[CUSTOMER_1]",
      "recommended_action": "create_new",
      "suggested_epic": "[PROJECT_KEY]-001",
      "suggested_title": "Add fixed version column to vulnerability table"
    }
  ],
  "flagged_for_review": [
    {
      "ask": "...",
      "reason": "Possible match to [PROJECT_KEY]-2462 but scope unclear — needs PM judgment"
    }
  ]
}
```

---

## Matching Rules

### Match when ALL of these are true:
- Core functionality overlap AND similar scope (specific feature, not broad theme)
- Specific tool/vendor name matches (e.g. "[TOOL_A]" in both = strong signal)
- Existing issue is NOT Closed
- Existing issue is NOT a sub-task

### Create new when ANY of these is true:
- Different scope (e.g. "[TOOL_A] integration" != "Generic scanner API")
- Existing issue is Closed (even if description matches)
- Request is additive to existing work, not the same feature
- No existing issue has meaningful overlap

### Flag for human review when:
- Possible match exists but confidence is low
- Ask could match multiple existing issues
- Existing issue title is broad and might or might not encompass the ask

**When in doubt, flag, don't match.**

---

## Calibration Examples

| Ask | Existing Issue | Decision | Reason |
|---|---|---|---|
| "[TOOL_A] integration as scanner" | [PROJECT_KEY]-001 "Vulnerability Data in [PRODUCT]" | No match — flag for review | Too broad; [PROJECT_KEY]-001 covers vulnerability data generally |
| "[TOOL_A] integration as scanner" | "Add [TOOL_A] as vulnerability scanner option" (hypothetical) | Match | Exact feature match |
| "Compliance benchmark reporting" | [PROJECT_KEY]-002 "Image Compliance Reporting & Governance" | Match | Compliance benchmarks are explicitly in scope of this epic |
| "Multi-region image support" | [PROJECT_KEY]-2477 "[PRODUCT_SHORT] Multi-Region Support" | Match | Same feature |
| "Fixed version column in vuln table" | [PROJECT_KEY]-2462 "Vuln Scanning Enhancements" | No match — create new | Specific UI ask, not the same as general enhancements |

---

## Match Confidence Levels

- `high` — specific feature name or vendor matches, scope aligns exactly, recommend update existing
- `medium` — related area, partial overlap, flag for review
- `low` — same broad theme but different scope, flag for review, lean toward create new

Only `high` confidence matches should be passed to `update-jira-issue`. `medium` and `low` always go to `flagged_for_review` for HITL-2.

---

## Naming Conventions to Know
| Term | Meaning |
|---|---|
| [PLATFORM] | [COMPANY] Cloud Platform |
| Core | [PRODUCT_SHORT] CLI |
| Vuln | Vulnerability |
| SBOM | Software Bill of Materials |
| CV | Continuous Verification |
| VMP | Vendor Management Program |

---

## Progress Signal
```
⚙️  map-to-existing-jira — matching N asks against 50 open [PROJECT_KEY] issues...
✓ map-to-existing-jira — N matched (high confidence), N flagged for review, N unmatched
```