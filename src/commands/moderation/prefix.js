// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { errorLogger, warnLogger } from "../../utils/logger.js";
import {
	FluxerPermissionFlags,
	computeChannelPermissions,
	hasPermission,
} from "../../utils/fluxerPermissions.js";
import { getUserTag } from "../../utils/botAdminUtils.js";
import { getGuildPrefix, upsertGuildPrefix } from "../../utils/prefixUtils.js";

export default {
	name: "prefix",
	description:
		"Shows or changes the bot prefix for this server. Only server administrators can use this command.",
	usage: "prefix [newPrefix]",
	aliases: [],

	async execute({ api, message, args }) {
		try {
			const channel = await api.channels.get(message.channel_id);

			if (!channel?.guild_id) {
				await api.channels.createMessage(message.channel_id, {
					content: "This command can only be used in a server.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			const guildId = channel.guild_id;

			const requesterMember = await api.guilds.getMember(
				guildId,
				message.author.id,
			);

			let isGuildAdmin = false;
			let usedOwnerFallback = false;

			try {
				const roles = await api.guilds.getRoles(guildId);

				const requesterPermissions = computeChannelPermissions(
					requesterMember,
					channel,
					roles,
					guildId,
				);

				isGuildAdmin = hasPermission(
					requesterPermissions,
					FluxerPermissionFlags.ADMINISTRATOR,
				);
			} catch (permissionError) {
				if (
					permissionError?.code === "MISSING_PERMISSIONS" ||
					permissionError?.status === 403
				) {
					const guild = await api.guilds.get(guildId);
					isGuildAdmin = guild?.owner_id === message.author.id;
					usedOwnerFallback = true;
				} else {
					throw permissionError;
				}
			}

			if (!isGuildAdmin) {
				await api.channels.createMessage(message.channel_id, {
					content: usedOwnerFallback
						? "I couldn't verify server administrator permissions here (probably due to missing permissions), so only the server owner can change the prefix in this server."
						: "Only server administrators can change the bot prefix in this server.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			if (!args.length) {
				const currentPrefix = await getGuildPrefix(guildId);

				await api.channels.createMessage(message.channel_id, {
					content: `The current prefix for this server is \`${currentPrefix}\`.`,
					message_reference: { message_id: message.id },
				});
				return;
			}

			const newPrefix = args.join(" ").trim();

			if (!newPrefix.length) {
				await api.channels.createMessage(message.channel_id, {
					content: "The prefix cannot be empty.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			if (/\s/.test(newPrefix)) {
				await api.channels.createMessage(message.channel_id, {
					content:
						"The prefix cannot contain spaces. Example of valid prefixes: `!`, `$`, `?`, `test`.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			await upsertGuildPrefix({
				guildId,
				prefix: newPrefix,
				modifiedBy: getUserTag(message.author),
				modifiedById: message.author.id,
			});

			warnLogger.warn(
				`${getUserTag(message.author)} changed the prefix in guild ${guildId} to "${newPrefix}"`,
			);

			await api.channels.createMessage(message.channel_id, {
				content: `The prefix for this server is now \`${newPrefix}\`.`,
				message_reference: { message_id: message.id },
			});
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error("Error on prefix command. Errors:", error);
			} else {
				console.error("Error on prefix command:", error);
			}

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
