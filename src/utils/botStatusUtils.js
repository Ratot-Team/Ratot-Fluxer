// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

const statusTypes = {
	1: "PLAYING",
	2: "LISTENING",
	3: "WATCHING",
	4: "COMPETING",
};

function getStatusTypeName(number) {
	return statusTypes[number] || null;
}

function getStatusTypeListText() {
	return (
		"**The list of possible status is:**\n" +
		"1 - Playing\n" +
		"2 - Listening to\n" +
		"3 - Watching\n" +
		"4 - Competing in"
	);
}

function formatStatusForHumans(type, text) {
	switch (type) {
		case "PLAYING":
			return `Playing ${text}`;
		case "LISTENING":
			return `Listening to ${text}`;
		case "WATCHING":
			return `Watching ${text}`;
		case "COMPETING":
			return `Competing in ${text}`;
		default:
			return text;
	}
}

export { getStatusTypeName, getStatusTypeListText, formatStatusForHumans };
