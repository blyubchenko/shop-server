import config from "../config.js";
import { ApiError } from "../errors/errorApi.js";
import { normalizeFileArray } from "../utils.js";

const {
  maxImagesProduct,
  maxImageSize,
  maxVideoSize,
  mimeTypesImages,
  mimeTypesVideos,
  maxVideosProduct,
  maxImagesAvatar
} = config;
const { BadRequestError } = ApiError;

const validateFiles = (files, maxCount, maxSize, mimeTypes, fileType) => {
  if (files.length > maxCount) {
    return `Количество загружаемых ${fileType} не должно превышать ${maxCount}`;
  }

  const invalidFile = files.find(
    (file) => file.size > maxSize || !mimeTypes.hasOwnProperty(file.mimetype)
  );
  if (invalidFile) {
    if (invalidFile.size > maxSize) {
      return `Размер файла ${fileType} превышает максимально допустимый: ${
        maxSize / 1024 / 1024
      } Мб`;
    }
    if (!mimeTypes.hasOwnProperty(invalidFile.mimetype)) {
      return `Недопустимый тип ${fileType} файла`;
    }
  }

  return null;
};

const uploadMediaMiddleware = (req, res, next) => {
  if (!req.files?.img && !req.files?.video && !req.files?.avatar) {
    return next(
      BadRequestError("Не загружено ни одного изображения или видео")
    );
  }

  let errorMessage = null;

  if (req.files?.img) {
    const images = normalizeFileArray(req.files.img);
    errorMessage = validateFiles(
      images,
      maxImagesProduct,
      maxImageSize,
      mimeTypesImages,
      "изображения"
    );
  }

  if (req.files?.avatar) {
    const images = normalizeFileArray(req.files.avatar);
    errorMessage = validateFiles(
      images,
      maxImagesAvatar,
      maxImageSize,
      mimeTypesImages,
      "изображения"
    );
  }

  if (!errorMessage && req.files?.video) {
    const videos = normalizeFileArray(req.files.video);
    errorMessage = validateFiles(
      videos,
      maxVideosProduct,
      maxVideoSize,
      mimeTypesVideos,
      "видео"
    );
  }

  if (errorMessage) {
    return next(BadRequestError(errorMessage));
  }

  next();
};

export { uploadMediaMiddleware };
