require('dotenv').config();
const http = require('http');
const app = require('./index'); // app now includes session middleware

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Error Handling
server.on('error', (err) => {
    console.error("Server error:", err.message);
});
