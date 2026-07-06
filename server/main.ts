import express from "express";
import 'dotenv/config';
import mongoose from "mongoose";
import ViteExpress from "vite-express";
import { registerSnippetRoutes } from "./api/SnippetAPI.js";
import { registerSettingsRoutes } from "./api/SettingsAPI.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myViteAppDB";
const PORT = Number(process.env.PORT) || 3000;

console.log("Using MongoDB URI:", MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Register all API routes
registerSettingsRoutes(app);
registerSnippetRoutes(app);

ViteExpress.listen(app, PORT, () =>
  console.log(`Server is listening on port ${PORT}...`),
);