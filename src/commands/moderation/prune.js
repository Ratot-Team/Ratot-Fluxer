// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { errorLogger } from "../../utils/logger.js";
import {
	FluxerPermissionFlags,
	computeChannelPermissions,
	hasPermission,
} from "../../utils/fluxerPermissions.js";

const pruneTimeouts = Object.create(null);

export default {
	name: "prune",
	description:
		"The bot deletes a certain number of messages. Only admins can use this command.",
	usage: "prune <number>",
	aliases: ["clear", "purge"],

	async execute({ client, api, message, args }) {
		try {
			const rawNumber = args[0];
			const messagesToDelete = Number.parseInt(rawNumber, 10);

			if (!rawNumber || Number.isNaN(messagesToDelete)) {
				await api.channels.createMessage(message.channel_id, {
					content:
						"You need to tell me how many messages I should delete.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			if (messagesToDelete < 0) {
				await api.channels.createMessage(message.channel_id, {
					content:
						"Think a little bit of what you asked me to do... Did you really think you could delete negative messages? Pff humans...",
					message_reference: { message_id: message.id },
				});
				return;
			}

			if (messagesToDelete === 0) {
				await api.channels.createMessage(message.channel_id, {
					content:
						"Nothing deleted! Because you know... 0 is nothing... human...",
					message_reference: { message_id: message.id },
				});
				return;
			}

			if (messagesToDelete > 99) {
				await api.channels.createMessage(message.channel_id, {
					content:
						"Unfortunately you can only delete a maximum of 99 messages at a time with this command.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			const channel = await api.channels.get(message.channel_id);

			if (!channel?.guild_id) {
				await api.channels.createMessage(message.channel_id, {
					content: "This command can only be used in a server!",
					message_reference: { message_id: message.id },
				});
				return;
			}

			const guildId = channel.guild_id;

			const now = Date.now();
			const timeoutInfo = pruneTimeouts[message.channel_id];

			if (timeoutInfo) {
				const timeSpent = now - timeoutInfo.date;

				if (timeSpent <= 5000) {
					const secondsLeft = Math.ceil((5000 - timeSpent) / 1000);

					await api.channels.createMessage(message.channel_id, {
						content: `You need to wait 5 seconds before using the delete command on this channel again. ${secondsLeft} seconds left`,
						message_reference: { message_id: message.id },
					});
					return;
				}
			}

			const [roles, requesterMember, botMember] = await Promise.all([
				api.guilds.getRoles(guildId),
				api.guilds.getMember(guildId, message.author.id),
				client.rest.get(`/guilds/${guildId}/members/@me`),
			]);

			const requesterPermissions = computeChannelPermissions(
				requesterMember,
				channel,
				roles,
				guildId,
			);

			const botPermissions = computeChannelPermissions(
				botMember,
				channel,
				roles,
				guildId,
			);

			const requesterCanManage =
				hasPermission(
					requesterPermissions,
					FluxerPermissionFlags.ADMINISTRATOR,
				) ||
				hasPermission(
					requesterPermissions,
					FluxerPermissionFlags.MANAGE_MESSAGES,
				);

			if (!requesterCanManage) {
				await api.channels.createMessage(message.channel_id, {
					content:
						"Only users with the manage messages permission can delete messages!",
					message_reference: { message_id: message.id },
				});
				return;
			}

			const botCanManage =
				hasPermission(
					botPermissions,
					FluxerPermissionFlags.ADMINISTRATOR,
				) ||
				hasPermission(
					botPermissions,
					FluxerPermissionFlags.MANAGE_MESSAGES,
				);

			if (!botCanManage) {
				await api.channels.createMessage(message.channel_id, {
					content: "I don't have permission to delete messages!",
					message_reference: { message_id: message.id },
				});
				return;
			}

			const recentMessages = await api.channels.getMessages(
				message.channel_id,
				{
					limit: messagesToDelete,
					before: message.id,
				},
			);

			const previousMessageIds = Array.isArray(recentMessages)
				? recentMessages.map((msg) => msg.id)
				: [];

			const messageIds = [...previousMessageIds, message.id];

			if (messageIds.length === 1) {
				await api.channels.deleteMessage(
					message.channel_id,
					message.id,
				);
				return;
			}

			await client.rest.post(
				`/channels/${message.channel_id}/messages/bulk-delete`,
				{
					body: {
						message_ids: messageIds,
					},
				},
			);

			pruneTimeouts[message.channel_id] = {
				date: now,
			};

			const confirmation = await api.channels.createMessage(
				message.channel_id,
				{
					content: `Deleted ${messageIds.length} message${messageIds.length === 1 ? "" : "s"}.`,
				},
			);

			setTimeout(async () => {
				try {
					await api.channels.deleteMessage(
						message.channel_id,
						confirmation.id,
					);
				} catch {
					// Ignore errors when trying to delete the confirmation message
				}
			}, 4000);
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error("Error on prune command. Errors:", error);
			} else {
				console.error("Error on prune command:", error);
			}

			let errorMessage =
				"Something wrong happened when trying to execute that command...";

			if (
				error?.code === "MISSING_PERMISSIONS" ||
				error?.status === 403
			) {
				errorMessage =
					"I couldn't complete that prune action because a required permission is missing.";
			} else if (
				error?.code === "INVALID_FORM_BODY" ||
				error?.status === 400
			) {
				errorMessage =
					"I couldn't delete the messages because the bulk delete request format was rejected.";
			}

			await api.channels.createMessage(message.channel_id, {
				content: errorMessage,
				message_reference: { message_id: message.id },
			});
		}
	},
};
