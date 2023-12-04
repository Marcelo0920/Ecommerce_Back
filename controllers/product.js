import { asyncError } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import { Category } from "../models/category.js";
import ErrorHandler from "../utils/error.js";
import { getDataUri } from "../utils/features.js";
import cloudinary from "cloudinary";

export const getAllProducts = asyncError(async (req, res, next) => {
  //Searcg & Category query

  const { keyword, category } = req.query;

  console.log(req.query);

  if (keyword) {
    conditions.name = {
      $regex: keyword,
      $options: "i",
    };
  }
  if (category) {
    conditions.category = category;
  }

  const products = await Product.find(conditions);

  console.log(products);

  res.status(200).json({
    success: true,
    products,
  });
});

export const getAdminProducts = asyncError(async (req, res, next) => {
  //Searcg & Category query
  const products = await Product.find({}).populate("category");

  const outOfStock = products.filter((index) => index.stock === 0);

  res.status(200).json({
    success: true,
    outOfStock: outOfStock.length,
    inStock: products.length - outOfStock.length,
    products,
  });
});

export const getProductDetails = asyncError(async (req, res, next) => {
  //Searcg & Category query
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

export const createProduct = asyncError(async (req, res, next) => {
  const { name, description, category, price, stock } = req.body;

  if (!req.file) {
    return next(new ErrorHandler("Please add an image", 400));
  }

  //req file
  const file = getDataUri(req.file);

  //Add Cloundinary here
  const myCLoud = await cloudinary.v2.uploader.upload(file.content);

  const image = {
    public_id: myCLoud.public_id,
    url: myCLoud.secure_url,
  };

  await Product.create({
    name,
    description,
    category,
    price,
    stock,
    images: [image],
  });

  res.status(200).json({
    success: true,
    message: "Product created successfully",
  });
});

export const updateProduct = asyncError(async (req, res, next) => {
  const { name, description, category, price, stock } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  if (name) product.name = name;
  if (description) product.description = description;
  if (category) product.category = category;
  if (price) product.price = price;
  if (stock) product.stock = stock;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
  });
});

export const addProductImage = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  if (!req.file) {
    return next(new ErrorHandler("Please add an image", 400));
  }

  //req file
  const file = getDataUri(req.file);

  //Add Cloundinary here
  const myCLoud = await cloudinary.v2.uploader.upload(file.content);

  const image = {
    public_id: myCLoud.public_id,
    url: myCLoud.secure_url,
  };

  product.images.push(image);
  await product.save();

  res.status(200).json({
    success: true,
    message: "Image added successfully",
  });
});

export const deleteProductImage = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const id = req.query.id;

  if (!id) {
    return next(new ErrorHandler("Please Image Id", 400));
  }

  let isExist = 1;

  product.images.forEach((item, index) => {
    if (item._id.toString() === id.toString()) isExist = index;
  });

  if (isExist < 0) {
    return next(new ErrorHandler("Image doesnt exist", 400));
  }

  await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);

  product.images.splice(isExist, 1);

  await product.save();

  res.status(200).json({
    success: true,
    message: "Image deleted succesfully",
  });
});

export const deleteProduct = asyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  for (let index = 0; index < product.images.length; index++) {
    await cloudinary.v2.uploader.destroy(product.images[index].public_id);
  }

  await cloudinary.v2.uploader.destroy(product.images[isExist].public_id);

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product deleted succesfully",
  });
});

export const addCategory = asyncError(async (err, req, next) => {
  await Category.create(req.body);

  res.status(201).json({
    success: true,
    message: "Category Added Successfully",
  });
});

export const getAllCategories = asyncError(async (err, req, next) => {
  const categories = await Category.find({});

  res.status(201).json({
    success: true,
    categories,
  });
});

export const deleteCategory = asyncError(async (err, req, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHandler("Category Not Found"), 404);
  }

  const products = await Product.find({ category: category._id });

  for (let counter = 0; counter < products.length; counter++) {
    let product = products[counter];
    product.category = undefined;
    await product.save();
  }

  await category.remove();

  res.status(200).json({
    success: true,
    message: "Category Deleted",
  });
});
