const CredentialsRepository = require("../repository/CredentialsRepository");

// Utils
const { GenericClientError } = require("../utils/OCPIError");
const axios = require("axios");

module.exports = class CredentialsService {
	#repository;

	constructor() {
		this.#repository = new CredentialsRepository();
	}

	async GetVersion(version) {
		const result = await this.#repository.GetVersion(version);

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

	async SaveTokenB(data) {
		await this.#repository.SaveTokenB(data);
	}

	async SaveTokenC(data) {
		await this.#repository.SaveTokenC(data);
	}

	async SaveCPOVersionsAndEndpoints(data) {
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

		await this.#repository.SaveCPOVersions({
			party_id: data.party_id,
			country_code: data.country_code,
			versions: versions.data.data,
		});

		await this.#repository.SaveCPOVersionEndpoints({
			party_id: data.party_id,
			country_code: data.country_code,
			endpoints: endpoints.data.data,
		});
	}

	async DeleteCPOVersions(data) {
		console.log(data);
		await this.#repository.DeleteCPOVersions(data);
	}
};
