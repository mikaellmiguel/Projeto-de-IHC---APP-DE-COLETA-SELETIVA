require("dotenv").config();
const config = require("../../knexfile");
const knex = require("knex");

const connection = knex(config);

connection.raw("SELECT 1")
  .then(() => {
    console.log("Conexão com o banco de dados estabelecida com sucesso!");
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
  });

module.exports = connection;