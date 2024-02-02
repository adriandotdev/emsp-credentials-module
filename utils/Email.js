require("dotenv").config();
const nodemailer = require("nodemailer");

const config = require("../config/config");

module.exports = class Email {
	#email_address;
	#data;
	#transporter;

	constructor(email_address, data) {
		this.#email_address = email_address;
		this.#data = data;
		this.#transporter = nodemailer.createTransport({
			name: config.nodemailer?.name,
			host: config.nodemailer.host,
			port: config.nodemailer.port,
			secure: config.nodemailer.secure,
			auth: {
				user: config.nodemailer.user,
				pass: config.nodemailer.password,
			},
			tls: {
				rejectUnauthorized: false,
			},
		});
	}

	GetEmail() {
		return this.#email_address;
	}

	GetData() {
		return this.#data;
	}

	GetTransporter() {
		return this.#transporter;
	}

	async SendEmail() {
		throw new Error("SendEmail method must be implemented");
	}
};
