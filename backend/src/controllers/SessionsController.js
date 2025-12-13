const knex = require("../database");
const AppError = require("../utils/AppError");
const {compare} = require("bcryptjs");
const authConfig = require("../configs/auth")
const { sign, decode } = require("jsonwebtoken");


class SessionsController {
    async create(request, response) {

        const {email, password} = request.body;
        const user = await knex("users").where({email}).first();
        
        if (!user){
            throw new AppError("Email ou Senha Incorreta");
        }
        
        const passwordMatched = await compare(password, user.password);
        
        if(!passwordMatched) {
            throw new AppError("E-mail ou Senha Incorreta", 401);
        }

        const {secret, expiresIn} = authConfig.jwt;
        
        const token = sign({}, secret, {
            subject: String(user.id),
            expiresIn
        });

        // Decodifica o token para obter o claim `exp` (segundos desde epoch)
        const decoded = decode(token);
        const exp = decoded && decoded.exp ? decoded.exp : null;
        const expiresAt = exp ? new Date(exp * 1000).toISOString() : null;

        return response.json({
            token,
            expiresAt,
            user: { name: user.name, email: user.email, id: user.id }
        });
    }
}

module.exports = SessionsController;