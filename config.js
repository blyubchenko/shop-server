import dotenv from "dotenv";
dotenv.config();
const timeСonfirmationToken = { day: 0, hour: 1, minute: 0 }; // Задайте время жизни для токена подтверждения почты
const timeJwtToken = { day: 1, hour: 0, minute: 0 }; // Задайте время жизни для токена авторизации
const timeTemporalCart = { day: 2, hour: 0, minute: 0 }; // Задайте время жизни для корзины неавторизованного пользователя

const config = {
  env: process.env.NODE_ENV || "production", // Окружение (production, development и т. д.)
  port: process.env.PORT || 3000, // Порт, на котором работает сервер
  urlDb: process.env.URL_DB || "mongodb://127.0.0.1:27017/mydb", // URL базы данных MongoDB
  secretJwtKey: process.env.SECRET_KEY_JWT || "secret_key", // Секретный ключ для подписи JWT токенов
  passwordLength: { minlength: 8, maxlength: 12 }, // Длина пароля пользователя (минимальная и максимальная)
  nameUserLength: { minlength: 2, maxlength: 30 }, // Длина имени пользователя (минимальная и максимальная)
  nameProductLength: { minlength: 2, maxlength: 30 }, // Длина названия продукта (минимальная и максимальная)
  descriptionProductLength: { minlength: 300, maxlength: 2000 }, // Длина описания продукта (минимальная и максимальная)
  priceLength: { minlength: 1, maxlength: 100000 }, // Диапазон цены продукта (минимальная и максимальная)
  saltRounds: 10, // Количество раундов для хеширования пароля (для bcrypt)
  lifeTimeJwt: convertingTime(timeJwtToken, 'ms'), // Время жизни токена авторизации (в миллисекундах)
  emailAdress: process.env.EMAIL_ADRESS || "youAdress@mail.ru", // Адрес электронной почты для отправки уведомлений
  emailService: process.env.EMAIL_SERVICE || "mail", // Сервис электронной почты для отправки уведомлений
  emailPassword: process.env.EMAIL_PASSWORD || "superPassword", // Пароль для доступа к сервису электронной почты
  tokenLifetime: convertingTime(timeСonfirmationToken, 'ms'), // Время жизни токена подтверждения почты (в миллисекундах) - для db
  tokenLifetimeInMinute: convertingTime(timeСonfirmationToken, 'm'), // Время жизни токена подтверждения почты (в минутах) - для email пользователю
  curentDate: new Date().getTime(), // Текущее время в миллисекундах
  lifetimeTemporaryCart: convertingTime(timeTemporalCart, 'ms'), // Время жизни временной корзины для незарегистрированных пользователей (в минутах)
  maxImagesProduct: 10, //Максимальное колличество изображений для одного товара
};
export default config;

function convertingTime(time, outputFormat = "ms") {
  const todaysDate = new Date().getTime();
  let outputTime;
  switch (outputFormat) {
    case "ms":
      outputTime =
        todaysDate +
        time.day * 24 * 60 * 60 * 1000 +
        time.hour * 60 * 60 * 1000 +
        time.minute * 60 * 1000;
      break;

    case "s":
      outputTime =
        todaysDate +
        time.day * 24 * 60 * 60 +
        time.hour * 60 * 60 +
        time.minute * 60;
      break;
    case "m":
      outputTime =
        todaysDate + time.day * 24 * 60 + time.hour * 60 + time.minute;
      break;
    case "h":
      outputTime = todaysDate + time.day * 24 + time.hour + time.minute / 60;
      break;
    case "d":
      outputTime =
        todaysDate + time.day + time.hour / 24 + time.minute / 60 / 24;
      break;

    default:
      outputTime = "Задан несуществующий флаг";
      break;
  }
  return outputTime;
}