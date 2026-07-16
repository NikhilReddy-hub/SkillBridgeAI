/**
 * catchAsync — wraps async route handlers to eliminate try/catch boilerplate.
 * Automatically forwards errors to Express's next() error handler.
 * 
 * @param {Function} fn - Async express handler function
 * @returns {Function} Express middleware
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
