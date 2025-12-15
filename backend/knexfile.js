const path = require("path");
require("dotenv").config();

module.exports = {
    client: 'pg',
    connection: process.env.SUPABASE_URL,
    pool: {
        min: 2,
        max: 10,
        propagateCreateError: false,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 60000,
    }
};