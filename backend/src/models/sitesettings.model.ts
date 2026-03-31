import mongoose, { Schema, Document } from "mongoose";

const SiteSettingsSchema = new Schema(
  {
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("SiteSettings", SiteSettingsSchema);
