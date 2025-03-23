const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const connection = require('./connection'); // Your MySQL connection

require('dotenv').config();

const sessionStore = new MySQLStore({
    expiration: 1000 * 60 * 60 * 24, // Session expiration (optional)
    createDatabaseTable: true, // Automatically create the sessions table
    connection: connection, // Your MySQL connection
});

app.use(session({
    secret: process.env.SESSION_SECRET,  // Make sure you have SESSION_SECRET defined in your .env
    resave: false,  // Do not save session if not modified
    saveUninitialized: false,  // Do not store unmodified sessions (important for login)
    store: sessionStore,  // Use the MySQL store for session persistence
    cookie: {
        httpOnly: true,  // Cookie accessible only by the server
        secure: process.env.NODE_ENV === 'production',  // Only send cookies over HTTPS in production
        sameSite: 'lax',  // CSRF protection (lax is a good default)
        maxAge: 1000 * 60 * 60 * 24  // 24 hours session duration (adjust as needed)
    }
}));

// Optional: Log session store errors
sessionStore.on('error', (err) => {
    console.error('Session store error:', err);
});
