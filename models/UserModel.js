import Sequelize from "sequelize";
import sequelize from "../util/database.js";

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
  role: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
    defaultValue: "user",
  },
});

export default UserModel;
