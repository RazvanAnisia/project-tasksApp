const { Tag } = require('../database/models');

/**
 *
 * @param {object} objUser user
 * @returns {Array} array of todolists corresponding to the user
 */
const fetchAll = async objUser => {
  try {
    const arrTags = await objUser.getTags();

    return arrTags ? { bSuccess: true, arrTags } : { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

/**
 * @param {object} objUser user
 * @param {string} strTagName name of the tags
 * @param {string} strTagColor tag hexcode color
 * @returns {object} new tag object
 */
const createOne = async (objUser, strTagName, strTagColor) => {
  try {
    // check if tag name is unique for user
    const objMatchingTag = await Tag.findOne({
      where: { name: strTagName },
      attributes: ['userId']
    });

    if (objMatchingTag && objMatchingTag.userId === objUser.id)
      return {
        bSuccess: false,
        err: 'Tag name must be unique',
        strValidationErr: 'Tag name must be unique'
      };

    const objNewTag = await objUser.createTag({
      name: strTagName,
      color: strTagColor
    });
    return objNewTag ? { bSuccess: true, objNewTag } : { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

/**
 * @param {string} strTagId tag id
 * @param {string} strTagName name of the tag
 * @param {string} strTagColor tag hexcode color
 * @returns {object|null} updated tag object
 */
const updateOne = async (strTagId, strTagName, strTagColor) => {
  try {
    const objTag = await Tag.findOne({
      where: { id: strTagId }
    });
    const objUpdatedTag = await objTag.update({
      name: strTagName,
      color: strTagColor
    });
    return objUpdatedTag
      ? { objUpdatedTag, bSuccess: true }
      : { bSuccess: false };
  } catch (err) {
    return { bSuccess: false, err: err };
  }
};

/**
 * @param {string} strTagId tag id
 * @returns {object} if the query succedded or not
 */
const deleteOne = async strTagId => {
  try {
    const intDeletedRows = await Tag.destroy({
      where: {
        id: strTagId
      }
    });
    return intDeletedRows === 0 ? { bSuccess: false } : { bSuccess: true };
  } catch (err) {
    return { bSuccess: false, err };
  }
};

exports.fetchAll = fetchAll;
exports.createOne = createOne;
exports.updateOne = updateOne;
exports.deleteOne = deleteOne;
