---
name: toon
description: Shrink JSON/YAML command output into TOON to save tokens. Use when running shell commands that print JSON or YAML (kubectl -o json, gh api, curl APIs, jq, docker inspect, cat of .json/.yaml).
---

# toon

Requires the `tnfy` command (`npm i -g github:Alfar-Lab/pi-toonify`).

```
tnfy <command> [args...]   run command, print stdout as TOON if it is JSON/YAML, else unchanged
<command> | tnfy           same, for piped input
```

- Output is unchanged when it is not JSON/YAML, TOON is not shorter, or the command exits non-zero. Exit code and stderr are passed through.
- Do not use `tnfy` when output must be parsed as JSON by another tool, or when you will copy text from it into an edit of the original file.
- TOON arrays: `users[2]{id,name}:` header, then one CSV-like row per item.
