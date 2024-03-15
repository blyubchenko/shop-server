import {statusCode} from "../errors/statusCode.js"
import { ApiError } from "../errors/errorApi.js";
const {SERVER_ERROR} = statusCode;


export const errorHandler = (err, req, res, next) => {
    if(err instanceof ApiError){
        return res.status(err.status).json({message: err.message})
    }
    return res.status(SERVER_ERROR).json({message: "Непредвиденная ошибка"})
}