import { Express } from "express";
import Settings from "../models/Settings.js";
import { requireAuth } from "../middleware/auth.js";

export function registerSettingsRoutes(app: Express) {
  // Get settings
  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      let settings = await Settings.findOne({ userId: req.userId });
      
      // If no settings exist, create default ones
      if (!settings) {
        settings = new Settings({
          userId: req.userId,
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
  app.put("/api/settings", requireAuth, async (req, res) => {
    try {
      const { baseLanguageCode, UILanguageCode, learningLanguageCode } = req.body;
      
      const update: any = { userId: req.userId };
      if (baseLanguageCode !== undefined) update.baseLanguageCode = baseLanguageCode;
      if (UILanguageCode !== undefined) update.UILanguageCode = UILanguageCode;
      if (learningLanguageCode !== undefined) update.learningLanguageCode = learningLanguageCode;

      // Update or create settings
      let settings = await Settings.findOneAndUpdate(
        { userId: req.userId },
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