const CredentialsRepository = require("../repository/CredentialsRepository");

module.exports = class CredentialsService {
	#repository;

	constructor() {
		this.#repository = new CredentialsRepository();
	}

	async GetVersions() {
		const versions = await this.#repository.GetVersions();

		return versions;
	}

	async GetVersionEndpoints(version) {
		const endpoints = await this.#repository.GetVersionEndpoints(version);

		return endpoints;
	}
};
