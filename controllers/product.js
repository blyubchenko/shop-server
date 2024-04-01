import mongoose from "mongoose";
import Product from "../models/product.js";
import { statusCode } from "../errors/statusCode.js";
import { ApiError } from "../errors/errorApi.js";
import { errorMessages } from "../errors/messageError.js";
import { checkResult, saveImages, findById, handleNewImages } from "../utils.js";

const { invalidData, deleteProduct, invalidProductId, entityNotFound } =
  errorMessages;
const { OK, CREATED } = statusCode;
const { BadRequestError, ConflictError } = ApiError;

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
      const images = await handleNewImages(req);
      const product = await Product.create({img:images, ...req.body });
      return res.status(CREATED).json(product);
    } catch (error) {
      if (error.code === 11000) {
        next(ConflictError("Не уникальное имя товара"));
      }
      if (error instanceof mongoose.Error.ValidationError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }

  async updateProductData(req, res, next) {
    try {
      const { name, description, price, material, color, type, quantity } =
        req.body;
        const images = await handleNewImages(req);
        const product = await Product.findByIdAndUpdate(
          req.params.id,
          { $set: { name, description, price, material, color, type, quantity }, $push: { img: images } },
          {new: true, runValidators: true});
          checkResult(product, entityNotFound("Товар"));
      return res.status(OK).json(product);
    } catch (error) {
      if (error.code === 11000) {
        next(ConflictError("Не уникальное имя товара"));
      }
      if (error instanceof mongoose.Error.ValidationError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await findById(Product, id, invalidProductId);
      checkResult(product, entityNotFound("Товар"));
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
