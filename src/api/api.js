// Ratot - Ratot is a Fluxer bot made to help you administrate your server and have some fun.
// Copyright (C) 2026 CaptainRatax
// Licensed under the GNU Affero General Public License v3.0 or later
// See the LICENSE file for details.

import express from "express";

const router = express.Router();

router.get("/health", (req, res) => {
	res.status(200).json({
		ok: true,
		service: "Ratot-Fluxer",
	});
});

export default router;
