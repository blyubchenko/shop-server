import mongoose from "mongoose";
import config from "../config.js";
const {nameProductLength, descriptionProductLength, priceLength, maxImagesProduct} = config;

const productShema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: nameProductLength.minlength,
    maxlength: nameProductLength.maxlength,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    minlength: descriptionProductLength.minlength,
    maxlength: descriptionProductLength.maxlength,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    minlength: priceLength.minlength,
    maxlength: priceLength.maxlength,
  },
  material: {
    type: String,
    default: "leather",
  },
  img: [{
    type: String,
  }],
  video: [{
    type: String, 
    default: "",
  }],
  color: {
    type: String,
    default: "black",
  },
  type: {
    type: String,
    enum: ['bag', 'wallet', "docholder", "belt", "watchband", "accessorie", "clutch"],
    default: 'accessorie'
  },
  quantity: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Product', productShema);