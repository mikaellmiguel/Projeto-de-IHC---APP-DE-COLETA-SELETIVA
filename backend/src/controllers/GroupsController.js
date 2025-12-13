const AppError = require("../utils/AppError");
const knex = require('../database');
const checkAdmin = require("../utils/checkAdmin");

class GroupsController {

    async create(request, response) {

        const id = request.user;
        const {name} = request.body;

        const trx = await knex.transaction();

        try {
            
            const [groupId] = await trx('groups').insert({
                name,
                user_created: id
            }).returning("id");

            await trx("group_members").insert({
                group_id: groupId.id,
                user_id: id,
                is_admin: true
            });

            await trx.commit();

        } catch (error) {
            await trx.rollback();
            console.log(error);
            throw new AppError("Não foi possível criar o grupo");
        }

        return response.status(201).json();
    }

    async update(request, response) {

        const user_id = request.user;
        const group_id = request.params.id;
        const {name} = request.body;

        const group = await knex("groups").where({id: group_id}).first();

        if (!group) {
            throw new AppError("Grupo não encontrado");
        }


        if (!await checkAdmin(user_id, group_id)) {
            throw new AppError("Ação permitida apenas para administradores do grupo", 403);
        }

        await knex("groups").where({id: group_id}).update({name});

        return response.status(200).json();
    }

    async delete(request, response) {

        const user_id = request.user;
        const group_id = request.params.id;

        const group = await knex("groups").where({id: group_id}).first();

        if (!group) {
            throw new AppError("Grupo não encontrado");
        }

        if (!await checkAdmin(user_id, group_id)) {
            throw new AppError("Ação permitida apenas para administradores do grupo", 403);
        }

        await knex("groups").where({id: group_id}).delete();

        return response.status(200).json();
    }

    async list(request, response) {
        const user_id = request.user;

        const groups = await knex("group_members as gm")
            .join("groups as g", "gm.group_id", "g.id")
            .select("g.id", "g.name", "g.code", "gm.is_admin", "g.created_at")
            .where("gm.user_id", user_id);
        
        return response.status(200).json(groups);
    }

    async join(request, response) {

        const user_id = request.user;
        const code = request.params.code;

        const group = await knex("groups").where({code}).first();

        if (!group) {
            throw new AppError("Grupo não encontrado");
        }

        const existingMembership = await knex("group_members")
            .where({user_id, group_id: group.id})
            .first();
    
        if (existingMembership) {
            throw new AppError("Usuário já é membro do grupo");
        }

        await knex("group_members").insert({
            user_id,
            group_id: group.id,
            is_admin: false
        });

        return response.status(201).json();
    }

    async leave(request, response) {

        const user_id = request.user;
        const group_id = request.params.id;
        const membership = await knex("group_members")
            .where({ user_id, group_id })
            .first();

        if (!membership) {
            throw new AppError("Usuário não é membro do grupo");
        }

        await knex("group_members")
            .where({ user_id, group_id })
            .delete();

        return response.status(200).json();
    }

    async addAdmin(request, response) {

        const user_id = request.user;
        const group_id = request.params.id;
        const { user_id: new_admin_id} = request.body;

        const group = await knex("groups").where({id: group_id}).first();
        
        if (!group) {
            throw new AppError("Grupo não encontrado");
        }

        if (!await checkAdmin(user_id, group_id)) {
            throw new AppError("Ação permitida apenas para administradores do grupo", 403);
        }

        const membership = await knex("group_members")
            .where({ user_id: new_admin_id, group_id })
            .first();

        if (!membership) {
            throw new AppError("O usuário não é membro do grupo");
        }

        await knex("group_members")
            .where({ user_id: new_admin_id, group_id })
            .update({ is_admin: true });

        return response.status(200).json();
    }

    async removeAdmin(request, response) {

        const user_id = request.user;
        const group_id = request.params.id;
        const { user_id: admin_id } = request.body;

        console.log("Removing admin:", admin_id, "from group:", group_id);

        const group = await knex("groups").where({id: group_id}).first();

        if (!group) {
            throw new AppError("Grupo não encontrado");
        }

        if (!await checkAdmin(user_id, group_id)) {
            throw new AppError("Ação permitida apenas para administradores do grupo", 403);
        }

        const membership = await knex("group_members")
            .where({ user_id: admin_id, group_id })
            .first();
        
        if (!membership || !membership.is_admin) {
            throw new AppError("O usuário não é administrador do grupo");
        }

        const qtdAdmins = await knex("group_members")
            .where({ group_id, is_admin: true })
            .count("user_id as count")
            .first();
        
        if (qtdAdmins.count <= 1) {
            throw new AppError("O grupo deve ter ao menos um administrador");
        }

        await knex("group_members")
            .where({ user_id: admin_id, group_id })
            .update({ is_admin: false });
    
        return response.status(200).json();
    }

    async listMembers(request, response) {

        const user_id = request.user;
        const group_id = request.params.id;

        const group = await knex("groups").where({id: group_id}).first();
        if (!group) {
            throw new AppError("Grupo não encontrado");
        }

        const isMember = await knex("group_members")
            .where({ user_id, group_id })
            .first();

        if (!isMember) {
            throw new AppError("Ação permitida apenas para membros do grupo", 403);
        }

        // Consulta única: membros + soma de qtd_bags, ordenado do maior para o menor
        const members = await knex("group_members as gm")
            .join("users as u", "gm.user_id", "u.id")
            .leftJoin("records as r", "u.id", "r.user_id")
            .where("gm.group_id", group_id)
            .groupBy("u.id", "u.name", "u.email", "gm.is_admin")
            .select(
                "u.id",
                "u.name",
                "u.email",
                "gm.is_admin",
                knex.raw("COALESCE(SUM(r.qtd_bags),0) as qtd_bags")
            )
            .orderBy([{ column: "qtd_bags", order: "desc" }]);

        return response.status(200).json(members);
    }

    async removeMember(request, response) {

        const user_id = request.user;
        const group_id = request.params.id;
        const { user_id: member_id } = request.body;
        const is_admin = await checkAdmin(user_id, group_id);

        if (!is_admin) {
            throw new AppError("Ação permitida apenas para administradores do grupo", 403);
        }

        if (member_id === user_id) {
            throw new AppError("Administradores não podem remover a si mesmos", 403);
        }

        const membership = await knex("group_members")
            .where({ user_id: member_id, group_id })
            .first();

        if (!membership) {
            throw new AppError("O usuário não é membro do grupo");
        }

        await knex("group_members")
            .where({ user_id: member_id, group_id })
            .delete();
        
        return response.status(200).json();
    }
}

module.exports = GroupsController;