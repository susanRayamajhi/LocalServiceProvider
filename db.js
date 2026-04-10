const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_CONTAINER || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.MYSQL_ROOT_USER || 'root',
    password: process.env.MYSQL_ROOT_PASSWORD || 'rootpassword',
    database: process.env.MYSQL_DATABASE || 'local_service_provider',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
