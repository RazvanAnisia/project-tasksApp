const Events = require('events');
const eventTypes = require('./eventTypes');
const { leaderBoardUpdate, sendWelcomeEmail } = require('./eventHandlers');

const { LEADERBOARD_UPDATE, USER_SIGN_UP, USER_CHANGED_EMAIL } = eventTypes;

const EventEmitter = new Events();

// Register event listeners
EventEmitter.on(LEADERBOARD_UPDATE, leaderBoardUpdate);
EventEmitter.on(USER_SIGN_UP, sendWelcomeEmail);
EventEmitter.on(USER_CHANGED_EMAIL, sendWelcomeEmail);

// TODO Add user changed email event, send new email when it happens

module.exports = EventEmitter;
