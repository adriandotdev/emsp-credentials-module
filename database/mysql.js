require("dotenv").config();
var mysql = require("mysql2");

// Configuration
const logger = require("../config/winston");

let pool = mysql.createPool({
	connectionLimit: process.env.DB_CONNECTION_LIMIT,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database:
		process.env.NODE_ENV === "test"
			? process.env.DB_DATABASE_TEST
			: process.env.DB_DATABASE,
});

pool.getConnection(function (err, connection) {
	//declaration of db pooling
	if (err) {
		logger.error("error: " + err.message);
	}

	if (connection) {
		logger.info("Connected to Database");
		connection.release(); //reuse of connection every after access
	}
});

pool.on("release", function (connection) {
	logger.info("Connection %d released", connection.threadId);
});

module.exports = pool;
