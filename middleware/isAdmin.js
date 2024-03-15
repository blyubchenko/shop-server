import {statusCode} from "../errors/statusCode.js"
import { errorMessages } from "../errors/messageError.js";

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(statusCode.FORBIDDEN).json({ message: errorMessages.accessIsdenied });
    }
  };