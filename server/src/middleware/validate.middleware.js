const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map((e) => e.msg);
    const specificMessage = errorList.join(' | ') || 'Dữ liệu không hợp lệ.';
    return res.status(400).json({
      success: false,
      message: specificMessage,
      errors: errorList,
      details: errors.array(),
    });
  }
  next();
};

module.exports = validate;
