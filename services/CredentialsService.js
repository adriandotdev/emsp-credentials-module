const CredentialsRepository = require("../repository/CredentialsRepository");

// Utils
const { GenericClientError } = require("../utils/OCPIError");
const axios = require("axios");

module.exports = class CredentialsService {
	#repository;

	constructor() {
		this.#repository = new CredentialsRepository();
	}

	async GetVersion(version, connection) {
		const result = await this.#repository.GetVersion(version, connection);

		if (result.length === 0)
			throw new GenericClientError("VERSION_NOT_SUPPORTED", []);
	}

	async GetVersions() {
		const versions = await this.#repository.GetVersions();

		return versions;
	}

	async GetVersionEndpoints(version) {
		const result = await this.#repository.GetVersionEndpoints(version);

		if (result[0][0].STATUS === "VERSION_NOT_SUPPORTED")
			throw new GenericClientError(result[0][0].STATUS, []);

		return result[0];
	}

	async SaveTokenB(data, connection) {
		await this.#repository.SaveTokenB(data, connection);
	}

	async SaveTokenC(data, connection) {
		await this.#repository.SaveTokenC(data, connection);
	}

	async SaveCPOVersionsAndEndpoints(data, connection) {
		// 2.) Get Versions
		const versions = await axios.get("http://localhost:5000/ocpi/cpo/versions");

		// 3.) Get Endpoints
		const endpoints = await axios.get(
			`http://localhost:5000/ocpi/cpo/${data.version}`
		);

		if (!versions || !versions.data || versions.data.data.length === 0)
			throw new GenericClientError("SUPPORTED_VERSIONS_ARE_REQUIRED", []);

		if (!endpoints || !endpoints.data || endpoints.data.data.length === 0)
			throw new GenericClientError("VERSION_ENDPOINTS_ARE_REQUIRED", []);

		await this.#repository.SaveCPOVersions(
			{
				party_id: data.party_id,
				country_code: data.country_code,
				versions: versions.data.data,
			},
			connection
		);

		await this.#repository.SaveCPOVersionEndpoints(
			{
				party_id: data.party_id,
				country_code: data.country_code,
				endpoints: endpoints.data.data,
			},
			connection
		);
	}

	async DeleteCPOVersions(data, connection) {
		await this.#repository.DeleteCPOVersions(data, connection);
	}

	async GetCredentialsConnection() {
		return await this.#repository.GetCredentialsConnection();
	}
};
