import mongoose from "mongoose";
import Order from "../models/order.js";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import { statusCode } from "../errors/statusCode.js";
import { ApiError } from "../errors/errorApi.js";
import { errorMessages } from "../errors/messageError.js";
import { checkResult } from "../utils.js";

const { invalidData, entityNotFound } =
  errorMessages;
const { OK, CREATED } = statusCode;
const { BadRequestError } = ApiError;

class orderController {
  async getAllOrders(req, res, next) {
    try {
      const { limit = 10, page = 1 } = req.query;
      let offset = page * limit - limit;
      const orders = await Order.find().limit(limit).skip(offset);
      return res.status(OK).json(orders);
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await Order.findById(req.params.id);
      checkResult(order, entityNotFound("Заказ"));
      return res.status(OK).json(order);
    } catch (error) {
      next(error);
    }
  }

  async createOrder(req, res, next) {
    try {
        const userId = req.user._id;
      const cart = await Cart.findOne({ userId });
      checkResult(cart, entityNotFound("Корзина"));
      const products = cart.items;
      const totalPrice = await Promise.all(products.map(async (item) => {
        const product = await Product.findById(item.productId);
        return product.price * item.quantity;
      })).then(prices => prices.reduce((acc, curr) => acc + curr, 0));
      console.log(totalPrice);
      const order = await Order.create({ userId, products, totalPrice });
      await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
      return res.status(CREATED).json(order);
    } catch (error) {
      next(error);
    }
  }

  async updateOrder(req, res, next) {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
        checkResult(updatedOrder, entityNotFound("Заказ"));
        return res.status(OK).json(updatedOrder);
    } catch (error) {
      next(error);
    }
  }

  async deleteOrder(req, res, next) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);
      checkResult(order, entityNotFound("Заказ"));
      await Order.deleteOne(order);
      return res.status(OK).json({ message: "Заказ удален" });
    } catch (error) {
      if (error instanceof mongoose.Error.CastError) {
        next(BadRequestError(invalidData));
      } else {
        next(error);
      }
    }
  }
}

export default new orderController();
