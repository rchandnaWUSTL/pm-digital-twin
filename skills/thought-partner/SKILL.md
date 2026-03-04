# Skill: Thought Partner

## Purpose

An optional product thinking framework that interrogates whether a proposed solution is the right one before committing to writing docs. Applies JTBD clarity, friction analysis, nudge design, satisfaction prediction, and SCAMPER to challenge the default approach and surface better alternatives.

**This skill is explicitly opt-in. It never runs automatically.** [PM_NAME] must invoke it with a flag or standalone request.

---

## Input

- **Topic or question**: The feature, solution, or product decision to examine (e.g. "Should we build provider selection for vuln scanning?", "Vulnerability Scanning Provider Selection PRD")
- **Downstream task reference** (optional): If the thought partner is being used as a pre-step before another task (e.g. "Write a PRD for X --think"), capture the downstream task so it can be triggered on resume

---

## Invocation

The thought partner is invoked in one of three ways:

1. **Flag on any task request**: Append `--think` or `with thought partner` to any request
   - Example: `"Write a PRD for vulnerability scanning provider selection --think"`
   - Example: `"Write a PRFAQ for SBOM generation with thought partner"`
   - The thought partner runs first, suspends for approval, then the downstream task runs on resume

2. **Standalone**: Invoke directly with no downstream task
   - Example: `"Think through whether we should build native compliance benchmarking"`
   - Example: `"Run thought partner on channel assignment management"`

3. **Explicit skill name**: `"Run thought-partner on [topic]"`

All three invocations produce the same analysis. The only difference is whether a downstream task is queued.

---

## Output

A structured markdown analysis written to stdout (displayed to [PM_NAME]). Not saved to a file unless [PM_NAME] requests it.

---

## Framework

The analysis proceeds through 5 stages in order. Each stage builds on the previous one.

### Stage 1: JTBD Clarity

Establish the core job the customer is hiring this solution to do.

- **Core goal**: What is the customer actually trying to accomplish? (Not what they asked for — what they need.)
- **Urgency**: Why now? What changed that makes this pressing?
- **Stakes**: What happens if we don't solve this? What does the customer lose?
- **Alternatives**: How are customers solving this today without us? What are they switching from?
- **Hiring criteria**: What would make a customer "hire" this solution over their current approach?

### Stage 2: Friction Diagnosis

Identify sources of friction in the proposed solution that could prevent adoption or satisfaction.

- **Comprehension friction**: Will customers understand what this is and why they need it? Is the mental model clear?
- **Decision complexity**: How many choices does the customer face? Can we reduce decisions without reducing value?
- **Actionability**: Can the customer start using this immediately, or does it require setup, migration, or prerequisite work?
- **Cognitive load**: Does this add complexity to the customer's existing workflow? Does it introduce new concepts they need to learn?
- **Consistency**: Does this solution work the way other parts of [PRODUCT] work? Will it feel familiar?
- **Distractions**: Does the proposed scope include things that don't serve the core JTBD? Are there features in the proposal that exist because they're interesting, not because they're needed?

### Stage 3: Motivational Nudge Design

Identify what would motivate customers to adopt this solution and what might hold them back.

- **Intrinsic nudges**: What makes this inherently valuable? What "aha moment" does the customer experience?
- **Extrinsic nudges**: What external factors (compliance requirements, team mandates, cost savings) push adoption?
- **Adoption barriers**: What would make a customer see this and decide "not now" or "not for us"?
- **Rationale**: For each nudge and barrier, explain why it matters and how the solution design should account for it

### Stage 4: Satisfaction Evaluation

Predict whether this solution will actually satisfy customers after they adopt it.

- **Problem solved?**: Does this fully address the core JTBD, or does it leave the customer 80% of the way there with a gap they still have to fill manually?
- **Expectations exceeded?**: Is there anything about this solution that would pleasantly surprise customers? Or is it exactly what they expected and nothing more?
- **Retention risk**: After adopting this, what would make a customer stop using it or revert to their old workflow?
- **Advocacy potential**: Would a customer tell a peer about this? What would they say?

### Stage 5: Alternative Solution Challenge

Use SCAMPER and creativity prompts to challenge the proposed approach and generate alternatives.

**SCAMPER Analysis:**

- **Substitute**: What component of this solution could be replaced with something simpler, cheaper, or more familiar? What if we used a different technology, pattern, or integration approach?
- **Combine**: Can this be merged with an existing feature to deliver more value with less surface area? What if this wasn't a separate feature but an enhancement to something that already exists?
- **Adapt**: Is there a solution from another product, industry, or domain that we could adapt? How do competitors or adjacent tools solve this?
- **Modify**: What if we changed the scope — made it bigger, smaller, more opinionated, less opinionated? What if Phase 1 was half the size? What if it was twice the size?
- **Put to other use**: Could this solution serve a use case we haven't considered? Could the same mechanism solve a different customer problem?
- **Eliminate**: What if we didn't build this at all? What would customers actually lose? Is there a version of this where we remove the most complex part and still deliver 80% of the value?
- **Reverse**: What if we approached this from the opposite direction? Instead of [proposed approach], what if we [opposite]? What if the customer did this themselves and we just provided the building blocks?

