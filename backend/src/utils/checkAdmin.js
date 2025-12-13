const knex = require("../database");

async function checkAdmin(user_id, group_id) {

    const membership = await knex("group_members")
        .where({ user_id, group_id })
        .first();

    if (!membership || !membership.is_admin) {
        return false;
    }

    return true;
    
}

module.exports = checkAdmin;