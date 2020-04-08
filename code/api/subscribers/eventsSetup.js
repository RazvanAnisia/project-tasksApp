const Events = require('events');
const eventTypes = require('./eventTypes');
const { leaderBoardUpdate, sendWelcomeEmail } = require('./listeners');

const { LEADERBOARD_UPDATE, USER_SIGN_UP } = eventTypes;

const EventEmitter = new Events();

// Register event listeners
EventEmitter.on(LEADERBOARD_UPDATE, leaderBoardUpdate);

EventEmitter.on(USER_SIGN_UP, sendWelcomeEmail);
// TODO Add user changed email event, send new email when it happens

module.exports = EventEmitter;
