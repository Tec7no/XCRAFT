import mongoose, { Schema, Document } from "mongoose";

export interface IUsedBy {
  userId?: string;
  orderId: string;
  date: Date;
}

export interface ICoupon extends Document {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
  minOrderAmount?: number;
  maxUsage?: number;
  usageCount: number;
  usedBy: IUsedBy[];
}

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    active: { type: Boolean, default: true },
    minOrderAmount: { type: Number, default: 0 },
    maxUsage: { type: Number, default: null }, // null = unlimited
    usageCount: { type: Number, default: 0 },
    usedBy: [
      {
        userId: { type: String, default: null },
        orderId: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

CouponSchema.virtual("id").get(function () {
  return this._id.toString();
});
CouponSchema.set("toJSON", { virtuals: true });

export default mongoose.model<ICoupon>("Coupon", CouponSchema);
