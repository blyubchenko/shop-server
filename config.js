import dotenv from "dotenv";
dotenv.config();
const minute = 20;//Задайте время жизни для токена подтверждения, в минутах

function convertingTimeInSeconds(timeInMinutes) {
  const todaysDate = new Date().getTime();
  return todaysDate + (timeInMinutes * 60 * 1000);
}

const config = {
  env: process.env.NODE_ENV || 'production',
  port: process.env.PORT || 3000,
  urlDb: process.env.URL_DB || "mongodb://127.0.0.1:27017/mydb",
  secretJwtKey: process.env.SECRET_KEY_JWT || "secret_key",
  passwordLength: { minlength: 8, maxlength: 12 },
  nameUserLength: { minlength: 2, maxlength: 30 },
  nameProductLength: { minlength: 2, maxlength: 30 },
  descriptionProductLength: { minlength: 300, maxlength: 2000 },
  priceLength: { minlength: 1, maxlength: 100000 },
  saltRounds: 10,
  emailAdress: process.env.EMAIL_ADRESS || 'youAdress@mail.ru',//Задайте адрес электронной почты с которой будет производится рассылка писем на адреса пользователей
  emailService: process.env.EMAIL_SERVICE || 'mail',//Задайте сервис электронной почты с которой будет производится рассылка писем на адреса пользователей
  emailPassword: process.env.EMAIL_PASSWORD || 'superPassword',//Задайте пароль для адреса электронной почты с которой будет производится рассылка писем на адреса пользователей(Чаще всего требуется настройка smtp и получение спец пароля)
  tokenLifetime: convertingTimeInSeconds(minute),
  tokenLifetimeInMinute: minute,//время жизни токена подтверждения, в минутах для информирования пользователя
  curentDate: new Date().getTime(),
  lifetimeTemporaryCart: convertingTimeInSeconds(1440)//Задайте время жизни корзины для незарегистрированного пользователя, в минутах
};
export default config;
