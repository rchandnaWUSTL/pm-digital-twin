# Skill: Get Notes by Customer

## Purpose
Return the list of all note files for a given customer, ordered by date (most recent first).

---

## Input

A customer name (canonical or display form).

---

## Output

```json
{
  "customer": "string — canonical customer name",
  "notes": [
    {
      "file": "string — note filename",
      "date": "YYYY-MM-DD",
      "path": "string — full relative path"
    }
  ],
  "total_count": "number"
}
```

---

## Instructions

1. Canonicalize the customer name (lowercase, hyphenated)
2. Search `/context/customer-notes/` for files matching `{canonical}-*.md`
3. Extract the date from each filename
4. Return sorted by date, most recent first
5. If no files found, return empty notes array with total_count: 0

---

## Progress Signals

```
⚙️  get-notes-by-customer — finding notes for [customer]...
   ✓ get-notes-by-customer — N notes found
```
