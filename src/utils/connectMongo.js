// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import mongoose from "mongoose";
import { errorLogger, infoLogger } from "./logger.js";

let mongoConnectionPromise = null;

export default async function connectMongo() {
	if (mongoose.connection.readyState === 1) {
		return mongoose.connection;
	}

	if (mongoConnectionPromise) {
		return mongoConnectionPromise;
	}

	const mongoUrl = process.env.DBURL;
	if (!mongoUrl) {
		throw new Error("Missing DBURL");
	}

	mongoConnectionPromise = mongoose
		.connect(mongoUrl)
		.then((connection) => {
			infoLogger.info("Connected to MongoDB");
			return connection;
		})
		.catch((error) => {
			mongoConnectionPromise = null;
			errorLogger.error("Error connecting to MongoDB:", error);
			throw error;
		});

	return mongoConnectionPromise;
}
