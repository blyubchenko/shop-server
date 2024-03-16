import express from "express";
import mongoose from "mongoose";
import config from "./config.js";
import cors from "cors";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cookieParser from 'cookie-parser';
import {errors} from "celebrate"

const {port, urlDb} = config;

const app = express();
app.use(cookieParser())
app.use(cors())
app.use(express.json());

app.use(router);
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
