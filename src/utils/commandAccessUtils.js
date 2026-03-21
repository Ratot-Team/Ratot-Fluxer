// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { isBotAdminUser } from "./botAdminUtils.js";

async function getCommandContext(api, message) {
	const channel = await api.channels.get(message.channel_id);

	const guildId = channel?.guild_id || null;
	const isDm = !guildId;
	const isOfficialGuild =
		Boolean(guildId) && guildId === process.env.RATOT_GUILD_ID;

	return {
		channel,
		guildId,
		isDm,
		isOfficialGuild,
	};
}

async function canAccessAdminCommand(api, message) {
	const isBotAdmin = await isBotAdminUser(message.author.id);

	if (!isBotAdmin) {
		return false;
	}

	const context = await getCommandContext(api, message);

	return context.isDm || context.isOfficialGuild;
}

export { getCommandContext, canAccessAdminCommand };
