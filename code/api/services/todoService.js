const { Tag, TodoList, Todo } = require('../database/models');
const EventEmitter = require('../subscribers/completedTodo');

/**
 * @description Attempt to create a todo with the provided object
 * @param {string} strTodoListId todolist id
 * @param {object} objTodoParams all the fields the new todo needs
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with newTodo
 */
const createOne = async (strTodoListId, objTodoParams) => {
  const { tagIds: arrTagIds } = objTodoParams;
  try {
    const objTodoList = await TodoList.findOne({
      where: { id: strTodoListId }
    });
    const objNewTodo = await objTodoList.createTodo(objTodoParams);
    if (arrTagIds) {
      const objAddedTags = await objNewTodo.addTag([...arrTagIds]);
      return objAddedTags
        ? { bSuccess: true, objNewTodo }
        : { bSuccess: false };
    }
    return objNewTodo ? { bSuccess: true, objNewTodo } : { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

/**
 * @description Attempt to find the todo for the provided id
 * @param {string} strTodoId todo id
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with todo
 */
const showOne = async strTodoId => {
  try {
    const objTodo = await Todo.findOne({
      where: { id: strTodoId },
      include: [Tag]
    });
    return objTodo ? { objTodo, bSuccess: true } : { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err: err };
  }
};

/**
 * @description Attempt to update the todo witht the corresponding id
 * @param {string} strTodoId todo id
 * @param {object} objTodoParams all the fields the new todo needs
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with updatedTodo
 */
const updateOne = async (strTodoId, objTodoParams) => {
  const { tagIds: arrTagIds, isCompleted: bIsCompleted } = objTodoParams;

  try {
    const objTodo = await Todo.findOne({
      where: { id: strTodoId }
    });

    if (bIsCompleted) {
      const strCompletedDate = new Date().toISOString().split('T')[0];
      objTodoParams.completedDate = strCompletedDate;
      EventEmitter.emit('todo_completed');
    }

    const objUpdatedTodo = await objTodo.update(objTodoParams);

    if (arrTagIds) {
      const objAddedTags = await objUpdatedTodo.setTags([...arrTagIds]);
      return objAddedTags
        ? { bSuccess: true, objUpdatedTodo }
        : { bSuccess: false };
    }

    return objUpdatedTodo
      ? { bSuccess: true, objUpdatedTodo }
      : { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

/**
 * @description Attempt to delete the todo witht the corresponding id
 * @param {string} strTodoId todo id
 * @returns {Promise<{success: boolean, result: *}|{success: boolean, err: Error}>} promise with result
 */
const deleteOne = async strTodoId => {
  try {
    const intDeletedRows = await Todo.destroy({
      where: {
        id: strTodoId
      }
    });
    return intDeletedRows === 0 ? { bSuccess: false } : { bSuccess: true };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

exports.createOne = createOne;
exports.updateOne = updateOne;
exports.deleteOne = deleteOne;
exports.showOne = showOne;
