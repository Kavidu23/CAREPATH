// doctorMiddleware.js
const authenticateDoctor = (req, res, next) => {
    if (!req.session || !req.session.doctor) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next(); // Proceed to the next middleware or route handler
};

module.exports = { authenticateDoctor };
