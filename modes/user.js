import mongoose from 'mongoose';
import validator from 'validator';
import config from '../config.js';
import { errorMessages } from '../errors/messageError.js';
const {invalidEmailFormat} = errorMessages

const {nameLength, passwordLength, saltRounds} = config;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: nameLength.minlength,
    maxlength: nameLength.maxlength,
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
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema);