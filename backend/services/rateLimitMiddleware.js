const rateLimitMiddleware = (req, res, next) => {
    const ip = req.ip; // Get the IP address of the requestor
    const currentTime = Date.now(); // Get the current time in milliseconds
    const windowMs = 15 * 60 * 1000; // Set the time window to 15 minutes
    const maxRequests = 100; // Maximum requests allowed in the window
  
    // Initialize the map for tracking requests if it doesn't exist
    if (!global.requestLimitMap) {
      global.requestLimitMap = new Map();
    }
  
    // Get or initialize the request data for the given IP address
    const requestData = global.requestLimitMap.get(ip) || { count: 0, lastRequestTime: currentTime };
  
    if (currentTime - requestData.lastRequestTime < windowMs) {
      // If the current time is within the time window, check if the limit is exceeded
      if (requestData.count >= maxRequests) {
        return res.status(429).json({
          message: 'Too many requests. Please try again later.'
        });
      }
      // Otherwise, increment the count
      requestData.count++;
    } else {
      // If the time window has passed, reset the count and last request time
      requestData.count = 1;
      requestData.lastRequestTime = currentTime;
    }
  
    // Update the map with the new request data
    global.requestLimitMap.set(ip, requestData);
  
    next(); // Continue to the next middleware or route handler
  };
  
  module.exports = rateLimitMiddleware;
  