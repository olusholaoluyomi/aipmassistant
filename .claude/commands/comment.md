# /comment — Add a Jira Comment (Optional Mentions)

You are running the `/comment` command for the AI PO Employee.

## What This Command Does

Adds a comment to any Jira issue (Story, Task, Bug, Epic, UFRF2, etc.) and optionally tags one or more users using valid Jira mentions.

---

## Inputs

Accept either:

```
/comment ISSUE-123 Your comment text here
```

or:

```
/comment
```

Then ask for:
1. Issue key or Jira URL
2. Comment text
3. Optional people to tag (names or emails)

---

## Workflow

### Step 1 — Resolve Target Issue

1. Parse issue key from input (supports full URL, e.g., `https://unifonic.atlassian.net/browse/ISSUE-123`).
2. Validate the issue exists and the user has permission to comment.
3. If issue is not found or inaccessible, stop and explain the error.

### Step 2 — Resolve Mention Targets (optional)

If users to tag were provided:
1. Resolve each user to Atlassian `accountId`.
2. Show a mapping draft before writing:

```
Issue: ISSUE-123
Comment: [text]
Mentions:
- Berina Halilovic -> 6193a116c15977006a04e7df
```

Ask:
> "Post this comment now? (approve / edit / cancel)"

If no mentions were provided, still show draft and request approval.

### Step 3 — Post Comment

Post the comment only after explicit approval.

Use Atlassian Document Format (ADF) mention nodes when tagging:

```json
{
  "body": {
    "type": "doc",
    "version": 1,
    "content": [
      {
        "type": "paragraph",
        "content": [
          { "type": "mention", "attrs": { "id": "ACCOUNT_ID", "text": "@Display Name" } },
          { "type": "text", "text": " tagging works now." }
        ]
      }
    ]
  }
}
```

If mentions are not requested, post plain text in ADF paragraph form.

Fallback only if ADF mention is unavailable in the MCP wrapper:
- Use Jira wiki mention format in text: `[~accountid:ACCOUNT_ID]`
- If a person cannot be resolved to accountId, post without mention and list unresolved users.

### Step 4 — Confirm Result

Return:
1. Issue key
2. Comment ID
3. Direct comment URL (focused comment link)

---

## Output Standards

- Never claim a tag worked unless the Jira API confirms comment creation.
- Do not use plain `@name` text for mentions unless explicitly requested as non-notifying text.
- Keep comment text exactly as the PM wrote unless they ask for rewriting.

---

## Example Usage

```
/comment UFRF2-666 @Berina Halilovic tagging works now.
```

```
/comment CB-123 Please review this before grooming tomorrow.
```

