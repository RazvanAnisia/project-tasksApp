const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UsersController');
const userSchema = require('../schemas/userSchema');
const validation = require('../middleware/validation');

router.post(
  '/',
  validation(userSchema.create, 'body'),
  UserController.createUser
);

module.exports = router;
