// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { errorLogger } from "../../utils/logger.js";
import { getContextPrefix } from "../../utils/prefixUtils.js";

const BOT_ICON_URL =
	"https://fluxerusercontent.com/avatars/1483578500003804314/06595fca.webp?size=512";
const SOURCE_URL = "https://github.com/Ratot-Team/Ratot-Fluxer";

function parsePositivePageNumber(value) {
	const parsed = Number.parseInt(value, 10);

	if (Number.isNaN(parsed) || parsed < 1) {
		return 1;
	}

	return parsed;
}

function formatChannelLine(channel, absoluteIndex) {
	const channelName = channel.name || "Unnamed channel";
	const channelTypeLabel = getChannelTypeLabel(channel);

	let line =
		`${absoluteIndex}. **${channelName}**\n` +
		`ID: \`${channel.id}\`\n` +
		`Type: \`${channelTypeLabel}\``;

	if (channel.parent_id) {
		line += `\nParent ID: \`${channel.parent_id}\``;
	}

	return line;
}

function getChannelTypeLabel(channel) {
	if (Array.isArray(channel.recipients) && channel.recipients.length > 0) {
		return channel.recipients.length === 1 ? "Direct Message" : "Group DM";
	}

	if (channel.url) {
		return "Link Channel";
	}

	if (
		channel.bitrate != null ||
		channel.rtc_region != null ||
		channel.user_limit != null
	) {
		return "Voice Channel";
	}

	if (channel.topic != null || channel.rate_limit_per_user != null) {
		return "Text Channel";
	}

	if (
		channel.guild_id &&
		channel.parent_id == null &&
		channel.topic == null &&
		channel.url == null &&
		channel.bitrate == null &&
		channel.rtc_region == null &&
		channel.user_limit == null
	) {
		return "Category";
	}

	return "Unknown Channel Type";
}

export default {
	name: "list-channels",
	description:
		"Lists all the channels from a given server ID or from the server where the message is sent.",
	usage: "list-channels [server-id] [page]",
	aliases: ["listchannels"],

	async execute({ client, api, message, args }) {
		try {
			const currentChannel = await api.channels.get(message.channel_id);
			const guildsResponse = await client.rest.get("/users/@me/guilds");
			const guilds = Array.isArray(guildsResponse) ? guildsResponse : [];

			const firstArg = args[0];
			const secondArg = args[1];

			let targetGuildId = null;
			let currentPage = 1;

			const guildFromFirstArg = firstArg
				? guilds.find((guild) => guild.id === firstArg)
				: null;

			if (guildFromFirstArg) {
				targetGuildId = guildFromFirstArg.id;
				currentPage = parsePositivePageNumber(secondArg);
			} else if (currentChannel?.guild_id) {
				targetGuildId = currentChannel.guild_id;
				currentPage = parsePositivePageNumber(firstArg);
			} else {
				if (!firstArg) {
					await api.channels.createMessage(message.channel_id, {
						content:
							"This command was used outside of a server, so you need to provide a valid server ID.",
						message_reference: { message_id: message.id },
					});
					return;
				}

				await api.channels.createMessage(message.channel_id, {
					content: "The id provided is not from a valid server.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			const targetGuild =
				guilds.find((guild) => guild.id === targetGuildId) || null;

			const channelsResponse = await client.rest.get(
				`/guilds/${targetGuildId}/channels`,
			);

			let channels = Array.isArray(channelsResponse)
				? channelsResponse
				: [];

			channels = channels.sort((a, b) => {
				const posA = typeof a.position === "number" ? a.position : 0;
				const posB = typeof b.position === "number" ? b.position : 0;

				if (posA !== posB) {
					return posA - posB;
				}

				const nameA = a.name || "";
				const nameB = b.name || "";

				return nameA.localeCompare(nameB);
			});

			if (!channels.length) {
				await api.channels.createMessage(message.channel_id, {
					content: "No channels were found for that server.",
					message_reference: { message_id: message.id },
				});
				return;
			}

			const itemsPerPage = 10;
			const totalPages = Math.ceil(channels.length / itemsPerPage);

			if (currentPage > totalPages) {
				await api.channels.createMessage(message.channel_id, {
					content: `That page does not exist. There ${totalPages === 1 ? "is" : "are"} only ${totalPages} page${totalPages === 1 ? "" : "s"}.`,
					message_reference: { message_id: message.id },
				});
				return;
			}

			const startIndex = (currentPage - 1) * itemsPerPage;
			const endIndex = startIndex + itemsPerPage;
			const channelsForPage = channels.slice(startIndex, endIndex);

			const lines = channelsForPage.map((channel, index) =>
				formatChannelLine(channel, startIndex + index + 1),
			);

			const prefix = await getContextPrefix(api, message);

			let description =
				`**Server:** ${targetGuild?.name || "Unknown Server"}\n` +
				`**Server ID:** \`${targetGuildId}\`\n\n` +
				`${lines.join("\n\n")}`;

			if (currentPage > 1) {
				if (guildFromFirstArg) {
					description += `\n\nPrevious page: \`${prefix}list-channels ${targetGuildId} ${currentPage - 1}\``;
				} else {
					description += `\n\nPrevious page: \`${prefix}list-channels ${currentPage - 1}\``;
				}
			}

			if (currentPage < totalPages) {
				if (guildFromFirstArg) {
					description += `\nNext page: \`${prefix}list-channels ${targetGuildId} ${currentPage + 1}\``;
				} else {
					description += `\nNext page: \`${prefix}list-channels ${currentPage + 1}\``;
				}
			}

			await api.channels.createMessage(message.channel_id, {
				message_reference: { message_id: message.id },
				embeds: [
					{
						title: "Channels List",
						description,
						color: 0x66ccff,
						timestamp: new Date().toISOString(),
						author: {
							name: process.env.RATOT_CURRENT_NAME || "Ratot",
							icon_url: BOT_ICON_URL,
							url: SOURCE_URL,
						},
						footer: {
							text: `Copyright © ${new Date().getFullYear()} by Captain Ratax • Page ${currentPage} of ${totalPages} • Total channels: ${channels.length}`,
							icon_url: BOT_ICON_URL,
						},
					},
				],
			});
		} catch (error) {
			if (errorLogger?.error) {
				errorLogger.error(
					"Error on list-channels command. Errors:",
					error,
				);
			} else {
				console.error("Error on list-channels command:", error);
			}

			await api.channels.createMessage(message.channel_id, {
				content:
					"Something wrong happened when trying to execute that command...",
				message_reference: { message_id: message.id },
			});
		}
	},
};
