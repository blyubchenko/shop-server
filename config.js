import dotenv from "dotenv";
dotenv.config();
const timeСonfirmationToken = { day: 0, hour: 1, minute: 0 }; // Задайте время жизни для токена подтверждения почты
const timeJwtToken = { day: 1, hour: 0, minute: 0 }; // Задайте время жизни для токена авторизации
const timeTemporalCart = { day: 2, hour: 0, minute: 0 }; // Задайте время жизни для корзины неавторизованного пользователя
const maxSizeFiles = {
  imageProduct: 5,//Задайте максимальный размер изображения в Мб
  imageAvatar: 5,//Задайте максимальный размер изображения в Мб
  videoProduct: 50//Задайте максимальный размер видео в Мб
}
const maximumFileCount = {
  imageProduct: 10,//Задайте максимальное количество изображений для товара
  imageAvatar: 1,//Максимальное количество изображений для аватара (неизменяемое значение)
  videoProduct: 1,//Максимальное количество видео для товара (неизменяемое значение)
}
const mimeTypesImages = { //Укажите допустимые для загрузки типы изображений
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
}
const mimeTypesVideos = { //Укажите допустимые для загрузки типы видео
  "video/mp4": ".mp4",
  "video/webm": ".webm",
}

//В текущей раализации конвертация создаст объект с тремя версиями заруженного изображения
//Для изменения количества версий изображения измените соответствующие схемы в монгоДБ 
//и только после этого количество параметров в объектах
const convertOptionsImageAvatar = { //Настройки конвертации изображений для аватара
  quality: [80, 60, 40],//Настройки качаства выходного файла, диапазон от 0 до 100
  size: ["large", "medium", "small"],// Не изменять из-за строгой схемы монгоДБ
  format: "webp",//Формат выходных изображений поддержиает [ jpeg, png, webp, gif, avif, tiff и raw]
  width: [800, 400, 200],// Ширина выходных изображений в пикселях
  height: [800, 400, 200],//Высота выходных изображений в пикселях
}
const convertOptionsImageProduct = { //Настройки конвертации изображений для товара
  quality: [80, 60, 40],//Настройки качаства выходного файла, диапазон от 0 до 100
  size: ["large", "medium", "small"],// Не изменять из-за строгой схемы монгоДБ
  format: "webp",//Формат выходных изображений поддержиает [ jpeg, png, webp, gif, avif, tiff и raw]
  width: [1280, 854, 427],// Ширина выходных изображений в пикселях
  height: [720, 480, 240],//Высота выходных изображений в пикселях
}
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
  lifeTimeJwt: convertingTime(timeJwtToken, "ms"), // Время жизни токена авторизации (в миллисекундах)
  emailAdress: process.env.EMAIL_ADRESS || "youAdress@mail.ru", // Адрес электронной почты для отправки уведомлений
  emailService: process.env.EMAIL_SERVICE || "mail", // Сервис электронной почты для отправки уведомлений
  emailPassword: process.env.EMAIL_PASSWORD || "superPassword", // Пароль для доступа к сервису электронной почты
  tokenLifetime: new Date().getTime() + convertingTime(timeСonfirmationToken, "ms"), // Время жизни токена подтверждения почты (в миллисекундах) - для db
  tokenLifetimeInMinute: convertingTime(timeСonfirmationToken, "m"), // Время жизни токена подтверждения почты (в минутах) - для email пользователю
  curentDate: new Date().getTime(), // Текущее время в миллисекундах
  lifetimeTemporaryCart: convertingTime(timeTemporalCart, "ms"), // Время жизни временной корзины для незарегистрированных пользователей (в минутах)
  maxImageSize: maxSizeFiles.image * 1024 * 1024, //Максимальный размер изображения в байтах
  maxVideoSize: maxSizeFiles.video * 1024 * 1024, //Максимальный размер видео в байтах
  mediaConfigImageProduct: {
    maxSlots: maximumFileCount.imageProduct,
    maxSize: maxSizeFiles.imageProduct * 1024 * 1024,
    mimeTypes: mimeTypesImages,
    fieldName: "img",
    convertOptions: convertOptionsImageProduct,
  },
  mediaConfigImageAvatar: {
    maxSlots: maximumFileCount.imageAvatar,
    maxSize: maxSizeFiles.imageAvatar * 1024 * 1024,
    mimeTypes: mimeTypesImages,
    fieldName: "avatar",
    convertOptions: convertOptionsImageAvatar,
  },
  mediaConfigVideoProduct: {
    maxSlots: maximumFileCount.videoProduct,
    maxSize: maxSizeFiles.videoProduct * 1024 * 1024,
    mimeTypes: mimeTypesVideos,
    fieldName: "video",
    convertOptions: null,
  }
};
export default config;

function convertingTime(time, outputFormat = "ms") {
  let outputTime;
  switch (outputFormat) {
    case "ms":
      outputTime = time.day * 24 * 60 * 60 * 1000 + time.hour * 60 * 60 * 1000 + time.minute * 60 * 1000;
      break;
    case "s":
      outputTime = time.day * 24 * 60 * 60 + time.hour * 60 * 60 + time.minute * 60;
      break;
    case "m":
      outputTime = time.day * 24 * 60 + time.hour * 60 + time.minute;
      break;
    case "h":
      outputTime = time.day * 24 + time.hour + time.minute / 60;
      break;
    case "d":
      outputTime = time.day + time.hour / 24 + time.minute / (60 * 24);
      break;
    default:
      outputTime = "Задан несуществующий флаг";
      break;
  }
  return outputTime;
}
