import mongoose from "mongoose";
import Product from "../models/product.js";
import { statusCode } from "../errors/statusCode.js";
import { ApiError } from "../errors/errorApi.js";
import { errorMessages } from "../errors/messageError.js";
import config from "../config.js";
import {
  checkResult,
  checkProductQuantity,
  getOrCreateCart,
  checkJwtToken,
} from "../utils.js";
import TemporaryCart from "../models/temporaryCart.js";

const { env, secretJwtKey } = config;

const { invalidData, productWasNotFound } = errorMessages;
const { OK, CREATED } = statusCode;
const { BadRequestError, ConflictError, NotFoundError } = ApiError;

class cartController {
  async getProductsInCart(req, res, next) {
    try {
      const payload = checkJwtToken(req, env, secretJwtKey);
      const cart = await getOrCreateCart(payload._id);
      return res.status(OK).json(cart);
    } catch (error) {
      next(error);
    }
  }

  async addToCart(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      checkResult(product, productWasNotFound);
      checkResult(product.quantity, "Товара нет в наличии");
      const payload = checkJwtToken(req, env, secretJwtKey);
      const cart = await getOrCreateCart(payload._id);
      const presenceProductId = cart.items.findIndex(
        (item) => item.productId.toString() === id
      );
      if (presenceProductId === -1) {
        cart.items.push({ productId: id, quantity: 1 });
        await cart.save();
      } else {
        throw ConflictError("Товар уже присутствует в корзине");
      }
      return res
        .status(CREATED)
        .json({ message: "Товар успешно добавлен в корзину", cart });
    } catch (error) {
      console.log(error);
      if (error instanceof mongoose.Error.ValidationError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }

  async updateQuantityProductInCart(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const product = await Product.findById(id);
      checkResult(product, productWasNotFound);
      const payload = checkJwtToken(req, env, secretJwtKey);
      const cart = await getOrCreateCart(payload._id);
      const presenceProductId = cart.items.findIndex(
        (item) => item.productId.toString() === id
      );
      if (presenceProductId === -1) {
        throw NotFoundError("Товар в корзине не найден");
      }
      const productAvailable = checkProductQuantity(quantity, product.quantity);
      cart.items[presenceProductId].quantity = productAvailable.amount;
      await cart.save();
      return res.status(OK).json({
        message: `Количество товара в корзине: ${productAvailable.amount}шт, ${productAvailable.message}шт`,
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }

  async deleteProductFromCart(req, res, next) {
    try {
      const { id } = req.params;
      const product = await Product.findById(id);
      checkResult(product, productWasNotFound);
      const payload = checkJwtToken(req, env, secretJwtKey);
      const cart = await getOrCreateCart(payload._id);
      const presenceProductId = cart.items.findIndex(
        (item) => item.productId.toString() === id
      );
      if (presenceProductId === -1) {
        throw NotFoundError("Товар в корзине не найден");
      }
      cart.items.splice(presenceProductId, 1);
      await cart.save();
      return res.status(OK).json({ message: "Товар удален из корзины" });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }

  async emptyСart(req, res, next) {
    try {
      const payload = checkJwtToken(req, env, secretJwtKey);
      const cart = await getOrCreateCart(payload._id);
      cart.items.splice(0, cart.items.length);
      await cart.save();
      return res.status(OK).json({ message: "Корзина очищена" });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }

  async transferCartItems(userId) {
    try {
      const temporaryCart = await TemporaryCart.findOne();
      if (temporaryCart) {
        const userCart = await getOrCreateCart(userId);
        const userCartItemsIds = userCart.items.map((item) =>
          item.productId.toString()
        );
        temporaryCart.items.forEach((tempCartitem) => {
          const temporaryCartItemsIds = tempCartitem.productId.toString();
          if (!userCartItemsIds.includes(temporaryCartItemsIds)) {
            userCart.items.push(tempCartitem);
          }
        });
        await userCart.save();
        temporaryCart.expiresAt = new Date();
        await temporaryCart.save();
      }
    } catch (error) {
      throw error;
    }
  }
}

export default new cartController();