**Creativity Prompts:**

- **"Think again"**: Set aside the first answer. What's a completely different way to solve the same JTBD?
- **"Why not both?"**: Are there two options being treated as mutually exclusive that could actually coexist?
- **"Make it unnecessary"**: Instead of solving this problem, what if we eliminated the condition that creates the problem in the first place?
- **"Combine unrelated ideas"**: Take a concept from a completely different domain (consumer apps, physical products, game design) and apply it here. What would this look like if it were designed by [different company/industry]?

---

## Output Format

```markdown
## Thought Partner Analysis: [topic]

### JTBD Clarity

**Core goal:** [what the customer actually needs]
**Urgency:** [why now]
**Stakes:** [what happens if we don't]
**Alternatives:** [how they solve it today]
**Hiring criteria:** [what would make them switch]

### Friction Diagnosis

| Friction Type | Assessment | Severity |
|---------------|-----------|----------|
| Comprehension | [assessment] | Low / Medium / High |
| Decision complexity | [assessment] | Low / Medium / High |
| Actionability | [assessment] | Low / Medium / High |
| Cognitive load | [assessment] | Low / Medium / High |
| Consistency | [assessment] | Low / Medium / High |
| Distractions | [assessment] | Low / Medium / High |

**Key friction risks:** [1-2 sentence summary of the biggest friction concerns]

### Motivational Nudge Design

**Intrinsic nudges:**
* [nudge] — [rationale]
* [nudge] — [rationale]

**Extrinsic nudges:**
* [nudge] — [rationale]
* [nudge] — [rationale]

**Adoption barriers:**
* [barrier] — [rationale]
* [barrier] — [rationale]

### Satisfaction Evaluation

* **Problem solved?** [assessment]
* **Expectations exceeded?** [assessment]
* **Retention risk:** [assessment]
* **Advocacy potential:** [assessment]

### Alternative Solution Challenge

**SCAMPER alternatives:**
* **Substitute:** [alternative]
* **Combine:** [alternative]
* **Adapt:** [alternative]
* **Modify:** [alternative]
* **Put to other use:** [alternative]
* **Eliminate:** [alternative]
* **Reverse:** [alternative]

**Creativity prompts:**
* **Think again:** [alternative approach]
* **Why not both?** [combined approach]
* **Make it unnecessary:** [root cause elimination]
* **Combine unrelated ideas:** [cross-domain inspiration]

### Recommendation

**Proceed with proposed approach?** [Yes / Yes with modifications / Explore alternative first / No]

**Rationale:** [2-3 sentences explaining the recommendation]

**If proceeding, watch out for:**
* [key risk or friction to mitigate]
* [key risk or friction to mitigate]

**Alternatives worth exploring:**
* [alternative 1 — one sentence]
* [alternative 2 — one sentence]
```

---

## HITL Suspend Behavior

The thought partner always suspends after generating its analysis (**HITL-TP**).

### On suspend:

1. Generate the complete analysis
2. Display it to [PM_NAME]
3. Write pending state to `/context/pending/thought-partner-{date}.pending.json`:

```json
{
  "pipeline": "thought-partner",
  "started_at": "ISO timestamp",
  "suspended_at": "ISO timestamp",
  "suspend_point": "HITL-TP",
  "suspend_reason": "awaiting_thought_partner_decision",
  "completed_steps": ["thought-partner-analysis"],
  "next_step": "downstream_task or none",
  "awaiting_approval": {
    "prompt": "Thought partner analysis complete for [topic]. How would you like to proceed?",
    "topic": "[topic]",
    "recommendation": "proceed | proceed_with_modifications | explore_alternative | no",
    "downstream_task": "[task description if flagged, null if standalone]",
    "alternatives_proposed": ["[alt 1]", "[alt 2]"]
  },
  "context": {
    "analysis_content": "[full markdown analysis]"
  }
}
```

### Resume options:

- **"Proceed"** or **"Approve"**: If a downstream task was queued, run it now. If standalone, close the pending file.
- **"Explore [alternative]"**: Re-run the thought partner analysis on the specified alternative. Creates a new pending state.
- **"Proceed with [modifications]"**: Pass the modifications as context to the downstream task.
- **"Stop"** or **"Cancel"**: Delete the pending file. No downstream task runs.

---

## Progress Signals

```
🧠 thought-partner — analyzing "[topic]"...
   ✓ JTBD clarity — core goal identified
   ✓ Friction diagnosis — [N] high-severity frictions found
   ✓ Nudge design — [N] intrinsic, [N] extrinsic nudges
   ✓ Satisfaction evaluation — [assessment]
   ✓ Alternative challenge — [N] SCAMPER alternatives, [N] creativity alternatives

⏸  PAUSED — Thought partner analysis complete ([topic])

   Recommendation: [proceed / proceed with modifications / explore alternative / no]
   Downstream task: [task description or "none (standalone)"]
   Alternatives proposed: [N]

   Run: "proceed with [topic]" to continue to downstream task
        "explore [alternative]" to re-analyze with a different approach
        "stop" to end without further action
```
