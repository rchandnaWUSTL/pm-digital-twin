# Skill: Format Customer Field Notes

## Purpose
Take raw input — in any format — and reformat it into [PM_NAME]'s standard field notes format, ready to copy-paste and send. Fix typos, normalize customer names, and ensure consistent structure.

Input can be any combination of:
- **Raw handwritten notes** (bullet points, fragments, shorthand)
- **AI-generated summaries** (from Granola, Otter, Fireflies, or any tool)
- **Voice-to-text transcripts** (verbatim, messy, with filler words)
- **Any mix of the above** pasted together

No MCP calls needed. [PM_NAME] pastes the input directly into Claude Code.

---

## Step 1: Parse the Input

When [PM_NAME] pastes notes, before formatting:

1. **Identify the customer** — look for company name, contact names, product references. Apply canonicalization (see below). If still ambiguous, trigger HITL-1: "I think this is [Customer] — confirm before I continue."
2. **Identify the date** — look for explicit dates or relative references ("today", "this morning"). If missing and needed for the filename, ask.
3. **Identify input type** — transcript, raw notes, AI summary, or mix. This affects normalization:
   - *Transcripts*: remove filler words, fix run-on sentences, extract meaning from verbatim speech
   - *Raw notes*: expand shorthand, fill in implied context
   - *AI summaries*: light reformatting, apply [PM_NAME]'s voice and structure
   - *Mixed*: treat each section by its type
4. **Extract all meaningful content** — don't drop anything. If something is unclear, include it with "(unclear from notes)" rather than omitting.
5. Then apply the formatting rules below.

---

## Customer Name Canonicalization

Always correct these names regardless of how they appear in the input or Granola notes:

| If you see... | Correct to |
|---|---|
| [CUSTOMER_1], [CUSTOMER_1] Bank, [CUSTOMER_1] Fin, [CUSTOMER_1] Financial | **[CUSTOMER_1]** |
| [CUSTOMER_4], [CUSTOMER_4] Wholesale, [CUSTOMER_4] Mtg, [CUSTOMER_4] Mortgage, [CUSTOMER_4] Mortg | **[CUSTOMER_4]** |
| [CUSTOMER_2], [CUSTOMER_2] misspelling variants | **[CUSTOMER_2]** |
| [CUSTOMER_3], [CUSTOMER_3] Soft, [CUSTOMER_3]Software | **[CUSTOMER_3]** |
| Internal, [COMPANY] Internal, [PLATFORM] Internal, Internal Customer, internal [company] | **[CUSTOMER_INTERNAL]** |
| [CUSTOMER_6], [CUSTOMER_6] misspelling variants | **[CUSTOMER_6]** |

Lighthouse customers (use "our lighthouse customer [Name]" in the opener):
- **[CUSTOMER_1]** — large bank; [PRODUCT] for AMI management, [VULN_PLATFORM_A] for vulnerability scanning and compliance benchmarks, [VCS_SECURITY_TOOL]
- **[CUSTOMER_4]** — mortgage company; Windows/RHEL/[CONTAINER_RUNTIME] images, compliance standards, [CONFIG_TOOL_B], Orkes workflows
- **[CUSTOMER_2]** — government IT provider; multi-cloud ([CLOUD_PROVIDER_A], [CLOUD_PROVIDER_B], [VIRTUALIZATION_PLATFORM], [CLOUD_PROVIDER_D]), [CI_PLATFORM], [CONFIG_MGMT_TOOL] for hardening
- **[CUSTOMER_3]** — fintech/banking software; 100% [IAC_TOOL]-based [PRODUCT] usage, [ORCHESTRATOR_A], [SERVICE_MESH]
- **[CUSTOMER_INTERNAL]** — internal [COMPANY] engineering (Stride, Team Forge); [PRODUCT_SHORT] for CI runners, Coder for dev environments

Non-lighthouse customers (use "we met with [Name]" or "we had a call with [Name]"):
- **[CUSTOMER_6]** — recently started using [PRODUCT_SHORT] CE, has not yet explored [PRODUCT] (not a lighthouse customer)

---

## Output Format

Every note should follow this exact structure:

```
Met with [our lighthouse customer / our internal customer / (nothing for non-lighthouse)] [Customer Name] [on DATE / earlier today / this Monday / etc.], [one-sentence description of what was covered].

[SECTION HEADING]
* [Bullet point]
   * [Sub-bullet if needed]

[SECTION HEADING]
* [Bullet point]
   * [Sub-bullet]

[Additional sections as needed]

Thanks,
[PM_NAME]
```

### Format Rules

1. **Opening line**: Single sentence naming the customer and summarizing call topics. Use "our lighthouse customer [Name]" for the five lighthouse accounts. Use "our internal customer" or "our internal [COMPANY] team" for [CUSTOMER_INTERNAL]. For non-lighthouse customers just use their name directly.

2. **Section headings**: Title case, no punctuation at end.

3. **Bullets**: Use `*` for top-level bullets, `   *` (3-space indent) for sub-bullets. Each bullet should be substantive — combine thin bullets if closely related.

