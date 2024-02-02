const CredentialsService = require("../services/CredentialsService");

// Utils
const Crypto = require("../utils/Crypto");

// Configs
const logger = require("../config/winston");

// Middleware
const OCPITokensMiddleware = require("../middlewares/OCPITokensMiddleware");

const axios = require("axios");

module.exports = (app) => {
	const service = new CredentialsService();
	const ocpiMiddleware = new OCPITokensMiddleware();

	app.get(
		"/ocpi/emsp/versions",
		[ocpiMiddleware.TokenAVerifier],
		async (req, res) => {
			logger.info({
				VERSIONS_API_REQUEST: "SUCCESS",
			});

			try {
				const versions = await service.GetVersions();

				logger.info({
					VERSIONS_API_RESPONSE: {
						status: 200,
						data: versions,
						status_code: 1000,
					},
				});

				return res
					.status(200)
					.json({ status_code: 1000, data: versions, message: "SUCCESS" });
			} catch (err) {
				if (err !== null) {
					logger.error({ VERSIONS_API_ERROR: { message: err.message } });

					return res.status(err.status ? err.status : 500).json({
						name: err.name ? err.name : "Generic Server Error",
						status_code: err.status_code ? err.status_code : 3000,
						status: err.status ? err.status : 500,
						data: err.data,
						message: err.message,
					});
				}

				logger.error({
					VERSIONS_API_ERROR: {
						name: "Generic Server Error",
						status_code: 3000,
						status: 500,
						data: [],
						message: "",
					},
				});
				return res.status(500).json({
					name: "Generic Server Error",
					status_code: 3000,
					status: 500,
					data: [],
					message: "",
				});
			}
		}
	);

	app.get(
		"/ocpi/emsp/:version",
		[ocpiMiddleware.TokenAVerifier],
		async (req, res) => {
			const { version } = req.params;

			logger.info({
				VERSION_ENDPOINTS_API_REQUEST: { version },
			});

			try {
				const versions = await service.GetVersionEndpoints(version);

				logger.info({
					VERSION_ENDPOINTS_API_RESPONSE: {
						status: 200,
						data: versions,
						status_code: 1000,
					},
				});

				return res
					.status(200)
					.json({ status_code: 1000, data: versions, message: "SUCCESS" });
			} catch (err) {
				if (err !== null) {
					logger.error({
						VERSION_ENDPOINTS_API_ERROR: { message: err.message },
					});

					return res.status(err.status ? err.status : 500).json({
						name: err.name ? err.name : "Generic Server Error",
						status_code: err.status_code ? err.status_code : 3000,
						status: err.status ? err.status : 500,
						data: err.data,
						message: err.message,
					});
				}

				logger.error({
					VERSION_ENDPOINTS_API_ERROR: {
						name: "Generic Server Error",
						status_code: 3000,
						status: 500,
						data: [],
						message: "",
					},
				});

				return res.status(500).json({
					name: "Generic Server Error",
					status_code: 3000,
					status: 500,
					data: [],
					message: "",
				});
			}
		}
	);

	app.post(
		"/ocpi/emsp/:version/credentials",
		[ocpiMiddleware.TokenAVerifier],
		async (req, res) => {
			const { version } = req.params;
			const { endpoint, token } = req.body;

			logger.info({
				CREDENTIALS_API_REQUEST: {
					endpoint,
					token,
				},
			});

			try {
				logger.info({
					CREDENTIALS_API_RESPONSE: {
						status: 200,
						data: [],
						status_code: 1000,
					},
				});

				/**
				 * 1.) Store Token B
				 * 2.) Get Versions
				 * 3.) Get Endpoints
				 * 4.) Save Versions and Endpoints
				 * 5.) Generate Token C
				 * 6.) Send Token C
				 */
				// 1.) Store Token B
				await service.SaveTokenB({
					token,
					party_id: req.party_id,
					country_code: req.country_code,
				});

				// 2.) Get Versions
				const versions = await axios.get(
					"http://localhost:5000/ocpi/cpo/versions"
				);

				// 3.) Get Endpoints
				const endpoints = await axios.get(
					`http://localhost:5000/ocpi/cpo/${version}`
				);

				// 4.) Save Endpoints
				// @TODO

				// 5.) Generate Token C
				/**
				 * @TODO
				 * Encrypt, and Decrypt method must have a dynamic IV, and SECRET KEY.
				 */

				const tokenC = Crypto.Encrypt(
					JSON.stringify({
						party_id: req.party_id,
						country_code: req.country_code,
					})
				);

				return res.status(200).json({
					status_code: 1000,
					data: { token: tokenC },
					message: "SUCCESS",
				});
			} catch (err) {
				if (err !== null) {
					logger.error({ CREDENTIALS_API_ERROR: { message: err.message } });

					return res.status(err.status ? err.status : 500).json({
						name: err.name ? err.name : "Generic Server Error",
						status_code: err.status_code ? err.status_code : 3000,
						status: err.status ? err.status : 500,
						data: err.data,
						message: err.message,
					});
				}

				logger.error({
					CREDENTIALS_API_ERROR: {
						name: "Generic Server Error",
						status_code: 3000,
						status: 500,
						data: [],
						message: "",
					},
				});
				return res.status(500).json({
					name: "Generic Server Error",
					status_code: 3000,
					status: 500,
					data: [],
					message: "",
				});
			}
		}
	);

	app.get("/ocpi/cpo/versions", (req, res) => {
		return res.status(200).json({
			status_code: 1000,
			data: [
				{
					version: "2.2.1",
					url: "localhost:5000/ocpi/emsp/2.2.1",
				},
			],
			message: "SUCCESS",
		});
	});

	app.get("/ocpi/cpo/:version", (req, res) => {
		return res.status(200).json({
			status_code: 1000,
			data: [
				{
					version: "2.2.1",
					identifier: "locations",
					url: "localhost:5001/ocpi/emsp/locations",
				},
			],
			message: "SUCCESS",
		});
	});
};
