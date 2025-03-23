const authenticateDoctor = (req, res, next) => {
    // Check if the session exists and if the doctor is logged in
    if (!req.session || !req.session.doctor) {
        console.error("Unauthorized access: No session or doctor not logged in");
        return res.status(401).json({
            message: "Unauthorized. Please log in.",
            error: "No session or doctor not logged in"
        });
    }

    // Check if the session has expired or is invalid
    if (!req.session.doctor.Email) {
        console.error("Unauthorized access: Session data is incomplete or expired");
        return res.status(401).json({
            message: "Unauthorized. Please log in again.",
            error: "Session expired or incomplete"
        });
    }

    // Prevent multiple requests for the same session
    if (req.session.isProcessing) {
        const currentTime = Date.now();
        const processingTimeDifference = currentTime - req.session.processingStartTime;

        // Allow re-processing only after a certain threshold (e.g., 5000ms)
        if (processingTimeDifference < 5000) {
            console.error("Multiple requests from the same session detected within a short interval");
            return res.status(429).json({
                message: "Request is already being processed. Please wait.",
                error: "Multiple requests detected within a short interval"
            });
        }
    }

    // Set flag to indicate that a request is being processed
    req.session.isProcessing = true;
    req.session.processingStartTime = Date.now(); // Record the start time

    // Log the session and doctor email for debugging
    console.log(`Doctor session authenticated: ${req.session.doctor.Email}`);

    // Proceed to the next middleware or route handler
    next();
};

// Reset the processing flag after the request is finished
const resetProcessingFlag = (req, res, next) => {
    res.on('finish', () => {
        // Reset the flag and clear processing timestamp once the response has been sent
        req.session.isProcessing = false;
        req.session.processingStartTime = null;
        console.log(`Processing flag reset for session: ${req.session.doctor.Email}`);
    });
    next();
};

module.exports = { authenticateDoctor, resetProcessingFlag };