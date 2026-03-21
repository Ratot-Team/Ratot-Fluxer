// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { BotAdmin } from "../../../models/botAdminsSchema.js";
import { errorLogger, warnLogger } from "../../utils/logger.js";
import { getUserTag } from "../../utils/botAdminUtils.js";

function mentionUser(userId) {
	return `<@${userId}>`;
}

export default {
	name: "remove-bot-admin",
	description:
		"Remove an administrator of the bot (don't do it without the creator permission!)",
	usage: "remove-bot-admin <@user>",
	aliases: ["removebotadmin"],

	async execute({ api, message }) {
		try {
			const requesterTag = getUserTag(message.author);

			const userToRemove = message.mentions?.[0];

			if (!userToRemove) {
				await api.channels.createMessage(message.channel_id, {
					content:
						"You need to mention the user you want to remove as a bot administrator.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			if (
				process.env.RATOT_CURRENT_FLUXER_ID &&
				userToRemove.id === process.env.RATOT_CURRENT_FLUXER_ID
			) {
				await api.channels.createMessage(message.channel_id, {
					content: "I cannot be my own administrator",
					message_reference: { message_id: message.id },
				});
				return;
			}

			const verifyUser = await BotAdmin.findOne({
				userId: userToRemove.id,
			}).lean();

			if (!verifyUser) {
				await api.channels.createMessage(message.channel_id, {
					content: `${mentionUser(userToRemove.id)} isn't my administrator`,
					message_reference: { message_id: message.id },
				});
				return;
			}

			await BotAdmin.deleteMany({
				userId: userToRemove.id,
			});

			warnLogger.warn(
				`${requesterTag} removed the user ${getUserTag(userToRemove)} with the id ${userToRemove.id} from admin!`,
			);

			await api.channels.createMessage(message.channel_id, {
				content: `${mentionUser(userToRemove.id)} is no longer my administrator now`,
				message_reference: { message_id: message.id },
			});
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error(
					"Error on remove-bot-admin command. Errors:",
					error,
				);
			} else {
				console.error("Error on remove-bot-admin command:", error);
			}

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
