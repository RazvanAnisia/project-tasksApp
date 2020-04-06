const Joi = require('@hapi/joi');

const userSchemas = {
  create: Joi.object().keys({
    firstName: Joi.string()
      .required()
      .min(3)
      .max(50),
    lastName: Joi.string()
      .required()
      .min(3)
      .max(50),
    email: Joi.string()
      .email()
      .required(),
    password: Joi.string()
      .required()
      .min(3)
      .max(100)
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    userName: Joi.string()
      .required()
      .alphanum()
      .min(3)
      .max(50)
  }),
  update: Joi.object().keys({
    firstName: Joi.string()
      .min(3)
      .max(50),
    lastName: Joi.string()
      .min(3)
      .max(50),
    email: Joi.string().email(),
    password: Joi.string()
      .min(3)
      .max(100)
      .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    userName: Joi.string()
      .alphanum()
      .min(3)
      .max(50)
  })
};

module.exports = userSchemas;
