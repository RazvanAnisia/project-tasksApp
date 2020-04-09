const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UsersController');
const userSchema = require('../schemas/userSchema');
const validation = require('../middleware/validation');
const fileUpload = require('../middleware/fileUpload');

router.post(
  '/',
  fileUpload,
  validation(userSchema.create, 'body'),
  UserController.createUser
);

module.exports = router;
