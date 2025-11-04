import React, { useState } from "react";

export default function StoryDisplay() {
  const [story, setStory] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [bookId, setBookId] = useState(null);
  const [chapterIdx, setChapterIdx] = useState(1);

  const API_BASE = "http://localhost:5050";

  const handleCreateBook = async () => {
    if (!bookTitle.trim() || isLoading) return;
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/books`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: bookTitle.trim() }),
      });
      const data = await res.json();
      if (data.book?.id) {
        setBookId(data.book.id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!input.trim() || isLoading) return;
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/story/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, bookId, idx: chapterIdx }),
      });
      const data = await res.json();
      setStory((prev) => (prev ? prev + "\n\n" : "") + (data.story || ""));
      setChapterIdx((prev) => prev + 1);
      setInput("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-start sm:items-center justify-center py-10 sm:py-16">
      <div className="w-full max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
            Storytime with Dan-AI
          </h1>
          <p className="mt-2 text-gray-600">
            Generate and continue stories with AI. Craft the next scene below.
          </p>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="mb-4 sm:mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Book title
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="e.g. The Clockwork Garden"
                className="textarea"
              />
              <button
                type="button"
                onClick={handleCreateBook}
                disabled={isLoading || !bookTitle.trim()}
                className="btn-primary whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {bookId ? "Book Created" : "Start Book"}
              </button>
            </div>
            {bookId && (
              <p className="mt-2 text-xs text-gray-500">Book ID: {bookId}</p>
            )}
          </div>
          <div className="mb-4 sm:mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start here...
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What happens next?"
              rows={4}
              className="textarea"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-gray-500">
              {isLoading ? "Generating..." : "Ready"}
            </div>
            <button
              onClick={handleContinue}
              disabled={isLoading || !input.trim()}
              className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Generating
                </span>
              ) : (
                <span>Continue Story</span>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 card p-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-3">Story</h2>
          <pre className="whitespace-pre-wrap text-gray-800 text-base leading-7 min-h-[4rem]">
            {story || "Your story will appear here..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
