import express from "express";
import { supabase } from "../utils/supabase.js";
import { generateChatCompletion } from "../utils/llm.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

// All story routes require authentication
router.use(authenticateUser);

router.post("/next", async (req, res) => {
  const { prompt, bookId, idx } = req.body;
  try {
    const story = await generateChatCompletion({
      messages: [
        { role: "system", content: "You are a creative story generator." },
        { role: "user", content: prompt },
      ],
    });

    // Optionally record as a chapter for a given book
    if (bookId) {
      await supabase.from("chapters").insert({ book_id: bookId, content: story, idx });
    }

    res.json({ story });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
