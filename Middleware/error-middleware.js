const ApiError = require('../exctencions/api-errors')

module.exports = function(err, req, res, next){
    console.log(err);
    if(err instanceof ApiError){
        res.status(err.status).json({message: err.message , errors: err.errors})
    }
    return res.status(500).json({message: "Непревиданная ошибка"})
}