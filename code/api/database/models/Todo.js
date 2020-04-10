'use strict';
module.exports = (sequelize, DataTypes) => {
  const Todo = sequelize.define(
    'Todo',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      // TODO add validation or constraint that i cannot be in the past
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      completedDate: {
        type: DataTypes.DATEONLY,
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
    },
    {
      hooks: {
        beforeUpdate: (Todo, options) => {
          console.log('updating', Todo);
        }
      }
    }
  );
  Todo.associate = models => {
    const { TodoList, TodoTag, Tag } = models;

    Todo.belongsTo(TodoList, {
      foreignKey: 'todoListId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      as: 'todos'
    });
    Todo.belongsToMany(Tag, {
      through: TodoTag,
      foreignKey: 'todoId',
      as: 'tags'
    });
  };
  return Todo;
};
