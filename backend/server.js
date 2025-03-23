require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const app = express();

// CORS Configuration
app.use(cors({
  origin: 'http://localhost:4200',  // Replace with the URL of your Angular frontend
  credentials: true,  // Allow cookies (session cookies) to be sent with requests
}));

// Session Middleware
app.use(session({
  secret: 'yourSecretKey',  // Use a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }  // Set to true in production with HTTPS
}));

// Rate Limit Middleware Configuration
const limiter = rateLimit({
  windowMs: 1000,  // 1 second
  max: 1000, // Limit each IP to 5 requests per second (adjust for testing)
  message: 'Too many requests from this IP, please try again later.',
});

// Apply the rate limit to all routes
app.use(limiter);

// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import your routes and app logic
const routes = require('./index'); // Import the routes from index.js
app.use(routes);

// Create the server
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Error Handling
server.on('error', (err) => {
    console.error("Server error:", err.message);
});
