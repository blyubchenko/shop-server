import { celebrate, Joi } from "celebrate";
import config from "../config.js";
const {
  nameUserLength,
  passwordLength,
  nameProductLength,
  descriptionProductLength,
  priceLength,
} = config;

const regPassword =
  /^(?=.*\d)(?=.*[a-zа-я])(?=.*[A-ZА-Я])(?=.*[!@#$%^&*(),.?":{}|<>])(?=.*[^\s]).*$/;

const validateId = celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex().required(),
  }),
});

const validatePostProduct = celebrate({
  body: Joi.object().keys({
    name: Joi.string()
      .required()
      .min(nameProductLength.minlength)
      .max(nameProductLength.maxlength),
    description: Joi.string()
      .min(descriptionProductLength.minlength)
      .max(descriptionProductLength.maxlength)
      .required(),
    price: Joi.number()
      .min(priceLength.minlength)
      .max(priceLength.maxlength)
      .required(),
    material: Joi.string().max(30),
    color: Joi.string().max(30),
    type: Joi.string()
      .valid(
        "bag",
        "wallet",
        "docholder",
        "belt",
        "watchband",
        "accessorie",
        "clutch"
      )
      .required(),
    quantity: Joi.number().max(1000).required(),
  }),
});

const validatePatchProductInfo = celebrate({
  body: Joi.object().keys({
    name: Joi.string()
      .min(nameProductLength.minlength)
      .max(nameProductLength.maxlength),
    description: Joi.string()
      .min(descriptionProductLength.minlength)
      .max(descriptionProductLength.maxlength),
    price: Joi.number().min(priceLength.minlength).max(priceLength.maxlength),
    material: Joi.string().max(30),
    color: Joi.string().max(30),
    type: Joi.string().valid(
      "bag",
      "wallet",
      "docholder",
      "belt",
      "watchband",
      "accessorie",
      "clutch"
    ),
    quantity: Joi.number().max(1000),
  }),
});

const validatePatchUserInfo = celebrate({
  body: Joi.object().keys({
    name: Joi.string()
      .min(nameUserLength.minlength)
      .max(nameUserLength.maxlength)
      .required(),
  }),
});

const validatePatchUserRole = celebrate({
  body: Joi.object().keys({
    role: Joi.string().valid("user", "admin", "moder").required(),
    secretKey: Joi.string()
  }),
});

const validateLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({ allowUnicode: false }),
    password: Joi.string()
      .min(passwordLength.minlength)
      .max(passwordLength.maxlength)
      .regex(regPassword)
      .required(),
  }),
});

const validatePostUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string()
      .min(nameUserLength.minlength)
      .max(nameUserLength.maxlength)
      .required(),
    password: Joi.string()
      .min(passwordLength.minlength)
      .max(passwordLength.maxlength)
      .regex(regPassword)
      .required(),
    role: Joi.string().valid("user", "admin", "moder"),
    email: Joi.string().required().email({ allowUnicode: false }),
  }),
});
const validateRestPasswordConfirmation = celebrate({
  body: Joi.object().keys({
    token: Joi.string()
      .length(36)
      .required(),
    password: Joi.string()
      .min(passwordLength.minlength)
      .max(passwordLength.maxlength)
      .regex(regPassword)
      .required(),
     }),
});
const validatePasswordResetRequest = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email({ allowUnicode: false }),
     }),
});

export {
  validateId,
  validatePostProduct,
  validatePatchProductInfo,
  validatePatchUserInfo,
  validatePatchUserRole,
  validateLogin,
  validatePostUser,
  validatePasswordResetRequest,
  validateRestPasswordConfirmation
};
