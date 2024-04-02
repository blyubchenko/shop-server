import express from "express";
import mongoose from "mongoose";
import config from "./config.js";
import cors from "cors";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cookieParser from 'cookie-parser';
import {errors} from "celebrate"
import fileupload from "express-fileupload"
import {celebrateHandler} from "./middleware/celebrateHandler.js"
import { requestLogger, errorLogger } from "./middleware/logger.js";
import path from 'path'
import { fileURLToPath } from 'url';

const { port, urlDb } = config;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cookieParser())
app.use(cors())
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileupload({limits: {fileSize: 5242880}}))
app.use(requestLogger)
app.use(router);
app.use(errorLogger)
app.use(celebrateHandler)
app.use(errors())
app.use(errorHandler)
async function start() {
  try {
   await mongoose.connect(urlDb);
    console.log("Подключен к MongoDB");
    app.listen(port, () => console.log("Сервер запущен на порту", port));
  } catch (error) {
    console.error("Ошибка подключения к MongoDB:", error);
    process.exit(1);
  }
}

start();
