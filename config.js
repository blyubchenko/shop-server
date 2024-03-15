import dotenv from "dotenv";
dotenv.config();
const config = {
  port: process.env.PORT || 3000,
  urlDb: process.env.URL_DB || "mongodb://127.0.0.1:27017/mydb",
  secretJwtKey: process.env.SECRET_KEY_JWT || "secret_key",
  password: { minlength: 4, maxlength: 12 },
  name: { minlength: 2, maxlength: 30 },
  saltRounds: 10,
};
export default config;
