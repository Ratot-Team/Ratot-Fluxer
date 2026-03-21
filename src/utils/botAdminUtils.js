// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { BotAdmin } from "../../models/botAdminsSchema.js";

function getUserTag(user) {
	const username = user?.username || "Unknown User";
	const discriminator = user?.discriminator;

	if (discriminator) {
		return `${username}#${discriminator}`;
	}

	return username;
}

async function isBotAdminUser(userId) {
	if (!userId) {
		return false;
	}

	if (userId === process.env.RATOT_CREATOR_FLUXER_ID) {
		return true;
	}

	const existingAdmin = await BotAdmin.exists({ userId });
	return Boolean(existingAdmin);
}

export { getUserTag, isBotAdminUser };
