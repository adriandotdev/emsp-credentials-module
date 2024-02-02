const logger = require("../config/winston");
const Crypto = require("../utils/Crypto");

// Repository
const OCPITokensRepository = require("../repository/OCPITokensRepository");

module.exports = class OCPITokenMiddleware {
	#repository;

	constructor() {
		this.#repository = new OCPITokensRepository();

		this.TokenAVerifier = this.TokenAVerifier.bind(this);
	}

	async TokenAVerifier(req, res, next) {
		logger.info({ TOKEN_A_VERIFIER: { message: "SUCCESS" } });
		try {
			const token = req.headers["authorization"]?.split(" ")[1];

			if (!token)
				return res.status(401).json({
					status_code: 2004,
					data: [],
					message: "Invalid Token",
					message: "Missing Token",
				});

			const decodedToken = JSON.parse(Crypto.Decrypt(token));

			const result = await this.#repository.GetToken(
				decodedToken.party_id,
				decodedToken.country_code
			);

			if (result.length === 0)
				return res.status(401).json({
					status_code: 2004,
					data: [],
					message: "Invalid Token",
					message: "Missing Token",
				});

			next();
		} catch (err) {
			if (err !== null) {
				logger.error({ TOKEN_A_VERIFIER_ERROR: { message: err.message } });
				console.log(err);
				return res.status(err.status ? err.status : 500).json({
					name: err.name ? err.name : "Generic Server Error",
					status_code: err.status_code ? err.status_code : 3000,
					status: err.status ? err.status : 500,
					data: err.data,
					message: err.message,
				});
			}

			logger.error({
				TOKEN_A_VERIFIER_ERROR: {
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
};
