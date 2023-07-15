const jwt = require('jsonwebtoken')
const db = require('../Models/db')
class TokenService{
    generateTokens(payload){
        const accesToken = jwt.sign(payload, process.env.JWT_ACCES_TOKEN, {expiresIn: "30m"})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN, {expiresIn: "30d"})
        return {
            accesToken,
            refreshToken
        }
    }

    validateAccesToken(token){
        try{
            const tokenData = jwt.verify(token, process.env.JWT_ACCES_TOKEN)
            return tokenData
        }catch(e){
            return null
        }
    }
    
    validateRefreshToken(token){
        try{
            const tokenData = jwt.verify(token, process.env.JWT_REFRESH_TOKEN)
            return tokenData
        }catch(e){
            return null
        }
    }
    async saveToken(userId, refreshToken){
        const tokenData = await db.query(
            "SELECT * FROM token WHERE users_id = $1",
            [userId]
          );
           if(tokenData){
            tokenData.rows.refreshToken = refreshToken
           }

           const token = await db.query(
            "INSERT INTO token(users_id,refreshToken) values ($1,$2)",
            [userId, refreshToken]
          );
          return token;
    }

    async removeToken(refreshToken){
        const tokendata = await db.query('DELETE FROM token WHERE refreshToken = $1', [refreshToken])
        return tokendata
    }

    async findOne(refreshToken){
        const tokendata = await db.query('SELECT * FROM token WHERE refreshToken = $1', [refreshToken])
        return tokendata
    }
}

module.exports = new TokenService();