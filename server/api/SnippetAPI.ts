import { Express } from "express";
import Snippet from "../models/Snippet.js";
import { analyzeSnippet } from "../ai.js";

export function registerSnippetRoutes(app: Express) {
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

  // Analyze snippet with AI
  app.post("/api/snippets/analyze", async (req, res) => {
    try {
      const { text, context, learning_language, base_language, ui_language } = req.body;
      
      if (!text || !context || !learning_language || !base_language || !ui_language) {
        return res.status(400).json({ error: "Text, context and languages are required" });
      }

      // Get AI analysis
      const analysis = await analyzeSnippet(text, context, learning_language, base_language, ui_language);

      res.json({ text, analysis });
    } catch (error: any) {
      console.error("Error analyzing snippet:", error);
      res.status(500).json({ error: error.message || "Failed to analyze snippet" });
    }
  });

  // Store new snippet
  app.post('/api/snippets', async (req, res) => {
    //console.log("POST /api/snippets called with body:", req.body);
    
    const { 
      rawText, 
      lemma, 
      partOfSpeech, 
      languageCode, 
      sourceContext, 
      tags,
      contextualExplanation,
      examples,
      explanations,
      translation,
      userId,
      difficulty,
      nextReview,
      reviewCount
    } = req.body;
    
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
      contextualExplanation,
      examples,
      explanations,
      translation,
      userId,
      difficulty,
      nextReview,
      reviewCount
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
    const { 
      rawText, 
      lemma, 
      partOfSpeech, 
      languageCode, 
      tags,
      contextualExplanation,
      examples,
      explanations,
      translation,
      difficulty,
      nextReview,
      reviewCount
    } = req.body;
    const update: any = {};
    
    if (rawText !== undefined) update.rawText = rawText;
    if (lemma !== undefined) update.lemma = lemma;
    if (partOfSpeech !== undefined) update.partOfSpeech = partOfSpeech;
    if (languageCode !== undefined) update.languageCode = languageCode;
    if (tags !== undefined) update.tags = tags;
    if (contextualExplanation !== undefined) update.contextualExplanation = contextualExplanation;
    if (examples !== undefined) update.examples = examples;
    if (explanations !== undefined) update.explanations = explanations;
    if (translation !== undefined) update.translation = translation;
    if (difficulty !== undefined) update.difficulty = difficulty;
    if (nextReview !== undefined) update.nextReview = nextReview;
    if (reviewCount !== undefined) update.reviewCount = reviewCount;

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
}
