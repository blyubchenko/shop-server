import config from "../config.js";
import { ApiError } from "../errors/errorApi.js";
import { normalizeFileArray } from "../utils.js";

const {
  mediaConfigImageProduct,
  mediaConfigVideoProduct,
  mediaConfigImageAvatar,
} = config;
const { BadRequestError } = ApiError;

const validateFiles = (files, config, fileType) => {
  const normalizedFiles = normalizeFileArray(files);
  if (normalizedFiles.length > config.maxSlots) {
    return `Количество загружаемых ${fileType} не должно превышать ${config.maxSlots}`;
  }
  const invalidFile = normalizedFiles.find(
    (file) =>
      file.size > config.maxSize ||
      !config.mimeTypes.hasOwnProperty(file.mimetype)
  );
  if (invalidFile) {
    if (invalidFile.size > config.maxSize) {
      return `Размер файла ${fileType} превышает максимально допустимый: ${
        config.maxSize / 1024 / 1024
      } Мб`;
    }
    if (!config.mimeTypes.hasOwnProperty(invalidFile.mimetype)) {
      return `Недопустимый тип ${fileType} файла`;
    }
  }
  return null;
};

const uploadMediaMiddleware = (req, res, next) => {
  const { img, video, avatar } = req.files || {};
  if (!img && !video && !avatar) {
    return next(
      BadRequestError("Не загружено ни одного изображения или видео")
    );
  }
  let errorMessage = null;
  if (img) {
    errorMessage = validateFiles(img, mediaConfigImageProduct, "изображения");
  }
  if (avatar) {
    errorMessage = validateFiles(avatar, mediaConfigImageAvatar, "изображения");
  }
  if (video) {
    errorMessage = validateFiles(video, mediaConfigVideoProduct, "видео");
  }
  if (errorMessage) {
    return next(BadRequestError(errorMessage));
  }
  next();
};

export { uploadMediaMiddleware };
