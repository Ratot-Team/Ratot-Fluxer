// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const BOT_ICON_URL =
	"https://fluxerusercontent.com/avatars/1483578500003804314/06595fca.webp?size=512";
const SOURCE_URL = "https://github.com/Ratot-Team/Ratot-Fluxer";

export default async function sendBotAdminWelcomeDm({
	client,
	api,
	targetUserId,
}) {
	const botName = process.env.RATOT_CURRENT_NAME || "Ratot";
	const prefix = process.env.COMMAND_PREFIX || "!";
	const currentYear = new Date().getFullYear();

	const dmChannel = await client.rest.post("/users/@me/channels", {
		body: {
			recipient_id: targetUserId,
		},
	});

	await api.channels.createMessage(dmChannel.id, {
		embeds: [
			{
				title: `You are now an administrator of the ${botName} bot!`,
				description:
					"Here are some bot admin commands you can now use:",
				color: 0x66ccff,
				fields: [
					{
						name: `${prefix}change-status <number of status> <status message>`,
						value: "Change the configured status of the bot.",
						inline: false,
					},
					{
						name: `${prefix}add-bot-admin <@someone>`,
						value: "Add a new administrator to the bot.",
						inline: false,
					},
					{
						name: `${prefix}remove-bot-admin <@someone>`,
						value: "Remove an administrator from the bot.",
						inline: false,
					},
					{
						name: `${prefix}list-servers [page]`,
						value: "Lists all the servers the bot is on.",
						inline: false,
					},
					{
						name: `${prefix}list-channels [server-id] [page]`,
						value: "Lists the channels from the current server or from a provided server ID.",
						inline: false,
					},
				],
				timestamp: new Date().toISOString(),
				author: {
					name: botName,
					icon_url: BOT_ICON_URL,
					url: SOURCE_URL,
				},
				footer: {
					text: `Copyright © ${currentYear} by Captain Ratax`,
					icon_url: BOT_ICON_URL,
				},
			},
		],
	});
}
