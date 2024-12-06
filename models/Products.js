import Sequalize from "sequelize";
import sequelize from "../util/database.js";

const ProductsModel = sequelize.define("products", {
  id: {
    type: Sequalize.DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
    type: Sequalize.DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: Sequalize.DataTypes.STRING,
    allowNull: false,
  },
});

export default ProductsModel;
