const tokenService = require("../Service/token-service");
const ApiError = require("../exctencions/api-errors")

module.exports = function(req, res, next){
    try {
        const authHeaders = req.headers.authorization;
        if(!authHeaders){
        next(ApiError.UnathorizedError())
        }
        const accesToken = authHeaders.split(' ')[1]
        if(!accesToken){
            next(ApiError.UnathorizedError())
        }
        const token = tokenService.validateAccesToken(accesToken)
        if(!token){
        next(ApiError.UnathorizedError())
        }
        req.user = token
        next()
    } catch (e) {
        next(ApiError.UnathorizedError())
    }
}