// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { errorLogger } from "../../utils/logger.js";

let lastPingUserId;
let pingCounter = 0;

export default {
	name: "ping",
	description:
		'The bot responds with "pong", but to know the bot ping you really have to insist a little bit',
	aliases: [],
	usage: "ping",

	async execute({ client, api, message, args }) {
		try {
			if (lastPingUserId === message.author.id) {
				pingCounter++;

				if (pingCounter >= 5) {
					const startedAt = Date.now();

					const sentMessage = await api.channels.createMessage(
						message.channel_id,
						{
							content: "Checking my ping...",
							message_reference: { message_id: message.id },
						},
					);

					const apiLatency = Date.now() - startedAt;

					await api.channels.editMessage(
						message.channel_id,
						sentMessage.id,
						{
							content: `Oh... Sorry... Right! My ping is around ${apiLatency}ms`,
						},
					);

					lastPingUserId = message.author.id;
					pingCounter = 1;
					return;
				}
			} else {
				lastPingUserId = message.author.id;
				pingCounter = 1;
			}

			let responseText = "Pong";

			await api.channels.createMessage(message.channel_id, {
				content: responseText,
				message_reference: { message_id: message.id },
			});
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error("Error on ping command. Errors:", error);
			} else {
				console.error("Error on ping command:", error);
			}

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
