const TagsService = require('../services/tagService');
const handleError = require('../helpers/error');
const HttpStatus = require('http-status-codes');

/**
 *
 * @description returns all tags
 * @param {object} req request
 * @param {object} res response
 */
const getTags = async (req, res) => {
  const { user: objUser } = req;
  try {
    const { arrTags, bSuccess, err } = await TagsService.fetchAll(objUser);
    if (bSuccess) return res.send(arrTags);
    handleError(HttpStatus.BAD_REQUEST, 'Could not get tags', res, err);
  } catch (err) {
    handleError(HttpStatus.BAD_REQUEST, 'Could not get tags', res, err);
  }
};

/**
 *
 * @description creates a tag
 * @param {object} req request
 * @param {object} res response
 */
const createTag = async (req, res) => {
  // TODO add validation for tag name and color
  const { name: strTagName, color: strTagColor } = req.body;
  const { user: objUser } = req;

  try {
    const {
      objNewTag,
      bSuccess,
      err,
      strValidationErr
    } = await TagsService.createOne(objUser, strTagName, strTagColor);

    if (bSuccess)
      return res.send({
        message: 'Created tag',
        data: objNewTag
      });
    if (strValidationErr)
      handleError(HttpStatus.UNPROCESSABLE_ENTITY, strValidationErr, res, err);

    handleError(HttpStatus.CONFLICT, 'Failed to create tag', res, err);
  } catch (err) {
    handleError(HttpStatus.CONFLICT, 'Failed to create tag', res, err);
  }
};

/**
 *
 * @description updates tag
 * @param {object} req request
 * @param {object} res response
 */
const updateTag = async (req, res) => {
  // TODO add validation for tag name and color
  const { name: strTagName, color: strTagColor } = req.body;
  const { id: strTagId } = req.params;
  try {
    const { objUpdatedTag, bSuccess, err } = await TagsService.updateOne(
      strTagId,
      strTagName,
      strTagColor
    );
    if (bSuccess)
      return res.send({
        message: 'Updated tag',
        data: objUpdatedTag
      });
    handleError(HttpStatus.CONFLICT, 'Failed to update tag', res, err);
  } catch (err) {
    handleError(HttpStatus.CONFLICT, 'Failed to update tag', res, err);
  }
};

/**
 *
 * @description deletes a todolist
 * @param {object} req request
 * @param {object} res response
 */
const deleteTag = async (req, res) => {
  const { id: strTagId } = req.params;

  try {
    const { bSuccess, err } = await TagsService.deleteOne(strTagId);
    if (bSuccess)
      return res.send({
        message: 'Deleted tag',
        data: { id: strTagId }
      });
    handleError(HttpStatus.BAD_REQUEST, 'Failed to delete tag', res, err);
  } catch (err) {
    handleError(HttpStatus.BAD_REQUEST, 'Failed to delete tag', res, err);
  }
};

exports.getTags = getTags;
exports.createTag = createTag;
exports.updateTag = updateTag;
exports.deleteTag = deleteTag;
