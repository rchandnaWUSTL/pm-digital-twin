# Skill: Refresh FR Snapshot

## Purpose

Fetch current non-Closed [PRODUCT] feature requests from the [FR_PROJECT_KEY] (Feature Request Board) Jira project via Atlassian MCP and overwrite `/context/product-context/fr-snapshot.json`. Run this before any FR-related work (PRDs, PRFAQs, signal briefs) to ensure downstream skills have current FR board data.

---

## Input

None. This skill takes no parameters.

**Trigger phrases:**
- "Refresh FR snapshot"
- "Update FR snapshot"
- "Pull latest FR data"
- "Run refresh-fr-snapshot"

---

## Output

Overwrites `/context/product-context/fr-snapshot.json` with the following schema:

```json
{
  "snapshot_date": "YYYY-MM-DD",
  "project": "[FR_PROJECT_KEY]",
  "filter": "[IMAGE_BUILDER]: prefix in summary, non-Closed",
  "total_count": 21,
  "issues": [
    {
      "key": "[FR_PROJECT_KEY]-7497",
      "summary": "[IMAGE_BUILDER]: Example feature request title",
      "status": "Open",
      "customer_name": "[CUSTOMER_1]",
      "description": "Plain text description of the feature request"
    }
  ]
}
```

**Field definitions:**
- `snapshot_date`: Today's date in YYYY-MM-DD format
- `project`: Always `"[FR_PROJECT_KEY]"`
- `filter`: Always `"[IMAGE_BUILDER]: prefix in summary, non-Closed"`
- `total_count`: Number of issues returned
- `issues[]`: Array of issue objects
  - `key`: Jira issue key (e.g. `"[FR_PROJECT_KEY]-7497"`)
  - `summary`: Full issue summary including the `[IMAGE_BUILDER]:` prefix
  - `status`: Current Jira status (e.g. `"Open"`, `"In Progress"`, `"Under Review"`)
  - `customer_name`: Value from `[CUSTOM_FIELD_CUSTOMER_NAME]` (Customer Name field), converted from ADF to plain text. `null` if the field is empty or not populated.
  - `description`: Issue description converted from ADF to plain text. `null` if empty.

---

## Instructions

### Step 1: Query [FR_PROJECT_KEY] via Atlassian MCP

Use JQL search against the [FR_PROJECT_KEY] project:

```
project = [FR_PROJECT_KEY] AND summary ~ "[IMAGE_BUILDER]:" AND status != Closed
```

**Atlassian Cloud ID**: `[ATLASSIAN_CLOUD_ID]`

Request fields: `summary`, `status`, `description`, `[CUSTOM_FIELD_CUSTOMER_NAME]`

Use `searchJiraIssuesUsingJql` with `maxResults: 100` to ensure all matching issues are captured (expect ~21 non-Closed issues with the [IMAGE_BUILDER]: prefix).

### Step 2: Extract and normalize fields

For each issue returned:

1. **key**: Use directly from response
2. **summary**: Use directly from response
3. **status**: Extract the status name string from the status object
4. **customer_name**: Extract from `[CUSTOM_FIELD_CUSTOMER_NAME]`. This field uses ADF (Atlassian Document Format) — convert to plain text by extracting text nodes. If the field is `null`, empty, or contains no text content, set to `null`.
5. **description**: Extract from the description field. This field uses ADF — convert to plain text by extracting text nodes. If the field is `null` or empty, set to `null`.

### Step 3: Write snapshot file

Assemble the JSON object with today's date, project info, total count, and the issues array. Write to `/context/product-context/fr-snapshot.json`, overwriting any existing file.

---

## Notes

- **`[CUSTOM_FIELD_CUSTOMER_NAME]` is inconsistently populated**: Many [FR_PROJECT_KEY] issues have no customer name. Expect `null` for the majority of issues. This is normal — the field is optional on the [FR_PROJECT_KEY] project.
- **`[IMAGE_BUILDER]:` prefix filter is primary**: The summary prefix `[IMAGE_BUILDER]:` is the reliable way to identify [PRODUCT] feature requests in the [FR_PROJECT_KEY] project. Label-based filtering (e.g. `labels = [image-builder]`) only catches ~7 of ~21 non-Closed issues.
- **[FR_PROJECT_KEY] issues are separate from [PROJECT_KEY]**: [FR_PROJECT_KEY] is a cross-product feature request board. Issues here are not linked to [PROJECT_KEY] issues in Jira. Downstream skills should suggest likely [PROJECT_KEY] matches based on content similarity but never assert a Jira link that doesn't exist.
- **ADF conversion**: Both `description` and `[CUSTOM_FIELD_CUSTOMER_NAME]` may be in ADF format. Extract text content by walking the ADF node tree and concatenating text nodes. Strip formatting — plain text only.

---

## Progress Signals

```
⚙️  refresh-fr-snapshot — querying [FR_PROJECT_KEY] for [IMAGE_BUILDER]: issues...
   ✓ Query complete — [N] non-Closed issues found
   ✓ Fields extracted and normalized
   ✓ Snapshot written to /context/product-context/fr-snapshot.json

✅ FR snapshot refreshed — [N] issues, [M] with customer names
```