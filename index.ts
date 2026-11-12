import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { toonify } from "./core.js";

// `read` stays raw so `edit` oldText still matches file contents.
const SKIP = new Set(["read"]);

export default function (pi: ExtensionAPI) {
	pi.on("tool_result", (event) => {
		// Nested results feed scripts (e.g. mcpScript) that may JSON.parse them; leave those alone.
		if (event.isError || event.parentToolCallId || SKIP.has(event.toolName)) return;

		let changed = false;
		const content = event.content.map((part) => {
			if (part.type !== "text") return part;
			const text = toonify(part.text);
			if (text === undefined) return part;
			changed = true;
			return { ...part, text };
		});
		if (!changed) return;
		return { content, structuredContent: event.structuredContent };
	});
}
