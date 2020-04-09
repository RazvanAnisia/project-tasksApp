const db = require('../database/models');

/**
 * @description empties db tables
 * @returns {Promise} promise
 */
const truncate = async () => {
  await Promise.all(
    Object.values(db.sequelize.models).map(function(model) {
      return model.destroy({ truncate: { cascade: true }, where: {} });
    })
  );
};

module.exports = truncate;
