# commit-push

Commits the currently staged (and any relevant untracked) changes with a
well-formed conventional-commit message, then pushes to the current branch.

## Usage

```
/commit-push <message>
```

`<message>` should follow conventional commits: `type(scope): description`.

## Steps

1. **Expand the commit message** into a well-formed description:
   - First line: the `$ARGUMENTS` as-is (keep it under 72 chars)
   - Blank line
   - Body: 2–4 sentences describing *why* the change was made and what behaviour
     changed, written for a future reader who has no context from this session.
     No bullet lists in the body unless there are genuinely distinct sub-items.
   - Trailer: `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`

2. **Commit** all currently staged files using the expanded message.

3. **Get the current branch name:**
   ```
   git rev-parse --abbrev-ref HEAD
   ```

4. **Push** to that branch:
   ```
   git push origin <branch>
   ```

5. **Report** the commit hash and push status.

## Notes

- Do not add `--no-verify`. If a hook fails, fix it.
- Do not amend existing commits; always create a new one.
- If nothing is staged (clean working tree), say so and stop.
