# Skill: Extract Tool Signals

## Purpose
Identify tools, integrations, and competitors mentioned in customer call notes. A single focused LLM call. Runs in parallel with other extraction tools during the branch phase.

---

## Input

The formatted field notes markdown content for one or more calls.

---

## Output Schema

```json
{
  "tools": [
    {
      "name": "string — tool, product, or integration name",
      "context": "string — how the customer mentioned it (using it, evaluating it, requesting integration, etc.)",
      "sentiment": "positive | neutral | negative | requested",
      "customer": "string — customer who mentioned this tool"
    }
  ]
}
```

---

## Instructions

1. Read the provided note content carefully
2. Identify all tools, products, integrations, vendors, and competing solutions mentioned
3. For each tool signal:
   - Use the canonical product name (e.g. "[TOOL_A]", not "[TOOL_A] scanner")
   - Describe the context: are they using it, evaluating it, requesting integration with [PRODUCT], or comparing it?
   - Assess sentiment:
     - **positive**: Customer likes it, wants integration, actively using it successfully
     - **neutral**: Mentioned in passing, no strong opinion
     - **negative**: Customer had problems with it, switching away from it
     - **requested**: Customer explicitly asked for [PRODUCT] to integrate with it
4. Include both [COMPANY] products (Terraform, [PRODUCT_C], etc.) and third-party tools
5. Do NOT invent tool mentions not in the notes

---

## Progress Signals

```
⚙️  extract-tool-signals — scanning [customer] notes for tool and integration mentions...
   ✓ extract-tool-signals — N tool signals found
```
