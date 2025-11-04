import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });
import express from "express";
import cors from "cors";
import storyRoute from "./routes/story.js";
import booksRoute from "./routes/books.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/story", storyRoute);
app.use("/api/books", booksRoute);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
