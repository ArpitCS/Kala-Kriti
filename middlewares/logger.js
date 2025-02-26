// Custom Logger Middleware with Morgan Module
const morgan = require("morgan");

const logger = (req, res, next) => {
  const method = req.method;
  const url = req.url;
  const timestamp = new Date().toISOString();

  // Sample Code from Morgan Docs
  const morganLogger = morgan("dev");
  morganLogger(req, res, next);

  // next() // => Called using the Morgan Module Object
};
module.exports = logger;
