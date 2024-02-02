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
		const query = `SELECT version, module_id AS identifier, url FROM emsp_version_details WHERE version = ?`;

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
