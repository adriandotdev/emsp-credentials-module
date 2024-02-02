const CredentialsRepository = require("../repository/CredentialsRepository");

// Utils
const { GenericClientError } = require("../utils/OCPIError");

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
		const result = await this.#repository.GetVersionEndpoints(version);

		if (result[0][0].STATUS === "VERSION_NOT_SUPPORTED")
			throw new GenericClientError(result[0][0].STATUS, []);

		return result[0];
	}

	async GetToken(partyID, countryCode) {
		const result = await this.#repository.GetToken(partyID, countryCode);

		return result;
	}
};
