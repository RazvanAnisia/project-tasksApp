const express = require('express');

const cors = require('cors');
const app = express();
const http = require('http');
const socketIo = require('socket.io');
// const axios = require('axios');

const server = http.createServer(app);
const io = socketIo(server);

const todos = require('./routes/todos');
const todolist = require('./routes/todolist');
const login = require('./routes/login');
const signup = require('./routes/signup');
const user = require('./routes/user');
const leaderboard = require('./routes/leaderboard');
const tags = require('./routes/tags');
const auth = require('./middleware/auth');
const authorization = require('./middleware/authorization');
const logger = require('./middleware/logger');
const { leaderBoardUpdate } = require('./subscribers/listeners');
const EventTypes = require('./subscribers/eventTypes');
const EventEmitter = require('./subscribers/eventsSetup');

app.use(logger);
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/todo', auth.verifyToken, authorization.verifyUser, todos);
app.use('/leaderboard', leaderboard);
app.use('/todolist', auth.verifyToken, authorization.verifyUser, todolist);
app.use('/tag', auth.verifyToken, authorization.verifyUser, tags);
app.use('/user', auth.verifyToken, authorization.verifyUser, user);
app.use('/login', login);
app.use('/signup', signup);

const PORT = process.env.NODE_ENV === 'test' ? 9001 : process.env.PORT || 9000;

io.on('connection', socket => {
  console.log('New client connected');
  EventEmitter.emit(EventTypes.LEADERBOARD_UPDATE, socket);
  EventEmitter.on(EventTypes.TODO_COMPLETED, () => leaderBoardUpdate(socket));

  socket.on('disconnect', () => console.log('Client disconnected'));
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

// TODO Add cron jobs https://scotch.io/tutorials/nodejs-cron-jobs-by-examples
// TODO Secure app with Helmet.js https://app.getpocket.com/read/2753537192
// TODO When an event is completed, it will triggered a completed event, based on the priority and points it had, user will gain points
// TODO Add Levels for users(create a levels table with some predefined levels and points needed ) and associate each user to one
// TODO add cross-orogin CORS headers so only our frontend can access the api
// TODO Add FAKER library for seeding the db
// TODO Add validation for all frontend data https://dev.to/itnext/joi-awesome-code-validation-for-node-js-and-express-35pk
// TODO Add support for profile avatars, cloudinary and cdm
// TODO Add confirmation email with Sendgrid or Mailgun
// TODO add coveralls free plan for testing coverage https://coveralls.io/pricing
// TODO add travis ci for readme badge https://github.com/nedssoft/sequelize-with-postgres-tutorial/blob/master/.travis.yml
process.on('unhandledRejection', (error, promise) => {
  console.log(
    ' Oh Lord! We forgot to handle a promise rejection here: ',
    promise
  );
  console.log(' The error was: ', error);
});

module.exports = server;
