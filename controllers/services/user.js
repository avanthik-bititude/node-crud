import UserModel from "../../models/UserModel.js";

export const createNewUser = async (hashedPassword, username, email, role) => {
  const newUser = await UserModel.create({
    username,
    email,
    role,
    password: hashedPassword,
  });
  return newUser;
};
