export const errorMessages = {
    userNotFound: "Пользователь с указанным id не найден",
    invalidUserId: "Некорректный идентификатор пользователя",
    invalidEntityLength: ( entity, minLength, maxLength) => `Длина ${entity} должна быть от ${minLength} до ${maxLength} символов`,
    duplicateEmail: "Пользователь с указанным email уже зарегистрирован",
    invalidEmailFormat: "Некорректный формат email",
    invalidData: "Переданы некорректные данные",
    invalidCredentials: "Неправильные почта или пароль",
    forbiddenAction: "Нельзя удалить чужой аккаунт",
    logoutSuccess: "Выход выполнен",
    loginSuccess: "Вход выполнен",
    deletedUser: "Пользователь удалён",
    hashingError: "Ошибка хеширования",
  };