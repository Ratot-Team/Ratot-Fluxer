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
			const sourceCodeUrl = "https://github.com/Ratot-Team/Ratot-Fluxer";

			const responseText =
				`# ${botName} Help Menu\n\n` +
				`## Commands List\n` +
				`${prefix}help-commands\n\n` +
				`## See my code on GitHub!\n` +
				`${sourceCodeUrl}\n\n` +
				`Copyright © ${currentYear} by Captain Ratax`;

			await api.channels.createMessage(message.channel_id, {
				content: responseText,
				message_reference: { message_id: message.id },
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
