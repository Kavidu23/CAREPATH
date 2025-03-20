// adminMiddleware.js
const authenticateAdmin = (req, res, next) => {
    if (!req.session || !req.session.admin) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next(); // Proceed to the next middleware or route handler
};

module.exports = { authenticateAdmin };
