import { ApiError } from "../errors/errorApi.js";
import config from "../config.js";
import { errorMessages } from "../errors/messageError.js";
import { checkJwtToken } from "../utils.js";

const { env, secretJwtKey } = config;

export const auth = async (req, res, next) => {
  try {
    const payload = checkJwtToken(req, env, secretJwtKey);
    if(payload){
      req.user = payload
      next()
    } else {
      next(ApiError.UnauthorizedError(errorMessages.notAuthorized));
    }
  } catch (err) {
    return next(ApiError.UnauthorizedError(errorMessages.notAuthorized));
  }
};
