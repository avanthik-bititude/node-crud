const bcrypt = require("bcryptjs");

const hashFunction = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error(error);
    return;
  }
};

module.exports = hashFunction;
