// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { errorLogger } from "../../utils/logger.js";

export default {
	name: "bot-ping",
	description: "Says the ping value of the bot.",
	aliases: ["botping"],
    usage: "bot-ping",

	async execute({ api, message, args }) {
		try {
			const startedAt = Date.now();

			const sentMessage = await api.channels.createMessage(
				message.channel_id,
				{
					content: "Checking my ping...",
					message_reference: { message_id: message.id },
				},
			);

			const apiLatency = Date.now() - startedAt;

			let responseText = `My ping is: ${apiLatency}ms`;

			await api.channels.editMessage(message.channel_id, sentMessage.id, {
				content: responseText,
			});
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error("Error on bot ping command. Errors:", error);
			} else {
				console.error("Error on bot ping command:", error);
			}

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
