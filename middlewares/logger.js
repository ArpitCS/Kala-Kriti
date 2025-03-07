// Custom Logger Middleware with Morgan Module
const morgan = require("morgan");

morgan.token('colored-status', (req, res) => {
  const status = res.statusCode;
  let color;

  if (status >= 500) {
    color = '\x1b[31m';
  } else if (status >= 400) {
    color = '\x1b[33m'; 
  } else if (status >= 300) {
    color = '\x1b[36m'; 
  } else if (status >= 200) {
    color = '\x1b[32m'; 
  } else {
    color = '\x1b[0m';  
  }
  
  return `${color}${status}\x1b[0m`;
});

morgan.token('timestamp', () => {
  return new Date().toISOString();
});

const logger = (req, res, next) => {
  
  const morganLogger = morgan("[:timestamp] :method :url :colored-status :response-time ms - :res[content-length]");

  morganLogger(req, res, next);
};

module.exports = logger;
