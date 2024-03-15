import mongoose from "mongoose";
import User from "../modes/user.js";
import { statusCode } from "../errors/statusCode.js";
import { ApiError } from "../errors/errorApi.js";
import { errorMessages } from "../errors/messageError.js";
import utils from "../utils.js";
import config from "../config.js";

const {
  checkStringLength,
  checkResult,
  comparisonsPassword,
  findById,
  generateToken,
  hashPassword,
  normalizeEmail,
} = utils;

const {
  duplicateEmail,
  forbiddenAction,
  invalidCredentials,
  invalidData,
  logoutSuccess,
  loginSuccess,
  deletedUser,
  invalidUserId,
  entityNotFound,
} = errorMessages;
const { nameLength, passwordLength } = config;
const { OK, CREATED } = statusCode;
const { BadRequestError, ConflictError } = ApiError;

class userController {
  async getUsers(req, res, next) {
    const users = await User.find({});
    return res.status(OK).json(users);
  }

  async getUserById(req, res, next) {
    try {
      const user = await findById(User, req.params.id, invalidUserId);
      checkResult(user, entityNotFound("Пользователь"));
      return res.status(OK).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getUserInfo(req, res, next) {
    try {
      const user = await findById(User, req.user._id, invalidUserId);
      checkResult(user, entityNotFound("Пользователь"));
      return res.status(OK).json(user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const { name, password, email } = req.body;
      checkStringLength(
        name,
        nameLength.minlength,
        nameLength.maxlength,
        "имени"
      );
      checkStringLength(
        password,
        passwordLength.minlength,
        passwordLength.maxlength,
        "пароля"
      );
      const normalizedEmail = normalizeEmail(email);
      const cryptPassword = await hashPassword(password);
      await User.create({
        name,
        password: cryptPassword,
        email: normalizedEmail,
      });
      return res.status(CREATED).json({ name, email: normalizedEmail, role });
    } catch (error) {
      if (error.code === 11000) {
        next(ConflictError(duplicateEmail));
      } else if (
        error.errors &&
        error.errors["email"] instanceof mongoose.Error.ValidatorError
      ) {
        next(BadRequestError(error.errors.email.message));
      } else if (error instanceof mongoose.Error.ValidationError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }

  async updateUserData(req, res, next) {
    try {
      const { name } = req.body;
      checkStringLength(
        name,
        nameLength.minlength,
        nameLength.maxlength,
        "имени"
      );
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { name } },
        {
          new: true,
          runValidators: true,
        }
      );
      checkResult(user, entityNotFound("Пользователь"));
      return res.status(OK).json(user);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }

  async updateRoleUser(req, res, next) {
    try {
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: { role } },
        {
          new: true,
          runValidators: true,
        }
      );
      checkResult(user, entityNotFound("Пользователь"));
      return res.status(OK).json(user);
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(BadRequestError(invalidUserId));
    }
      if (error instanceof mongoose.Error.ValidationError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const user = await findById(User, id, invalidUserId);
      checkResult(user, entityNotFound("Пользователь"));
      await User.deleteOne(user);
      return res.status(OK).json({ message: deletedUser });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }

  async deleteAcount(req, res, next) {
    try {
      const user = await User.findById(req.params.id);
      checkResult(user, entityNotFound("Пользователь"));
      if (JSON.stringify(user.owner) !== JSON.stringify(req.user._id)) {
        throw new ForbiddenError(forbiddenAction);
      }
      await User.deleteOne();
      return res.status(OK).send({ message: deletedUser });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const normalizedEmail = normalizeEmail(email);
      const user = await User.findOne({ email: normalizedEmail }).select(
        "+password"
      );
      checkResult(user, invalidCredentials);
      await comparisonsPassword(password, user.password);
      const token = generateToken(user._id, user.role);
      res.cookie("jwt", token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
      });
      return res.status(OK).send({ message: loginSuccess });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res) {
    res.cookie("jwt", "", { expires: new Date(0) });
    return res.status(OK).send({ message: logoutSuccess });
  }
}

export default new userController();
