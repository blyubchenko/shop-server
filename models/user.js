import mongoose from "mongoose";
import validator from "validator";
import config from "../config.js";
import { messageResponce } from "../errors/messageResponce.js";
const { invalidEmailFormat } = messageResponce;

const { nameUserLength, passwordLength, saltRounds } = config;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: nameUserLength.minlength,
    maxlength: nameUserLength.maxlength,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: passwordLength.minlength,
    maxlength: (passwordLength.maxlength + saltRounds) * 3,
    select: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: invalidEmailFormat,
    },
  },
  role: {
    type: String,
    enum: ["user", "admin", "moder"],
    default: "user",
  },
  avatar: [
    {
      url: { type: String, required: true },
      formats: {
        large: {
          url: { type: String },
          format: { type: String },
          width: { type: Number },
          height: { type: Number },
        },
        medium: {
          url: { type: String },
          format: { type: String },
          width: { type: Number },
          height: { type: Number },
        },
        small: {
          url: { type: String },
          format: { type: String },
          width: { type: Number },
          height: { type: Number },
        },
      },
    },
  ],
  confirmed: {
    type: Boolean,
    default: false,
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    expires: 60,
  },
});
userSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("User", userSchema);
