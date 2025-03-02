const mysql = require('mysql');
require('dotenv').config();

var connection = mysql.createConnection({   // Create a connection to the database
    port: process.env.DB_PORT,  // Port number
    host: process.env.DB_HOST,  // Host name
    user: process.env.DB_USERNAME,  // User name
    password: process.env.DB_PASSWORD,  // Password
    database: process.env.DB_NAME  // Database name
});

connection.connect((err)=> {  // Connect to the database
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');      
}); 

module.exports = connection;  // Export the connection