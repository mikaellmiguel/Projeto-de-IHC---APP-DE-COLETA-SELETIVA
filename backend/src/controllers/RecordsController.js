const AppError = require("../utils/AppError");
const knex = require('../database');

class RecordsController {

    async create(request, response) {
        const group_id = request.params.id;
        const {qtd_bags, show_feed} = request.body;

        const id = request.user;

        const group = await knex("groups").where({id: group_id}).first();

        if (!group) {
            throw new AppError("Grupo não encontrado");
        }

        const membership = await knex("group_members")
            .where({ user_id: id, group_id })
            .first();

        if (!membership) {
            throw new AppError("Ação permitida apenas para membros do grupo", 403);
        }

        if (![true, false].includes(show_feed)) {
            throw new AppError("Parâmetro show_feed inválido");
        }

        await knex('records').insert({
            qtd_bags,
            user_id: id,
            group_id,
            show_feed
        });

        return response.status(201).json();
    }

    async getFeedRecords(request, response) {
        const group_id = request.params.id;
        const user_id = request.user;
        let { limit, offset } = request.query;

        limit = limit ? parseInt(limit) : 10;
        offset = offset ? parseInt(offset) : 0;

        const group = await knex("groups").where({id: group_id}).first();
        if (!group) {
            throw new AppError("Grupo não encontrado");
        }

        const membership = await knex("group_members")
            .where({ user_id: request.user, group_id })
            .first();
        
        if (!membership) {
            throw new AppError("Ação permitida apenas para membros do grupo", 403);
        }

        const records = await knex("records")
        .join("users", "records.user_id", "users.id")
        .leftJoin("liked_posts", function () {
            this.on("liked_posts.record_id", "records.id")
                .andOnVal("liked_posts.user_id", user_id)
        })
        .where({ "records.group_id": group_id })
        .andWhere("records.show_feed", true)
        .select(
            "records.*",
            "users.id as user_id",
            "users.name as user_name",
            "liked_posts.id as liked_post_id"
        )
        .orderBy("records.created_at", "desc")
        .limit(limit)
        .offset(offset);
        
        const totalBags = await knex("records")
            .where({ group_id })
            .sum('qtd_bags as total')
            .first();
            
        return response.json({records: records, totalBags: totalBags.total });
    }

    async getUserRecords(request, response) {
        
        const group_id = request.params.id;
        const user_id = request.user;
        let { limit, offset } = request.query;

        limit = limit ? parseInt(limit) : 10;
        offset = offset ? parseInt(offset) : 0;

        const group = await knex("groups").where({id: group_id}).first();
        if (!group) {
            throw new AppError("Grupo não encontrado");
        }

        const records = await knex("records")
            .where({ user_id })
            .andWhere({ group_id })
            .limit(limit).offset(offset)
            .select("*").orderBy("created_at", "desc");

        return response.json(records);
    }

    async update(request, response) {
        const record_id = request.params.id;
        const {qtd_bags} = request.body;
        const user_id = request.user;
        const record = await knex("records").where({id: record_id}).first();
        if (!record) {
            throw new AppError("Registro não encontrado");
        }

        if (record.user_id !== user_id) {
            throw new AppError("Ação permitida apenas para o criador do registro", 403);
        }

        await knex("records").where({id: record_id}).update({qtd_bags});

        return response.status(200).json();
    }

    async delete(request, response) {
        const record_id = request.params.id;
        const user_id = request.user;
        const record = await knex("records").where({id: record_id}).first();
        if (!record) {
            throw new AppError("Registro não encontrado");
        }   
        if (record.user_id !== user_id) {
            throw new AppError("Ação permitida apenas para o criador do registro", 403);
        }
        await knex("records").where({id: record_id}).delete();

        return response.status(200).json();
    }

    async addLike(request, response) {
        const record_id = request.params.id;
        const user_id = request.user;
        const record = await knex("records").where({id: record_id}).first();

        if (!record) {
            throw new AppError("Registro não encontrado");
        }

        const existingLike = await knex("liked_posts")
            .where({ record_id, user_id })
            .first();
        if (existingLike) {
            throw new AppError("Você já curtiu este registro");
        }

        await knex("liked_posts").insert({ record_id, user_id });
        await knex("records")
            .where({ id: record_id })
            .increment("likes", 1);

        return response.status(201).json();
    }

    async removeLike(request, response) {
        const record_id = request.params.id;
        const user_id = request.user;
        const record = await knex("records").where({id: record_id}).first();

        if (!record) {
            throw new AppError("Registro não encontrado");
        }

        const existingLike = await knex("liked_posts")
            .where({ record_id, user_id })
            .first();
        if (!existingLike) {
            throw new AppError("Você não curtiu este registro");
        }
        await knex("liked_posts")
            .where({ record_id, user_id })
            .delete();
        await knex("records")
            .where({ id: record_id })
            .decrement("likes", 1);

        return response.status(200).json();
    }

    async record_impact(request, response) {
        const user_id = request.user;
        const group_id = request.params.id;
        const month = request.params.month ? parseInt(request.params.month) : null;
        const year = request.params.year ? parseInt(request.params.year) : null;
    
        const membership = await knex("group_members")
            .where({ user_id })
            .first();
        if (!membership) {
            throw new AppError("Ação permitida apenas para membros de grupos", 403);
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Último dia do mês

        const totalBags = await knex("records")
            .where({ group_id }).whereBetween('created_at', [startDate, endDate])
            .sum('qtd_bags as total')
            .first();

        const result = await knex("records")
            .where("group_id", group_id)
            .whereBetween("created_at", [startDate, endDate])
            .select(
                knex.raw(`
                CEIL(EXTRACT(DAY FROM created_at) / 7.0) AS week
                `)
            )
            .sum("records.qtd_bags as qtd_bags")
            .groupBy("week")
            .orderBy("week");
        
        return response.json({
            totalBags: totalBags.total || 0,
            weeklyData: result
        });
    }
}

module.exports = RecordsController;