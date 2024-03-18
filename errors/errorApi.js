import { statusCode } from "./statusCode.js";
const {
  BAD_REQUEST,
  SERVER_ERROR,
  FORBIDDEN,
  NOT_FOUND,
  UNAUTHORIZED,
  CONFLICT,
} = statusCode;

export class ApiError extends Error {
  constructor(status, message) {
    super();
    this.status = status;
    this.message = message;
  }
  static BadRequestError(message) {
    return new ApiError(BAD_REQUEST, message);
  }
  static InternalError(message) {
    return new ApiError(SERVER_ERROR, message);
  }
  static ForbidenError(message) {
    return new ApiError(FORBIDDEN, message);
  }
  static NotFoundError(message) {
    return new ApiError(NOT_FOUND, message);
  }
  static UnauthorizedError(message) {
    return new ApiError(UNAUTHORIZED, message);
  }
  static ConflictError(message) {
    return new ApiError(CONFLICT, message);
  }
  static MailSendingError(message) {
    return new ApiError(SERVER_ERROR, message);
  }
}
