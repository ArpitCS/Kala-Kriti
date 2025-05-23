// Error Handler
const errorHandler = (err, req, res, next) => {
    console.error(err.stack)
    
    res.status(500).send({
        error: 'Something went wrong!',
        message: err.message || 'Internal Server Error'
    })
}
module.exports = errorHandler
