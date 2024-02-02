require("dotenv").config();
const jwt = require("jsonwebtoken");
const JsonWebToken = require("../utils/JsonWebToken");
const {
	HttpUnauthorized,
	HttpInternalServerError,
	HttpForbidden,
} = require("../utils/HttpError");
const logger = require("../config/winston");
const Crypto = require("../utils/Crypto");
const AccountRepository = require("../repository/AccountRepository");

const repository = new AccountRepository();

const AccessTokenVerifier = async (req, res, next) => {
	// logger
	logger.info({
		ACCESS_TOKEN_VERIFIER_MIDDLEWARE: {
			access_token: req.headers["authorization"]?.split(" ")[1],
		},
	});

	try {
		const accessToken = req.headers["authorization"]?.split(" ")[1];

		if (!accessToken) throw new HttpUnauthorized("Unauthorized", []);

		const decryptedAccessToken = Crypto.Decrypt(accessToken);

		const isAccessTokenExistingInDB = await repository.FindAccessToken(
			decryptedAccessToken
		);

		if (isAccessTokenExistingInDB.length < 1) {
			throw new HttpUnauthorized("Unauthorized", []);
		}

		JsonWebToken.Verify(
			decryptedAccessToken,
			process.env.JWT_ACCESS_KEY,
			(err, decode) => {
				if (err) {
					if (err instanceof jwt.TokenExpiredError) {
						throw new HttpUnauthorized("Token Expired", []);
					} else if (err instanceof jwt.JsonWebTokenError) {
						throw new HttpUnauthorized("Invalid Token", []);
					} else {
						throw new HttpInternalServerError("Internal Server Error", []);
					}
				}

				if (
					decode.iss !== "parkncharge" ||
					decode.typ !== "Bearer" ||
					decode.aud !== "parkncharge-app" ||
					decode.usr !== "serv"
				)
					throw new HttpUnauthorized("Unauthorized", []);

				req.username = decode.data.username;
				req.id = decode.data.id;
				req.role_id = decode.data.role_id;
				req.access_token = decryptedAccessToken;
			}
		);

		logger.info({
			ACCESS_TOKEN_VERIFIER_MIDDLEWARE: {
				message: "SUCCESS",
			},
		});
		next();
	} catch (err) {
		logger.error({
			ACCESS_TOKEN_VERIFIER_MIDDLEWARE_ERROR: {
				message: err.message,
			},
		});

		if (err !== null) {
			return res.status(err.status ? err.status : 500).json({
				status: err.status ? err.status : 500,
				data: err.data,
				message: err.message,
			});
		}

		return res
			.status(500)
			.json({ status: 500, data: [], message: "Internal Server Error" });
	}
};

const RefreshTokenVerifier = async (req, res, next) => {
	logger.info({
		REFRESH_TOKEN_VERIFIER_MIDDLEWARE: {
			refresh_token: req.headers["authorization"]?.split(" ")[1],
		},
	});

	try {
		const refreshToken = req.headers["authorization"]?.split(" ")[1];

		if (!refreshToken) throw new HttpUnauthorized("Unauthorized", []);

		const decryptedRefreshToken = Crypto.Decrypt(refreshToken);

		const isRefreshTokenExisting = await repository.FindRefreshToken(
			decryptedRefreshToken
		);

		if (isRefreshTokenExisting.length < 1) {
			JsonWebToken.Verify(
				decryptedRefreshToken,
				process.env.JWT_REFRESH_KEY,
				async (err, decode) => {
					if (err) throw new HttpForbidden("Forbidden", []);

					// Delete all access tokens associated with user
					await repository.DeleteRefreshTokenWithUserID(decode.data.id);
				}
			);

			throw new HttpForbidden("Forbidden", []);
		}

		JsonWebToken.Verify(
			decryptedRefreshToken,
			process.env.JWT_REFRESH_KEY,
			(err, decode) => {
				if (err) {
					if (err instanceof jwt.TokenExpiredError) {
						throw new HttpUnauthorized("Token Expired", []);
					} else if (err instanceof jwt.JsonWebTokenError) {
						throw new HttpUnauthorized("Invalid Token", []);
					} else {
						throw new HttpInternalServerError("Internal Server Error", []);
					}
				}

				if (
					decode.iss !== "parkncharge" ||
					decode.typ !== "Bearer" ||
					decode.aud !== "parkncharge-app" ||
					decode.usr !== "serv"
				)
					throw new HttpUnauthorized("Unauthorized", []);

				req.username = decode.data.username;
				req.id = decode.data.id;
				req.role_id = decode.data.role_id;
				req.refresh_token = decryptedRefreshToken;
			}
		);

		logger.info({
			REFRESH_TOKEN_VERIFIER_MIDDLEWARE: {
				message: "Success",
			},
		});
		next();
	} catch (err) {
		if (err !== null) {
			return res.status(err.status ? err.status : 500).json({
				status: err.status ? err.status : 500,
				data: err.data,
				message: err.message,
			});
		}

		return res
			.status(500)
			.json({ status: 500, data: [], message: "Internal Server Error" });
	}
};

const BasicTokenVerifier = (req, res, next) => {
	logger.info({
		BASIC_TOKEN_VERIFIER_MIDDLEWARE: {
			token: req.headers["authorization"]?.split(" ")[1],
		},
	});

	try {
		const token = req.headers["authorization"]?.split(" ")[1];

		if (!token) throw new HttpUnauthorized("Unauthorized", []);

		JsonWebToken.Verify(token, process.env.PARKNCHARGE_SECRET_KEY);

		logger.info({
			BASIC_TOKEN_VERIFIER_MIDDLEWARE: {
				message: "Valid Token",
			},
		});
		next();
	} catch (err) {
		if (err instanceof jwt.JsonWebTokenError) {
			logger.error({
				BASIC_TOKEN_VERIFIER_MIDDLEWARE_ERROR: {
					message: "Invalid Token",
				},
			});
			return res
				.status(401)
				.json({ status: 401, data: [], message: "Invalid Token" });
		} else if (err instanceof jwt.TokenExpiredError) {
			logger.error({
				BASIC_TOKEN_VERIFIER_MIDDLEWARE_ERROR: {
					message: "Token Expired",
				},
			});
			return res
				.status(401)
				.json({ status: 401, data: [], message: "Token Expired" });
		} else if (err !== null) {
			logger.error({
				BASIC_TOKEN_VERIFIER_MIDDLEWARE_ERROR: {
					message: err.message,
				},
			});
			return res
				.status(err.status)
				.json({ status: err.status, data: [], message: err.message });
		} else {
			logger.error({
				BASIC_TOKEN_VERIFIER_MIDDLEWARE_ERROR: {
					message: "Internal Server Error",
				},
			});

			return res
				.status(500)
				.json({ status: 500, data: [], message: "Internal Server Error" });
		}
	}
};

module.exports = {
	AccessTokenVerifier,
	RefreshTokenVerifier,
	BasicTokenVerifier,
};
