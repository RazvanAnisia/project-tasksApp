'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      // TODO Add user changed email hook EventEmitter.emit(EventTypes.USER_SIGN_UP, objUser.email);
    }
  );

  User.associate = models => {
    const { TodoList, Tag } = models;
    User.hasMany(TodoList, {
      foreignKey: 'userId',
      onDelete: 'CASCADE',
      as: 'todoLists'
    });
    User.hasMany(Tag, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
  };
  return User;
};
