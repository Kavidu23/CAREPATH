require('dotenv').config(); 

function checkRole(req, res, next) {
    const role = req.user.role;
    if (role === process.env.USER) {  // Compare role from req.user to the role in env
        res.sendStatus(401);   // Unauthorized access
    } else {
        next();  // Proceed to the next middleware/route handler
    }
}

module.exports = {checkRole, checkRole};  // Export the function
