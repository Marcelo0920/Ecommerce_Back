import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },
  description: {
    type: String,
    required: [true, "Please enter a description"],
  },
  price: {
    type: String,
    required: [true, "Please enter a price"],
  },
  stock: {
    type: String,
    required: [true, "Please enter a stock"],
  },
  images: [
    {
      public_id: String,
      url: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "category",
  },
});

export const Product = mongoose.model("Product", schema);
