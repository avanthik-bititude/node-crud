import express from "express";
import cors from "cors";

const app = express();
import sequelize from "./util/database.js";

import dotenv from "dotenv";
dotenv.config();

import user from "./routes/user.js";
import products from "./routes/products.js";

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
