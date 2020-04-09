const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const moment = require('moment');
const { User, Todo, TodoList } = require('../database/models');
const cloudinary = require('../loaders.js');

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
  const { email, password, profilePicture } = objUserParams;

  try {
    const objPicture = await cloudinary.uploader.upload(profilePicture);
    const { url: strPictureUrl } = objPicture;
    const strHashedPassword = await bcrypt.hash(password, intSaltRounds);

    const objNewUser = await User.create({
      ...objUserParams,
      profilePicture: strPictureUrl,
      password: strHashedPassword
    });
    const strToken = signJWT(email);
    if (strHashedPassword && objNewUser && strToken) {
      return {
        bSuccess: true,
        strToken
      };
    }
  } catch (err) {
    if (err.errors && err.errors[0].message)
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
    const {
      email,
      firstName,
      lastName,
      userName,
      profilePicture
    } = objFoundUser;

    const objUserDetails = {
      email,
      firstName,
      lastName,
      userName,
      profilePicture
    };

    return objFoundUser
      ? { bSuccess: true, objUserDetails }
      : { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

/**
 * @description attempt to get user stats
 * @param {string} strUserEmail user email
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with user stats
 */
const showStats = async strUserEmail => {
  try {
    const objFoundUser = await User.findOne({ where: { email: strUserEmail } });
    const arrTodoLists = await objFoundUser.getTodoLists({
      include: { model: Todo, as: 'todos' }
    });

    const arrTotalPoints = arrTodoLists.map(todolist =>
      todolist.todos.map(todo => todo.points)
    );
    const arrTodayPoints = arrTodoLists.map(todolist =>
      todolist.todos.map(todo => {
        const today = moment();
        if (
          todo.isCompleted &&
          todo.completedDate &&
          today.diff(todo.completedDate, 'days') === 0
        ) {
          return todo.points;
        }
        return 0;
      })
    );
    const intTodosCompletedToday =
      arrTodayPoints.length &&
      arrTodayPoints[0].filter(
        intNoOfPoints => intNoOfPoints !== 0 && intNoOfPoints
      ).length;
    const intTotalCompletedTodos =
      arrTotalPoints.length && arrTotalPoints[0].length;
    const intTodayPoints =
      arrTodayPoints.length && arrTodayPoints[0].reduce((a, b) => a + b, 0);
    const intTotalPoints =
      arrTodayPoints.length && arrTotalPoints[0].reduce((a, b) => a + b, 0);

    const objUserStats = {
      todosCompletedToday: intTodosCompletedToday,
      totalCompletedTodos: intTotalCompletedTodos,
      todayPoints: intTodayPoints,
      totalPoints: intTotalPoints
    };

    return objFoundUser
      ? { bSuccess: true, objUserStats }
      : { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

/**
 * @description attempt to get leaderboard
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with leaderboard
 */
const leaderBoard = async () => {
  try {
    const arrUsersData = await User.findAll({
      include: [
        {
          model: TodoList,
          as: 'todoLists',
          include: { model: Todo, as: 'todos' }
        }
      ]
    });

    const arrLeaderboardData = arrUsersData.map(objUser => {
      objUser.todoLists.map(todolist => {
        return todolist.todos.map(todo => todo.points);
      });
      const arrTotalPoints = objUser.todoLists.map(todolist =>
        todolist.todos.map(todo => todo.isCompleted !== null && todo.points)
      );
      const arrTodayPoints = objUser.todoLists.map(todolist =>
        todolist.todos.map(todo => {
          const today = moment();
          if (
            todo.isCompleted &&
            todo.completedDate &&
            today.diff(todo.completedDate, 'days') === 0
          ) {
            return todo.points;
          }
          return 0;
        })
      );
      const intTodosCompletedToday =
        arrTodayPoints.length &&
        arrTodayPoints[0].filter(
          intNoOfPoints => intNoOfPoints !== 0 && intNoOfPoints
        ).length;
      const intTotalCompletedTodos =
        arrTotalPoints.length && arrTotalPoints[0].length;
      const intTodayPoints =
        arrTodayPoints.length && arrTodayPoints[0].reduce((a, b) => a + b, 0);
      const intTotalPoints =
        arrTodayPoints.length && arrTotalPoints[0].reduce((a, b) => a + b, 0);
      return {
        username: objUser.userName,
        todosCompletedToday: intTodosCompletedToday,
        totalCompletedTodos: intTotalCompletedTodos,
        todayPoints: intTodayPoints,
        totalPoints: intTotalPoints
      };
    });
    arrLeaderboardData.sort((a, b) => b.totalPoints - a.totalPoints);

    return arrUsersData
      ? { bSuccess: true, arrLeaderboardData }
      : { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

/**
 * @description Attempt to delete the user with the corresponding id
 * @param {object} objUserParams params from the user
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with result
 */
const deleteOne = async objUserParams => {
  const { email, password } = objUserParams;
  try {
    const objFoundUser = await User.findOne({ where: { email: email } });
    const bPasswordMatch = await bcrypt.compare(
      password,
      objFoundUser.password
    );

    if (bPasswordMatch) {
      const intDeletedRows = await User.destroy({
        where: {
          email
        }
      });
      return intDeletedRows === 0 ? { bSuccess: false } : { bSuccess: true };
    }
    return { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

exports.findOne = findOne;
exports.createOne = createOne;
exports.login = login;
exports.updateOne = updateOne;
exports.showOne = showOne;
exports.deleteOne = deleteOne;
exports.showStats = showStats;
exports.leaderBoard = leaderBoard;
