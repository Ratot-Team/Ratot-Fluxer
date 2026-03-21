// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import mongoose from "mongoose";

const botConfigsSchema = new mongoose.Schema(
	{
		config: {
			type: String,
			required: true,
		},
		value: {
			type: String,
			default: "",
		},
		value2: {
			type: String,
			default: "",
		},
		value3: {
			type: String,
			default: "",
		},
		lastModifiedBy: {
			type: String,
			default: "",
		},
		lastModifiedById: {
			type: String,
			default: "",
		},
	},
	{ timestamps: true },
);

const BotConfigs =
	mongoose.models.BotConfigs ||
	mongoose.model("BotConfigs", botConfigsSchema, "botConfigs");

export { BotConfigs, botConfigsSchema };
