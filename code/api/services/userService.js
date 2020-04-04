const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const { User } = require('../database/models');

const intSaltRounds = 10;

/**
 * @description signs token based on secret and user email
 * @param {string} strEmail user email
 * @returns {string} auth token for user
 */
const signJWT = strEmail => {
  return jwt.sign({ email: strEmail }, process.env.TOKEN_SECRET, {
    expiresIn: '23h'
  });
};

/**
 * @description Attempt to create a user with the provided object
 * @param  {object} objUserParams  all the fields for the new user
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with newTodo
 */
const createOne = async objUserParams => {
  const { email, password } = objUserParams;

  try {
    const strHashedPassword = await bcrypt.hash(password, intSaltRounds);
    const objNewUser = await User.create({
      ...objUserParams,
      password: strHashedPassword
    });
    const strToken = signJWT(email);
    if (strHashedPassword && objNewUser && strToken)
      return { bSuccess: true, strToken };
  } catch (err) {
    if (err.errors[0].message)
      return {
        bSuccess: false,
        err: err.errors[0].message,
        bSequelizeError: true
      };
    return { bSuccess: false, err: err };
  }
};

/**
 *
 * @param {string} strUserEmail user email
 * @returns {object} user
 */
const findOne = async strUserEmail => {
  try {
    const objUser = await User.findOne({
      where: {
        email: strUserEmail
      }
    });

    return objUser ? { bSuccess: true, objUser } : { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

exports.find = findOne;
exports.createOne = createOne;
