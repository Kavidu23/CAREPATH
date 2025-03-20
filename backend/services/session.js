const session = require('express-session');
require('dotenv').config();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,  // This ensures the cookie cannot be accessed via JavaScript
        secure: false // Set to true if using HTTPS
    }
}));