4. **Sign-off**: Always end with `Thanks,\n[PM_NAME]` on its own lines.

5. **Tense**: Past tense throughout.

6. **Length**: Preserve all meaningful detail. Do not summarize away specifics — feature names, product names, workarounds, and customer pain points should all be retained.

7. **No filler**: Remove meta-commentary like "[PM_NAME] noted that" or "The team discussed" — just state the fact.

8. **Date format**: Use natural language (e.g., "earlier today", "this Monday", "on January 27th", "on December 4th"). If no date is provided, omit it.

9. **Calls with little feedback**: If the notes indicate the call was brief or didn't yield much feedback, reflect that honestly in the opener.

10. **Drop watercooler content**: Omit sections or bullets that are purely personal, social, or internal team logistics with no product/customer signal value. Examples: interview scheduling load, PTO mentions, casual team banter, personal recommendations (YouTube channels, podcasts). If a section is entirely watercooler talk, drop the whole section. If only some bullets are irrelevant, keep the section and drop the individual bullets. When in doubt, keep it — but content that no downstream reader (engineering, design, leadership) would act on should be cut.

Common product name corrections:
- "[PLATFORM] [product_short]" → "[PRODUCT]"
- "[company]" → "[COMPANY]"
- "github actions" → "[CI_PLATFORM]"
- "terraform" → "[IAC_TOOL]"
- "[platform] terraform" → "[PLATFORM] [IAC_TOOL]"
- "ansible" → "[CONFIG_MGMT_TOOL]"
- "[policy_tool]" → "[POLICY_TOOL]"

---

## Examples

### Example 1 — [CUSTOMER_1] (implementation & compliance)

**Input:**
```
Today we met with our lighthouse customer [CUSTOMER_1], we talked about self-service and their security and compliance requirements, and also spent some time discussing AI.
Current [PRODUCT_SHORT] Implementation & Workflow
* Built comprehensive documentation in Confluence for teams consuming [PRODUCT_SHORT] images
   * Getting started guide shows [IAC_TOOL] integration with [PRODUCT] data source
   * Teams use [IAC_TOOL] to reference AMIs instead of building their own
* Cross-account access management via [CI_PLATFORM]
   * Variable holds ~300 [CLOUD_PROVIDER_A] account IDs for automatic AMI sharing
   * Weekly builds grant KMS key and cross-account access to specified accounts
   * Similar process for [CLOUD_PROVIDER_B] subscriptions
* Current pain points:
   * Still receiving one-off requests for custom images despite documentation
   * Teams not following standard process (e.g., unpatched ASTs)
Security & Compliance Requirements
* Compliance benchmarking discussion:
   * Security architect ([CONTACT_NAME]) heavily focused on compliance benchmarks for [CLOUD_PROVIDER_A]/[CLOUD_PROVIDER_B]
   * Primary concern is [IAC_TOOL] configuration issues, not base image compliance
   * Current image validation relies on vulnerability scanning only
* Image security approval process:
   * Dual vulnerability scans during and after AMI build
   * Pipeline fails on critical vulnerabilities
   * License findings flagged but not enforced
   * No current misconfiguration scanning for compliance benchmark compliance
AI
* [CUSTOMER_1] is interested in [COMPANY] AI features as design partner
* Current AI usage:
   * [VCS_PLATFORM] Copilot enabled for PR reviews and suggestions
Thanks,
[PM_NAME]
```

**Output:**
```
Met with our lighthouse customer [CUSTOMER_1] earlier today, covering self-service image workflows, security and compliance requirements, and AI.

Current [PRODUCT_SHORT] Implementation & Workflow
* Built comprehensive Confluence documentation for teams consuming [PRODUCT_SHORT] images
   * Getting started guide covers [IAC_TOOL] integration with [PRODUCT] data source
   * Teams reference AMIs via [IAC_TOOL] instead of building their own
* Cross-account access managed via [CI_PLATFORM]
   * Variable holds ~300 [CLOUD_PROVIDER_A] account IDs for automatic AMI sharing
   * Weekly builds grant KMS key and cross-account access to specified accounts
   * Similar process in place for [CLOUD_PROVIDER_B] subscriptions
* Current pain points:
   * Still receiving one-off requests for custom images despite documentation
   * Teams not following standard process (e.g., unpatched ASTs)

Security & Compliance Requirements
* Compliance benchmarking discussion with security architect [CONTACT_NAME]:
   * Primary concern is [IAC_TOOL] configuration issues, not base image compliance
   * Current image validation relies on vulnerability scanning only
   * No misconfiguration scanning for compliance benchmark compliance today
* Image security approval process:
   * Dual vulnerability scans run during and after AMI build
   * Pipeline fails on critical vulnerabilities
   * License findings flagged but not enforced

AI
* [CUSTOMER_1] is interested in [COMPANY] AI features as a design partner
* Currently using [VCS_PLATFORM] Copilot for PR reviews and suggestions

Thanks,
[PM_NAME]
```

---

