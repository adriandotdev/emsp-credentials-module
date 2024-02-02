const mysql = require("../database/mysql");

module.exports = class CredentialsRepository {
	GetVersions() {
		const query = `SELECT version, url FROM emsp_versions`;

		return new Promise((resolve, reject) => {
			mysql.query(query, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	GetVersionEndpoints(version) {
		const query = `CALL EMSP_GET_ENDPOINTS(?)`;

		return new Promise((resolve, reject) => {
			mysql.query(query, [version], (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	SaveTokenB(data) {
		const query = `UPDATE cpos SET token_b = ? WHERE party_id = ? AND country_code = ?`;

		return new Promise((resolve, reject) => {
			mysql.getConnection((err, connection) => {
				if (err) {
					connection.release();
					reject(err);
				}

				connection.query(
					query,
					[data.token, data.party_id, data.country_code],
					(err, result) => {
						if (err) {
							connection.release();
							reject(err);
						}

						resolve(connection);
					}
				);
			});
		});
	}
};
