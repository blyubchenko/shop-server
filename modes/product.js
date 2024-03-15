import mongoose from "mongoose";

const productShema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    minlength: 2,
    maxlength: 30,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  material: {
    type: String,
    default: "leather",
  },
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

export default mongoose.model('product', productShema);