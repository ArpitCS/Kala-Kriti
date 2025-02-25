// Custom Logger Middleware with Morgan Module
const morgan = require("morgan");

const logger = (req, res, next) => {
  const method = req.method;
  const url = req.url;
  const timestamp = new Date().toISOString();

  // console.log(`[${timestamp}] ${method}:${url}`)

  // Sample Code from Morgan Docs
  const morganFormat = `:method :url :status - :response-time ms`;
  const morganLogger = morgan(morganFormat);

  morganLogger(req, res, next);

  // next()
};
module.exports = logger;
