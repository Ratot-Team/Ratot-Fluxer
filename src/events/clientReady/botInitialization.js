// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { GatewayDispatchEvents } from "@discordjs/core";
import { infoLogger, errorLogger } from "../../utils/logger.js";
import { BotConfigs } from "../../../models/botConfigsSchema.js";
import { BotAdmin } from "../../../models/botAdminsSchema.js";
import { formatStatusForHumans } from "../../utils/botStatusUtils.js";
import { ensureGuildPrefixRecord } from "../../utils/prefixUtils.js";

export default {
	name: GatewayDispatchEvents.Ready,

	async execute({ client }) {
		try {
			infoLogger.info(`${process.env.RATOT_CURRENT_NAME} is online!`);

			if (
				process.env.RATOT_CURRENT_TOKEN === process.env.RATOT_DEV_TOKEN
			) {
				infoLogger.info("Bot in dev mode.");
			} else {
				infoLogger.info("Bot in production mode.");
			}

			let checkConfigs = await BotConfigs.findOne({
				config: "Status",
			});

			if (!checkConfigs) {
				checkConfigs = await BotConfigs.create({
					config: "Status",
					value: `${process.env.COMMAND_PREFIX || "!"}help`,
					value2: "LISTENING",
					value3: "",
					lastModifiedBy: "",
					lastModifiedById: "",
				});

				infoLogger.info(
					`Default bot status configuration created: "${formatStatusForHumans(checkConfigs.value2, checkConfigs.value)}"`,
				);
			} else {
				infoLogger.info(
					`Loaded bot status configuration: "${formatStatusForHumans(checkConfigs.value2, checkConfigs.value)}"`,
				);
			}

			const creatorId = process.env.RATOT_CREATOR_FLUXER_ID;
			const creatorTag = process.env.RATOT_CREATOR_FLUXER_USERNAME;

			if (creatorId && creatorTag) {
				const existingCreatorAdmin = await BotAdmin.findOne({
					userId: creatorId,
				});

				if (!existingCreatorAdmin) {
					await BotAdmin.create({
						userId: creatorId,
						userName: creatorTag,
						createdBy: creatorTag,
						createdById: creatorId,
					});

					infoLogger.info(
						"Creator was not in botAdmins collection, so the record was created automatically.",
					);
				}
			}

			const guildsResponse = await client.rest.get("/users/@me/guilds");
			const guilds = Array.isArray(guildsResponse) ? guildsResponse : [];

			for (const guild of guilds) {
				await ensureGuildPrefixRecord(guild.id);
			}

			client.hasSeenReady = true;
			infoLogger.info("Guild prefix records were checked successfully.");
		} catch (error) {
			errorLogger.error(
				"Error on botInitialization event. Errors:",
				error,
			);
		}
	},
};
