import { errorMessages } from "../errors/messageError.js";
import { statusCode } from "../errors/statusCode.js";
import { checkResult } from "../utils.js";
import config from "../config.js";
import User from "../models/user.js";
import Token from "../models/token.js";

const {curentDate} = config;

export async function emailConfirmation(req, res, next) {
  try {
    const { token } = req.params;
    const userToken = await Token.findOne( {token} );
    checkResult(userToken, errorMessages.invalidData)
    const user = await User.findById(userToken.owner)
    checkResult(user, errorMessages.invalidData);
    user.confirmed = true;
    user.expiresAt = null;
    await user.save();
    userToken.expiresAt = curentDate;
    await userToken.save();
    return res.status(statusCode.OK).json({message: "Почта подтверждена"});
  } catch (error) {
    next(error);
  }
}
