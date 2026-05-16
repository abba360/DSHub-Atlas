const asyncHandler = require("../../utils/async-handler");
const userService = require("./user.service");

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.validated.body);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user
  });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();

  res.status(200).json({
    success: true,
    message: "Users retrieved successfully",
    data: users
  });
});

module.exports = {
  createUser,
  listUsers
};
