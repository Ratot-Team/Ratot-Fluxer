// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { BotAdmin } from "../../../models/botAdminsSchema.js";
import { errorLogger, warnLogger } from "../../utils/logger.js";
import { getUserTag } from "../../utils/botAdminUtils.js";
import sendBotAdminWelcomeDm from "../../utils/sendBotAdminWelcomeDm.js";

function mentionUser(userId) {
	return `<@${userId}>`;
}

export default {
	name: "add-bot-admin",
	description:
		"Add a new administrator to the bot (don't do it without the creator permission!)",
	usage: "add-bot-admin <@user>",
	aliases: ["addbotadmin"],

	async execute({ client, api, message }) {
		try {
			const requesterId = message.author.id;
			const requesterName = getUserTag(message.author);

			const userToAdd = message.mentions?.[0];

			if (!userToAdd) {
				await api.channels.createMessage(message.channel_id, {
					content:
						"You need to mention the user you want to add as a bot administrator.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			if (
				process.env.RATOT_CURRENT_FLUXER_ID &&
				userToAdd.id === process.env.RATOT_CURRENT_FLUXER_ID
			) {
				await api.channels.createMessage(message.channel_id, {
					content: "I cannot be my own administrator",
					message_reference: { message_id: message.id },
				});
				return;
			}

			const verifyUser = await BotAdmin.findOne({
				userId: userToAdd.id,
			}).lean();

			if (verifyUser) {
				await api.channels.createMessage(message.channel_id, {
					content: "That user is already my administrator",
					message_reference: { message_id: message.id },
				});
				return;
			}

			await BotAdmin.create({
				userId: userToAdd.id,
				userName: getUserTag(userToAdd),
				createdBy: requesterName,
				createdById: requesterId,
			});

			warnLogger.warn(
				`${requesterName} added the user ${getUserTag(userToAdd)} with the id ${userToAdd.id} as admin!`,
			);

			let responseText = `${mentionUser(userToAdd.id)} is now an administrator!`;

			try {
				await sendBotAdminWelcomeDm({
					client,
					api,
					targetUserId: userToAdd.id,
				});
			} catch (dmError) {
				warnLogger.warn(
					`The user ${getUserTag(userToAdd)} was added as bot admin, but the admin DM could not be sent. Error: ${dmError}`,
				);

				responseText +=
					"\nI added the user as admin, but I couldn't send the private admin information message.";
			}

			await api.channels.createMessage(message.channel_id, {
				content: responseText,
				message_reference: { message_id: message.id },
			});
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error(
					"Error on add-bot-admin command. Errors:",
					error,
				);
			} else {
				console.error("Error on add-bot-admin command:", error);
			}

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
