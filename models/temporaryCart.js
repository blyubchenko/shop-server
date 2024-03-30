import mongoose from "mongoose";
import config from "../config.js";
const { lifetimeTemporaryCart } = config;

const temporaryCartSchema = new mongoose.Schema({
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
  expiresAt: { type: Date, default: lifetimeTemporaryCart, expires: 120 },
});

temporaryCartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("TemporaryCart", temporaryCartSchema);
