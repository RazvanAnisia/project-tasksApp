const HttpStatus = require('http-status-codes');
const handleError = require('../helpers/error');
const userService = require('../services/userService');

exports.verifyUser = async (req, res, next) => {
  const { locals: strUserEmail } = req;
  try {
    const { bSuccess, objUser, err } = await userService.findOne(strUserEmail);
    if (bSuccess) {
      req.user = objUser;
      next();
    } else {
      handleError(HttpStatus.UNAUTHORIZED, 'Forbidden', res, err);
    }
  } catch (err) {
    handleError(HttpStatus.UNAUTHORIZED, 'Forbidden', res, err);
  }
};
