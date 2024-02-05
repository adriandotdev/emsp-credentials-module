const mysql = require("../database/mysql");

module.exports = class CredentialsRepository {
	GetVersion(version) {
		const query = `SELECT version FROM emsp_versions WHERE version = ?`;

		return new Promise((resolve, reject) => {
			mysql.query(query, version, (err, result) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			});
		});
	}

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
			mysql.query(
				query,
				[data.token, data.party_id, data.country_code],
				(err, result) => {
					if (err) {
						reject(err);
					}
					resolve(result);
				}
			);
		});
	}

	SaveTokenC(data) {
		const query = `call EMSP_SET_TOKEN_C_REMOVE_TOKEN_A(?,?,?)`;

		return new Promise((resolve, reject) => {
			mysql.query(
				query,
				[data.party_id, data.country_code, data.token_c],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}

	SaveCPOVersions(data) {
		let formatQuery = ``;

		data.versions.forEach((v) => {
			formatQuery += `('${data.party_id}', '${data.country_code}', '${v.version}', '${v.url}'), `;
		});

		const query = `INSERT INTO cpo_versions (party_id, country_code, version, url) VALUES ${formatQuery.slice(
			0,
			formatQuery.length - 2
		)}`;

		return new Promise((resolve, reject) => {
			mysql.query(query, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	SaveCPOVersionEndpoints(data) {
		let formatQuery = ``;

		data.endpoints.forEach((e) => {
			formatQuery += `('${data.party_id}', '${data.country_code}', '${e.version}', '${e.identifier}', '${e.url}'), `;
		});

		const query = `INSERT INTO cpo_version_details (party_id, country_code, version, identifier, url) VALUES ${formatQuery.slice(
			0,
			formatQuery.length - 2
		)}`;

		return new Promise((resolve, reject) => {
			mysql.query(query, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}
};
