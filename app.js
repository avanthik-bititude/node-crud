const express = require("express");
const cors = require("cors");
const app = express();
const sequelize = require("./util/database");
require("dotenv").config();

const user = require("./routes/user");
const products = require("./routes/products");

app.use(express.json());
app.use(cors());

app.use("/user", user);
app.use("/products", products);

sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 3001, () => {
      console.log("server running on " + (process.env.PORT || 3001));
    });
  })
  .catch((error) => {
    console.error(error);
  });
