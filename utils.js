import { errorMessages } from "./errors/messageError.js";
import mongoose from "mongoose";
import { ApiError } from "./errors/errorApi.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "./config.js";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import Cart from "./models/cart.js";
import TemporaryCart from "./models/temporaryCart.js";
const { NotFoundError, UnauthorizedError, BadRequestError } =
  ApiError;
const {
  env,
  secretJwtKey,
  saltRounds,
  emailService,
  emailAdress,
  emailPassword,
  tokenLifetime,
} = config;
const { hashingError, invalidCredentials, sendingEmailOk, errorSendingEmail } =
  errorMessages;

async function findById(model, id, errorMessage) {
  try {
    const result = await model.findById(id);
    return result;
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw BadRequestError(errorMessage);
    } else {
      throw error;
    }
  }
}

function checkResult(result, errorMessage) {
  if (result === null || result === false || result === 0) {
    throw NotFoundError(errorMessage);
  }
}

function checkProductQuantity(quantity, productQuantity) {
  const productBalance = Math.max(productQuantity - quantity, 0);
  if (productQuantity >= quantity){
    return {amount: quantity, message: `Доступный остаток товара: ${productBalance}`}
  } if (productQuantity < quantity){
    return {amount: productQuantity, message: `Доступный остаток товара: ${productBalance}`}
  }
}

async function getOrCreateCart(userId = false){
  let cart;
  if (userId) {
    cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      cart = await Cart.create({ userId: userId, items: [] });
    }
  } else {
    cart = await TemporaryCart.findOne();
    if (!cart) {
      cart = await TemporaryCart.create({ items: [] });
    }
  }
  return cart
}

async function sendEmail(email, confirmationToken, script = false) {
  try {
    const transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailAdress,
        pass: emailPassword,
      },
    });

    const mailOptions = {
      from: emailAdress,
      to: email,
      subject: script ? "Сброс пароля" : "Подтверждение регистрации",
      text: script
        ? `Для сброса пароля скопируйте токен ${confirmationToken} и перейдите по ссылке: пока пусто. Зполните форму: в первое поле введите новый пароль, во второе поле введите новый пароль еще раз, в третье поле вставьте полученый в письме токен и нажмите кнопку подтверждения`
        : "Для подтверждения регистрации " +
          `перейдите по ссылке: http://localhost:3000/confirm/${confirmationToken}`,
    };

    await transporter.sendMail(mailOptions);
    return sendingEmailOk;
  } catch (error) {
    throw MailSendingError(errorSendingEmail + error.message);
  }
}

async function hashPassword(password) {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw InternalError(hashingError);
  }
}

async function comparisonsPassword(password, hash) {
  const match = await bcrypt.compare(password, hash);
  if (!match) {
    throw UnauthorizedError(invalidCredentials);
  }
}

function generateJwtToken(userId, role) {
  return jwt.sign(
    { _id: userId, role },
    env === "production" ? secretJwtKey : "dev-secret",
    { expiresIn: "7d" }
  );
}

function checkJwtToken(req, env, secretJwtKey) {
  if (req.cookies?.jwt) {
    const token = req.cookies.jwt;
    const payload = jwt.verify(token, env === 'production' ? secretJwtKey : 'dev-secret');
    return payload;
  } else{
    return false;
  }
}

function setJwtCookie(res, token) {
  res.cookie("jwt", token, {
    maxAge: 3600000 * 24 * 7,
    httpOnly: true,
  });
}

function generateConfirmationToken() {
  const token = uuidv4();
  return {
    token,
    expiresAt: tokenLifetime,
  };
}

function normalizeEmail(email) {
  return email.toLowerCase();
}

function deleteJwt(jwt) {
  jwt.cookie("jwt", "", { expires: new Date(0) });
}

export {
  normalizeEmail,
  comparisonsPassword,
  hashPassword,
  findById,
  generateJwtToken,
  checkResult,
  deleteJwt,
  sendEmail,
  generateConfirmationToken,
  checkProductQuantity,
  getOrCreateCart,
  setJwtCookie,
  checkJwtToken
};
