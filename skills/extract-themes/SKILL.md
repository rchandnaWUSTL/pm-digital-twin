# Skill: Extract Themes

## Purpose
Identify recurring themes from customer call notes. A single focused LLM call. Runs in parallel with other extraction tools during the branch phase.

---

## Input

The formatted field notes markdown content for one or more calls.

---

## Output Schema

```json
{
  "themes": [
    {
      "title": "string — concise theme name",
      "evidence": ["string — direct quotes or paraphrases from the notes supporting this theme"],
      "frequency": "number — how many times this theme appears across the input notes",
      "customers_mentioning": ["string — customer names who raised this theme"]
    }
  ]
}
```

---

## Instructions

1. Read the provided note content carefully
2. Identify distinct recurring themes — topics that appear multiple times or carry significant weight
3. For each theme:
   - Give it a concise, descriptive title (e.g. "[TOOL_A] integration for vulnerability scanning", not "Security")
   - Extract 1–3 direct quotes or close paraphrases as evidence
   - Count frequency across the input
   - List which customers mentioned it
4. Keep themes meaningfully distinct — do not over-merge (e.g. "CIS benchmarks" and "vulnerability scanning" are separate themes even though both relate to security)
5. Do not invent themes not supported by the notes
6. Order themes by frequency (highest first)

---

## Progress Signals

```
⚙️  extract-themes — analyzing [customer] notes for recurring themes...
   ✓ extract-themes — N themes found
```
