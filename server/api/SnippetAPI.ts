import { Express } from "express";
import Snippet from "../models/Snippet.js";
import { analyzeSnippet, generateQuiz } from "../ai.js";
import { requireAuth } from "../middleware/auth.js";

export function registerSnippetRoutes(app: Express) {
  // Get all snippets with optional filtering by languageCode, tag and state
  app.get("/api/snippets", requireAuth, async (req, res) => {
    try {
      const { languageCode, tag, state } = req.query;
      const filter: any = { userId: req.userId };
      if (languageCode) filter.languageCode = languageCode;
      if (tag) filter.tags = tag;
      
      if (state) {
        let states: string[] = [];
        if (Array.isArray(state)) {
          states = state.map(String);
        } else if (typeof state === "string") {
          states = state.split(",").map((s) => s.trim()).filter(Boolean);
        }

        if (states.length > 0 && !states.includes("all")) {
          if (states.includes("new")) {
            filter.$or = [
              { state: { $in: states } },
              { state: { $exists: false } },
              { state: null },
            ];
          } else {
            filter.state = { $in: states };
          }
        }
      }

      const snippets = await Snippet.find(filter).sort({ createdAt: -1 });
      res.json(snippets);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch snippets" });
    }
  });

  // Analyze snippet with AI
  app.post("/api/snippets/analyze", requireAuth, async (req, res) => {
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

  // Generate a quiz from random snippets
  app.get('/api/quiz', requireAuth, async (req, res) => {
    try {
      const size = parseInt((req.query.size as string) || '5', 10);
      const ui_language = (req.query.ui_language as string) || 'en';

      // sample random snippets for the authenticated user (prioritize non-known snippets)
      let snippets = await Snippet.aggregate([
        { 
          $match: { 
            userId: req.userId,
            $or: [
              { state: { $ne: "known" } },
              { state: { $exists: false } },
              { state: null },
            ]
          } 
        },
        { $sample: { size } },
        { $project: { rawText: 1, languageCode: 1, sourceContext: 1, state: 1, _id: 1 } }
      ]);

      if (!snippets || snippets.length === 0) {
        snippets = await Snippet.aggregate([
          { $match: { userId: req.userId } },
          { $sample: { size } },
          { $project: { rawText: 1, languageCode: 1, sourceContext: 1, state: 1, _id: 1 } }
        ]);
      }

      if (!snippets || snippets.length === 0) {
        return res.status(404).json({ message: 'No snippets available for quiz' });
      }

      const generatedQuestions = await generateQuiz(snippets, ui_language, 'multiple_choice', 4);
      const snippetMap = new Map(snippets.map(s => [s.rawText.trim().toLowerCase(), s]));
      const quiz = generatedQuestions.map((q, idx) => {
        const matched = snippetMap.get(q.rawText.trim().toLowerCase()) || snippets[idx];
        return {
          ...q,
          snippetId: matched?._id?.toString(),
          snippetState: matched?.state || "new",
        };
      });

      res.json({ quiz });
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      res.status(500).json({ message: 'Failed to generate quiz' });
    }
  });

  // Store new snippet
  app.post('/api/snippets', requireAuth, async (req, res) => {
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
      state,
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
      userId: req.userId,
      state: state || "new",
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
  app.get('/api/snippets/:id', requireAuth, async (req, res) => {
    const id = req.params.id;
    try {
      const snippet = await Snippet.findOne({ _id: id, userId: req.userId });
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
  app.put('/api/snippets/:id', requireAuth, async (req, res) => {
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
      state,
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
    if (state !== undefined) update.state = state;
    if (difficulty !== undefined) update.difficulty = difficulty;
    if (nextReview !== undefined) update.nextReview = nextReview;
    if (reviewCount !== undefined) update.reviewCount = reviewCount;

    try {
      const updated = await Snippet.findOneAndUpdate(
        { _id: id, userId: req.userId },
        update,
        { new: true, runValidators: true }
      );
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
  app.delete('/api/snippets/:id', requireAuth, async (req, res) => {
    const id = req.params.id;
    try {
      const deleted = await Snippet.findOneAndDelete({ _id: id, userId: req.userId });
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
