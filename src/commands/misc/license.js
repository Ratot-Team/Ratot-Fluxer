// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

export default {
	name: "license",
	description: "Shows the bot license information and source code link.",
	aliases: ["licence"],
    usage: "license",

	async execute({ api, message }) {
		try {
			const currentYear = new Date().getFullYear();
			const botName = process.env.RATOT_CURRENT_NAME || "Ratot";
			const sourceCodeUrl = "https://github.com/Ratot-Team/Ratot-Fluxer";

			const responseText =
				`# ${botName} License\n\n` +
				`This bot is free software licensed under the **GNU Affero General Public License v3.0 or later**.\n\n` +
				`**License**\n` +
				`GNU AGPL v3.0-or-later\n\n` +
				`**Source Code**\n` +
				`${sourceCodeUrl}\n\n` +
				`**License Details**\n` +
				`See the LICENSE file in the GitHub repository for the full license text.\n\n` +
				`**Your Rights**\n` +
				`You can study, share, and modify this bot under the terms of the AGPL v3 or later.\n\n` +
				`Copyright © ${currentYear} by Captain Ratax`;

			await api.channels.createMessage(message.channel_id, {
				content: responseText,
				message_reference: { message_id: message.id },
			});
		} catch (error) {
			console.error("Error on license command:", error);

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
