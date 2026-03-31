import mongoose, { Schema, Document } from "mongoose";

export interface IDiscount extends Document {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  active: boolean;
  minOrderAmount?: number;
  usageCount: number;
}

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },
    active: { type: Boolean, default: true },
    minOrderAmount: { type: Number, default: 0 },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CouponSchema.virtual("id").get(function () {
  return this._id.toString();
});
CouponSchema.set("toJSON", { virtuals: true });

export default mongoose.model<IDiscount>("Coupon", CouponSchema);
