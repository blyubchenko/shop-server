import config from "../config.js";
import { ApiError } from "../errors/errorApi.js";

const { maxImagesProduct, maxImageSize, allowedImageTypes } = config;

const uploadImageMiddleware = (req, res, next) => {
  if (!req.files?.img) {
    return next(ApiError.BadRequestError("Не загружено ни одного изображения"));
  }

  const images = Array.isArray(req.files.img) ? req.files.img : [req.files.img];

  if (images.length > maxImagesProduct) {
    return next(
      ApiError.BadRequestError(
        `Количество загружаемых изображений не должно превышать ${maxImagesProduct}`
      )
    );
  }

  for (let image of images) {
    if (image.size > maxImageSize) {
      return next(ApiError.BadRequestError("Размер файла превышает максимально допустимый"));
    }
    if (!allowedImageTypes.includes(image.mimetype)) {
      return next(ApiError.BadRequestError("Недопустимый тип файла"));
    }
  }

  next();
};

export { uploadImageMiddleware };

