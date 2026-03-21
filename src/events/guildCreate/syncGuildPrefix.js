// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { GatewayDispatchEvents } from "@discordjs/core";
import { infoLogger, errorLogger } from "../../utils/logger.js";
import {
	ensureGuildPrefixRecord,
	resetGuildPrefixToDefault,
	getDefaultPrefix,
} from "../../utils/prefixUtils.js";

const NEW_GUILD_JOIN_WINDOW_MS = 10 * 60 * 1000;

export default {
	name: GatewayDispatchEvents.GuildCreate,

	async execute({ client, data }) {
		try {
			if (!data?.id) {
				return;
			}

			const joinedAtMs = data.joined_at
				? Date.parse(data.joined_at)
				: NaN;
			const isRecentJoin =
				!Number.isNaN(joinedAtMs) &&
				Date.now() >= joinedAtMs &&
				Date.now() - joinedAtMs <= NEW_GUILD_JOIN_WINDOW_MS;

			if (client.hasSeenReady && isRecentJoin) {
				await resetGuildPrefixToDefault(data.id);

				infoLogger.info(
					`Guild ${data.id} received a fresh default prefix reset to "${getDefaultPrefix()}" after a recent join.`,
				);
				return;
			}

			await ensureGuildPrefixRecord(data.id);
		} catch (error) {
			errorLogger.error(
				"Error on guild prefix sync event. Errors:",
				error,
			);
		}
	},
};
