const path = require("path");
require("dotenv").config();

module.exports = {
    client: 'pg',
    connection: process.env.SUPABASE_URL,
    pool: {
        min: 1,
        max: 1,
        propagateCreateError: false
    }
};