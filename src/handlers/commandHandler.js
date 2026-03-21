// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import getAllFiles from "../utils/getAllFiles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function loadCommands(client) {
	const commandsPath = path.join(__dirname, "..", "commands");
	const commandFiles = getAllFiles(commandsPath).filter((file) =>
		file.endsWith(".js"),
	);

	for (const file of commandFiles) {
		const fileUrl = pathToFileURL(file).href;
		const imported = await import(fileUrl);
		const command = imported.default;

		if (!command?.name || typeof command.execute !== "function") {
			continue;
		}

		const normalizedFile = file.replace(/\\/g, "/");

		if (normalizedFile.includes("/commands/admin/")) {
			command.adminCommand = true;
		}

		client.commands.set(command.name.toLowerCase(), command);

		if (Array.isArray(command.aliases)) {
			for (const alias of command.aliases) {
				client.commands.set(alias.toLowerCase(), command);
			}
		}
	}
}