### Example 2 — [CUSTOMER_2] ([PLATFORM] RBAC & [PRODUCT_SHORT] implementation)

**Input:**
```
Met with our lighthouse customer [CUSTOMER_2] on Monday, covering a concern around [PLATFORM] RBAC and their current [PRODUCT_SHORT] implementation.
[PLATFORM] RBAC Feedback
* Customer feedback on [PLATFORM] platform access controls:
   * Current limitation: can only assign org-level or project-level permissions
   * Want granular permissions per [PLATFORM] product (different access levels for [PRODUCT_SHORT] vs [PRODUCT_B] vs [PRODUCT_C])
   * Currently working around by creating separate projects per team
   * Comparing to [PLATFORM] [IAC_TOOL]'s workspace-level permission granularity
Current [PRODUCT_SHORT] Implementation & Challenges
* Image building setup across platforms:
   * [CLOUD_PROVIDER_A] & [CLOUD_PROVIDER_B]: scheduled builds via [CI_PLATFORM] pipeline
   * [VIRTUALIZATION_PLATFORM]: manual builds, still using [CLOUD_PROVIDER_B] DevOps pipeline
   * Build separate templates per platform due to different base images, agents, and customization steps
* [VIRTUALIZATION_PLATFORM]-specific considerations:
   * Pagefile config in [VIRTUALIZATION_PLATFORM] image: questioning if removal is possible
   * Looking into MAK key from Logic Pass to replace ISO file approach
   * Migration from [CLOUD_PROVIDER_B] DevOps to [VCS_PLATFORM] planned but lower priority (smaller footprint)
   * VCD requires private runner with file access vs cloud APIs
* Compliance handled by separate OS teams post-deployment
   * Run [CONFIG_MGMT_TOOL] playbooks to harden images after server provisioning
   * Not currently priority for image-level vulnerability scanning
Other
* Consider bringing [PLATFORM] RBAC PM on for RBAC discussion in future call
* Team is exploring [PRODUCT_B] but no active use cases yet
Thanks,
[PM_NAME]
```

**Output:**
```
Met with our lighthouse customer [CUSTOMER_2] this Monday, covering [PLATFORM] RBAC concerns and their current [PRODUCT_SHORT] implementation.

[PLATFORM] RBAC Feedback
* Currently limited to org-level or project-level permission assignments
   * Want granular permissions per [PLATFORM] product (e.g., different access levels for [PRODUCT_SHORT] vs [PRODUCT_B] vs [PRODUCT_C])
   * Working around today by creating separate projects per team
   * Comparing unfavorably to [PLATFORM] [IAC_TOOL]'s workspace-level permission granularity

Current [PRODUCT_SHORT] Implementation & Challenges
* Multi-platform image building setup:
   * [CLOUD_PROVIDER_A] & [CLOUD_PROVIDER_B]: scheduled builds via [CI_PLATFORM]
   * [VIRTUALIZATION_PLATFORM]: still on manual builds via [CLOUD_PROVIDER_B] DevOps pipeline
   * Separate templates per platform due to different base images, agents, and customization steps
* [VIRTUALIZATION_PLATFORM]-specific considerations:
   * Evaluating pagefile removal from [VIRTUALIZATION_PLATFORM] images
   * Exploring MAK key from Logic Pass to replace ISO file approach
   * [CLOUD_PROVIDER_B] DevOps to [VCS_PLATFORM] migration planned but lower priority given smaller footprint
   * VCD requires private runner with file access rather than cloud APIs
* Compliance handled post-deployment by separate OS teams running [CONFIG_MGMT_TOOL] playbooks to harden images
   * Image-level vulnerability scanning not currently a priority

Other
* Consider bringing the [PLATFORM] RBAC PM onto a future call for this discussion
* Team is exploring [PRODUCT_B] but has no active use cases yet

Thanks,
[PM_NAME]
```

---

### Example 3 — [CUSTOMER_3] (feature request)

**Input:**
```
Sending out some late notes here. Met with [CUSTOMER_3] on Jan 27th. We discussed an open FR which I have documented here.
[PRODUCT] Golden Images Progress
* Currently deployed in dev environment, partially in staging — not yet in production
   * [CONTACT_NAME_2] leading implementation
* Expanding [PRODUCT_SHORT] usage beyond current scope
   * Different image for traffic management
   * Plans to expand from private to public ingress
Feature Request: Metadata Lookup in [IAC_TOOL] Data Source
* [CUSTOMER_3] team needs build label filtering capability in [PRODUCT] [IAC_TOOL] data source
   * Currently using workaround with version info embedded in channel names
   * Want to search/filter by [ORCHESTRATOR_A] version, [SERVICE_MESH] version in build labels
* Current workaround shown via screen share
   * Using [CLOUD_PROVIDER_A] AMI data lookup with filter on description field
   * Parameterizing [ORCHESTRATOR_A]/[SERVICE_MESH] versions in locals.tf
   * Channel names include version info as hack
* Benefits would extend to other use cases
   * GitLab runner version management for staged rollouts
   * Software bill of materials filtering
   * Version pinning across environments
* Usage pattern: 100% [IAC_TOOL]-based interaction with [PRODUCT]
Thanks,
[PM_NAME]
```

