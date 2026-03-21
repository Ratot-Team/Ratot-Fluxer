// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { BotConfigs } from "../../../models/botConfigsSchema.js";
import { BotConfigsLog } from "../../../models/botConfigsLogSchema.js";
import { errorLogger, warnLogger } from "../../utils/logger.js";
import { getUserTag } from "../../utils/botAdminUtils.js";
import {
	getStatusTypeName,
	getStatusTypeListText,
	formatStatusForHumans,
} from "../../utils/botStatusUtils.js";

export default {
	name: "change-status",
	description: "Change the configured status message of the bot.",
	usage: "change-status <1-4> <status message>",
	aliases: ["changestatus", "set-status", "setstatus"],

	async execute({ api, message, args }) {
		try {
			const requesterId = message.author.id;
			const requesterTag = getUserTag(message.author);

			const rawNumber = args[0];
			const numberOfStatus = Number.parseInt(rawNumber, 10);
			const statusMessage = args.slice(1).join(" ").trim();

			if (!rawNumber || Number.isNaN(numberOfStatus)) {
				await api.channels.createMessage(message.channel_id, {
					content:
						"You need to specify the type of status you want.\n\n" +
						getStatusTypeListText(),
					message_reference: { message_id: message.id },
				});
				return;
			}

			if (!statusMessage) {
				await api.channels.createMessage(message.channel_id, {
					content: "You need to write the new status message.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			const statusTypeName = getStatusTypeName(numberOfStatus);

			if (!statusTypeName) {
				await api.channels.createMessage(message.channel_id, {
					content:
						"You need to specify a valid type of status.\n\n" +
						getStatusTypeListText(),
					message_reference: { message_id: message.id },
				});
				return;
			}

			if (statusMessage.length > 128) {
				await api.channels.createMessage(message.channel_id, {
					content: `Status can't have more than 128 characters. You wrote a status with ${statusMessage.length} characters.`,
					message_reference: { message_id: message.id },
				});
				return;
			}

			const previousConfig = await BotConfigs.findOne({
				config: "Status",
			});

			await BotConfigs.findOneAndUpdate(
				{ config: "Status" },
				{
					config: "Status",
					value: statusMessage,
					value2: statusTypeName,
					value3: "",
					lastModifiedBy: requesterTag,
					lastModifiedById: requesterId,
				},
				{
					upsert: true,
					returnDocument: "after",
				},
			);

			await BotConfigsLog.create({
				changed: "Status",
				changedTo: statusMessage,
				changedTo2: statusTypeName,
				changedTo3: "",
				changedBy: requesterTag,
				changedById: requesterId,
			});

			warnLogger.warn(
				`Bot status changed by ${requesterTag} to ${statusTypeName} ${statusMessage}`,
			);

			const previousText = previousConfig
				? formatStatusForHumans(
						previousConfig.value2,
						previousConfig.value,
					)
				: "No previous status configured";

			const newText = formatStatusForHumans(
				statusTypeName,
				statusMessage,
			);

			await api.channels.createMessage(message.channel_id, {
				content:
					"Status successfully changed!\n\n" +
					`Previous: ${previousText}\n` +
					`New: ${newText}`,
				message_reference: { message_id: message.id },
			});
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error(
					"Error on change-status command. Errors:",
					error,
				);
			} else {
				console.error("Error on change-status command:", error);
			}

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
