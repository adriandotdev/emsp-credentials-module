const mysql = require("../database/mysql");
const logger = require("../config/winston");

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

	GetVersion(version, connection) {
		const query = `SELECT version FROM emsp_versions WHERE version = ?`;

		return new Promise((resolve, reject) => {
			connection.query(query, version, (err, result) => {
				if (err) {
					reject(err);
				}
				resolve(result);
			});
		});
	}

	GetCredentialsConnection() {
		return new Promise((resolve, reject) => {
			mysql.getConnection((err, connection) => {
				connection.beginTransaction((err) => {
					if (err) {
						connection.release();
						reject(err);
					}

					resolve(connection);
				});
			});
		});
	}

	SaveTokenB(data, connection) {
		const query = `UPDATE cpos SET token_b = ? WHERE party_id = ? AND country_code = ?`;

		return new Promise((resolve, reject) => {
			connection.query(
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

	SaveTokenC(data, connection) {
		const query = `call EMSP_SET_TOKEN_C_REMOVE_TOKEN_A(?,?,?)`;

		return new Promise((resolve, reject) => {
			connection.query(
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

	SaveCPOVersions(data, connection) {
		let formatQuery = ``;

		data.versions.forEach((v) => {
			formatQuery += `('${data.party_id}', '${data.country_code}', '${v.version}', '${v.url}'), `;
		});

		const query = `INSERT INTO cpo_versions (party_id, country_code, version, url) VALUES ${formatQuery.slice(
			0,
			formatQuery.length - 2
		)}`;

		return new Promise((resolve, reject) => {
			connection.query(query, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	SaveCPOVersionEndpoints(data, connection) {
		let formatQuery = ``;

		data.endpoints.forEach((e) => {
			formatQuery += `('${data.party_id}', '${data.country_code}', '${e.version}', '${e.identifier}', '${e.url}'), `;
		});

		const query = `INSERT INTO cpo_version_details (party_id, country_code, version, identifier, url) VALUES ${formatQuery.slice(
			0,
			formatQuery.length - 2
		)}`;

		return new Promise((resolve, reject) => {
			connection.query(query, (err, result) => {
				if (err) {
					reject(err);
				}

				resolve(result);
			});
		});
	}

	DeleteCPOVersions(data, connection) {
		let query = `DELETE FROM cpo_versions WHERE party_id = ?
		AND country_code = ? AND version = ?`;

		return new Promise((resolve, reject) => {
			connection.query(
				query,
				[data.party_id, data.country_code, data.version],
				(err, result) => {
					if (err) {
						reject(err);
					}

					resolve(result);
				}
			);
		});
	}
};
