import mongoose from "mongoose";
import User from "../models/user.js";
import Token from "../models/token.js";
import { statusCode } from "../errors/statusCode.js";
import { ApiError } from "../errors/errorApi.js";
import { errorMessages } from "../errors/messageError.js";
import { v4 as uuidv4 } from "uuid";
import {
  checkResult,
  comparisonsPassword,
  findById,
  generateJwtToken,
  hashPassword,
  normalizeEmail,
  deleteJwt,
  sendEmail,
  generateConfirmationToken,
} from "../utils.js";

const {
  duplicateEmail,
  invalidCredentials,
  invalidData,
  logoutSuccess,
  loginSuccess,
  deletedUser,
  invalidUserId,
  entityNotFound,
  emailNotFound,
  resetPasswordInstructions,
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
      const { name, password, email, role } = req.body;

      const normalizedEmail = normalizeEmail(email);
      const cryptPassword = await hashPassword(password);
      const { token, expiresAt } = generateConfirmationToken();
      const user = await User.create({
        name,
        password: cryptPassword,
        email: normalizedEmail,
        role,
        expiresAt,
      });

      await Token.create({
        token,
        expiresAt,
        owner: user._id,
      });
      const responseSendingMail = await sendEmail(normalizedEmail, token);

      return res.status(CREATED).json({
        message: responseSendingMail,
        user: {
          name,
          email: normalizedEmail,
          role
        },
      });
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
        next(BadRequestError(invalidData));
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
      const user = await User.findById(req.user._id);
      checkResult(user, entityNotFound("Пользователь"));
      await User.deleteOne();
      deleteJwt(res);
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
      const token = generateJwtToken(user._id, user.role);
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
    deleteJwt(res);
    return res.status(OK).send({ message: logoutSuccess });
  }

  async passwordResetRequest(req, res, next) {
    try {
      const { email } = req.body;
      const normalizedEmail = normalizeEmail(email);
      const user = await User.findOne({ email: normalizedEmail });
      checkResult(user, emailNotFound);
      const {token, expiresAt} = generateConfirmationToken();
      await Token.create({
        token,
        expiresAt,
        owner: user._id
      })
      await sendEmail(normalizedEmail, token, true);
      return res.status(OK).json({ message: resetPasswordInstructions });
    } catch (error) {
      if (
        error.errors &&
        error.errors["email"] instanceof mongoose.Error.ValidatorError
      ) {
        next(BadRequestError(error.errors.email.message));
      } else {
        next(error);
      }
    }
  }
  async restPasswordConfirmation(req, res, next) {
    try {
      const {password, token} = req.body;
      const userToken = await Token.findOne({token});
      checkResult(userToken, invalidData);
      const user = await User.findById(userToken.owner);
      checkResult(user, invalidData);
      const cryptPassword = await hashPassword(password);
      user.password = cryptPassword
      await user.save()
      userToken.token = null, 
      userToken.expiresAt = new Date(0)
      await userToken.save()
      return res.status(OK).json({message: "Пароль успешно изменён"})
    } catch (error) {
      next(error);
    }
  }
}

export default new userController();
