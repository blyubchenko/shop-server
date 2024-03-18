import { errorMessages } from "./errors/messageError.js";
import mongoose from "mongoose";
import { ApiError } from "./errors/errorApi.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "./config.js";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
const { NotFoundError, UnauthorizedError, BadRequestError } = ApiError;
const {
  env,
  secretJwtKey,
  saltRounds,
  emailService,
  emailAdress,
  emailPassword,
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
  if (result === null) {
    throw NotFoundError(errorMessage);
  }
}

function checkingKey(adminKey, userKey, userRole) {
  if (adminKey === userKey) {
    return { verifiedRole: userRole, confirmationToken: null, confirmed: true };
  } else {
    const confirmationToken = uuidv4();
    return { verifiedRole: "user", confirmationToken, confirmed: false };
  }
}

async function sendConfirmationEmail(email, confirmationToken) {
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
      subject: "Подтверждение регистрации",
      text: `Для подтверждения регистрации перейдите по ссылке: http://localhost:3000/confirm/${confirmationToken}`,
    };

    const info = await transporter.sendMail(mailOptions);
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

function generateToken(userId, role) {
  return jwt.sign(
    { _id: userId, role },
    env === "production" ? secretJwtKey : "dev-secret",
    { expiresIn: "7d" }
  );
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
  generateToken,
  checkResult,
  deleteJwt,
  checkingKey,
  sendConfirmationEmail,
};
