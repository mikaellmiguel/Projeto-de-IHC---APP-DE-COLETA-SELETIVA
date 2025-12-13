const { hash, compare } = require('bcryptjs');

const AppError = require("../utils/AppError");
const knex = require('../database');

class UsersController {

    async create(request, response) {
        const { name, email, password } = request.body;

        const userAlreadyExists = await knex('users').where('email', email).first();

        if (userAlreadyExists) {
            throw new AppError("Este e-mail já está em uso");
        }

        const passwordHash = await hash(password, 8);

        await knex('users').insert({ name, email, password: passwordHash });

        return response.status(201).json();
    }

    async update(request, response) {
        const { name, email, password, old_password } = request.body;
        const id = request.user;

        const user = await knex('users').where('id', id).first();

        if (!user) {
            throw new AppError("Usuário não encontrado");
        }

        const userWithUpdatedEmail = await knex('users').where('email', email).first();

        if (userWithUpdatedEmail && userWithUpdatedEmail.id !== id) {
            throw new AppError("Este e-mail já está em uso");
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;

        if (password && !old_password) {
            throw new AppError("Senha antiga não informada");
        }

        if (password && old_password) {
            const oldPasswordMatch = await compare(old_password, user.password);

            if (!oldPasswordMatch) {
                throw new AppError("Senha antiga incorreta");
            }

            user.password = await hash(password, 8);
        }

        await knex('users').where('id', id).update(user);
        return response.status(200).json();
    }

    async delete(request, response) {
        const { password } = request.body;
        const id = request.user;

        if (!password) {
            throw new AppError("Senha não informada");
        }

        const user = await knex('users').where('id', id).first();

        if (!user) {
            throw new AppError("Usuário não encontrado");
        }

        const checkPasswordMatch = await compare(password, user.password);

        if (!checkPasswordMatch) {
            throw new AppError("Permissão Negada: Senha Incorreta", 401);
        }

        await knex('users').where('id', id).delete();

        return response.status(200).json();
    }

}



module.exports = UsersController;