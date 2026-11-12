// Self-check: node check.ts
import assert from "node:assert/strict";
import { decode } from "@toon-format/toon";
import { toonify } from "./core.js";

const json = JSON.stringify({ users: [{ id: 1, name: "a" }, { id: 2, name: "b" }], ok: true }, null, 2);
const t = toonify(json)!;
assert.ok(t.includes("users[2]{id,name}:"), t);
assert.deepEqual(decode(t), JSON.parse(json));

const yaml = "items:\n  - name: alpha\n    kind: svc\n  - name: beta\n    kind: job\n  - name: gamma\n    kind: svc\n";
assert.deepEqual(decode(toonify(yaml)!), { items: [{ name: "alpha", kind: "svc" }, { name: "beta", kind: "job" }, { name: "gamma", kind: "svc" }] });
assert.equal(toonify("version: 1.10\nmode: 0755\n"), undefined); // quoting numeric-looking strings makes TOON longer

assert.equal(toonify("Error: boom"), undefined); // single line
assert.equal(toonify("hello world\nsecond line"), undefined); // plain text
assert.equal(toonify("[not json"), undefined);
assert.equal(toonify('{"id": 12345678901234567890}'), undefined); // unsafe int
assert.equal(toonify("42"), undefined);
console.log("ok");
