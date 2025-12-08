require("dotenv").config();
require("express-async-error");

const express = require("express");

const app = express();
const cors = require("cors");

app.use(express.json());

app.use(cors());

app.get("/test", (req, res) => {
  res.send("The server is running!");
});

const knex = require("../src/database/index.js");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
