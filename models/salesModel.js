const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  tproduct: {
    type: String,
    trim: true,
    required: true
  },
  nproduct: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    trim: true,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  transportCheck: {
    type: Boolean
  },
  totalPrice: {
    type: Number,
    required: true
  },
  payment: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserModel",
    required: true
  }
});

module.exports = mongoose.model("SalesModel", salesSchema);
