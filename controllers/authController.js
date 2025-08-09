const { register, login } = require("../services/userService");
const { validateRegister, validateLogin } = require("../utils/validate");

exports.register = async (req, res, next) => {
  try {
    const { error } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await register({ ...req.body, requestingUser: req.user });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const result = await login(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
