// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { errorLogger } from "../../utils/logger.js";

const BOT_ICON_URL =
	"https://fluxerusercontent.com/avatars/1483578500003804314/06595fca.webp?size=512";
const SOURCE_URL = "https://github.com/Ratot-Team/Ratot-Fluxer";

export default {
	name: "license",
	description: "Shows the bot license information and source code link.",
	aliases: ["licence"],
	usage: "license",

	async execute({ api, message }) {
		try {
			const currentYear = new Date().getFullYear();
			const botName = process.env.RATOT_CURRENT_NAME || "Ratot";

			await api.channels.createMessage(message.channel_id, {
				message_reference: { message_id: message.id },
				embeds: [
					{
						title: `${botName} License`,
						description:
							"This bot is free software licensed under the **GNU Affero General Public License v3.0 or later**.",
						color: 0x66ccff,
						fields: [
							{
								name: "License",
								value: "GNU AGPL v3.0-or-later",
								inline: false,
							},
							{
								name: "Source Code",
								value: SOURCE_URL,
								inline: false,
							},
							{
								name: "License Details",
								value: "See the LICENSE file in the GitHub repository for the full license text.",
								inline: false,
							},
							{
								name: "Your Rights",
								value: "You can study, share, and modify this bot under the terms of the AGPL v3 or later.",
								inline: false,
							},
						],
						timestamp: new Date().toISOString(),
						author: {
							name: botName,
							icon_url: BOT_ICON_URL,
							url: SOURCE_URL,
						},
						footer: {
							text: `Copyright © ${currentYear} by Captain Ratax`,
							icon_url: BOT_ICON_URL,
						},
					},
				],
			});
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error("Error on license command. Errors:", error);
			} else {
				console.error("Error on license command:", error);
			}

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
