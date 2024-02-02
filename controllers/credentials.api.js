const CredentialsService = require("../services/CredentialsService");

// Configs
const logger = require("../config/winston");

// Middleware
const OCPITokensMiddleware = require("../middlewares/OCPITokensMiddleware");

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
};
