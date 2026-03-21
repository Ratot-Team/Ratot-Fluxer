// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import { GatewayDispatchEvents } from "@discordjs/core";
import {
	canAccessAdminCommand,
	getCommandContext,
} from "../../utils/commandAccessUtils.js";
import { getDefaultPrefix, getGuildPrefix } from "../../utils/prefixUtils.js";

function startsWithSingleCharPrefix(text) {
	return /^[^a-zA-Z0-9\s]/.test(text);
}

export default {
	name: GatewayDispatchEvents.MessageCreate,

	async execute({ client, api, data }) {
		if (!data?.content) {
			return;
		}

		if (data.author?.bot) {
			return;
		}

		const context = await getCommandContext(api, data);
		const isDm = context.isDm;
		const trimmedContent = data.content.trim();

		if (!trimmedContent.length) {
			return;
		}

		let activePrefix = getDefaultPrefix();

		if (!isDm && context.guildId) {
			activePrefix = await getGuildPrefix(context.guildId);
		}

		let rawCommandText = null;

		if (isDm) {
			if (activePrefix && trimmedContent.startsWith(activePrefix)) {
				rawCommandText = trimmedContent
					.slice(activePrefix.length)
					.trim();
			} else if (startsWithSingleCharPrefix(trimmedContent)) {
				rawCommandText = trimmedContent.slice(1).trim();
			} else {
				rawCommandText = trimmedContent;
			}
		} else {
			if (!trimmedContent.startsWith(activePrefix)) {
				return;
			}

			rawCommandText = trimmedContent.slice(activePrefix.length).trim();
		}

		if (!rawCommandText.length) {
			return;
		}

		const args = rawCommandText.split(/\s+/);
		const commandName = args.shift().toLowerCase();
		const command = client.commands.get(commandName);

		if (!command) {
			if (isDm) {
				await api.channels.createMessage(data.channel_id, {
					content:
						"I didn't recognize that command. Send `help-commands` to see the available commands.",
					message_reference: { message_id: data.id },
				});
			}

			return;
		}

		if (command.adminCommand) {
			const canUseAdminCommand = await canAccessAdminCommand(api, data);

			if (!canUseAdminCommand) {
				return;
			}
		}

		try {
			await command.execute({
				client,
				api,
				message: data,
				args,
				commandName,
				prefix: activePrefix,
			});
		} catch (error) {
			console.error(`Error running command "${commandName}":`, error);

			await api.channels.createMessage(data.channel_id, {
				content: "Ocorreu um erro ao executar esse comando.",
				message_reference: { message_id: data.id },
			});
		}
	},
};
