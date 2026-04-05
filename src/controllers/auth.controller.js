const authService = require("../services/auth.service");
const { success } = require("../utils/response");

function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = authService.login(email, password);
    return success(res, result, "Login successful.");
  } catch (err) {
    next(err);
  }
}

function getProfile(req, res, next) {
  try {
    const profile = authService.getProfile(req.user.id);
    return success(res, profile, "Profile retrieved.");
  } catch (err) {
    next(err);
  }
}

module.exports = { login, getProfile };
