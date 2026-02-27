# Failure Taxonomy

Living document — updated after each error analysis session.

---

## Open Coding Notes

_Raw observations from reading pipeline outputs. Add notes here as you review traces._

---

## Axial Categories

_Grouped failure patterns derived from open coding notes._

---

## Failure Counts by Skill

| Skill | Total Failures | Most Common Failure | Last Updated |
|---|---|---|---|
| `extract-open-asks` | | | |
| `extract-themes` | | | |
| `extract-pain-points` | | | |
| `extract-tool-signals` | | | |
| `map-to-existing-jira` | | | |
| `merge-insights` | | | |
| `format-field-notes` | | | |
| `update-customer-profile` | | | |
| `insights-onepager` | | | |

---

## Transition Failure Matrix

_Build after 20+ real pipeline runs. Rows = last successful step. Columns = where first failure occurred._

```
                      │ format │ update- │ extract │ merge  │ map-   │ insights │ jira-  │
                      │ -notes │ profile │ -asks   │ -insig │ -jira  │ -onepgr  │ writes │
──────────────────────┼────────┼─────────┼─────────┼────────┼────────┼──────────┼────────┤
format-field-notes    │   —    │         │         │        │        │          │        │
update-customer-prof  │        │   —     │         │        │        │          │        │
extract-open-asks     │        │         │   —     │        │        │          │        │
merge-insights        │        │         │         │   —    │        │          │        │
map-to-existing-jira  │        │         │         │        │   —    │          │        │
insights-onepager     │        │         │         │        │        │    —     │        │
```
