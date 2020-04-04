const logger = require('../services/logger');

/**
 * @description function for handling http errors and internal logging
 * @param {number} intStatusCode status code
 * @param {string} strMessage message
 * @param {object} res Express response object
 * @param {object} err error
 * @returns {object} response object express
 */
const handleError = (intStatusCode, strMessage, res, err) => {
  err && logger.error('ERROR ', err);
  return res.status(intStatusCode).send({
    status: 'error',
    statusCode: intStatusCode,
    error: strMessage
  });
};

module.exports = handleError;
