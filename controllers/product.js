import mongoose from "mongoose";
import Product from "../models/product.js";
import { statusCode } from "../errors/statusCode.js";
import { ApiError } from "../errors/errorApi.js";
import { errorMessages } from "../errors/messageError.js";
import {
  checkResult,
  findById,
  storeMediaLocally,
  normalizeFileArray,
  deleteMediaFromFS
} from "../utils.js";
import config from "../config.js";

const { maxImagesProduct, maxVideosProduct, mimeTypesImages, mimeTypesVideos } = config;
const { invalidData, deleteProduct, invalidProductId, entityNotFound } =
  errorMessages;
const { OK, CREATED } = statusCode;
const { BadRequestError, ConflictError } = ApiError;

async function patchProductMedia(req, res, next, mediaType) {
  try {
    const product = await Product.findById(req.params.id);
    checkResult(product, entityNotFound("Товар"));

    const mediaConfig = {
      img: {
        maxSlots: maxImagesProduct,
        mimeTypes: mimeTypesImages,
        fieldName: 'img'
      },
      video: {
        maxSlots: maxVideosProduct,
        mimeTypes: mimeTypesVideos,
        fieldName: 'video'
      }
    };

    const config = mediaConfig[mediaType];
    const remainingSlots = config.maxSlots - product[config.fieldName].length;
    const mediaArr = normalizeFileArray(req.files[mediaType]);
    if (remainingSlots < mediaArr.length) {
      return next(
        ConflictError(`${mediaType} доступно для загрузки: ${remainingSlots} из ${config.maxSlots}`))
    } else {
      const mediaFiles = storeMediaLocally(req.files[mediaType], config.mimeTypes);
      product[config.fieldName] = [...product[config.fieldName], ...mediaFiles];
      await product.save();
    }
    return res.status(OK).json(product);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      next(BadRequestError(invalidData));
    } else {
      next(error);
    }
  }
}

class productController {
  async getProducts(req, res, next) {
    try {
      const { type, limit = 10, page = 1 } = req.query;
      let offset = page * limit - limit;
      let products;
      type
        ? (products = await Product.find({ type }).limit(limit).skip(offset))
        : (products = await Product.find({}).limit(limit).skip(offset));
      return res.status(OK).json(products);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await findById(Product, req.params.id, invalidProductId);
      checkResult(product, entityNotFound("Товар"));
      return res.status(OK).json(product);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const images = storeMediaLocally(req.files.img, mimeTypesImages);
      const videos = storeMediaLocally(req.files.video, mimeTypesVideos);
      const product = await Product.create({ img: images, video: videos, ...req.body });
      return res.status(CREATED).json(product);
    } catch (error) {
      next(error);
    }
  }

  async patchProductInfo (req, res, next) {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: { ...req.body } },
        { new: true, runValidators: true }
      );
      checkResult(product, entityNotFound("Товар"));
      return res.status(OK).json(product);
    } catch (error) {
      next(error);
    }
  }
  

  async patchProductImage(req, res, next) {
    await patchProductMedia(req, res, next, 'img');
  }
  
  async patchProductVideo(req, res, next) {
    await patchProductMedia(req, res, next, 'video');
  }

  async deleteProductImage(req, res, next) {
    try {
      const { id } = req.params;
      const { arrayImageNames } = req.body;
      const product = await Product.findById(id);
      const images = product.img.filter(
        (image) => !arrayImageNames.includes(image)
      );
      product.img = images;
      await product.save();
      deleteMediaFromFS(arrayImageNames)
      return res.status(OK).json({ message: "Изображения успешно удалены" });
    } catch (error) {
      next(error);
    }
  }

  async deleteProductVideo(req, res, next) {
    try {
      const { id } = req.params;
      const { arrayVideoNames } = req.body;
      const product = await Product.findById(id);
      const videos = product.video.filter(
        (video) => !arrayVideoNames.includes(video)
      );
      product.video = videos;
      await product.save();
      deleteMediaFromFS(arrayVideoNames)
      return res.status(OK).json({ message: "Видео успешно удалены" });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await findById(Product, id, invalidProductId);
      checkResult(product, entityNotFound("Товар"));
      deleteMediaFromFS(product.img)
      deleteMediaFromFS(product.video)
      await Product.deleteOne(product);
      return res.status(OK).json({ message: deleteProduct });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }
}

export default new productController();
