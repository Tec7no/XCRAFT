import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: {
    type: String,
    enum: ["customer", "admin", "manager", "employee"],
    default: "customer",
  },
  verified: { type: Boolean, default: false },
  addresses: [addressSchema],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