**Output:**
```
Met with our lighthouse customer [CUSTOMER_3] on January 27th, covering golden image rollout progress and an open feature request.

[PRODUCT] Golden Images Progress
* Currently deployed in dev, partially in staging — not yet in production
   * [CONTACT_NAME_2] leading implementation
* Expanding [PRODUCT_SHORT] usage to additional image types (e.g., traffic management)
   * Plans to expand from private to public ingress

Feature Request: Metadata Lookup in [IAC_TOOL] Data Source
* [CUSTOMER_3] needs build label filtering capability in the [PRODUCT] [IAC_TOOL] data source
   * Currently embedding version info in channel names as a workaround
   * Want to filter by [ORCHESTRATOR_A] version, [SERVICE_MESH] version in build labels for cleaner pipelines
* Current workaround (shown via screen share):
   * [CLOUD_PROVIDER_A] AMI data lookup with description field filter
   * [ORCHESTRATOR_A]/[SERVICE_MESH] versions parameterized in locals.tf
   * Channel names carry version info as a hack
* This feature would unlock additional use cases:
   * GitLab runner version management for staged rollouts
   * Software bill of materials filtering
   * Version pinning across environments
* Note: [CUSTOMER_3]'s interaction with [PRODUCT] is 100% [IAC_TOOL]-based

Thanks,
[PM_NAME]
```

---

### Example 4 — [CUSTOMER_INTERNAL] (team reorg & dev environments)

**Input:**
```
Met with our internal [COMPANY] customer to understand how developer self service of base images functions today.
Team Reorganization & New Structure
* [COMPANY] platform teams completely rechartered and renamed
   * PSS became Stride team under Randy's management (~6 people)
      * Focus: [CI_PLATFORM] CI runners (still use [PRODUCT_SHORT] underneath)
      * No longer own base images
      * Working on IBM versions of CI runners as IBM migrates to [CI_PLATFORM]
   * New Team Forge under current leadership (4 people)
      * Focus: Development environments, especially remote development environments
Current Development Environment Strategy
* Stride will own base image management
   * Security base image as top-level image everyone pulls from, ideally in [PRODUCT]
* Development environment workflow using Coder:
   * Developers pick Coder template, get compute (EC2, K8s pod, container, Fargate) abstracted away
   * Environment built from pre-built AMI maintained by template owners
   * End users never see or choose the AMI directly
* Today developers use raw [PRODUCT_SHORT]/[IAC_TOOL] with no standardized starting point
   * PRDE will be absorbed by Coder around Q3
   * Coder evaluation started 6+ months ago; opening to all [COMPANY] Engineering this quarter
[PRODUCT_SHORT] Integration & Future Plans
* Plan mirrors TF Cloud Box model with [PRODUCT]
   * Weekly async AMI rebuilds for security patches, fed into [PRODUCT] for template consumption
* Template ownership: template owners own the AMI, not the teams rendering templates
* Long-term IBM transition:
   * Base images replaced by IBM-provided RHEL images
   * [COMPANY] builds golden images on top of IBM distribution
   * All AMIs to be built in a single [CLOUD_PROVIDER_A] account with cross-account access
Thanks,
[PM_NAME]
```

**Output:**
```
Met with our internal [COMPANY] customer to understand how developer self-service of base images functions today — worth sharing even though it covers organizational process and team changes rather than typical field notes topics.

Team Reorganization & New Structure
* [COMPANY] platform teams fully rechartered and renamed:
   * PSS to Stride team (~6 people, under Randy)
      * Focus: [CI_PLATFORM] CI runners ([PRODUCT_SHORT] underneath); no longer own base images
      * Working on IBM versions of CI runners as IBM migrates to [CI_PLATFORM]
   * New Team Forge (4 people)
      * Focus: Development environments, especially remote dev environments

Current Development Environment Strategy
* Stride will own base image management — security base image as top-level image, ideally in [PRODUCT]
* Development environment workflow via Coder:
   * Developers pick a Coder template, get compute (EC2, K8s pod, container, Fargate) abstracted away
   * Environment built from pre-built AMI maintained by template owners; end users never see the AMI directly
* Today developers use raw [PRODUCT_SHORT]/[IAC_TOOL] with no standardized starting point
   * PRDE will be absorbed by Coder around Q3
   * Coder evaluation started 6+ months ago; opening to all [COMPANY] Engineering this quarter

[PRODUCT_SHORT] Integration & Future Plans
* Plan mirrors TF Cloud Box model with [PRODUCT] — weekly async AMI rebuilds fed into [PRODUCT] for template consumption
* Template owners own the AMI; teams rendering templates do not
* Long-term IBM transition:
   * Base images replaced by IBM-provided RHEL images; [COMPANY] builds golden images on top
   * All AMIs to be built in a single [CLOUD_PROVIDER_A] account with cross-account access

Thanks,
[PM_NAME]
```

---

