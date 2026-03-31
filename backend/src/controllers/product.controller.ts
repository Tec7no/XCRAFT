import { Request, Response } from "express";
import Product from "../models/product.model";

const mapProduct = (product: any) => {
  const obj = product.toObject ? product.toObject() : product;
  // Convert variantStock Map to plain object if needed
  let variantStock = obj.variantStock;
  if (variantStock && typeof variantStock.toObject === 'function') {
    variantStock = variantStock.toObject();
  }
  return { ...obj, id: obj._id.toString(), variantStock };
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category, badge, featured, search } = req.query;
    const filter: any = {};
    if (category) filter.category = category;
    if (badge) filter.badge = badge;
    if (featured) filter.featuredIn = featured;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { name_ar: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, products: products.map(mapProduct) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.json({ success: true, product: mapProduct(product) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, product: mapProduct(product) });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.json({ success: true, product: mapProduct(product) });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};