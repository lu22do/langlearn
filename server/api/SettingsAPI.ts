import { Express } from "express";
import Settings from "../models/Settings.js";

export function registerSettingsRoutes(app: Express) {
  // Get settings
  app.get("/api/settings", async (req, res) => {
    try {
      // For now, we'll use a single global settings document (userId = null)
      let settings = await Settings.findOne({ userId: null });
      
      // If no settings exist, create default ones
      if (!settings) {
        settings = new Settings({
          userId: null,
          baseLanguageCode: "en",
          UILanguageCode: "en",
          learningLanguageCode: "de",
        });
        await settings.save();
      }
      
      res.json(settings);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  // Update settings
  app.put("/api/settings", async (req, res) => {
    try {
      const { baseLanguageCode, UILanguageCode, learningLanguageCode } = req.body;
      
      const update: any = {};
      if (baseLanguageCode !== undefined) update.baseLanguageCode = baseLanguageCode;
      if (UILanguageCode !== undefined) update.UILanguageCode = UILanguageCode;
      if (learningLanguageCode !== undefined) update.learningLanguageCode = learningLanguageCode;

      // Update or create settings
      let settings = await Settings.findOneAndUpdate(
        { userId: null },
        update,
        { new: true, upsert: true, runValidators: true }
      );
      
      res.json(settings);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Error updating settings" });
    }
  });
}