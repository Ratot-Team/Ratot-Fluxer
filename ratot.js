// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import dotenv from "dotenv";
import cluster from "node:cluster";
import express from "express";

import { Client } from "@discordjs/core";
import { REST } from "@discordjs/rest";
import { WebSocketManager } from "@discordjs/ws";

import connectMongo from "./src/utils/connectMongo.js";
import loadCommands from "./src/handlers/commandHandler.js";
import loadEvents from "./src/handlers/eventHandler.js";
import createApiRouter from "./src/api/api.js";
import { errorLogger, infoLogger } from "./src/utils/logger.js";

dotenv.config();

const token = process.env.RATOT_CURRENT_TOKEN;
const port = Number(process.env.PORT) || 3000;
const botRuntime = {
	client: null,
	gateway: null,
	startedAt: null,
};

if (!token) {
	throw new Error("Missing RATOT_CURRENT_TOKEN");
}

async function startFluxerBot() {
	const rest = new REST({
		api: "https://api.fluxer.app",
		version: "1",
	}).setToken(token);

	const gateway = new WebSocketManager({
		intents: 0,
		rest,
		token,
		version: "1",
	});

	const client = new Client({ rest, gateway });

	client.commands = new Map();

	await loadCommands(client);
	await loadEvents(client);

	botRuntime.client = client;
	botRuntime.gateway = gateway;
	botRuntime.startedAt = Date.now();

	await gateway.connect();

	infoLogger.info("Fluxer bot started successfully.");

	return { client, gateway };
}

function startApiServer() {
	const app = express();

	app.use(express.json());
	app.use(
		express.urlencoded({
			extended: false,
		}),
	);

	app.use(
		"/",
		createApiRouter({
			getBotRuntime: () => botRuntime,
		}),
	);

	app.use((req, res) => {
		res.status(404).json({
			ok: false,
			message: "Route not found",
		});
	});

	const server = app.listen(port, () => {
		infoLogger.info(`API Server is listening on port ${port}`);
	});

	server.on("error", (error) => {
		errorLogger.error("Error when trying to start express server:", error);
		process.exit(1);
	});

	return server;
}

async function bootstrapWorker() {
	try {
		await connectMongo();
		startApiServer();
		await startFluxerBot();

		infoLogger.info(`Worker ${process.pid} is fully up and running.`);
	} catch (error) {
		errorLogger.error("Fatal error during worker bootstrap:", error);
		process.exit(1);
	}
}

if (cluster.isPrimary) {
	infoLogger.info(`Primary process started with PID ${process.pid}`);

	const worker = cluster.fork();

	cluster.on("exit", (deadWorker, code, signal) => {
		errorLogger.error(
			`Worker ${deadWorker.process.pid} died. Code: ${code ?? "unknown"}, Signal: ${signal ?? "none"}. Restarting...`,
		);

		cluster.fork();
	});

	cluster.on("online", (onlineWorker) => {
		infoLogger.info(`Worker ${onlineWorker.process.pid} is online.`);
	});
} else {
	process.on("uncaughtException", (error) => {
		errorLogger.error("Uncaught exception in worker:", error);
		process.exit(1);
	});

	process.on("unhandledRejection", (reason) => {
		errorLogger.error("Unhandled rejection in worker:", reason);
		process.exit(1);
	});

	await bootstrapWorker();
}
