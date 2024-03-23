import config from "../config.js";
const {tokenLifetimeinMinute} = config;
export const errorMessages = {
    entityNotFound: (entity) => `${entity} с указанным id не найден`,
    invalidUserId: "Некорректный идентификатор пользователя",
    duplicateEmail: "Пользователь с указанным email уже зарегистрирован",
    emailNotFound: "Пользователь с указанным email не найден",
    invalidEmailFormat: "Некорректный формат email",
    invalidData: "Переданы некорректные данные",
    invalidCredentials: "Неправильные почта или пароль",
    logoutSuccess: "Выход выполнен",
    loginSuccess: "Вход выполнен",
    deletedUser: "Пользователь удалён",
    hashingError: "Ошибка хеширования",
    deleteProduct: "Товар удалён",
    invalidProductId: "Некорректный идентификатор товара",
    accessIsdenied: "Доступ запрещен",
    notAuthorized: "Необходима авторизация",
    errorSendingEmail: "Ошибка отправки письма",
    sendingEmailOk: `На ваш email отправлено письмо с подтверждением регистрции. Подтвердите почту в течении ${tokenLifetimeinMinute} минут`,
    resetPasswordInstructions: 'Инструкции по сбросу пароля отправлены на ваш email', 
  };