import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import express from "express";
import cors from "cors";
import storyRoute from "./routes/story.js";
import booksRoute from "./routes/books.js";
import authRoute from "./routes/auth.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/story", storyRoute);
app.use("/api/books", booksRoute);

// 404 handler - ensure JSON response
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler - ensure all errors return JSON
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({ 
    error: err.message || "Internal server error" 
  });
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
