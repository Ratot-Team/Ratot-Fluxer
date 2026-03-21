// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

export default async function sendBotAdminWelcomeDm({
	client,
	api,
	targetUserId,
}) {
	const botName = process.env.RATOT_CURRENT_NAME || "Ratot";
	const prefix = process.env.COMMAND_PREFIX || "!";

	const dmChannel = await client.rest.post("/users/@me/channels", {
		body: {
			recipient_id: targetUserId,
		},
	});

	const content =
		`# You are now an administrator of the ${botName} bot!\n\n` +
		`Current admin commands available in this Fluxer version:\n` +
		`- ${prefix}add-bot-admin <@user>\n` +
		`- ${prefix}remove-bot-admin <@user>\n\n` +
		`Use them carefully.`;

	await api.channels.createMessage(dmChannel.id, {
		content,
	});
}
