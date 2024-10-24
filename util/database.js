const Sequelize = require("sequelize");

const sequelize = new Sequelize("node_crud", "root", "Bititude123@", {
  dialect: "mysql",
  host: "localhost",
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Sequelize conncetion success");
  } catch (error) {
    console.error("Sequelize connection error :", error.message);
  }
};

testConnection();

module.exports = sequelize;
