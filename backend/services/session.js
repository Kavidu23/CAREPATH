const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const connection = require('./connection'); // MySQL connection

require('dotenv').config();

const sessionStore = new MySQLStore({
    connection: connection, // Pass database connection

});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Recommended for login sessions
    store: sessionStore, // Use the MySQL store
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true in production
        sameSite: 'lax', // Or 'strict' for more security
        maxAge: 1000 * 60 * 60 * 24 // Example: 24 hours
    }
}));