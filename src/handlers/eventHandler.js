// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import getAllFiles from "../utils/getAllFiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function loadEvents(client) {
	const eventsPath = path.join(__dirname, "..", "events");
	const eventFiles = getAllFiles(eventsPath).filter((file) =>
		file.endsWith(".js"),
	);

	for (const file of eventFiles) {
		const fileUrl = pathToFileURL(file).href;
		const imported = await import(fileUrl);
		const event = imported.default;

		if (!event?.name || typeof event.execute !== "function") {
			continue;
		}

		client.on(event.name, (payload) => {
			event.execute({
				client,
				...payload,
			});
		});
	}
}