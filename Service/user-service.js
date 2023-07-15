const db = require('../Models/db')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('../Service/mail-service')
const tokenService = require('../Service/token-service')
const UserDto = require('../dtos/user-dtos')
const ApiError = require('../exctencions/api-errors')

class UserService{
    async registration(email, password){
        const {rowCount:condidate} = await db.query('SELECT * FROM users WHERE email = $1', [email])
        if(Boolean(condidate)){
            throw  ApiError.BadRequest('Пользователь с таким почтовым адресом уже существует')
        }
        const activationLink = uuid.v4()
        const hashPassword = await bcrypt.hash(password, 5)
        if(!Boolean(condidate)){
            const user = await db.query('INSERT INTO users(email,password,activationLink) values ($1,$2,$3) RETURNING *', [email,hashPassword, activationLink])
            await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)
            const userDto = new UserDto(user.rows);
            const tokens = tokenService.generateTokens({...userDto})
            await tokenService.saveToken(userDto.id, tokens.refreshToken)
            return{...tokens,user: userDto}
        }
    }

    async activate(activationLink){
        const user = await db.query('SELECT * FROM users WHERE activationLink = $1', [activationLink])
        if(Boolean(user.rowCount) == false){
            throw  ApiError.BadRequest('Неверная ссылка активации')
        }
        const userTrue = user.rows[0].isActivated = true
    await db.query('UPDATE users set isActivated = $1', [userTrue])
    }

    async login(email, password){
        const condidate = await db.query('SELECT * FROM users WHERE email = $1', [email])
        if(Boolean(condidate.rowCount) == false){
            throw  ApiError.BadRequest('Пользователь не существет')
        }
        const isPassword = await bcrypt.compare(password, condidate.rows[0].password)
        if(!isPassword){
            throw  ApiError.BadRequest('Пароль не верен')
        }
        const userDto = new UserDto(condidate.rows)
        const tokens =  tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return{...tokens,user: userDto}
    }

    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken);
        return token
    }

    async refresh(refreshToken){
        if(!refreshToken){
            throw ApiError.UnathorizedError()
        }
        const userData = tokenService.validateRefreshToken(refreshToken)
        const tokenFromDB = await  tokenService.findOne(refreshToken)
        if(!userData || tokenFromDB.rows.length === 0){
            throw ApiError.UnathorizedError();
        }

            const user = await db.query('SELECT * FROM users WHERE id = $1', [userData.id])
            const userDto = new UserDto(user.rows)

            const tokens = tokenService.generateTokens({...userDto})
                await tokenService.saveToken(userDto.id, tokens.refreshToken)
                return{...tokens,user: userDto}
    }

    async getAllUsers(){
        const users = await db.query('SELECT * FROM users')
        return users
    }
}

module.exports = new UserService();