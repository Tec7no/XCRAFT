import { Request, Response } from "express";
import SiteSettings from "../models/sitesettings.model";

export const getSettings = async (req: Request, res: Response) => {
  try {
    const doc = await SiteSettings.findOne();
    if (!doc) return res.json({ success: true, settings: null });
    return res.json({ success: true, settings: doc.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const saveSettings = async (req: Request, res: Response) => {
  try {
    const { settings } = req.body;
    if (!settings) return res.status(400).json({ success: false, message: "Settings data required" });
    const doc = await SiteSettings.findOneAndUpdate(
      {},
      { data: settings },
      { upsert: true, new: true }
    );
    return res.json({ success: true, settings: doc.data });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
