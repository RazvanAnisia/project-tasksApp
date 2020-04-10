const formidable = require('formidable');

/**
 * @description File uploading middleware based on formidable
 * @param {object} req request obj
 * @param {object} res response obj
 * @param {Function} next next function
 */
const fileUpload = (req, res, next) => {
  const form = formidable({ multiples: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    const obj = { ...fields, profilePicture: files.profilePicture.path };
    req.body = obj;
    next();
  });
};

module.exports = fileUpload;
