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
  price: {
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
    type: String,
    required: true
  }
});

module.exports = mongoose.model("SalesModel", salesSchema);
