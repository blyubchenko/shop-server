import { isCelebrateError } from "celebrate";

export const celebrateHandler = (err, req, res, next) => {
  if (isCelebrateError(err)) {
    let problem;
    switch (true) {
      case err.details.has("query"):
        problem = err.details.get("query").details[0].message;
        break;
      case err.details.has("params"):
        problem = err.details.get("params").details[0].message;
        break;
      case err.details.has("body"):
        problem = err.details.get("body").details[0].message;
        break;
      default:
        problem = "Неизвестная ошибка валидации";
    }
    console.log(problem);
    return res.json({ message: `Ошибка валидации: ${problem}` });
  }
  next(err);
};
