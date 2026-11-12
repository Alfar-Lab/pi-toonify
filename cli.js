#!/usr/bin/env node
import { spawn } from "node:child_process";
import { toonify } from "./core.js";

const USAGE = `Usage:
  tnfy <command> [args...]   run command, print stdout as TOON if it is JSON/YAML, else unchanged
  <command> | tnfy           same, for piped input
Falls back to the original output when it is not JSON/YAML, TOON is not shorter, or the command fails.`;

const args = process.argv.slice(2);
if (args[0] === "-h" || args[0] === "--help") {
	console.log(USAGE);
	process.exit(0);
}

// ponytail: buffers all stdout before printing (no streaming). Fine for command output; upgrade if huge streams matter.
const collect = async (stream) => {
	const chunks = [];
	for await (const c of stream) chunks.push(c);
	return Buffer.concat(chunks);
};

const emit = (buf, ok) => {
	const out = ok ? toonify(buf.toString("utf8")) : undefined;
	process.stdout.write(out === undefined ? buf : out + "\n");
};

if (args.length === 0) {
	if (process.stdin.isTTY) {
		console.error(USAGE);
		process.exit(2);
	}
	emit(await collect(process.stdin), true);
} else {
	const child = spawn(args[0], args.slice(1), { stdio: ["inherit", "pipe", "inherit"] });
	const [buf, [code, signal]] = await Promise.all([
		collect(child.stdout),
		new Promise((res) => {
			child.on("error", (e) => {
				console.error(`tnfy: ${e.message}`);
				res([e.code === "ENOENT" ? 127 : 126, null]);
			});
			child.on("close", (c, s) => res([c, s]));
		}),
	]);
	emit(buf, code === 0);
	if (signal) process.kill(process.pid, signal);
	process.exitCode = code ?? 1;
}
