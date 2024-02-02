const jwt = require("jsonwebtoken");

module.exports = class JWT {
	static Sign(payload, secretKey) {
		return jwt.sign(payload, secretKey);
	}

	static Verify(token, secretKey) {
		try {
			jwt.verify(token, secretKey);
		} catch (err) {
			if (err instanceof jwt.TokenExpiredError)
				throw new jwt.TokenExpiredError("Token Expired");

			throw new jwt.JsonWebTokenError("Invalid Token");
		}
	}

	static Decode(token) {
		return jwt.decode(token);
	}
};
