const {Joi} = require('express-validation');

RegisterValidation = Joi.object({
    name: Joi.string().min(2).max(40).required(),
    email: Joi.string().min(5).max(100).email().required(),
    password: Joi.string().min(6).required(),
    confirm_password: Joi.string().min(6).required(),
    username: Joi.string().min(2).max(40).required()
});

module.exports = RegisterValidation;