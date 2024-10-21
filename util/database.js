const Sequelize = require("sequelize");

const sequelize = new Sequelize("node_crud", "root", "Bititude123@", {
  dialect: "mysql",
  host: "localhost",
});


module.exports = sequelize;
