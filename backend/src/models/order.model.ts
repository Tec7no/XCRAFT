import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId?: string;
  items: {
    productId: string;
    name: string;
    name_ar?: string;
    name_en?: string;
    code: string;
    image: string;
    size: string;
    color: string;
    colorName?: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
  };
  payment: {
    method: "card" | "transfer" | "cod";
    proofImage?: string;
    transactionId?: string;
    maskedCard?: string;
    cardBrand?: string;
  };
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  status: "pending_review" | "accepted" | "rejected" | "preparing" | "shipping" | "delivered";
  rejectionReason?: string;
  archived?: boolean;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String, default: null },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        name_ar: String,
        name_en: String,
        code: { type: String, required: true },
        image: String,
        size: String,
        color: String,
        colorName: String,
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        lineTotal: { type: Number, required: true },
      },
    ],
    customer: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    payment: {
      method: { type: String, enum: ["card", "transfer", "cod"], required: true },
      proofImage: String,
      transactionId: String,
      maskedCard: String,
      cardBrand: String,
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    delivery: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending_review", "accepted", "rejected", "preparing", "shipping", "delivered"],
      default: "pending_review",
    },
    rejectionReason: String,
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);