import { isCelebrateError } from "celebrate";

export const celebrateHandler = (err, req, res, next) => {
  if (isCelebrateError(err)) {
    const problemElement = (param) => err.details.get(param).details[0].context.key;
    const problemKey = err.details.has("params")
      ? problemElement("params")
      : problemElement("body");
    return res.json({ message: `Ошибка валидации: ${problemKey}` });
  }
  next(err);
};
