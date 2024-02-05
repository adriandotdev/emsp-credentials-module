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

	/**
	 * @dependencies
	 * - SaveTokenB
	 * - SaveVersionAndEndpoints
	 * - Crypto.Encrypt
	 * - SaveTokenC
	 */
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
				await service.GetVersion(version); // throws an error when version is not found.

				// 1.) Store Token B
				await service.SaveTokenB({
					token,
					party_id: req.party_id,
					country_code: req.country_code,
				});

				await service.DeleteCPOVersions({
					party_id: req.party_id,
					country_code: req.country_code,
					version,
				});

				await service.SaveCPOVersionsAndEndpoints({
					party_id: req.party_id,
					country_code: req.country_code,
					version,
				});

				// Generate, and Save Token C. Remove Token A.
				const tokenC = Crypto.Encrypt(
					JSON.stringify({
						party_id: req.party_id,
						country_code: req.country_code,
					}),
					process.env.CREDENTIAL_TOKEN_C_SECRET_KEY,
					process.env.CREDENTIAL_TOKEN_A_IV
				);

				await service.SaveTokenC({
					party_id: req.party_id,
					country_code: req.country_code,
					token_c: tokenC,
				});

				logger.info({
					CREDENTIALS_API_RESPONSE: {
						status: 200,
						data: {
							party_id: req.party_id,
							country_code: req.country_code,
							token_c: tokenC,
						},
						status_code: 1000,
					},
				});

				return res.status(200).json({
					status_code: 1000,
					data: { token: tokenC },
					message: "SUCCESS",
					timestamp: Date.now(),
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

	/** These 2 APIs are for testing purposes only. */
	app.get("/ocpi/cpo/versions", (req, res) => {
		return res.status(200).json({
			status_code: 1000,
			data: [
				{
					version: "2.2.1",
					url: "localhost:5000/ocpi/cpo/2.2.1",
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
					url: "localhost:5001/ocpi/cpo/locations",
				},
			],
			message: "SUCCESS",
		});
	});
};
