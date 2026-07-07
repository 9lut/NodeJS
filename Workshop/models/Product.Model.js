const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    price: Number,
    stock: Number,
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
