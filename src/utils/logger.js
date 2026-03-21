// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { format, createLogger, transports } = winston;
const { timestamp, combine, printf } = format;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(process.cwd(), "logs");
fs.mkdirSync(logsDir, { recursive: true });

function buildTransportWithLevel(level) {
	return new DailyRotateFile({
		level,
		datePattern: "YYYY-MM-DD",
		dirname: logsDir,
		filename: `${level}s-%DATE%.log`,
		json: false,
	});
}

const errorsTransport = buildTransportWithLevel("error");
const warnsTransport = buildTransportWithLevel("warn");
const infosTransport = buildTransportWithLevel("info");

const logFormat = printf(({ level, message, timestamp, stack }) => {
	if (!stack) {
		return `${timestamp} ${level}: ${message}`;
	}

	return `${timestamp} ${level}: ${message}\n${stack}`;
});

function loggerCreator(level) {
	return createLogger({
		format: combine(
			format.colorize(),
			timestamp({
				format: "YYYY-MM-DD HH:mm:ss",
			}),
			format.errors({
				stack: true,
			}),
			logFormat,
		),
		transports: [
			new transports.Console({
				level,
			}),
			level === "error"
				? errorsTransport
				: level === "warn"
					? warnsTransport
					: infosTransport,
		],
	});
}

const errorLogger = loggerCreator("error");
const warnLogger = loggerCreator("warn");
const infoLogger = loggerCreator("info");

function isFileEmpty(fileName, ignoreWhitespace = true) {
	return new Promise((resolve, reject) => {
		fs.readFile(fileName, (err, data) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(
				(!ignoreWhitespace && data.length === 0) ||
					(ignoreWhitespace && /^\s*$/.test(String(data))),
			);
		});
	});
}

function doOnRotate(level, oldFileName) {
	try {
		infoLogger.info(`${level} logger has been rotated.`);

		const fullPath = path.isAbsolute(oldFileName)
			? oldFileName
			: path.join(logsDir, path.basename(oldFileName));

		isFileEmpty(fullPath)
			.then((isEmpty) => {
				if (isEmpty && fs.existsSync(fullPath)) {
					fs.unlinkSync(fullPath);
					infoLogger.info(
						`Previous ${level} log file deleted successfully.`,
					);
				}
			})
			.catch((err) => {
				errorLogger.error(
					`The rotation of the ${level} logger has errors: ${err}`,
				);
			});
	} catch (error) {
		errorLogger.error(
			`The rotation of the ${level} logger has errors: ${error}`,
		);
	}
}

errorsTransport.on("rotate", (oldFileName) => {
	doOnRotate("error", oldFileName);
});

warnsTransport.on("rotate", (oldFileName) => {
	doOnRotate("warn", oldFileName);
});

infosTransport.on("rotate", (oldFileName) => {
	doOnRotate("info", oldFileName);
});

export { errorLogger, warnLogger, infoLogger };
