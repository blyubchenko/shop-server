import jwt from 'jsonwebtoken';
import {ApiError} from '../errors/errorApi.js';
import config from '../config.js';
import {errorMessages} from "../errors/messageError.js"

const { env ,secretJwtKey } = config;

export const auth = async (req, res, next) => {
  try {
  const token = req.cookies.jwt;
  if (!token) {
    return next(ApiError.UnauthorizedError(errorMessages.notAuthorized));
  }
   const payload = jwt.verify(token, env === 'production' ? secretJwtKey : 'dev-secret');
   req.user = payload;
   next();
  } catch (err) {
    return next(ApiError.UnauthorizedError(errorMessages.notAuthorized));
  }
};