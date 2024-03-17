import {statusCode} from "../errors/statusCode.js"
import { errorMessages } from "../errors/messageError.js";

export function isAcces (requiredRole, optionalRole=''){
  return (req, res, next) => {
    if (req.user && (req.user.role === requiredRole || req.user.role === optionalRole)) {
      next();
    } else {
      return res.status(statusCode.FORBIDDEN).json({ message: errorMessages.accessIsdenied });
    }
  }
};