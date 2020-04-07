const events = require('events');
const eventEmitter = new events.EventEmitter();
const eventTypes = require('./eventTypes');
const { leaderBoardUpdate } = require('./listeners');

const { LEADERBOARD_UPDATE } = eventTypes;

// Register event listeners
eventEmitter.on(LEADERBOARD_UPDATE, leaderBoardUpdate);

module.exports = eventEmitter;
