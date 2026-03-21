// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import mongoose from "mongoose";

const guildPrefixesSchema = new mongoose.Schema(
	{
		prefix: {
			type: String,
			required: true,
		},
		guild_id: {
			type: String,
			required: true,
			unique: true,
		},
		modifiedBy: {
			type: String,
			default: "",
		},
		modifiedById: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true },
);

const GuildPrefix =
	mongoose.models.GuildPrefix ||
	mongoose.model("GuildPrefix", guildPrefixesSchema, "guildPrefixes");

export { GuildPrefix, guildPrefixesSchema };
