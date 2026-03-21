// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import dotenv from "dotenv";
import { errorLogger } from "../../utils/logger.js";

dotenv.config();

function mentionUser(userId) {
	return `<@${userId}>`;
}

export default {
	name: "hug",
	description:
		"The bot gives a hug to someone you mention. You can mention yourself don't be shy!",
	aliases: [],
    usage: "hug <@someone>",

	async execute({ api, message, args }) {
		try {
			const userToHug = message.mentions?.[0];

			if (!userToHug) {
				let responseText = "You need to mention a user to hug.";

				await api.channels.createMessage(message.channel_id, {
					content: responseText,
					message_reference: { message_id: message.id },
				});
				return;
			}

			const authorId = message.author.id;
			const botId = process.env.RATOT_CURRENT_FLUXER_ID;

			let responseText;

			if (botId && userToHug.id === botId) {
				responseText = `I hugged myself as requested by ${mentionUser(authorId)}`;
			} else if (userToHug.id === authorId) {
				responseText = "I hugged you!";
			} else {
				responseText = `I hugged ${mentionUser(userToHug.id)} as requested by ${mentionUser(authorId)}`;
			}

			await api.channels.createMessage(message.channel_id, {
				content: responseText,
				message_reference: { message_id: message.id },
			});
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error("Error on hug command. Errors:", error);
			} else {
				console.error("Error on hug command:", error);
			}

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
