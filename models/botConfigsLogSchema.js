// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import mongoose from "mongoose";

const botConfigsLogSchema = new mongoose.Schema(
	{
		changed: {
			type: String,
			required: true,
		},
		changedTo: {
			type: String,
			default: "",
		},
		changedTo2: {
			type: String,
			default: "",
		},
		changedTo3: {
			type: String,
			default: "",
		},
		changedBy: {
			type: String,
			required: true,
		},
		changedById: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const BotConfigsLog =
	mongoose.models.BotConfigsLog ||
	mongoose.model("BotConfigsLog", botConfigsLogSchema, "botConfigsLogs");

export { BotConfigsLog, botConfigsLogSchema };
