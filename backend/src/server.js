require("dotenv").config();
require("express-async-error");

const express = require("express");

const app = express();
const cors = require("cors");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

app.use(express.json());
app.use(cors());

app.use(routes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
