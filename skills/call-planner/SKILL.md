# Skill: Call Planner

## Purpose

Generate structured research questions for upcoming customer calls, rooted in **The Mom Test** methodology (Rob Fitzpatrick). Produces a call plan with context-aware questions designed to extract real behavioral data — not opinions, hypotheticals, or validation. This is the pre-call counterpart to the full-call-pipeline (post-call).

**This skill is explicitly opt-in.** [PM_NAME] must invoke it directly.

---

## Input

Three invocation modes, each with different context sources:

- **By customer**: A known customer name from `/context/customer-profiles/`
  - Example: `"Prep a call plan for [CUSTOMER_1]"`
  - Context: Customer profile JSON, all past notes for that customer, most recent insights JSON (if any), relevant product context files, Jira snapshot
- **By topic**: A feature area, keyword, or product capability
  - Example: `"Generate a call plan for vulnerability scanning"`
  - Context: Topic search across all customer notes, all customer profiles, relevant product context files, Jira snapshot, FR snapshot
- **By meeting context**: A prospect description or meeting briefing with no existing customer profile
  - Example: `"Prep a call plan for my meeting with a large FSI prospect evaluating container security"`
  - Context: Meeting description parsed for industry/company/topics, relevant product context files (semantic match on parsed topics), Jira snapshot

### Context Loading

| Mode | Sources Loaded |
|------|----------------|
| Customer | `customer-profiles/{canonical}.json`, all `/context/customer-notes/{canonical}-*.md`, most recent `/context/insights/{customer}-*.json` (if exists), semantically relevant `/context/product-context/` files, `jira-snapshot.json` |
| Topic | `get-notes-by-topic` results across all notes, all `/context/customer-profiles/*.json`, semantically relevant `/context/product-context/` files, `jira-snapshot.json`, `fr-snapshot.json` |
| Meeting | Parse meeting description for keywords/industry/company, semantically relevant `/context/product-context/` files, matching customer profile (if company maps to known customer), `jira-snapshot.json` |

### Graph Traversal (Context Enrichment)

After loading semantically relevant product context files:

1. **Parse wikilinks and frontmatter**: For each loaded product context file, extract `related_customers`, `related_jira`, `related_docs` from frontmatter and `[[wikilinks]]` from body
2. **Load 1-hop neighbors**: Read wikilinked customer profiles, related product docs (1 hop only, no recursion)
3. **Display traversal log**: Show user which related files were loaded
4. **Enrich question generation**: Use the additional context to identify deeper knowledge gaps and generate more targeted questions

See CLAUDE.md Graph Traversal for traversal pattern and resolution rules.

---

## Invocation

The call planner is invoked in one of four ways:

1. **By customer name**: `"Prep a call plan for [CUSTOMER_1]"`
2. **By topic**: `"Generate a call plan for vulnerability scanning"` or `"Call plan for SBOM"`
3. **By meeting context**: `"Prep a call plan for my meeting with a large FSI prospect evaluating container security"`
4. **With thought partner flag**: Append `--think` or `with thought partner` to any of the above
   - Example: `"Prep a call plan for [CUSTOMER_1] --think"`
   - The thought partner runs first, suspends for approval, then call-planner uses that analysis to inform question generation

---

## Output

A structured markdown call plan displayed to [PM_NAME]. **Not auto-saved.** [PM_NAME] says "save that call plan" to persist.

**File path (when saved)**: `/context/call-plans/{slug}-call-plan-{YYYY-MM-DD}.md`

Slugify the customer name or topic: lowercase, spaces to hyphens, strip characters that aren't alphanumeric or hyphens, collapse consecutive hyphens. Examples:
- "[CUSTOMER_1]" becomes `customer-1`
- "vulnerability scanning" becomes `vulnerability-scanning`
- "large FSI prospect container security" becomes `large-fsi-prospect-container-security`

**Collision handling**: If the file already exists, append a counter: `-2.md`, `-3.md`, etc. Never overwrite an existing file.

---

## Methodology

The call plan is generated through 3 stages in order. Each stage builds on the previous one.

### Stage 1: Context Synthesis & Gap Analysis

Before generating any questions, analyze all loaded context to identify what we know and what we don't.

**What we know** — Summarize from loaded context:
- Customer's current stack, tools, and integrations
- Past asks, pain points, and themes from previous calls
- Their tier, decision-makers, and organizational context
- Relevant product roadmap items and Jira status
- Competitive tools they use or have mentioned

