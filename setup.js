// setup.js
import fs from "fs";
import path from "path";

const baseDir = path.resolve("ai-book-agent");

const structure = {
  frontend: {
    src: {
      components: {
        "StoryDisplay.jsx": `import { useState } from "react";

export default function StoryDisplay() {
  const [story, setStory] = useState("");
  const [input, setInput] = useState("");

  const handleContinue = async () => {
    const res = await fetch("http://localhost:5000/api/story/next", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });
    const data = await res.json();
    setStory(prev => prev + "\\n\\n" + data.story);
    setInput("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <pre className="whitespace-pre-wrap text-lg">{story}</pre>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="What happens next?"
        className="w-full p-3 border rounded mt-4"
      />
      <button
        onClick={handleContinue}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Continue Story
      </button>
    </div>
  );
}
`,
      },
      "main.jsx": `import React from "react";
import ReactDOM from "react-dom/client";
import StoryDisplay from "./components/StoryDisplay";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <StoryDisplay />
  </React.StrictMode>
);
`,
      "index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;`,
    },
    "package.json": `{
  "name": "frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0"
  }
}`,
  },

  backend: {
    routes: {
      "story.js": `import express from "express";
import { openai } from "../utils/openai.js";
import { supabase } from "../utils/supabase.js";

const router = express.Router();

router.post("/next", async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        { role: "system", content: "You are a creative story generator." },
        { role: "user", content: prompt },
      ],
    });

    const story = response.choices[0].message.content;
    await supabase.from("stories").insert({ content: story });
    res.json({ story });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
`,
    },
    utils: {
      "openai.js": `import OpenAI from "openai";
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });`,
      "supabase.js": `import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);`,
    },
    "server.js": `import express from "express";
import cors from "cors";
import storyRoute from "./routes/story.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/story", storyRoute);

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
`,
    "package.json": `{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.19.0",
    "cors": "^2.8.5",
    "openai": "^4.0.0",
    "@supabase/supabase-js": "^2.39.0"
  }
}`,
  },

  ".env.example": `OPENAI_API_KEY=your_openai_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
FIREBASE_API_KEY=your_firebase_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
`,
};

// Recursive file builder
function createStructure(base, obj) {
  for (const key in obj) {
    const fullPath = path.join(base, key);
    if (typeof obj[key] === "object") {
      fs.mkdirSync(fullPath, { recursive: true });
      createStructure(fullPath, obj[key]);
    } else {
      fs.writeFileSync(fullPath, obj[key]);
      console.log(`✅ Created: ${fullPath}`);
    }
  }
}

fs.mkdirSync(baseDir, { recursive: true });
createStructure(baseDir, structure);

console.log("\n🎉 AI Book Agent scaffold created successfully!");

