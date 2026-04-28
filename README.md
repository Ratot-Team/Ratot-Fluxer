# ![Ratot Status](https://status.ratot.eu/api/badge/13/status?style=for-the-badge&label=ratot+status) ![Ratot DB Status](https://status.ratot.eu/api/badge/15/status?style=for-the-badge&label=ratot+db+status) ![Ratot Uptime](https://status.ratot.eu/api/badge/13/uptime/72?style=for-the-badge&label=ratot+uptime+%2872h%29) ![Ratot DB Uptime](https://status.ratot.eu/api/badge/15/uptime/72?style=for-the-badge&label=ratot+db+uptime+%2872h%29) ![GitHub release (latest by date)](https://img.shields.io/github/v/release/Ratot-Team/Ratot-Fluxer?style=for-the-badge) ![AGPL-3.0 Licensed](https://img.shields.io/github/license/Ratot-Team/Ratot-Fluxer?style=for-the-badge) ![Code quality grade on Codacy](https://img.shields.io/codacy/grade/1ecf6c83fff64b209489c003a00477b9?style=for-the-badge) ![GitHub repository size](https://img.shields.io/github/repo-size/Ratot-Team/Ratot-Fluxer?style=for-the-badge) ![GitHub last commit](https://img.shields.io/github/last-commit/Ratot-Team/Ratot-Fluxer?style=for-the-badge) ![GitHub issues](https://img.shields.io/github/issues/Ratot-Team/Ratot-Fluxer?style=for-the-badge) ![GitHub pull requests](https://img.shields.io/github/issues-pr/Ratot-Team/Ratot-Fluxer?style=for-the-badge) ![GitHub language count](https://img.shields.io/github/languages/count/Ratot-Team/Ratot-Fluxer?style=for-the-badge) ![GitHub top language](https://img.shields.io/github/languages/top/Ratot-Team/Ratot-Fluxer?style=for-the-badge) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/Ratot-Team/Ratot-Fluxer?style=for-the-badge)

# Ratot

Ratot is a Fluxer bot made to help you administrate your server and have some fun.

## Invite Ratot

You can add Ratot to your Fluxer server using the invite link below:

🔗 [Invite Ratot to your server](https://web.fluxer.app/oauth2/authorize?client_id=1483578550746522197&scope=bot&permissions=8)

## Status Page

You can check the current status of Ratot, its database, and view incident history on the official status page:

🔗 [status.ratot.eu](https://status.ratot.eu)

The status page provides:

- Real-time uptime information
- Database status
- Historical incidents and outages

## Installation and Execution

Use [npm](https://www.npmjs.com/get-npm) to install all the dependencies needed.

```bash
npm install
```

## Environment Variables

Before starting the bot, create a .env file and configure the required environment variables.

Example:

```env
RATOT_CURRENT_TOKEN=your_fluxer_bot_token
DBURL=your_mongodb_connection_string
COMMAND_PREFIX=!
RATOT_CURRENT_NAME=your_bot_name
RATOT_CURRENT_FLUXER_ID=your_bot_id
RATOT_CREATOR_FLUXER_ID=your_fluxer_user_id
RATOT_CREATOR_FLUXER_USERNAME=yourusername#0000
RATOT_GUILD_ID=your_official_guild_id
PORT=3000
```

## Execution

Use the following command to start the Ratot bot:

```bash
npm start
```

To stop the bot press Ctrl+C or just close the terminal window.

## Prefix System

By default, the bot uses the prefix defined in COMMAND_PREFIX.

If COMMAND_PREFIX is not defined, the bot uses `!`

Each server can also have its own custom prefix.
If a custom prefix is set for a specific server, the bot will only respond to that prefix in that server.

Example:

```text
!help
testhelp
```

In direct messages, the bot is more flexible and also accepts commands without a prefix.

## Usage (List of Commands)

Examples below use the default prefix `!`, but in some servers the prefix may be different.

### !help

The bot sends a menu with some information about the bot and some commands to help.

### !help-commands

The bot sends the list of all commands and the description of what they do.

### !ping

The bot responds with "pong", but to know the bot ping you really have to insist a little bit.

### !bot-ping

Says the ping value of the bot.

### !hug <@someone>

The bot gives a hug to someone you mention. You can mention yourself, don't be shy!

### !prune \<number\>

The bot deletes a certain number of messages in the current channel.  
Only users with the required moderation permissions can use this command.

### !prefix [newPrefix]

Shows or changes the bot prefix for the current server.  
Only server administrators can use this command.

## Bot Admin Usage

The following commands are only available to bot admins.  
They are only usable in direct messages or in the official Ratot server.

### !change-status \<number of status\> \<status message\>

Changes the configured bot status.

Available status types:

- `1` = Playing
- `2` = Listening to
- `3` = Watching
- `4` = Competing in

### !add-bot-admin <@someone>

Adds the user as a bot admin in the database.

### !remove-bot-admin <@someone>

Removes the user from the bot admins database.

### !list-servers [page]

Lists all the servers the bot is in, using page-based navigation.

### !list-channels [server-id] [page]

Lists all the channels from the current server or from a provided server ID, using page-based navigation.

## Notes

- Bot admin permissions are different from server admin permissions.
- Server admins can manage the prefix for their own server.
- Bot admins can access special administration commands for managing the bot itself.
- Some commands are hidden from users who do not have access to them.

## License

Copyright (C) 2026 Captain Ratax

This project is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

See the [LICENSE](./LICENSE) file for the full license text.
