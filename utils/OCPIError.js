const HTTP_STATUS_CODE = {
	BAD_REQUEST: 400,
};

const OCPI_STATUS_CODE = {
	GENERIC_CLIENT_ERROR: 2000,
};

class OCPIError extends Error {
	constructor({ name, status_code, status, message, data }) {
		super(message);
		this.status_code = status_code;
		this.status = status;
		this.data = data;
		this.name = name;
		Error.captureStackTrace(this);
	}
}

class GenericClientError extends OCPIError {
	constructor(message, data) {
		super({
			name: "Generic Client Error",
			status_code: OCPI_STATUS_CODE.GENERIC_CLIENT_ERROR,
			status: HTTP_STATUS_CODE.BAD_REQUEST,
			message,
			data,
		});
	}
}

module.exports = {
	GenericClientError,
};
