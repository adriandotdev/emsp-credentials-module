const mysql = require("../database/mysql");

module.exports = class OCPITokensRepository {
	GetToken(partyID, countryCode) {
		const query = `SELECT party_id, country_code, token_a FROM cpos WHERE party_id = ? AND country_code = ?`;
		return new Promise((resolve, reject) => {
			mysql.query(query, [partyID, countryCode], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
