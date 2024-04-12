import Product from "../models/product.js";
import { statusCode } from "../errors/statusCode.js";
import { ApiError } from "../errors/errorApi.js";
import { messageResponce } from "../errors/messageResponce.js";
import {
  checkResult,
  storeMediaLocally,
  normalizeFileArray,
  deleteMediaFromFS,
} from "../utils.js";
import config from "../config.js";

const { mediaConfigImageProduct, mediaConfigVideoProduct } = config;
const { deleteProduct, imagesDeleted, videosDeleted, entityNotFound } =
  messageResponce;
const { OK, CREATED } = statusCode;
const { ConflictError } = ApiError;

async function patchProductMedia(req, res, next, config) {
  try {
    const product = await Product.findById(req.params.id);
    checkResult(product, entityNotFound("Товар"));

    const remainingSlots = config.maxSlots - product[config.fieldName].length;
    const mediaArr = normalizeFileArray(req.files[config.fieldName]);
    if (remainingSlots < mediaArr.length) {
      return next(
        ConflictError(
          `${config.fieldName} доступно для загрузки: ${remainingSlots} из ${config.maxSlots}`
        )
      );
    } else {
      const mediaFiles = storeMediaLocally(
        req.files[config.fieldName],
        config.mimeTypes,
        config.convertOptions
      );
      product[config.fieldName] = [...product[config.fieldName], ...mediaFiles];
      await product.save();
    }
    return res.status(OK).json(product);
  } catch (error) {
    next(error);
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
      const product = await Product.findById(req.params.id);
      checkResult(product, entityNotFound("Товар"));
      return res.status(OK).json(product);
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const product = await Product.create({
        img: [],
        video: [],
        ...req.body,
      });
      const images = await storeMediaLocally(
        req.files.img,
        mediaConfigImageProduct.mimeTypes,
        mediaConfigImageProduct.convertOptions
      );
      const videos = await storeMediaLocally(
        req.files.video,
        mediaConfigVideoProduct.mimeTypes
      );
      product.img = images;
      product.video = videos;
      await product.save();
      return res.status(CREATED).json(product);
    } catch (error) {
      next(error);
    }
  }

  async patchProductInfo(req, res, next) {
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
    await patchProductMedia(req, res, next, mediaConfigImageProduct);
  }

  async patchProductVideo(req, res, next) {
    await patchProductMedia(req, res, next, mediaConfigVideoProduct);
  }

  async deleteProductImage(req, res, next) {
    try {
      const { id } = req.params;
      const { arrayImageNames } = req.body;
      const product = await Product.findById(id);
      checkResult(product, entityNotFound("Товар"));
      const images = product.img.filter(
        (image) => !arrayImageNames.includes(image)
      );
      product.img = images;
      await product.save();
      deleteMediaFromFS(arrayImageNames);
      return res.status(OK).json({ message: imagesDeleted });
    } catch (error) {
      next(error);
    }
  }

  async deleteProductVideo(req, res, next) {
    try {
      const { id } = req.params;
      const { arrayVideoNames } = req.body;
      const product = await Product.findById(id);
      checkResult(product, entityNotFound("Товар"));
      const videos = product.video.filter(
        (video) => !arrayVideoNames.includes(video)
      );
      product.video = videos;
      await product.save();
      deleteMediaFromFS(arrayVideoNames);
      return res.status(OK).json({ message: videosDeleted });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      checkResult(product, entityNotFound("Товар"));
      deleteMediaFromFS(product.img);
      deleteMediaFromFS(product.video);
      await Product.deleteOne(product);
      return res.status(OK).json({ message: deleteProduct });
    } catch (error) {
      next(error);
    }
  }
}

export default new productController();
