// Plain JS so it runs on Node without a build step (pi extension and CLI).
import { encode } from "@toon-format/toon";
import { parse as parseYaml } from "yaml";

// Returns TOON text when `text` is a whole JSON or YAML document and TOON is shorter; else undefined.
export function toonify(text) {
	const data = parse(text.trim());
	if (data === undefined) return;
	const out = encode(data);
	return out.length < text.length ? out : undefined;
}

function parse(s) {
	if (s.length < 2) return;
	if (s[0] === "{" || s[0] === "[") {
		// ponytail: integers past 2^53 lose precision in JSON.parse, so skip such docs. Upgrade: reviver with context.source.
		if (/(?<![\d.])\d{16,}/.test(s)) return;
		try {
			return JSON.parse(s);
		} catch {
			return; // not JSON; plain text starting with a bracket is not YAML either
		}
	}
	// YAML: require multi-line block mapping or sequence, otherwise any log line ("Error: x") would match.
	if (!s.includes("\n") || !/^(?:[\w"'.-][^:\n]*:(?:\s|$)|- )/.test(s)) return;
	try {
		// failsafe schema keeps every scalar a string, so "1.10" or "0755" survive unchanged.
		const v = parseYaml(s, { schema: "failsafe", uniqueKeys: true });
		return v !== null && typeof v === "object" ? v : undefined;
	} catch {
		return;
	}
}
