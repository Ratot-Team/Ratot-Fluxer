// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { GuildPrefix } from "../../models/guildPrefixesSchema.js";

function getDefaultPrefix() {
	const envPrefix = process.env.COMMAND_PREFIX;

	if (typeof envPrefix === "string" && envPrefix.length > 0) {
		return envPrefix;
	}

	return "!";
}

async function getGuildPrefix(guildId) {
	if (!guildId) {
		return getDefaultPrefix();
	}

	const existingPrefix = await GuildPrefix.findOne({
		guild_id: guildId,
	}).lean();

	if (existingPrefix?.prefix) {
		return existingPrefix.prefix;
	}

	return getDefaultPrefix();
}

async function upsertGuildPrefix({
	guildId,
	prefix,
	modifiedBy = "",
	modifiedById = "",
}) {
	return GuildPrefix.findOneAndUpdate(
		{ guild_id: guildId },
		{
			guild_id: guildId,
			prefix,
			modifiedBy,
			modifiedById,
		},
		{
			upsert: true,
			returnDocument: "after",
		},
	);
}

async function ensureGuildPrefixRecord(guildId) {
	const existingPrefix = await GuildPrefix.findOne({
		guild_id: guildId,
	}).lean();

	if (existingPrefix) {
		return existingPrefix;
	}

	return upsertGuildPrefix({
		guildId,
		prefix: getDefaultPrefix(),
		modifiedBy: "",
		modifiedById: "",
	});
}

async function resetGuildPrefixToDefault(guildId) {
	return upsertGuildPrefix({
		guildId,
		prefix: getDefaultPrefix(),
		modifiedBy: "",
		modifiedById: "",
	});
}

async function getContextPrefix(api, message) {
	const channel = await api.channels.get(message.channel_id);

	if (!channel?.guild_id) {
		return getDefaultPrefix();
	}

	return getGuildPrefix(channel.guild_id);
}

export {
	getDefaultPrefix,
	getGuildPrefix,
	upsertGuildPrefix,
	ensureGuildPrefixRecord,
	resetGuildPrefixToDefault,
	getContextPrefix,
};
