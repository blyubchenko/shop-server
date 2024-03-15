import { errorMessages } from "./errors/messageError.js";
import mongoose from "mongoose";
import { ApiError } from "./errors/errorApi.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "./config.js";
const { NotFoundError, UnauthorizedError, BadRequestError } = ApiError;
const { env, secretJwtKey, saltRounds } = config;
const {
  invalidEntityLength,
  hashingError,
  invalidCredentials,
} = errorMessages;

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

function checkStringLength(value, minLength, maxLength, entity){
    if (value.length < minLength || value.length > maxLength) {
        throw BadRequestError(
          invalidEntityLength(entity, minLength, maxLength)
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

export default {
  normalizeEmail,
  comparisonsPassword,
  hashPassword,
  checkStringLength,
  findById,
  generateToken,
  checkResult,
};
