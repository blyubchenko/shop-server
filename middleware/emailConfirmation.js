import { errorMessages } from "../errors/messageError.js";
import { statusCode } from "../errors/statusCode.js";
import { checkResult } from "../utils.js";
import User from "../modes/user.js";

export async function emailConfirmation(req, res, next) {
  try {
    const { token } = req.params;
    const user = await User.findOneAndUpdate(
        { confirmationToken: token },
        { $set: { confirmed: true, confirmationToken: null } },
        { new: true, runValidators: true }
    );
    checkResult(user, errorMessages.invalidData);
    return res.status(statusCode.OK).json(user);
  } catch (error) {
    next(error);
  }
}
