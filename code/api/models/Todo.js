const Sequelize = require('sequelize').Sequelize;
const DataTypes = require('sequelize').DataTypes;
const sequelize = require('../config/database');

const Todo = sequelize.define('todo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isCompleted: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // TODO  TEST validation or constraint that i cannot be in the past
  dueDate: {
    type: Sequelize.DATE,
    allowNull: true,
    defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
  },
  completedDate: {
    type: Sequelize.DATEONLY,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM(['low', 'medium', 'high']),
    allowNull: false,
    defaultValue: 'low'
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
});

module.exports = Todo;
