// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { errorLogger } from "../../utils/logger.js";
import { getContextPrefix } from "../../utils/prefixUtils.js";

export default {
	name: "help",
	description:
		"The bot sends a menu with some information about the bot and some commands to help.",
	aliases: [],
	usage: "help",

	async execute({ api, message }) {
		try {
			const currentYear = new Date().getFullYear();
			const botName = process.env.RATOT_CURRENT_NAME || "Ratot";
			const prefix = await getContextPrefix(api, message);

			await api.channels.createMessage(message.channel_id, {
				message_reference: { message_id: message.id },
				embeds: [
					{
						title: `${process.env.RATOT_CURRENT_NAME} Help Menu`,
						color: 0x66ccff,
						fields: [
							{
								name: "Commands List",
								value: `${prefix}help-commands`,
								inline: false,
							},
							{
								name: "\u200B",
								value: "\u200B",
								inline: false,
							},
							{
								name: "See my code on GitHub!",
								value: "https://github.com/Ratot-Team/Ratot",
								inline: false,
							},
						],
						timestamp: new Date().toISOString(),
						author: {
							name: process.env.RATOT_CURRENT_NAME,
							icon_url:
								"https://fluxerusercontent.com/avatars/1483578500003804314/06595fca.webp?size=512",
							url: "https://github.com/Ratot-Team/Ratot-Fluxer",
						},
						footer: {
							text: `Copyright © ${currentYear} by Captain Ratax`,
							icon_url:
								"https://fluxerusercontent.com/avatars/1483578500003804314/06595fca.webp?size=512",
						},
					},
				],
			});
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error("Error on help command. Errors:", error);
			} else {
				console.error("Error on help command:", error);
			}

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