### Example 5 — [CUSTOMER_1] ([TOOL_A], cross-product, Ansible)

**Input:**
```
Met with our lighthouse customer [CUSTOMER_1] earlier today, covering vulnerability management, [PRODUCT_SHORT]+[IAC_TOOL] requests, [CONFIG_MGMT_TOOL] Automation Platform requests, and more.
Customer feedback on vulnerability scanning [TOOL_A] integration
* Strong interest in using [TOOL_A] for vulnerability scanning instead of [DEFAULT_SCANNER]
   * Already [TOOL_A] customers, required for certain scan types in their organization
   * Selector option between [DEFAULT_SCANNER] and [TOOL_A] databases would be valuable
Cross-product integration opportunities
* [PRODUCT] image tracking highly valuable
   * Risk team wants proof of [PRODUCT_SHORT] image adoption vs public images
   * Currently using tags ("built with [PRODUCT]") for compliance reporting
   * [IAC_TOOL] could show which EC2 instances use [PRODUCT] data sources vs non-approved images
* [POLICY_TOOL] policy integration with [PRODUCT_SHORT]
   * Interest in restricting [PRODUCT_SHORT] usage across teams
[VCS_SECURITY_TOOL] implementation
* Using for secret scanning across PRs - stops commits with detected secrets
* Dependabot automatically opens PRs for package updates
AI Use at [CUSTOMER_1]
* Copilot access requires 5-6 training courses + repo security compliance
* Office365 chat used org-wide, IDE integration gated by training
[CONFIG_MGMT_TOOL] automation challenges & opportunities
* Current [CONFIG_MGMT_TOOL] Automation Platform blocked by authentication
   * Only supports [VCS_PLATFORM] integration via username/password
   * Security requires OAuth/SSO - submitted feature request with no response
* Potential [PRODUCT_SHORT] + [CONFIG_MGMT_TOOL] integration
   * Use [CONFIG_MGMT_TOOL] provisioner for dynamic vulnerability remediation
   * Post-build playbooks could resolve detected CVEs and retry builds
Note
* [CUSTOMER_1] will likely bring their security architect to the next call as he's interested in new [TOOL_A] use cases.
Thanks,
[PM_NAME]
```

**Output:**
```
Met with our lighthouse customer [CUSTOMER_1] earlier today, covering vulnerability management, [PRODUCT_SHORT] + [IAC_TOOL] requests, [CONFIG_MGMT_TOOL] Automation Platform challenges, and more.

Vulnerability Scanning & [TOOL_A] Integration
* Strong interest in using [TOOL_A] for vulnerability scanning instead of [DEFAULT_SCANNER]
   * Already [TOOL_A] customers; certain scan types require it organizationally
   * Want a selector option between [DEFAULT_SCANNER] and [TOOL_A] databases

Cross-Product Integration Opportunities
* [PRODUCT] image tracking highly valuable to their risk team
   * Currently tagging images ("built with [PRODUCT]") for compliance reporting
   * Interested in [IAC_TOOL] showing which EC2 instances use [PRODUCT] data sources vs non-approved images
* Interest in [POLICY_TOOL] policy integration to restrict [PRODUCT_SHORT] usage across teams

[VCS_SECURITY_TOOL]
* Using for secret scanning across PRs — stops commits with detected secrets
* Dependabot automatically opens PRs for package updates

AI Use at [CUSTOMER_1]
* Copilot access requires 5-6 training courses + repo security compliance
* Office365 chat used org-wide; IDE integration gated by training completion

[CONFIG_MGMT_TOOL] Automation Platform Challenges & Opportunities
* [CONFIG_MGMT_TOOL] Automation Platform currently blocked by authentication limitations
   * Only supports [VCS_PLATFORM] integration via username/password
   * Security requires OAuth/SSO — feature request submitted with no response
* Potential [PRODUCT_SHORT] + [CONFIG_MGMT_TOOL] integration:
   * [CONFIG_MGMT_TOOL] provisioner for dynamic vulnerability remediation during builds
   * Post-build playbooks to resolve detected CVEs and retry builds

Note
* [CUSTOMER_1] will likely bring their security architect to the next call given his interest in [TOOL_A] use cases.

Thanks,
[PM_NAME]
```

---

### Example 6 — [CUSTOMER_2] (self-service images)

**Input:**
```
This Monday we met with our lighthouse customer [CUSTOMER_2], covering how they enable self service of images.
Customer Usage & Feedback
* [CUSTOMER_2] team continues using [PRODUCT] for image management
* Evaluated [PLATFORM] [IAC_TOOL] run task but decided against implementation
   * Concerns about team confusion with advisory warnings
   * No strong business need identified
* Current workflow working well
   * Teams reference latest channel via [IAC_TOOL] data source
   * Ignore blocks prevent destructive AMI changes
Cost Optimization & Automation
* Implemented Lambda function for automated image cleanup in [CLOUD_PROVIDER_A]
   * Deletes unused images after set time period
   * Revokes corresponding [PRODUCT] references via API
   * Saves thousands annually in storage costs
   * Considering expansion to other clouds
* Manual channel creation but auto-updates with new builds
Integration Challenges
* ServiceNow integration attempts unsuccessful
   * Considering basic API integration instead
   * Need better request management with approval flows and identity database
* [PRODUCT_B] evaluation completed
   * Decided on no-code modules in [PLATFORM] [IAC_TOOL] instead
   * Integration issues: variable descriptions not visible in [PRODUCT_B] forms
Thanks,
[PM_NAME]
```

