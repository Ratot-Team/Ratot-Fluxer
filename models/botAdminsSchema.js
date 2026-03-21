// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import mongoose from "mongoose";

const botAdminsSchema = new mongoose.Schema(
	{
		userId: {
			type: String,
			required: true,
		},
		userName: {
			type: String,
			required: true,
		},
		createdBy: {
			type: String,
			required: true,
		},
		createdById: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

const BotAdmin =
	mongoose.models.BotAdmin ||
	mongoose.model("BotAdmin", botAdminsSchema, "botAdmins");

export { BotAdmin, botAdminsSchema };
