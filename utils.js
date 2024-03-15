import { errorMessages } from "./errors/messageError.js";
import mongoose from "mongoose";
import { ApiError } from "./errors/errorApi.js";
import User from "./modes/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "./config.js";
const { NotFoundError, UnauthorizedError, BadRequestError } = ApiError;
const { env, secretJwtKey, name, password, saltRounds } = config;
const {
  invalidUserId,
  userNotFound,
  invalidEntityLength,
  hashingError,
  invalidCredentials,
} = errorMessages;

async function findUserById(id) {
  try {
    const user = await User.findById(id);
    checkUser(user);
    return user;
  } catch (error) {
    if (error instanceof mongoose.Error.CastError) {
      throw BadRequestError(invalidUserId);
    } else {
      throw error;
    }
  }
}

function checkUser(user, message = userNotFound) {
  if (user === null) {
    throw NotFoundError(message);
  }
}

function checkNameLength(userName) {
  if (userName.length < name.minlength || userName.length > name.maxlength) {
    throw BadRequestError(
      invalidEntityLength(name.minlength, name.maxlength)
    );
  }
}
function checkPasswordLength(userPassword) {
  if (userPassword.length < password.minlength || userPassword.length > password.maxlength) {
    throw BadRequestError(
      invalidEntityLength(password.minlength, password.maxlength)
    );
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

function generateToken(userId) {
  return jwt.sign(
    { _id: userId },
    env === "production" ? secretJwtKey : "dev-secret",
    { expiresIn: "7d" }
  );
}

function normalizeEmail(email) {
  return email.toLowerCase();
}

export default {
  normalizeEmail,
  comparisonsPassword,
  hashPassword,
  checkNameLength,
  checkPasswordLength,
  findUserById,
  generateToken,
  checkUser,
};
