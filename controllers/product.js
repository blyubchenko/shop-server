import mongoose from "mongoose";
import Product from "../models/product.js";
import { statusCode } from "../errors/statusCode.js";
import { ApiError } from "../errors/errorApi.js";
import { errorMessages } from "../errors/messageError.js";
import {
  checkResult,
  findById,
  processImages,
  normalizeImageArray,
  deleteImagesFromFS
} from "../utils.js";
import config from "../config.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { maxImagesProduct } = config;
const { invalidData, deleteProduct, invalidProductId, entityNotFound } =
  errorMessages;
const { OK, CREATED } = statusCode;
const { BadRequestError, ConflictError, NotFoundError } = ApiError;

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
      const images = processImages(req);
      const product = await Product.create({ img: images, ...req.body });
      return res.status(CREATED).json(product);
    } catch (error) {
      next(error);
    }
  }

  async pathProductInfo(req, res, next) {
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

  async pathProductImage(req, res, next) {
    try {
        const product = await Product.findById(req.params.id);
        checkResult(product, entityNotFound("Товар"));

        const remainingImageSlots = maxImagesProduct - product.img.length;
        const imageArr = normalizeImageArray(req.files.img);
        if (remainingImageSlots < imageArr.length) {
          return next(
            ConflictError(`Изображений доступно для загрузки: ${remainingImageSlots} из ${maxImagesProduct}`))
        } else {
          const images = processImages(req);
          product.img = [...product.img, ...images]
          await product.save()
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
      deleteImagesFromFS(arrayImageNames)
      return res.status(OK).json({ message: "Изображения успешно удалены" });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await findById(Product, id, invalidProductId);
      checkResult(product, entityNotFound("Товар"));
      deleteImagesFromFS(product.img)
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
