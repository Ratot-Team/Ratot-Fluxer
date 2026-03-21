// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { errorLogger } from "../../utils/logger.js";
import { canAccessAdminCommand } from "../../utils/commandAccessUtils.js";
import { getContextPrefix } from "../../utils/prefixUtils.js";

const SAFE_PAGE_CHAR_LIMIT = 1700;

function parsePositivePageNumber(value) {
	const parsed = Number.parseInt(value, 10);

	if (Number.isNaN(parsed) || parsed < 1) {
		return 1;
	}

	return parsed;
}

function buildCommandPages({ botName, prefix, commands, charLimit }) {
	const pages = [];
	let currentEntries = [];
	let currentLength = 0;

	const baseHeader = `# ${botName} Commands List\n\n`;
	const baseFooter = `\n\nCopyright © ${new Date().getFullYear()} by Captain Ratax`;

	for (const command of commands) {
		const usage = command.usage
			? `${prefix}${command.usage}`
			: `${prefix}${command.name}`;

		const description = command.description || "No description available.";
		const entry = `**${usage}**\n${description}`;

		const separatorLength = currentEntries.length > 0 ? 2 : 0;
		const predictedLength =
			baseHeader.length +
			currentLength +
			separatorLength +
			entry.length +
			baseFooter.length +
			40;

		if (currentEntries.length > 0 && predictedLength > charLimit) {
			pages.push(currentEntries);
			currentEntries = [entry];
			currentLength = entry.length;
		} else {
			currentEntries.push(entry);
			currentLength += separatorLength + entry.length;
		}
	}

	if (currentEntries.length > 0) {
		pages.push(currentEntries);
	}

	return pages;
}

export default {
	name: "help-commands",
	description:
		"The bot sends the list of all commands and the description of what they do.",
	aliases: ["helpcommands", "commands"],
	usage: "help-commands [page]",

	async execute({ client, api, message, args }) {
		try {
			const currentYear = new Date().getFullYear();
			const botName = process.env.RATOT_CURRENT_NAME || "Ratot";
			const prefix = await getContextPrefix(api, message);
			const requestedPage = parsePositivePageNumber(args[0]);
			const canSeeAdminCommands = await canAccessAdminCommand(
				api,
				message,
			);

			const uniqueCommands = [
				...new Map(
					[...client.commands.values()].map((command) => [
						command.name,
						command,
					]),
				).values(),
			]
				.filter((command) => {
					if (!command.adminCommand) {
						return true;
					}

					return canSeeAdminCommands;
				})
				.sort((a, b) => a.name.localeCompare(b.name));

			if (!uniqueCommands.length) {
				await api.channels.createMessage(message.channel_id, {
					content: "No commands are available right now.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			const pages = buildCommandPages({
				botName,
				prefix,
				commands: uniqueCommands,
				charLimit: SAFE_PAGE_CHAR_LIMIT,
			});

			const totalPages = pages.length;
			const currentPage =
				requestedPage > totalPages ? totalPages : requestedPage;

			if (requestedPage > totalPages) {
				await api.channels.createMessage(message.channel_id, {
					content: `That page does not exist. There ${totalPages === 1 ? "is" : "are"} only ${totalPages} page${totalPages === 1 ? "" : "s"}.`,
					message_reference: { message_id: message.id },
				});
				return;
			}

			const pageEntries = pages[currentPage - 1];

			let responseText =
				`# ${botName} Commands List\n\n` +
				`${pageEntries.join("\n\n")}\n\n` +
				`Page ${currentPage}/${totalPages}`;

			if (currentPage > 1) {
				responseText += `\nPrevious page: \`${prefix}help-commands ${currentPage - 1}\``;
			}

			if (currentPage < totalPages) {
				responseText += `\nNext page: \`${prefix}help-commands ${currentPage + 1}\``;
			}

			responseText += `\n\nCopyright © ${currentYear} by Captain Ratax`;

			await api.channels.createMessage(message.channel_id, {
				content: responseText,
				message_reference: { message_id: message.id },
			});
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error(
					"Error on help-commands command. Errors:",
					error,
				);
			} else {
				console.error("Error on help-commands command:", error);
			}

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
