import express from "express";
import { supabase } from "../utils/supabase.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// All book routes require authentication
router.use(authenticateUser);

// Create a new book
router.post("/", async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  try {
    const { data, error } = await supabase
      .from("books")
      .insert({ title })
      .select()
      .single();
    if (error) throw error;
    res.json({ book: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List books
router.get("/", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("books")
      .select("id, title, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ books: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single book with chapters
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [{ data: book, error: bookErr }, { data: chapters, error: chErr }] = await Promise.all([
      supabase.from("books").select("id, title, created_at").eq("id", id).single(),
      supabase.from("chapters").select("id, content, idx, created_at").eq("book_id", id).order("idx", { ascending: true }),
    ]);
    if (bookErr) throw bookErr;
    if (chErr) throw chErr;
    res.json({ book, chapters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a chapter to a book
router.post("/:id/chapters", async (req, res) => {
  const { id } = req.params;
  const { content, idx } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Content is required" });
  }
  try {
    const { data, error } = await supabase
      .from("chapters")
      .insert({ book_id: id, content, idx })
      .select()
      .single();
    if (error) throw error;
    res.json({ chapter: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


