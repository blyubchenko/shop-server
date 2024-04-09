import {statusCode} from "../errors/statusCode.js"
import { ApiError } from "../errors/errorApi.js";
import mongoose from "mongoose";
import {messageResponce} from "../errors/messageResponce.js"
const {invalidData, internalServerError, invalidDataValidation, duplicateEmail} = messageResponce;
const {SERVER_ERROR, BAD_REQUEST, CONFLICT} = statusCode;


export const errorHandler = (err, req, res, next) => {
    if (err.code === 11000) {
        res.status(CONFLICT).json({ message: duplicateEmail });
      } else if (
        err.errors &&
        err.errors["email"] instanceof mongoose.Error.ValidatorError
      ) {
        res.status(BAD_REQUEST).json({ message: err.errors.email.message});
      } else if (err instanceof mongoose.Error.CastError) {
        res.status(BAD_REQUEST).json({ message: invalidData });
      } else if (err instanceof mongoose.Error.ValidationError) {
        res.status(BAD_REQUEST).json({ message: invalidDataValidation });
      } else if(err instanceof ApiError){
        return res.status(err.status).json({message: err.message})
    }
    return res.status(SERVER_ERROR).json({message: internalServerError})
}

