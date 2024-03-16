import mongoose from "mongoose";
import Product from "../modes/product.js";
import { statusCode } from "../errors/statusCode.js";
import { ApiError } from "../errors/errorApi.js";
import { errorMessages } from "../errors/messageError.js";
import utils from "../utils.js";
import config from "../config.js";

const { checkStringLength, checkResult, findById } = utils;

const { invalidData, deleteProduct, invalidProductId, entityNotFound } = errorMessages;
const { nameProductLength } = config;
const { OK, CREATED } = statusCode;
const { BadRequestError } = ApiError;

class productController {
  async getProducts(req, res, next) {
    const product = await Product.find({});
    return res.status(OK).json(product);
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
      const { name } = req.body;
      checkStringLength(
        name,
        nameProductLength.minlength,
        nameProductLength.maxlength,
        "наименования товара"
      );
      const product = await Product.create({...req.body});
      return res.status(CREATED).json(product);
    } catch (error) {
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
      checkStringLength(
        name,
        nameProductLength.minlength,
        nameProductLength.maxlength,
        "нименования товара"
      );
      const product = await Product.findByIdAndUpdate(
        req.product._id,
        { $set: { name, description, price, material, color, type, quantity } },
        {
          new: true,
          runValidators: true,
        }
      );
      checkResult(product, entityNotFound("Товар"));
      return res.status(OK).json(product);
    } catch (error) {
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
