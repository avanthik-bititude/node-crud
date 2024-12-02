const Sequalize = require("sequelize");

const sequalize = require("../util/database");

const ProductsModel = sequalize.define("products", {
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

module.exports = ProductsModel;
