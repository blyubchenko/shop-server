import express from "express";
import mongoose from "mongoose";
import config from "./config.js";
import cors from "cors";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";


const {port, urlDb} = config;

const app = express();

app.use(cors())
app.use(express.json());

app.use(router);
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
