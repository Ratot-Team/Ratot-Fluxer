// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

export const FluxerPermissionFlags = {
	ADMINISTRATOR: 0x8n,
	MANAGE_MESSAGES: 0x2000n,
};

function toBigInt(value) {
	try {
		if (typeof value === "bigint") {
			return value;
		}

		if (typeof value === "number") {
			return BigInt(value);
		}

		if (typeof value === "string" && value.length > 0) {
			return BigInt(value);
		}

		return 0n;
	} catch {
		return 0n;
	}
}

export function hasPermission(permissions, permissionFlag) {
	const perms = toBigInt(permissions);
	return (perms & permissionFlag) === permissionFlag;
}

export function computeGuildPermissions(member, roles, guildId) {
	let permissions = 0n;

	const everyoneRole = roles.find((role) => role.id === guildId);
	if (everyoneRole?.permissions) {
		permissions |= toBigInt(everyoneRole.permissions);
	}

	const memberRoleIds = new Set(member?.roles ?? []);

	for (const role of roles) {
		if (memberRoleIds.has(role.id)) {
			permissions |= toBigInt(role.permissions);
		}
	}

	return permissions;
}

export function computeChannelPermissions(member, channel, roles, guildId) {
	let permissions = computeGuildPermissions(member, roles, guildId);

	if (hasPermission(permissions, FluxerPermissionFlags.ADMINISTRATOR)) {
		return permissions;
	}

	const overwrites = channel?.permission_overwrites ?? [];

	const everyoneOverwrite = overwrites.find(
		(overwrite) => overwrite.id === guildId && Number(overwrite.type) === 0,
	);

	if (everyoneOverwrite) {
		permissions &= ~toBigInt(everyoneOverwrite.deny);
		permissions |= toBigInt(everyoneOverwrite.allow);
	}

	const memberRoleIds = new Set(member?.roles ?? []);
	let roleDeny = 0n;
	let roleAllow = 0n;

	for (const overwrite of overwrites) {
		if (Number(overwrite.type) === 0 && memberRoleIds.has(overwrite.id)) {
			roleDeny |= toBigInt(overwrite.deny);
			roleAllow |= toBigInt(overwrite.allow);
		}
	}

	permissions &= ~roleDeny;
	permissions |= roleAllow;

	const memberOverwrite = overwrites.find(
		(overwrite) =>
			Number(overwrite.type) === 1 && overwrite.id === member?.user?.id,
	);

	if (memberOverwrite) {
		permissions &= ~toBigInt(memberOverwrite.deny);
		permissions |= toBigInt(memberOverwrite.allow);
	}

	return permissions;
}