**What we don't know** — Identify gaps across these categories:

| Gap Category | What to Look For |
|-------------|------------------|
| **Workflow gaps** | Steps in their process we haven't observed; how they actually use the feature day-to-day; who else is involved |
| **Decision gaps** | Who approves purchases; what budget cycle they're in; what alternatives they evaluated; what would make them switch |
| **Pain gaps** | Workaround costs we haven't quantified; downstream effects of current friction; how often the problem occurs |
| **Effort gaps** | How much time/money they spend on workarounds; team size dedicated to the problem; opportunity cost |
| **Timeline gaps** | When they need a solution; what's driving urgency; external deadlines (compliance, audits, contracts) |
| **Competitive gaps** | What other tools they've tried; why those didn't work; what they liked about them |

Questions in Stage 2 target these gaps, not confirmation of known facts.

### Stage 2: Question Generation (Mom Test)

Generate questions in three depth layers. Every question must pass the Mom Test anti-pattern filter (Stage 3) before inclusion.

#### Layer 1: Openers (2-3 questions)

Broad workflow questions that get the customer talking and reveal what they care about. These set the conversation direction.

**Patterns:**
- "Walk me through how your team handles [workflow]..."
- "Tell me about the last time you [relevant activity]..."
- "What does a typical [timeframe] look like for [role] on your team?"

**Rules:**
- Must be open-ended (no yes/no answers)
- Must reference their actual workflow, not a hypothetical
- Must not mention [PRODUCT] features or roadmap items
- Tag each question with a topic label: `[topic-tag]`

#### Layer 2: Deep Dives (4-6 questions)

Target specific knowledge gaps identified in Stage 1. Each question includes 1-2 conditional follow-up probes.

**Patterns:**
- "You mentioned [thing from past call] — what happened after that?"
- "When [specific scenario from their workflow] happens, what do you do next?"
- "How does your team decide [decision we don't understand]?"

