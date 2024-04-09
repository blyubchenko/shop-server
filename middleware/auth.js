import { ApiError } from "../errors/errorApi.js";
import config from "../config.js";
import { messageResponce } from '../errors/messageResponce.js'
import { checkJwtToken } from "../utils.js";

const { env, secretJwtKey } = config;
const {notAuthorized} = messageResponce;
export const auth = async (req, res, next) => {
  try {
    const payload = checkJwtToken(req, env, secretJwtKey);
    if(payload){
      req.user = payload
      next()
    } else {
      next(ApiError.UnauthorizedError(notAuthorized));
    }
  } catch (err) {
    return next(ApiError.UnauthorizedError(notAuthorized));
  }
};