**Output:**
```
Met with our lighthouse customer [CUSTOMER_2] this Monday, covering how they enable self-service of images.

Customer Usage & Feedback
* Continuing to use [PRODUCT] for image management
* Evaluated [PLATFORM] [IAC_TOOL] run task but decided against it
   * Concerns about team confusion with advisory warnings
   * No strong business need identified
* Current workflow working well — teams reference latest channel via [IAC_TOOL] data source, ignore blocks prevent destructive AMI changes

Cost Optimization & Automation
* Implemented Lambda function for automated image cleanup in [CLOUD_PROVIDER_A]
   * Deletes unused images after a set time period, revokes corresponding [PRODUCT] references via API
   * Saves thousands annually in storage costs; considering expansion to other clouds
* Manual channel creation but channels auto-update with new builds

Integration Challenges
* ServiceNow integration attempts unsuccessful — considering basic API integration instead
   * Need better request management with approval flows and identity database
* [PRODUCT_B] evaluation complete — decided on no-code modules in [PLATFORM] [IAC_TOOL] instead
   * Blocker: variable descriptions not visible in [PRODUCT_B] forms

Thanks,
[PM_NAME]
```

---

### Example 7 — [CUSTOMER_4] (pipelines & compliance)

**Input:**
```
On December 4th we had a call with our lighthouse customer [CUSTOMER_4]. We covered pipelines and compliance.
[PRODUCT_SHORT] Pipeline Implementation
* Got pipeline approved for [PRODUCT_SHORT] builds
* Starting with Windows images, then RHEL, then [CONTAINER_RUNTIME] containers
* Currently doing local testing on Windows 2019 templates
   * Successfully ran Windows [PRODUCT_SHORT] template builds locally vs. on server
   * Windows 2019 template has reboot issue after Microsoft updates — [VIRTUALIZATION_PLATFORM] issue suspected
* Plan: automate builds through Orkes workflows
* [PRODUCT] integration working well
   * Metadata uploads automatically; easy configuration with [PLATFORM] client ID and secret
* Image promotion through dev/staging/production channels straightforward
   * Uses version numbering (0.0.1, 0.0.2)
   * Monthly patching cycle: dev to stage to prod
Security & Compliance Standards
* Follow compliance standards profile for security compliance
* Post-building compliance handled through [CONFIG_TOOL_B]; [CONFIG_TOOL_B] team purchased new SCM feature expecting it to solve compliance automation
* Template-level security compliance would be a valuable addition
   * Currently only get compliance feedback from separate security team
Thanks,
[PM_NAME]
```

**Output:**
```
Met with our lighthouse customer [CUSTOMER_4] on December 4th, covering [PRODUCT_SHORT] pipeline implementation and compliance standards.

[PRODUCT_SHORT] Pipeline Implementation
* Pipeline approved — starting with Windows images, then RHEL, then [CONTAINER_RUNTIME] containers
* Local testing on Windows 2019 templates underway
   * Builds running successfully locally; reboot issue after Microsoft updates suspected to be [VIRTUALIZATION_PLATFORM]
* Plan to automate builds through Orkes workflows
* [PRODUCT] integration working well — metadata uploads automatically, easy configuration with [PLATFORM] client ID and secret
* Image promotion through dev/staging/prod channels straightforward
   * Version numbering (0.0.1, 0.0.2) for testing new templates
   * Monthly patching cycle: dev to stage to prod

Security & Compliance Standards
* Following compliance standards profile for security compliance
* Post-build compliance managed via [CONFIG_TOOL_B]; [CONFIG_TOOL_B] team recently purchased SCM feature expecting it to solve compliance automation
* Template-level security compliance would be a valuable addition — currently rely entirely on separate security team for compliance feedback

Thanks,
[PM_NAME]
```

---

### Example 8 — [CUSTOMER_6] (non-lighthouse, brief call)

**Input:**
```
On December 10th I met with [CUSTOMER_6] extremely briefly. [CUSTOMER_6] recently started using [PRODUCT_SHORT] CE and has yet to explore [PRODUCT]. I have some notes on how they previously did image builds:
* Legacy pattern: manual VM creation with snapshots
* Manual process involved:
   * People logging into machines interactively
   * Running updates and installing packages manually
   * Creating sys prep snapshots
* Successfully moved away from this legacy approach with [PRODUCT_SHORT] CE
Thanks,
[PM_NAME]
```

