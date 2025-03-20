const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const connection = require('./connection');
const userRouter = require('./routes/patient');
const doctorRouter = require('./routes/doctor');
const homeRouter = require('./routes/home');
const dprofileRouter = require('./routes/d_profile');
const dlistRouter = require('./routes/d_list');
const clinicRouter = require('./routes/clinics');
const priflistRouter = require('./routes/p_profile');
const homecareRouter = require('./routes/homecare');
const app = express();

// Configure MySQL session store
const sessionStore = new MySQLStore({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'medicalsystem'
});

// Use session middleware in index.js
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use routes after session middleware
app.use('/patient', userRouter);
app.use('/doctor', doctorRouter);
app.use('/home', homeRouter);
app.use('/d_profile', dprofileRouter);
app.use('/d_list', dlistRouter);
app.use('/clinics', clinicRouter);
app.use('/p_profile', priflistRouter);
app.use('/clinics', clinicRouter);
app.use('/home-care', homecareRouter);




module.exports = app;
