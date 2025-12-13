const AppError = require("../utils/AppError");
const knex = require('../database');
const checkAdmin = require("../utils/checkAdmin");


class GoalsController {
    
    async create(request, response) {

        const user_id = request.user;
        const group_id = request.params.id;
        const isAdmin = await checkAdmin(user_id, group_id);
        const month = request.params.month;
        const year = request.params.year;

        console.log("Creating goal for group:", group_id, "month:", month, "year:", year);

        const {qtd_bags, rewards } = request.body;

        if(!isAdmin) {
            throw new AppError("Ação permitida apenas para administradores.", 403);
        }

        const group = await knex('groups').where({ id: group_id }).first();

        if(!group) {
            throw new AppError("Grupo não encontrado.")
        }

        if(![1,2,3,4,5,6,7,8,9,10,11,12].includes(Number(month))) {
            throw new AppError("Mês inválido.")
        }

        const yearRegex = /^\d{4}$/;
        if (!yearRegex.test(String(year))) {
            throw new AppError("Ano inválido. Use o formato YYYY (ex.: 2025).")
        }

        if (qtd_bags <= 0) {
            throw new AppError("Quantidade de sacos inválida.")
        }

        await knex('group_goals').insert({
            group_id,
            month,
            year,
            qtd_bags,
            rewards
        });

        return response.status(201).json();
    }

    async update(request, response) {
        const user_id = request.user;
        const group_id = request.params.id;
        const isAdmin = await checkAdmin(user_id, group_id);
        const month = request.params.month;
        const year = request.params.year;

        const { qtd_bags, rewards } = request.body;

        if(!isAdmin) {
            throw new AppError("Ação permitida apenas para administradores.", 403);
        }

        const goal = await knex('group_goals')
            .where({ group_id, month, year })
            .first();
        
        if(!goal) {
            throw new AppError("Meta não encontrada.")
        }

        await knex('group_goals')
            .where({ group_id, month, year })
            .update({
                qtd_bags,
                rewards
            });
        
        return response.status(200).json();
    }

    async delete(request, response) {
        const user_id = request.user;
        const group_id = request.params.id;
        const isAdmin = await checkAdmin(user_id, group_id);
        const month = request.params.month;
        const year = request.params.year;

        if(!isAdmin) {
            throw new AppError("Ação permitida apenas para administradores.", 403);
        }

        const goal = await knex('group_goals')
            .where({ group_id, month, year })
            .first();
        if(!goal) {
            throw new AppError("Meta não encontrada.")
        }

        await knex('group_goals')
            .where({ group_id, month, year })
            .delete();

        return response.status(200).json();
    }

    async list(request, response) {
        const group_id = request.params.id;

        const membership = await knex('group_members')
            .where({ group_id, user_id: request.user })
            .first();

        if(!membership) {
            throw new AppError("Ação permitida apenas para membros do grupo.", 403);
        }

        const goals = await knex('group_goals')
            .where({ group_id })
            .select('*')
            .orderBy(['year', 'month']);
        
        return response.json(goals);
    }
}

module.exports = GoalsController;