const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const HttpStatus = require('http-status-codes');
const { User, Todo, TodoList } = require('../database/models');
const UserService = require('../services/userService');
const handleError = require('../helpers/error');

/**
 * @description create user
 * @param {object} req request
 * @param {object} res response
 * @returns {Promise<*>} response promise
 */
const createUser = async (req, res) => {
  const {
    firstName: strFirstName,
    lastName: strLastName,
    email: strEmail,
    password: strPassword,
    userName: strUserName
  } = req.body;

  const objUser = {
    firstName: strFirstName,
    lastName: strLastName,
    email: strEmail,
    password: strPassword,
    userName: strUserName
  };

  try {
    const {
      strToken,
      bSuccess,
      err,
      bSequelizeError
    } = await UserService.createOne(objUser);

    if (bSuccess) return res.send({ token: strToken });
    if (bSequelizeError) handleError(HttpStatus.BAD_REQUEST, err, res, err);
    handleError(HttpStatus.BAD_REQUEST, 'Failed to sign up', res, err);
  } catch (err) {
    handleError(HttpStatus.BAD_REQUEST, 'Failed to sign up', res, err);
  }
};

/**
 * @description login user
 * @param {object} req request
 * @param {object} res response
 * @returns {Promise<*>} response promise
 */
const loginUser = async (req, res) => {
  const { email: strEmail, password: strPassword } = req.body;
  const objUserParams = { email: strEmail, password: strPassword };

  try {
    const { strToken, bSuccess, err } = await UserService.login(objUserParams);
    if (bSuccess) return res.send({ token: strToken });
    handleError(HttpStatus.BAD_REQUEST, 'Wrong credentials', res, err);
  } catch (err) {
    handleError(HttpStatus.BAD_REQUEST, 'Failed to login', res, err);
  }
};

// TODO add an update password function (in case user forgets their password)
// TODO add email integration win sendgrid/mailgun
// TODO If they forget their password , send then a link in their email which will keep a token(xpires in 10min)
//  The token auths them AGAINST to our db, we are then sure who they are, and they can update their password
// TODO If a user wants to change their email, first input password, then enter new email in.
// After that send them a new email to their new address , with a link.
// TODO Create a listener and an event for (user sign up) or user changed email, to trigger a service function to send the email

/**
 * @description update user details
 * @param {object} req request
 * @param {object} res response
 * @returns {Promise<*>} response promise
 */
const updateUserDetails = async (req, res) => {
  const { locals: strUserEmail } = req;
  const { email, firstName, lastName, userName, password } = req.body;
  const objUserParams = {
    email,
    firstName,
    lastName,
    userName,
    password
  };

  try {
    const { bSuccess, err } = await UserService.updateOne(
      strUserEmail,
      objUserParams
    );
    if (bSuccess)
      return res.send({ message: 'Successfully updated user details' });
    handleError(HttpStatus.BAD_REQUEST, 'Failed to update details', res, err);
  } catch (err) {
    handleError(HttpStatus.BAD_REQUEST, 'Failed to update details', res, err);
  }
};

/**
 * @description get user details
 * @param {object} req request
 * @param {object} res response
 * @returns {Promise<*>} response promise
 */
const getUserDetails = async (req, res) => {
  const { locals: strUserEmail } = req;
  try {
    const { objUserDetails, bSuccess, err } = await UserService.showOne(
      strUserEmail
    );
    if (bSuccess) return res.send(objUserDetails);
    handleError(HttpStatus.BAD_REQUEST, 'Failed to update details', res, err);
  } catch (err) {
    handleError(HttpStatus.BAD_REQUEST, 'Failed to update details', res, err);
  }
};

/**
 * @description delete user
 * @param {object} req request
 * @param {object} res response
 * @returns {Promise<*>} response promise
 */
const deleteUserAccount = async (req, res) => {
  const { locals: strUserEmail } = req;
  const { email, password } = req.body;
  const objUserParams = { email, password };

  if (strUserEmail === email) {
    try {
      const { bSuccess, err } = await UserService.deleteOne(objUserParams);
      if (bSuccess) return res.send('Successfully deleted account');
      handleError(HttpStatus.BAD_REQUEST, 'Failed to delete user', res, err);
    } catch (err) {
      handleError(HttpStatus.BAD_REQUEST, 'Failed to delete user', res, err);
    }
  } else {
    handleError(
      HttpStatus.BAD_REQUEST,
      'Failed delete user final',
      res,
      'Email from token does not match email in request'
    );
  }
};

/**
 * @description user stats
 * @param {object} req request
 * @param {object} res response
 * @returns {Promise<*>} response promise
 */
const getUserStats = async (req, res) => {
  // TODO Write an SQL function to do all this logic

  const { locals: strUserEmail } = req;

  try {
    const { objUserStats, bSuccess, err } = await UserService.showStats(
      strUserEmail
    );
    if (bSuccess) return res.send(objUserStats);
    handleError(HttpStatus.BAD_REQUEST, 'Failed to update details', res, err);
  } catch (err) {
    handleError(HttpStatus.BAD_REQUEST, 'Failed to update details', res, err);
  }
};

/**
 * @description leaderboard
 * @param {object} req request
 * @param {object} res response
 * @returns {Promise<*>} response promise
 */
const getLeaderboard = async (req, res) => {
  try {
    const {
      arrLeaderboardData,
      bSuccess,
      err
    } = await UserService.leaderBoard();
    if (bSuccess) return res.send(arrLeaderboardData);
    handleError(HttpStatus.BAD_REQUEST, 'Failed to get leaderboard', res, err);
  } catch (err) {
    handleError(HttpStatus.BAD_REQUEST, 'Failed to get leaderboard', res, err);
  }
};

exports.createUser = createUser;
exports.loginUser = loginUser;
exports.updateUserDetails = updateUserDetails;
exports.getUserDetails = getUserDetails;
exports.deleteUserAccount = deleteUserAccount;
exports.getUserStats = getUserStats;
exports.getLeaderboard = getLeaderboard;
