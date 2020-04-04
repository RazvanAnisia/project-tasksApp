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

exports.loginUser = (req, res) => {
  const { email, password } = req.body;
  User.findOne({
    where: {
      email
    }
  })
    .then(({ dataValues }) => {
      const { password: strHashedPassword } = dataValues;
      if (!dataValues) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .send({ message: 'wrong credentials' });
      } else {
        bcrypt
          .compare(password, strHashedPassword)
          .then(result => {
            result
              ? jwt.sign(
                  { email },
                  process.env.TOKEN_SECRET,
                  { expiresIn: '10h' },
                  (err, token) => {
                    res.send({ token });
                  }
                )
              : res
                  .status(HttpStatus.BAD_REQUEST)
                  .send({ message: 'wrong credentials' });
          })
          .catch(err => {
            console.error(err);
          });
      }
    })
    .catch(err => {
      res.status(HttpStatus.BAD_REQUEST).send({ message: 'wrong credentials' });
      // console.log(err);
    });
};

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

exports.updateUserDetails = (req, res) => {
  const { locals } = req;
  const { email, firstName, lastName, userName, password } = req.body;
  const objUpdatedUser = { email, firstName, lastName, userName, password };
  User.findOne({ where: { email: locals } })
    .then(user => {
      user
        .update(objUpdatedUser)
        .then(() => res.send({ message: 'Updated user details' }))
        .catch(err => res.send({ message: err }));
    })
    .catch(err => res.send({ message: err }));
};

exports.getUserDetails = (req, res) => {
  const { locals } = req;
  User.findOne({ where: { email: locals } })
    .then(user => {
      const { email, firstName, lastName, userName } = user;
      const objUserDetails = { email, firstName, lastName, userName };
      res.send({ userDetails: objUserDetails });
    })
    .catch(err => res.send({ message: err }));
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

exports.getLeaderboard = (req, res) => {
  User.findAll({
    include: [
      {
        model: TodoList,
        include: [Todo]
      }
    ]
  })
    .then(arrUsersData => {
      const arrLeaderboardData = arrUsersData.map(objUser => {
        objUser.todoLists.map(todolist =>
          todolist.todos.map(todo => todo.points)
        );
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
