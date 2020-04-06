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

exports.deleteUserAccount = (req, res) => {
  const { locals } = req;
  const { email, password } = req.body;

  if (locals === email) {
    User.findOne({ where: { email: locals } })
      .then(user => {
        const { dataValues } = user;
        const { password: strHashedPassword } = dataValues;
        if (!dataValues) {
          res
            .status(HttpStatus.BAD_REQUEST)
            .send({ message: 'user could not be found' });
        } else {
          bcrypt
            .compare(password, strHashedPassword)
            .then(result => {
              if (result) {
                user
                  .destroy()
                  .then(() =>
                    res.send({ message: 'successfully delete account' })
                  )
                  .catch(err =>
                    res.status(HttpStatus.BAD_REQUEST).send({ message: err })
                  );
              } else {
                res
                  .status(HttpStatus.BAD_REQUEST)
                  .send({ message: 'password does not match' });
              }
            })
            .catch(err => {
              console.error(err);
              res
                .status(HttpStatus.BAD_REQUEST)
                .send({ message: 'password does not match' });
            });
        }
      })
      .catch(err => {
        res.status(HttpStatus.BAD_REQUEST).send({ message: err });
        console.log(err);
      });
  } else {
    res.status(HttpStatus.BAD_REQUEST).send({ message: 'wrong credentials' });
  }
};

// TODO Write an SQL function to do all this logic
exports.getUserStats = (req, res) => {
  const { locals } = req;
  User.findOne({ where: { email: locals } })
    .then(user => {
      user
        .getTodoLists({
          include: Todo
        })
        .then(todolists => {
          const arrTotalPoints = todolists.map(todolist =>
            todolist.todos.map(todo => todo.points)
          );
          const arrTodayPoints = todolists.map(todolist =>
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
            arrTodayPoints.length &&
            arrTodayPoints[0].reduce((a, b) => a + b, 0);
          const intTotalPoints =
            arrTodayPoints.length &&
            arrTotalPoints[0].reduce((a, b) => a + b, 0);

          res.status(HttpStatus.OK).send({
            todosCompletedToday: intTodosCompletedToday,
            totalCompletedTodos: intTotalCompletedTodos,
            todayPoints: intTodayPoints,
            totalPoints: intTotalPoints
          });
        })
        .catch(err => console.log(err));
    })
    .catch(err => res.send({ message: err }));
};

exports.getLeaderboard = (req, res) => {
  User.findAll({
    include: [
      {
        model: TodoList,
        as: 'todoLists',
        include: { model: Todo, as: 'todos' }
      }
    ]
  })
    .then(arrUsersData => {
      console.log('USERS DATA', arrUsersData);
      const arrLeaderboardData = arrUsersData.map(objUser => {
        objUser.todoLists.map(todolist => {
          if (todolist.todos.length === 0)
            return res.send({ messages: 'no todos' });
          return todolist.todos.map(todo => todo.points);
        });
        const arrTotalPoints = objUser.todoLists.map(todolist =>
          todolist.todos.map(todo => todo.isCompleted !== null && todo.points)
        );
        console.log(arrTotalPoints);
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

      res.send({ leaderboard: arrLeaderboardData });
    })
    .catch(err => console.log(err) && res.send({ message: err }));
};

exports.createUser = createUser;
exports.loginUser = loginUser;
exports.updateUserDetails = updateUserDetails;
exports.getUserDetails = getUserDetails;
