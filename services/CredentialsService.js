const CredentialsRepository = require("../repository/CredentialsRepository");

// Utils
const { GenericClientError } = require("../utils/OCPIError");

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

	async SaveCPOVersions(data) {
		await this.#repository.SaveCPOVersions(data);
	}

	async SaveCPOVersionEndpoints(data) {
		await this.#repository.SaveCPOVersionEndpoints(data);
	}

	async DeleteCPOVersions(data) {
		console.log(data);
		await this.#repository.DeleteCPOVersions(data);
	}
};
