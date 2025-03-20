// userMiddleware.js
const authenticateUser = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    next(); // Proceed to the next middleware or route handler
};

module.exports = { authenticateUser };
