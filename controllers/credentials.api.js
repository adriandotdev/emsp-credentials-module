const CredentialsService = require("../services/CredentialsService");

const service = new CredentialsService();

// Utils
const logger = require("../config/winston");

module.exports = (app) => {
	app.get("/ocpi/emsp/versions", async (req, res) => {
		try {
			logger.info({
				VERSIONS_API_RESPONSE: { status: 200, message: "APPROVED" },
			});

			const versions = await service.GetVersions();

			return res
				.status(200)
				.json({ status: 1000, data: versions, message: "SUCCESS" });
		} catch (err) {
			if (err !== null) {
				logger.error({ VERSIONS_API_ERROR: { message: err.message } });

				return res.status(err.status ? err.status : 500).json({
					status: err.status ? err.status : 500,
					data: err.data,
					message: err.message,
				});
			}

			logger.error({
				VERSIONS_API_ERROR: {
					message: "Internal Server Error",
				},
			});
			return res
				.status(500)
				.json({ status: 500, data: [], message: "Internal Server Error" });
		}
	});

	app.get("/ocpi/emsp/:version", async (req, res) => {
		try {
			logger.info({
				VERSION_ENDPOINTS_API_RESPONSE: { status: 200, message: "APPROVED" },
			});

			const versions = await service.GetVersions();

			return res
				.status(200)
				.json({ status: 1000, data: versions, message: "SUCCESS" });
		} catch (err) {
			if (err !== null) {
				logger.error({ VERSION_ENDPOINTS_API_ERROR: { message: err.message } });

				return res.status(err.status ? err.status : 500).json({
					status: err.status ? err.status : 500,
					data: err.data,
					message: err.message,
				});
			}

			logger.error({
				VERSION_ENDPOINTS_API_ERROR: {
					message: "Internal Server Error",
				},
			});
			return res
				.status(500)
				.json({ status: 500, data: [], message: "Internal Server Error" });
		}
	});
};