**Output:**
```
Met briefly with [CUSTOMER_6] on December 10th to learn about their image build history. They recently adopted [PRODUCT_SHORT] CE and have not yet explored [PRODUCT].

Legacy Image Build Process
* Previously relied on manual VM creation with snapshots
   * Teams logged into machines interactively to run updates and install packages manually
   * Finalized images by creating sysprep snapshots
* Successfully moved away from this manual approach with [PRODUCT_SHORT] CE

Thanks,
[PM_NAME]
```

---

### Example 9 — [CUSTOMER_2] (vulnerability scanning design review, low feedback)

**Input:**
```
On November 17th we met with our lighthouse customer [CUSTOMER_2] to go over our vulnerability scanning designs, though we didn't receive much feedback sadly.
Customer Infrastructure & Platform Usage
* Multi-cloud deployment focus: [CLOUD_PROVIDER_D], [CLOUD_PROVIDER_A], Windows
* Added cloud directory to deployment scope
* Using [PRODUCT_SHORT] templates per platform (not everything transferable)
* [IAC_TOOL] as main tool alongside [PRODUCT_SHORT]
Security & Vulnerability Management
* Security team provides requirements but our customer is not directly involved in vulnerability checks
* Concerns about third-party security applications in [PRODUCT_SHORT] process
* Looking into [PRODUCT_SHORT] security checks through cloud version
* Not utilizing run tasks yet
Thanks,
[PM_NAME]
```

**Output:**
```
Met with our lighthouse customer [CUSTOMER_2] on November 17th to review our vulnerability scanning designs, though we didn't receive much feedback.

Customer Infrastructure & Platform Usage
* Multi-cloud deployment across [CLOUD_PROVIDER_D], [CLOUD_PROVIDER_A], and Windows; recently added cloud directory to scope
* Using separate [PRODUCT_SHORT] templates per platform — not all configuration is transferable across clouds
* [IAC_TOOL] is their primary tool alongside [PRODUCT_SHORT]

Security & Vulnerability Management
* Security team owns requirements; [CUSTOMER_2] is not directly involved in vulnerability checks day-to-day
* Some concern about introducing third-party security applications into the [PRODUCT_SHORT] process
* Exploring [PRODUCT_SHORT] security checks through the cloud version
* Not yet utilizing run tasks

Thanks,
[PM_NAME]
```

---

### Example 10 — [CUSTOMER_1] (vulnerability scanning design review)

**Input:**
```
On November 12th we met with our lighthouse customer [CUSTOMER_1] to go over our vulnerability scanning designs.
Product Status and Usage
* [CUSTOMER_1] confirmed everything working well with current product
* SBOM storage feature
   * Haven't tried yet but have upcoming use case
   * [CLOUD_PROVIDER_B] pipeline for Windows Server 2022 experiencing [TOOL_A] false positives on curl vulnerability
   * Planning to upgrade to latest [PRODUCT_SHORT] and test SBOM during upcoming Sprint with [CONTAINER_RUNTIME] functionality
Compliance Benchmarks and Compliance
* [CUSTOMER_1] uses [TOOL_A] for compliance benchmark scanning
   * Machine config scan type shows compliance benchmarks and misconfigurations
   * [CLOUD_PROVIDER_B] compliance benchmarks better defined than [CLOUD_PROVIDER_A]
   * Pipelines set to fail if security policies not met
* Current workflow:
   * Security defines which benchmarks to pass
   * [TOOL_A] CLI runs inside provisioner during build time
   * No manual compliance reporting required - automated pipeline enforcement
Vulnerability Scanning UI Design Review
* New vulnerabilities tab in side panel with two main containers:
   * Summary dashboard: critical/high/medium/low counts, top vulnerable packages, top affected channels, average issue age bar chart, interactive severity filtering
   * Detailed vulnerability table: CVE ID, severity, affected packages, package version, detection timeframe, search/filter including build version filtering, color-coded severity levels
* CVE flyout: severity badge, CVE details, affected versions, release notes, full report download
* Customer feedback on UI:
   * Likes critical/high prominently displayed on left
   * Detection timeframe important for SLA tracking
   * Requested fixed version column
   * Interested in affected package path for better identification
* Customer interested in early testing opportunity
AI and Platform Engineering Resources
* Platform engineering: PlatformEngineering YouTube channel, Tech World with Nana
* AI tools: NetworkChuck's recent AI videos highlighted; Unity MCP project on [VCS_PLATFORM]
* Company AI adoption: Copilot for Office 365 and [VCS_PLATFORM] coming soon; cloud director Rob exploring Claude; currently using [CLOUD_PROVIDER_A] Bedrock for knowledge base building
Thanks,
[PM_NAME]
```

