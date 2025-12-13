const {verify} = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const authConfig = require("../configs/auth");
const knex = require("../database");

async function ensureAuthenticated(request, response, next) {
    const authHeader = request.headers.authorization;

    if(!authHeader) {
        throw new AppError("JWT token não informado", 401);
    }

    const [, token] = authHeader.split(" ");

    try {
        const {sub: user_id} = verify(token, authConfig.jwt.secret);
        const user = await knex('users').where({ id: user_id }).first();
        if (!user_id || !user) throw new Error();
        request.user = user.id;
        return next();
    } 
    catch{
        throw new AppError("JWT token inválido", 401);
    }

}

module.exports = ensureAuthenticated;