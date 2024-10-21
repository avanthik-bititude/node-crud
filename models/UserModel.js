const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const UserModel = sequelize.define("users", {
  id: {
    type: Sequelize.DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  username: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = UserModel;
