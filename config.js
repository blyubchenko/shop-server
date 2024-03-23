import dotenv from "dotenv";
dotenv.config();

const minute = 15; //Задайте время жизни токен подтверждения,  в минутах
const todaysDate = new Date().getTime()
const timeInSeconds = todaysDate + (minute * 60 * 1000);
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
  emailAdress: process.env.EMAIL_ADRESS || 'youAdress@mail.ru',
  emailService: process.env.EMAIL_SERVICE || 'mail',
  emailPassword: process.env.EMAIL_PASSWORD || 'superPassword',
  tokenLifetimeinMinute: minute,
  tokenLifetime: timeInSeconds,
  curentDate: todaysDate,
};
export default config;
