const userService = require("../services/user.service");
const { success, paginated } = require("../utils/response");

function listUsers(req, res, next) {
  try {
    const { data, pagination } = userService.listUsers(req.query);
    return paginated(res, data, pagination, "Users retrieved.");
  } catch (err) {
    next(err);
  }
}

function getUserById(req, res, next) {
  try {
    const user = userService.getUserById(req.params.id);
    return success(res, user, "User retrieved.");
  } catch (err) {
    next(err);
  }
}

function createUser(req, res, next) {
  try {
    const user = userService.createUser(req.body);
    return success(res, user, "User created successfully.", 201);
  } catch (err) {
    next(err);
  }
}

function updateUser(req, res, next) {
  try {
    const user = userService.updateUser(req.params.id, req.body);
    return success(res, user, "User updated successfully.");
  } catch (err) {
    next(err);
  }
}

function deleteUser(req, res, next) {
  try {
    userService.deleteUser(req.params.id, req.user.id);
    return success(res, null, "User deleted successfully.");
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers, getUserById, createUser, updateUser, deleteUser };
