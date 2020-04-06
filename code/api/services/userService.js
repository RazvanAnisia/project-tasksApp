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
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with new token
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
 * @description Attempt to login user with the provided email
 * @param  {object} objUserParams  params from the user
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with new token
 */
const login = async objUserParams => {
  const { email, password } = objUserParams;

  try {
    const objFoundUser = await User.findOne({ where: { email } });
    const bPasswordMatch = await bcrypt.compare(
      password,
      objFoundUser.password
    );

    if (objFoundUser && bPasswordMatch)
      return { bSuccess: true, strToken: signJWT(email) };
  } catch (err) {
    return { bSuccess: false, err: err };
  }
};

/**
 * @description find a specific user
 * @param {string} strUserEmail user email
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with user object
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

/**
 * @description attempt to update user
 * @param {string} strUserEmail user email
 * @param  {object} objUserParams  params from the user
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with  updated user object
 */
const updateOne = async (strUserEmail, objUserParams) => {
  try {
    const objFoundUser = await User.findOne({ where: { email: strUserEmail } });
    const objUpdatedUser = await objFoundUser.update(objUserParams);

    return objUpdatedUser ? { bSuccess: true } : { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

/**
 * @description attempt to update user
 * @param {string} strUserEmail user email
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with  updated user object
 */
const showOne = async strUserEmail => {
  try {
    const objFoundUser = await User.findOne({ where: { email: strUserEmail } });
    const { email, firstName, lastName, userName } = objFoundUser;
    const objUserDetails = { email, firstName, lastName, userName };

    return objFoundUser
      ? { bSuccess: true, objUserDetails }
      : { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

exports.findOne = findOne;
exports.createOne = createOne;
exports.login = login;
exports.updateOne = updateOne;
exports.showOne = showOne;
