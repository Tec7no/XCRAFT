import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  name_ar?: string;
  name_en?: string;
  code: string;
  category: "Men" | "Women" | "Kids";
  stock: number;
  salePrice: number;
  originalPrice: number;
  discount: number;
  description?: string;
  description_ar?: string;
  description_en?: string;
  instructions?: string;
  colors: { hex: string; name?: string; image?: string }[];
  sizes: string[];
  variantStock?: Record<string, number>;
  stockByColor?: Record<string, number>;
  images: string[];
  badge?: "New" | "Sale" | "Limited" | null;
  specifications?: any[];
  sizeGuideImage?: string;
  featuredIn?: string[];
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    name_ar: String,
    name_en: String,
    code: { type: String, required: true, unique: true },
    category: { type: String, enum: ["Men", "Women", "Kids"], required: true },
    stock: { type: Number, default: 0 },
    salePrice: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    description: String,
    description_ar: String,
    description_en: String,
    instructions: String,
    colors: [{ hex: { type: String, required: true }, name: String, image: String }],
    sizes: [String],
    variantStock: { type: Map, of: Number },
    stockByColor: { type: Map, of: Number },
    images: [String],
    badge: { type: String, enum: ["New", "Sale", "Limited", null], default: null },
    specifications: { type: Array, default: [] },
    sizeGuideImage: String,
    featuredIn: [{ type: String, enum: ["Best Sellers", "New Arrivals", "Offers"] }],
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", ProductSchema);