**Output:**
```
Met with our lighthouse customer [CUSTOMER_1] on November 12th to review our vulnerability scanning designs.

Product Status & Usage
* Everything working well with the current product
* SBOM storage feature not yet tried but an upcoming use case is identified
   * [CLOUD_PROVIDER_B] pipeline for Windows Server 2022 experiencing [TOOL_A] false positives on the curl vulnerability
   * Planning to upgrade to latest [PRODUCT_SHORT] and test SBOM with [CONTAINER_RUNTIME] functionality in an upcoming sprint

Compliance Benchmarks & Compliance
* Using [TOOL_A] for compliance benchmark scanning via machine config scan type
   * [CLOUD_PROVIDER_B] compliance benchmarks better defined than [CLOUD_PROVIDER_A]
   * Pipelines set to fail if security policies not met
* Workflow: security team defines benchmarks, [TOOL_A] CLI runs inside provisioner at build time, automated enforcement, no manual reporting

Vulnerability Scanning UI Design Review
* New vulnerabilities tab (side panel with two containers):
   * Summary dashboard: critical/high/medium/low counts, top vulnerable packages, top affected channels, average issue age by severity, interactive severity filtering
   * Detailed vulnerability table: CVE ID, severity, affected packages, version, detection timeframe, build version filtering, color-coded severity
* CVE flyout: severity badge, CVE details, affected versions, release notes, full report download
* Customer feedback:
   * Likes critical/high prominently on the left; appreciates color coding and affected packages visibility
   * Detection timeframe important for SLA tracking
   * Requested a fixed version column and affected package path for better identification
* Customer interested in early testing opportunity

AI & Platform Engineering Resources
* The team shared some resources they've found valuable:
   * Platform engineering: PlatformEngineering YouTube channel, Tech World with Nana
   * AI: NetworkChuck's recent AI videos, Unity MCP project on [VCS_PLATFORM]
   * Company AI adoption: Copilot for Office 365 and [VCS_PLATFORM] coming soon; cloud director Rob exploring Claude; currently using [CLOUD_PROVIDER_A] Bedrock for knowledge base building

Thanks,
[PM_NAME]
```

---

### Example 11 — [CUSTOMER_4] (vulnerability scanning design review)

**Input:**
```
On November 6th we met with our lighthouse customer [CUSTOMER_4] to go over our vulnerability scanning designs.
[VIRTUALIZATION_PLATFORM] Migration & Current Work
* DevOps ticket submitted for [PRODUCT_SHORT] pipeline setup — waiting for approvals
* [VIRTUALIZATION_PLATFORM] 7 to 8 migration in progress
   * Template-level service changes required
   * Encountering errors ([VIRTUALIZATION_PLATFORM]-related, not [PRODUCT_SHORT])
* Previous work: VM lifecycle automation — server build workflows with automated AD joining, [CONFIG_TOOL_B] installation, SolarWinds integration
Vulnerability Scanning Feature Feedback
* Current security compliance: 20% (need 80% for production use) — moving to Windows Server 2025
* Template scanning preferred over runtime scanning
* Compliance profile usage confirmed — security compliance via [CONFIG_MGMT_TOOL] for Linux servers
* Reporting requirements:
   * PDF reports preferred (limited [PLATFORM] portal access)
   * Weekly/monthly email summaries needed
   * Automated workflow integration planned
Template Build Process & Automation
* Current process: monthly builds with latest OS updates — old templates deleted and replaced, no versioning
* Planning version control (0.0.1 to 0.0.2) with rollback capability
* Automation goals: scheduled builds, automatic vulnerability scanning, email notifications, automated server deployment from approved templates
* Templates differ per environment (dev/stage/prod); channel assignment currently manual with interest in metadata-based automation
Design Feedback
* Comprehensive PDF report format preferred; point-in-time snapshots sufficient
* Remediation workflow: rollback to previous version if critical vulnerabilities found
Thanks,
[PM_NAME]
```

**Output:**
```
Met with our lighthouse customer [CUSTOMER_4] on November 6th to review our vulnerability scanning designs.

[VIRTUALIZATION_PLATFORM] Migration & Current Work
* DevOps ticket submitted for [PRODUCT_SHORT] pipeline setup — waiting on approvals before work begins
* [VIRTUALIZATION_PLATFORM] 7 to 8 migration in progress; encountering errors at the template level ([VIRTUALIZATION_PLATFORM]-related, not [PRODUCT_SHORT])
* Previously built VM lifecycle automation: server build workflows with automated AD joining, [CONFIG_TOOL_B] installation, and SolarWinds integration

Vulnerability Scanning Feedback
* Current security compliance at 20% — need 80% for production; moving to Windows Server 2025
* Preference for template scanning over runtime scanning
* Using compliance standards profile via [CONFIG_MGMT_TOOL] for Linux servers
* Reporting requirements:
   * PDF reports preferred due to limited [PLATFORM] portal access
   * Weekly/monthly email summaries needed
   * Automated workflow integration planned

Template Build Process & Automation
* Currently doing monthly builds with latest OS updates — old templates deleted and replaced with no versioning
* Planning version control (0.0.1 to 0.0.2) with rollback capability
* Automation goals: scheduled builds, automatic vulnerability scanning, email notifications, automated server deployment from approved templates
* Templates differ per environment (dev/stage/prod); channel assignment currently manual with interest in metadata-based automation

Design Feedback
* Comprehensive PDF report format preferred; point-in-time snapshots sufficient
* Remediation workflow: rollback to previous template version if critical vulnerabilities found

Thanks,
[PM_NAME]
```