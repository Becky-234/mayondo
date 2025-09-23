const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  tproduct: {
    type: String,
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
    type: String,
    required: true
  },
  transportCheck: {
    type: Boolean,
    default: false
  },
  totalPrice: {
    type: String,
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
