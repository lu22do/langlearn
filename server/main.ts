import express from "express";
import 'dotenv/config';
import mongoose from "mongoose";
import ViteExpress from "vite-express";
import Snippet from "./models/Snippet.js";
import { analyzeSnippet, generateFlashcards, generateQuiz } from "./ai.js";

const app = express();
// parse JSON and URL-encoded bodies so req.body is populated
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/myViteAppDB";

console.log("Using MongoDB URI:", MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Snippet endpoints
// Get all snippets with optional filtering by languageCode and tag
app.get("/api/snippets", async (req, res) => {
  try {
    const { languageCode, tag } = req.query;
    const filter: any = {};
    if (languageCode) filter.languageCode = languageCode;
    if (tag) filter.tags = tag;
    
    const snippets = await Snippet.find(filter).sort({ createdAt: -1 });
    res.json(snippets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch snippets" });
  }
});

app.post("/api/snippets/analyze", async (req, res) => {
  try {
    const { text, context, learning_language, base_language } = req.body;
    
    if (!text || !context || !learning_language) {
      return res.status(400).json({ error: "Text and learning language are required" });
    }

    // Get AI analysis
    const analysis = await analyzeSnippet(text, context, learning_language, base_language);

    res.json({ text, analysis });
  } catch (error: any) {
    console.error("Error analyzing snippet:", error);
    res.status(500).json({ error: error.message || "Failed to analyze snippet" });
  }
});

// Store new snippet
app.post('/api/snippets', async (req, res) => {
  console.log("POST /api/snippets called with body:", req.body);
  
  const { rawText, lemma, partOfSpeech, languageCode, sourceContext, tags } = req.body;
  
  if (!rawText || !sourceContext) {
    return res.status(400).json({ message: "rawText and sourceContext are required" });
  }
  
  if (sourceContext.length > 20000) {
    return res.status(400).json({ message: "sourceContext exceeds 20,000 character limit" });
  }

  const newSnippet = new Snippet({
    rawText,
    lemma,
    partOfSpeech,
    languageCode: languageCode || "en",
    sourceContext,
    tags: tags || [],
  });

  try {
    const savedSnippet = await newSnippet.save();
    res.status(201).json(savedSnippet);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error creating snippet" });
  }
});

// Get single snippet by id
app.get('/api/snippets/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const snippet = await Snippet.findById(id);
    if (!snippet) {
      return res.status(404).json({ message: "Snippet not found" });
    }
    res.json(snippet);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error fetching snippet" });
  }
});

// Update snippet by id
app.put('/api/snippets/:id', async (req, res) => {
  const id = req.params.id;
  const { rawText, lemma, partOfSpeech, languageCode, tags } = req.body;
  const update: any = {};
  
  if (rawText !== undefined) update.rawText = rawText;
  if (lemma !== undefined) update.lemma = lemma;
  if (partOfSpeech !== undefined) update.partOfSpeech = partOfSpeech;
  if (languageCode !== undefined) update.languageCode = languageCode;
  if (tags !== undefined) update.tags = tags;

  try {
    const updated = await Snippet.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (!updated) {
      return res.status(404).json({ message: "Snippet not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error updating snippet" });
  }
});

// Delete snippet by id
app.delete('/api/snippets/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const deleted = await Snippet.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Snippet not found" });
    }
    res.json({ message: "Snippet deleted", _id: deleted._id });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Error deleting snippet" });
  }
});

ViteExpress.listen(app, 3000, () =>
  console.log("Server is listening on port 3000..."),
);
