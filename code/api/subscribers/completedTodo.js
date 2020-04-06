const events = require('events');
const eventEmitter = new events.EventEmitter();

/**
 * @returns {undefined}
 */
const completedTodo = () => {
  console.log('YEEAH COMPLETED TODO');
};

eventEmitter.addListener('todo_completed', completedTodo);

module.exports = eventEmitter;
