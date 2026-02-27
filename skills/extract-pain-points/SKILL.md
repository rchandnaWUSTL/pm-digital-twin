# Skill: Extract Pain Points

## Purpose
Identify friction, blockers, and workarounds from customer call notes. A single focused LLM call. Runs in parallel with other extraction tools during the branch phase.

---

## Input

The formatted field notes markdown content for one or more calls.

---

## Output Schema

```json
{
  "pain_points": [
    {
      "description": "string — concise description of the pain point",
      "severity": "high | medium | low",
      "workaround": "string — what the customer is doing to work around this, or null if none",
      "customer": "string — customer experiencing this pain",
      "evidence": "string — direct quote or paraphrase from the notes"
    }
  ]
}
```

---

## Instructions

1. Read the provided note content carefully
2. Identify points of friction, blockers, and workarounds the customer described
3. A pain point is something causing the customer difficulty, slowing them down, or forcing them to build workarounds
4. For each pain point:
   - Write a concise description of the problem
   - Assess severity:
     - **high**: Blocking adoption, causing security/compliance risk, or costing significant effort
     - **medium**: Causing friction but they have a workaround
     - **low**: Minor inconvenience or cosmetic issue
   - Note any workaround the customer described (or null if none mentioned)
   - Include supporting evidence
5. Do NOT invent pain points not described in the notes
6. Distinguish between pain points (problems they have) and asks (things they want) — this tool captures problems, not requests

---

## Progress Signals

```
⚙️  extract-pain-points — identifying friction and blockers in [customer] notes...
   ✓ extract-pain-points — N pain points found
```
