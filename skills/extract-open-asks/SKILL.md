# Skill: Extract Open Asks

## Purpose
Identify explicit feature requests and asks from customer call notes. A single focused LLM call. Runs in parallel with other extraction tools during the branch phase.

---

## Input

The formatted field notes markdown content for one or more calls.

---

## Output Schema

```json
{
  "open_asks": [
    {
      "ask": "string — concise description of the feature request or ask",
      "evidence": "string — direct quote or paraphrase from the notes",
      "first_raised": "YYYY-MM-DD — date the ask was first mentioned in the input",
      "customer": "string — customer who raised this ask",
      "times_mentioned": "number — how many times across input notes"
    }
  ]
}
```

---

## Instructions

1. Read the provided note content carefully
2. Identify explicit feature requests, enhancement asks, or capability gaps the customer raised
3. An "ask" must be something the customer explicitly requested or strongly implied they need — not a general discussion topic
4. For each ask:
   - Write a concise, specific description (e.g. "[TOOL_A] integration as vulnerability scanning option", not "better scanning")
   - Include the supporting evidence — a direct quote or close paraphrase
   - Record the date it was first mentioned in the provided notes
   - Record which customer raised it
5. Do NOT hallucinate asks that aren't in the source notes
6. Do NOT count general discussion topics as asks — only explicit requests
7. If an ask appears in multiple notes, consolidate into one entry with the earliest first_raised date and total times_mentioned

---

## Progress Signals

```
⚙️  extract-open-asks — scanning [customer] notes for feature requests...
   ✓ extract-open-asks — N asks found
```
