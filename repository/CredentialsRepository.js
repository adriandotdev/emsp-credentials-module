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
};
