// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { errorLogger } from "../../utils/logger.js";
import { getContextPrefix } from "../../utils/prefixUtils.js";

const BOT_ICON_URL =
	"https://fluxerusercontent.com/avatars/1483578500003804314/06595fca.webp?size=512";
const SOURCE_URL = "https://github.com/Ratot-Team/Ratot-Fluxer";

export default {
	name: "list-servers",
	description: "Lists all the servers the bot is on.",
	usage: "list-servers [page]",
	aliases: ["listservers"],

	async execute({ client, api, message, args }) {
		try {
			const requestedPage = Number.parseInt(args[0], 10);
			const currentPage =
				!args[0] || Number.isNaN(requestedPage) || requestedPage < 1
					? 1
					: requestedPage;

			const guildsResponse = await client.rest.get("/users/@me/guilds");
			const guilds = Array.isArray(guildsResponse) ? guildsResponse : [];

			if (!guilds.length) {
				await api.channels.createMessage(message.channel_id, {
					content: "I am not in any servers.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			const itemsPerPage = 10;
			const totalPages = Math.ceil(guilds.length / itemsPerPage);

			if (currentPage > totalPages) {
				await api.channels.createMessage(message.channel_id, {
					content: `That page does not exist. There ${totalPages === 1 ? "is" : "are"} only ${totalPages} page${totalPages === 1 ? "" : "s"}.`,
					message_reference: { message_id: message.id },
				});
				return;
			}

			const startIndex = (currentPage - 1) * itemsPerPage;
			const endIndex = startIndex + itemsPerPage;
			const guildsForPage = guilds.slice(startIndex, endIndex);

			const lines = guildsForPage.map((guild, index) => {
				const absoluteIndex = startIndex + index + 1;
				return `${absoluteIndex}. **${guild.name}**\nID: \`${guild.id}\``;
			});

			const prefix = await getContextPrefix(api, message);

			let description = lines.join("\n\n");

			if (currentPage > 1) {
				description += `\n\nPrevious page: \`${prefix}list-servers ${currentPage - 1}\``;
			}

			if (currentPage < totalPages) {
				description += `\nNext page: \`${prefix}list-servers ${currentPage + 1}\``;
			}

			await api.channels.createMessage(message.channel_id, {
				message_reference: { message_id: message.id },
				embeds: [
					{
						title: "Servers List",
						description,
						color: 0x66ccff,
						timestamp: new Date().toISOString(),
						author: {
							name: process.env.RATOT_CURRENT_NAME || "Ratot",
							icon_url: BOT_ICON_URL,
							url: SOURCE_URL,
						},
						footer: {
							text: `Copyright © ${new Date().getFullYear()} by Captain Ratax • Page ${currentPage} of ${totalPages} • Total servers: ${guilds.length}`,
							icon_url: BOT_ICON_URL,
						},
					},
				],
			});
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error(
					"Error on list-servers command. Errors:",
					error,
				);
			} else {
				console.error("Error on list-servers command:", error);
			}

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
