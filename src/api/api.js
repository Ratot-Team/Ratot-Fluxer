// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import express from "express";
import mongoose from "mongoose";
import { WebSocketShardStatus } from "@discordjs/ws";

const serviceName = "Ratot-Fluxer";
const healthCheckTimeoutMs = 1500;

const mongoReadyStates = {
	0: "disconnected",
	1: "connected",
	2: "connecting",
	3: "disconnecting",
};

function withTimeout(promise, timeoutMs, message) {
	return Promise.race([
		promise,
		new Promise((_, reject) => {
			setTimeout(() => {
				reject(new Error(message));
			}, timeoutMs).unref();
		}),
	]);
}

function getErrorMessage(error) {
	return error instanceof Error ? error.message : "Unknown error";
}

function sendHealthResponse(res, health) {
	res.status(health.statusCode).json(health.body);
}

async function getFluxerHealth(getBotRuntime) {
	const checkedAt = new Date().toISOString();
	const runtime =
		typeof getBotRuntime === "function" ? getBotRuntime() : {};
	const { client, gateway, startedAt } = runtime;

	if (!client || !gateway) {
		return {
			statusCode: 503,
			body: {
				ok: false,
				service: serviceName,
				component: "fluxer",
				status: "starting",
				ready: false,
				checkedAt,
			},
		};
	}

	try {
		const shardStatuses = await withTimeout(
			gateway.fetchStatus(),
			healthCheckTimeoutMs,
			"Timed out fetching Fluxer gateway status",
		);

		const shards = Array.from(shardStatuses, ([id, statusCode]) => ({
			id,
			status: WebSocketShardStatus[statusCode] || "Unknown",
			statusCode,
		}));

		const allShardsReady =
			shards.length > 0 &&
			shards.every(
				(shard) => shard.statusCode === WebSocketShardStatus.Ready,
			);
		const ready = Boolean(client.hasSeenReady) && allShardsReady;

		return {
			statusCode: ready ? 200 : 503,
			body: {
				ok: ready,
				service: serviceName,
				component: "fluxer",
				status: ready
					? "ready"
					: client.hasSeenReady
						? "degraded"
						: "starting",
				ready,
				hasSeenReady: Boolean(client.hasSeenReady),
				uptimeSeconds: startedAt
					? Math.floor((Date.now() - startedAt) / 1000)
					: null,
				shards,
				checkedAt,
			},
		};
	} catch (error) {
		return {
			statusCode: 503,
			body: {
				ok: false,
				service: serviceName,
				component: "fluxer",
				status: client.hasSeenReady ? "degraded" : "starting",
				ready: false,
				hasSeenReady: Boolean(client.hasSeenReady),
				error: getErrorMessage(error),
				checkedAt,
			},
		};
	}
}

async function getDbHealth() {
	const checkedAt = new Date().toISOString();
	const readyState = mongoose.connection.readyState;
	const status = mongoReadyStates[readyState] || "unknown";
	const baseBody = {
		ok: false,
		service: serviceName,
		component: "db",
		status,
		readyState,
		checkedAt,
	};

	if (readyState !== 1 || !mongoose.connection.db) {
		return {
			statusCode: 503,
			body: baseBody,
		};
	}

	const startedAt = process.hrtime.bigint();

	try {
		await withTimeout(
			mongoose.connection.db.admin().ping(),
			healthCheckTimeoutMs,
			"Timed out pinging MongoDB",
		);

		const pingMs =
			Number(process.hrtime.bigint() - startedAt) / 1_000_000;

		return {
			statusCode: 200,
			body: {
				...baseBody,
				ok: true,
				pingMs: Number(pingMs.toFixed(2)),
			},
		};
	} catch (error) {
		return {
			statusCode: 503,
			body: {
				...baseBody,
				status: "unhealthy",
				error: getErrorMessage(error),
			},
		};
	}
}

export default function createApiRouter({ getBotRuntime } = {}) {
	const router = express.Router();

	router.get("/health", async (req, res) => {
		const [fluxer, db] = await Promise.all([
			getFluxerHealth(getBotRuntime),
			getDbHealth(),
		]);
		const ok = fluxer.body.ok && db.body.ok;

		res.status(ok ? 200 : 503).json({
			ok,
			service: serviceName,
			components: {
				fluxer: fluxer.body,
				db: db.body,
			},
		});
	});

	router.get("/health/fluxer", async (req, res) => {
		sendHealthResponse(res, await getFluxerHealth(getBotRuntime));
	});

	router.get("/health/db", async (req, res) => {
		sendHealthResponse(res, await getDbHealth());
	});

	return router;
}
