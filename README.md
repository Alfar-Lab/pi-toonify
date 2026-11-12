# pi-toonify

Rewrite JSON/YAML tool and command output as [TOON](https://github.com/toon-format/toon) to save tokens. Example: a 50-item JSON array drops from 4232 to 1156 chars.

## pi (extension)

```bash
pi install git:github.com/Alfar-Lab/pi-toonify
```

Rewrites tool results automatically. No skill needed.

- Converts a text part only when the whole part is a JSON or multi-line YAML document and TOON is shorter.
- Skips `read` (so `edit` still matches file contents), error results, and nested tool calls (e.g. from `mcpScript`).

## Other agent harnesses (CLI + skill)

```bash
npm i -g github:Alfar-Lab/pi-toonify    # provides the `tnfy` command
```

```
tnfy <command> [args...]   run command, print stdout as TOON if it is JSON/YAML, else unchanged
<command> | tnfy           same, for piped input
```

Falls back to the original output when it is not JSON/YAML, TOON is not shorter, or the command exits non-zero. Exit code and stderr pass through.

### With other command prefixes (e.g. rtk)

`tnfy` must be the outermost wrapper (`tnfy rtk <cmd>`) or at the end of a pipe (`<cmd> | tnfy`). `rtk tnfy <cmd>` disables rtk's filter, and a rewrite hook does not recognize `tnfy <cmd>`. When the order cannot be guaranteed, skip `tnfy` and run the command directly. Pipe form reports `tnfy`'s exit code; use `set -o pipefail` if it matters.

The pi extension does not have this issue: it converts the final tool result after every prefix has run.

Copy `skills/toon/SKILL.md` into the harness's skill folder, e.g. Claude Code:

```bash
mkdir -p ~/.claude/skills/toon
cp "$(npm root -g)/pi-toonify/skills/toon/SKILL.md" ~/.claude/skills/toon/
```

## Example

```console
$ cat users.json
[
  { "id": 1, "name": "Ana", "role": "admin" },
  { "id": 2, "name": "Budi", "role": "user" }
]
$ tnfy cat users.json
[2]{id,name,role}:
  1,Ana,admin
  2,Budi,user
$ tnfy echo hello      # not JSON/YAML: unchanged
hello
```

## Limits

- XML is not converted (lossy).
- JSON with integers of 16+ digits is left as-is (precision loss). YAML scalars stay strings.
- The CLI buffers stdout before printing (no streaming).

## Check

```bash
npm i && npm test
```
