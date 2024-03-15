import mongoose from "mongoose";
import User from "../modes/user.js";
import { statusCode } from "../errors/statusCode.js";
import { ApiError } from "../errors/errorApi.js";
import { errorMessages } from "../errors/messageError.js";
import utils from "../utils.js";

const {
  checkNameLength,
  checkPasswordLength,
  checkUser,
  comparisonsPassword,
  findUserById,
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
} = errorMessages;
const { OK, CREATED } = statusCode;
const { BadRequestError, ConflictError } = ApiError;

class userController {
  async getUsers(req, res, next) {
    const users = await User.find({});
    return res.status(OK).json(users);
  }

  async getUserById(req, res, next) {
    try {
      const user = await findUserById(req.params.id);
      return res.status(OK).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getUserInfo(req, res, next) {
    try {
      const user = await findUserById(req.user._id);
      return res.status(OK).json(user);
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const { name, password, email, role } = req.body;
      checkNameLength(name);
      checkPasswordLength(password);
      const normalizedEmail = normalizeEmail(email);
      const cryptPassword = await hashPassword(password);
      await User.create({
        name,
        password: cryptPassword,
        email: normalizedEmail,
        role,
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
      checkNameLength(name);
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { name } },
        {
          new: true,
          runValidators: true,
        }
      );
      checkUser(user);
      return res.status(OK).json(user);
    } catch (error) {
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
      const user = await findUserById(id);
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
      checkUser(user);
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
      checkUser(user, invalidCredentials);
      await comparisonsPassword(password, user.password);
      const token = generateToken(user._id);
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
