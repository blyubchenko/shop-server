import { errorMessages } from "./errors/messageError.js";
import mongoose from "mongoose";
import { ApiError } from "./errors/errorApi.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "./config.js";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
const { NotFoundError, ForbidenError, UnauthorizedError, BadRequestError } = ApiError;
const {
  env,
  secretJwtKey,
  saltRounds,
  emailService,
  emailAdress,
  emailPassword,
  secretAdminKey,
  tokenLifetime,
  curentDate,
} = config;
const { hashingError, accessIsdenied, invalidCredentials, sendingEmailOk, errorSendingEmail } =
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
  if (result === null) {
    throw NotFoundError(errorMessage);
  }
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
};