**Rules:**
- Each question must target a specific gap from Stage 1
- Include 1-2 conditional follow-ups: *"If they mention X, ask: ..."*
- Ground in past behavior and real scenarios — never ask about hypothetical futures
- Each must have a parenthetical learning goal: *(Learning: [what we're trying to find out])*
- Tag each question with a topic label: `[topic-tag]`

#### Layer 3: Commitment & Decision (2-3 questions)

Test seriousness — budget, decision authority, what they've tried, timeline drivers. These reveal whether the customer will actually act.

**Patterns:**
- "What have you tried so far to solve [problem]?"
- "If you had [solution] today, what would you need to change on your end to adopt it?"
- "What's driving the timeline on this — is there an external deadline?"
- "Who else on your team would need to be involved in evaluating this?"

**Rules:**
- Must test real commitment, not hypothetical willingness
- Ask about actions they've already taken, not actions they might take
- Ask about constraints and blockers, not wishlists
- Tag each question with a topic label: `[topic-tag]`

### Stage 3: Mom Test Anti-Pattern Filter

Before including any question in the output, validate it against this checklist. If a question matches ANY anti-pattern, rewrite it.

#### Anti-Pattern Checklist

| Anti-Pattern | Example (Bad) | Why It Fails | Rewrite Pattern |
|-------------|---------------|-------------|-----------------|
| **Pitching disguised as asking** | "Would you use a [TOOL_A] integration if we built one?" | Reveals roadmap, invites compliments | "How do you get [TOOL_A] scan results into your registry workflow today?" |
| **Hypothetical future** | "If we added X, would that help?" | People can't predict their own behavior | "When did you last run into [problem X solves]? What did you do?" |
| **Rating scale** | "How important is SBOM on 1-10?" | Produces meaningless numbers | "Walk me through what happens when a customer asks for your SBOM." |
| **Feature wishlist** | "What features would you like to see?" | Gets generic answers, not real needs | "What's the most annoying part of your current workflow?" |
| **Yes/no without follow-up** | "Do you need CIS benchmarks?" | Gets agreement without understanding | "How does your team handle CIS compliance today?" |
| **Leading question** | "Don't you think provider selection would be useful?" | Telegraphs the desired answer | "How do you decide which scanning tools to use?" |
| **Compliment fishing** | "What do you think of our vulnerability scanning?" | Gets polite feedback, not real problems | "Tell me about the last vulnerability your team found. What happened next?" |
| **Solution-first** | "Would a dashboard for X work for you?" | Skips understanding the problem | "When you need to check X, where do you go and what do you look for?" |

#### Rewrite Rules

1. Replace hypotheticals with past-tense behavioral questions
2. Replace feature mentions with workflow questions
3. Replace rating scales with "walk me through" or "tell me about the last time"
4. Replace yes/no with open-ended alternatives
5. Remove any reference to [PRODUCT] roadmap, planned features, or unreleased capabilities

---

## Output Format

```markdown
## Call Plan: [Customer Name / Topic / Meeting Description]

**Mode:** [Customer / Topic / Meeting Context]
**Date:** [YYYY-MM-DD]
**Prepared for:** [PM_NAME]

---

### Context Summary

**What we know:**
* [Key fact from loaded context]
* [Key fact from loaded context]
* [Key fact from loaded context]

**What we don't know (target gaps):**
* [Gap category]: [Specific gap description]
* [Gap category]: [Specific gap description]
* [Gap category]: [Specific gap description]

---

### Research Objectives

1. [Learning goal — what we want to understand after this call]
2. [Learning goal]
3. [Learning goal]

---

### Openers

1. `[topic-tag]` [Open-ended workflow question]

2. `[topic-tag]` [Open-ended workflow question]

3. `[topic-tag]` [Open-ended workflow question]

---

### Deep Dives

1. `[topic-tag]` [Targeted question grounded in past behavior]
   *(Learning: [what we're trying to find out])*
   * If they mention [X], ask: "[follow-up probe]"
   * If they mention [Y], ask: "[follow-up probe]"

2. `[topic-tag]` [Targeted question grounded in past behavior]
   *(Learning: [what we're trying to find out])*
   * If they mention [X], ask: "[follow-up probe]"

3. `[topic-tag]` [Targeted question grounded in past behavior]
   *(Learning: [what we're trying to find out])*
   * If they mention [X], ask: "[follow-up probe]"
   * If they mention [Y], ask: "[follow-up probe]"

4. `[topic-tag]` [Targeted question grounded in past behavior]
   *(Learning: [what we're trying to find out])*
   * If they mention [X], ask: "[follow-up probe]"

---

### Commitment & Decision

1. `[topic-tag]` [Question testing real commitment or decision process]

2. `[topic-tag]` [Question testing real commitment or decision process]

3. `[topic-tag]` [Question testing real commitment or decision process]

---

### Traps to Avoid

* **Don't [specific anti-pattern for this context]** — instead, [what to do]
* **Don't [specific anti-pattern for this context]** — instead, [what to do]
* **Don't [specific anti-pattern for this context]** — instead, [what to do]

---

### Related Context

**Customer Profiles**: [[Customer A]] | [[Customer B]]
**Jira Tracking**: [[[PROJECT_KEY]-XXX]] (epic name) | [[[PROJECT_KEY]-YYY]] (issue title)
**Product Context**: [[related-doc-slug]] | [[another-doc-slug]]
```

---

## Traps to Avoid — Generation Rules

The "Traps to Avoid" section must be **context-specific**, not generic. Generate traps based on:

1. **Roadmap leaks**: If loaded context reveals planned features relevant to the call, warn against revealing them. Example: "Don't mention that [TOOL_A] integration is on the roadmap — ask about their workaround cost instead."
2. **Confirmation bias**: If past calls established a strong signal, warn against seeking validation. Example: "Don't ask [CUSTOMER_1] to confirm they want provider selection — we already know they do. Ask what happens after they select a provider."
3. **Pet topics**: If the customer repeatedly raises one topic, warn against spending the whole call there. Example: "CIS benchmarks will come up — acknowledge it, capture any new nuance, then steer to [gap area] where we have less data."
4. **Politeness traps**: If the customer is senior or the relationship is new, warn against accepting polite non-answers. Example: "If they say 'that would be nice,' follow up with 'tell me about the last time you needed that and didn't have it.'"
5. **Solution mode**: If [PM_NAME] has strong opinions about the solution, warn against pitching. Example: "Don't describe the provider abstraction architecture — ask how they handle multi-tool scan results today."

Generate 3-5 traps per call plan. Each must reference specific context (customer name, feature, or scenario) — never generic advice.

---

## Voice & Style Rules

1. **Questions over statements**: The output is a tool for conversation, not a report. Every question should be ready to speak aloud.
2. **Plain language**: Questions should use the customer's vocabulary, not [PRODUCT] internal jargon. Say "your scanning tool" not "your vulnerability data provider."
3. **Past tense over future tense**: "When did you last..." not "Would you ever..." — ground everything in real behavior.
4. **Specific over abstract**: "Walk me through how your team handled the last CVE-critical finding" not "Tell me about your vulnerability management process."
5. **No [PRODUCT] feature names in questions**: Questions should reference workflows and outcomes, not product capabilities. The customer shouldn't feel like they're being sold to.
6. **Conversational tone**: Questions should feel natural in a call, not like a survey. Avoid numbered lists when speaking — use transition phrases in the plan notes.

---

## Save Behavior

The call plan is **display-first** — it is shown to [PM_NAME] but not automatically saved.

### To save:

[PM_NAME] says "save that call plan" (or similar). On save:

1. Slugify the customer name, topic, or meeting description
2. Check for collision at `/context/call-plans/{slug}-call-plan-{YYYY-MM-DD}.md`
3. Write the full call plan to the file
4. Confirm: `"Call plan saved to /context/call-plans/{slug}-call-plan-{YYYY-MM-DD}.md"`

### No pending state:

Unlike skills with HITL suspend points, the call planner does **not** write to `/context/pending/`. It has no downstream actions that require approval. The output is informational only.

---

## Worked Example (abbreviated)

Mode: **By customer** — `"Prep a call plan for [CUSTOMER_1]"`

This example shows every section with representative content. A real call plan would have similar depth.

---

```markdown
## Call Plan: [CUSTOMER_1]

**Mode:** Customer
**Date:** 2026-02-28
**Prepared for:** [PM_NAME]

---

### Context Summary

**What we know:**
* [CUSTOMER_1] is a Lighthouse FSI customer running [PRODUCT] in production across AWS and Azure
* Their security architect is focused on CIS benchmarks (CIS 1 for containers, exploring CIS 2 for Linux via Ansible)
* They run [TOOL_A] CLI inside [PRODUCT_SHORT] provisioners at build time as a workaround for the lack of native [TOOL_A] integration
* They explicitly asked for "a selector option between [DEFAULT_SCANNER] and [TOOL_A] databases" (Dec 2025)
* They want PDF vulnerability reports for compliance artifact distribution
* They use [CI_TOOL] for CI/CD with [PRODUCT_SHORT] provisioners in the pipeline

**What we don't know (target gaps):**
* **Workflow gap**: How do they actually consume [TOOL_A] scan results today? Who reviews them, in what tool, how often?
* **Decision gap**: Is the security architect the decision-maker for scanning tool changes, or does someone else approve?
* **Effort gap**: How much time does their team spend maintaining the [TOOL_A] CLI workaround inside provisioners?
* **Competitive gap**: Have they evaluated other registry-integrated scanning options? What did they look at?
* **Timeline gap**: Is there an external audit or compliance deadline driving urgency on CIS benchmarks?

---

### Research Objectives

1. Understand the end-to-end workflow for how [CUSTOMER_1] consumes and acts on vulnerability scan results today
2. Quantify the cost (time, people, friction) of their current [TOOL_A] CLI workaround
3. Learn what's driving their CIS benchmark timeline — internal initiative or external compliance deadline
4. Map the decision process for adopting new scanning integrations — who's involved, what they need to see

---

### Openers

1. `[vuln-scanning]` Walk me through what happens after your team runs a [TOOL_A] scan on an image in the build pipeline — who sees the results first, and what do they do with them?

2. `[compliance]` Tell me about the last time your team had to produce a compliance artifact for an audit — what was the process like from start to finish?

3. `[workflow]` What does a typical week look like for your platform engineering team when it comes to managing image security across your registries?

---

### Deep Dives

1. `[vuln-scanning]` You mentioned running [TOOL_A] CLI inside your [PRODUCT_SHORT] provisioners — what was the process of setting that up, and what breaks when you need to update it?
   *(Learning: actual maintenance cost of the workaround)*
   * If they mention update frequency, ask: "How often do you need to touch that configuration, and who handles it?"
   * If they mention it breaking builds, ask: "What happened the last time it failed — how did you find out and how long did it take to fix?"

2. `[cis-benchmarks]` You've been working on CIS 1 for containers — what prompted the move to also look at CIS 2 for Linux servers?
   *(Learning: whether CIS expansion is internally driven or externally mandated)*
   * If they mention an audit, ask: "When is that audit, and what specifically do they need to see from you?"
   * If they mention a security initiative, ask: "Who's sponsoring that initiative, and what does success look like for them?"

3. `[decision-process]` When your team adopted [TOOL_A] initially, how did that decision get made — who was involved and what did they need to evaluate?
   *(Learning: decision-making process and stakeholders for scanning tool adoption)*
   * If they mention a security review board, ask: "What does that review process look like for a new integration versus expanding an existing tool?"

4. `[reporting]` You mentioned needing PDF vulnerability reports — tell me about who receives those reports and what they do with them.
   *(Learning: who the downstream consumer is and whether they need raw data or executive summaries)*
   * If they mention distributing to customers or auditors, ask: "What's in those reports today that's missing, and what happens when the data isn't there?"
   * If they mention manual assembly, ask: "How long does it take to pull together one of those reports right now?"

5. `[competitive]` Before you settled on the [TOOL_A] CLI workaround, what other approaches did your team consider for getting [TOOL_A] data into your image pipeline?
   *(Learning: what alternatives they evaluated and why they were rejected)*
   * If they mention another tool, ask: "What made you choose the CLI approach over that?"

---

### Commitment & Decision

1. `[effort]` How many people on your team spend time maintaining the [TOOL_A] scanning workaround today, and roughly how much of their time does it take?

2. `[timeline]` What's driving the timeline on your CIS benchmark work — is there a specific audit date or compliance deadline you're working toward?

3. `[adoption]` If the [TOOL_A] scanning workflow changed tomorrow, what would your team need to do on your side to adapt — config changes, pipeline updates, approvals?

---

### Traps to Avoid

* **Don't reveal that [TOOL_A] integration is on the roadmap** — ask about their workaround cost and pain instead. Let them describe the problem without knowing a solution is coming.
* **Don't ask [CUSTOMER_1] to confirm they want provider selection** — we already know they do (Dec 2025 call). Instead, ask what happens *after* they'd select a provider — what does the downstream workflow look like?
* **CIS benchmarks will come up — don't let it consume the call.** Acknowledge the topic, capture any new nuance (especially timeline/audit dates), then steer toward vulnerability scanning workflow gaps where we have less data.
* **Don't describe the provider abstraction architecture** — ask how they handle multi-source scan results today. We need to understand their mental model before showing them ours.
* **If they say "that would be really useful," press further** — ask "tell me about the last time you needed that and didn't have it" to get a real story instead of a polite endorsement.

---

### Related Context

**Customer Profiles**: [[[CUSTOMER_1]]]
**Jira Tracking**: [[[PROJECT_KEY]-001]] (Vulnerability Data Integration) | [[[PROJECT_KEY]-002]] (Image Compliance Reporting & Governance)
**Product Context**: [[vulnerability-scanning-provider-selection-prd-2026-02-20]]
```

---

## `--think` Flag Behavior

When invoked with `--think` or `with thought partner`:

1. Run `thought-partner` on the call topic first
2. Thought partner suspends at HITL-TP for approval
3. On resume/proceed, the thought partner analysis is passed as additional context to call-planner
4. Call planner uses the JTBD clarity, friction diagnosis, and alternative solutions from thought-partner to:
   - Sharpen research objectives (target the most uncertain JTBD assumptions)
   - Add questions that test the friction points identified
   - Add commitment questions around the alternatives surfaced
5. Call plan is generated and displayed (standard display-first behavior)

The thought partner analysis enriches question generation but does not change the call plan format.

---

## Progress Signals

```
📋 call-planner — preparing call plan ([mode]: [customer/topic/description])...
   ✓ Context loaded — [N] customer notes, [M] product context files
   -> Following wikilinks (1 hop):
      ✓ [related-doc].md
      ✓ [Customer Name] customer profile
   ✓ Gap analysis — [N] knowledge gaps identified across [M] categories
   ✓ Questions generated — [N] openers, [M] deep dives, [P] commitment
   ✓ Mom Test filter — [N] questions rewritten, [M] passed

📋 Call plan ready — [Customer/Topic/Description]

   Research objectives: [N]
   Questions: [total] ([openers] openers, [deep-dives] deep dives, [commitment] commitment)
   Traps to avoid: [N]

   This plan is displayed only — not saved.
   Run: "save that call plan" to persist to /context/call-plans/
```
