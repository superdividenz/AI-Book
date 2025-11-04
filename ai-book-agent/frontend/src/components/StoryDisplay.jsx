import React, { useEffect, useState } from "react";
import {
  speak,
  stop,
  isSpeaking,
  supportsTTS,
  loadVoices,
  getVoices,
  curateVoices,
} from "../utils/tts";

export default function StoryDisplay({ accessToken, user, onLogout }) {
  const [story, setStory] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookTitle, setBookTitle] = useState("");
  const [bookId, setBookId] = useState(null);
  const [chapterIdx, setChapterIdx] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [books, setBooks] = useState([]);
  const [isBooksLoading, setIsBooksLoading] = useState(false);
  const [voices, setVoices] = useState([]);
  const [voiceURI, setVoiceURI] = useState("");

  const API_BASE = "http://localhost:5050";

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  const fetchBooks = async () => {
    try {
      setIsBooksLoading(true);
      const res = await fetch(`${API_BASE}/api/books`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setBooks(Array.isArray(data.books) ? data.books : []);
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setIsBooksLoading(false);
    }
  };

  const loadBookDetails = async (id) => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/books/${id}`, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const title = data.book?.title || "";
      const chapters = Array.isArray(data.chapters) ? data.chapters : [];
      const combined = chapters
        .sort((a, b) => (a.idx ?? 0) - (b.idx ?? 0))
        .map((c) => c.content || "")
        .join("\n\n");
      setBookTitle(title);
      setStory(combined);
      const nextIdx = chapters.length
        ? Math.max(...chapters.map((c) => c.idx || 0)) + 1
        : 1;
      setChapterIdx(nextIdx);
    } catch (err) {
      console.error("Error loading book:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // initial load of user's books
    fetchBooks();
    // load TTS voices
    if (supportsTTS()) {
      loadVoices().then((v) => {
        const list = Array.isArray(v) ? v : getVoices();
        const curated = curateVoices(list);
        setVoices(curated);
        const preferred = curated[0] || list[0];
        if (preferred) setVoiceURI(preferred.voiceURI || preferred.name || "");
      });
    }
    // Stop TTS when unmounting or when user logs out
    return () => {
      try {
        stop();
      } catch (_) {}
    };
  }, []);

  const handleCreateBook = async () => {
    if (!bookTitle.trim() || isLoading) return;
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/books`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: bookTitle.trim() }),
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      // Check if response is JSON before parsing
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      if (data.book?.id) {
        setBookId(data.book.id);
      }
    } catch (err) {
      console.error("Error creating book:", err);
      if (err.message && err.message.includes("Failed to fetch")) {
        alert(
          "Unable to connect to server. Please make sure the backend is running."
        );
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
        headers: getAuthHeaders(),
        body: JSON.stringify({ prompt: input, bookId, idx: chapterIdx }),
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      // Check if response is JSON before parsing
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setStory((prev) => (prev ? prev + "\n\n" : "") + (data.story || ""));
      setChapterIdx((prev) => prev + 1);
      setInput("");
    } catch (err) {
      console.error("Error continuing story:", err);
      if (err.message && err.message.includes("Failed to fetch")) {
        alert(
          "Unable to connect to server. Please make sure the backend is running."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRead = async () => {
    if (!story.trim()) return;
    if (!supportsTTS()) {
      alert("Sorry, your browser doesn't support text-to-speech.");
      return;
    }

    if (speaking || isSpeaking()) {
      stop();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    try {
      await speak(story, { voiceURI: voiceURI || undefined });
    } catch (e) {
      console.error("TTS error:", e);
    } finally {
      setSpeaking(false);
    }
  };

  const handleSelectBook = async (e) => {
    const id = e.target.value || null;
    setBookId(id);
    if (id) {
      await loadBookDetails(id);
    } else {
      // Reset state when no book selected
      setBookTitle("");
      setStory("");
      setChapterIdx(1);
    }
  };

  return (
    <div className="min-h-full flex items-start sm:items-center justify-center py-10 sm:py-16">
      <div className="w-full max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1"></div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900">
                Storytime with Dan-AI
              </h1>
              <p className="mt-2 text-gray-600">
                Generate and continue stories with AI. Craft the next scene
                below.
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600">{user?.email}</p>
                <button
                  onClick={onLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 mt-1"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="mb-4 sm:mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pick an existing book
            </label>
            <div className="flex gap-3">
              <select
                value={bookId || ""}
                onChange={handleSelectBook}
                className="textarea"
              >
                <option value="">— Select a book —</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={fetchBooks}
                className="btn-primary whitespace-nowrap"
              >
                {isBooksLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
            {bookId && (
              <p className="mt-2 text-xs text-gray-500">Book ID: {bookId}</p>
            )}
          </div>

          <div className="mb-4 sm:mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or create a new book
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
                onClick={async () => {
                  await handleCreateBook();
                  // refresh list and select the new book
                  await fetchBooks();
                }}
                disabled={isLoading || !bookTitle.trim()}
                className="btn-primary whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Start Book
              </button>
            </div>
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
          {!bookId && (
            <p className="mt-2 text-xs text-gray-500">
              Tip: Select or create a book to save new chapters to your
              database.
            </p>
          )}
        </div>

        <div className="mt-6 sm:mt-8 card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-lg font-medium text-gray-900">
              Story{bookTitle ? ` — ${bookTitle}` : ""}
            </h2>
            <div className="flex items-center gap-2">
              {supportsTTS() && (
                <select
                  className="textarea py-2 px-3"
                  value={voiceURI}
                  onChange={(e) => setVoiceURI(e.target.value)}
                  title="Choose a voice"
                >
                  {voices.length === 0 ? (
                    <option value="">Loading voices…</option>
                  ) : (
                    voices.map((v) => (
                      <option
                        key={v.voiceURI || v.name}
                        value={v.voiceURI || v.name}
                      >
                        {`${v.lang || ""} — ${v.name}`}
                      </option>
                    ))
                  )}
                </select>
              )}
              <button
                type="button"
                onClick={handleToggleRead}
                disabled={!story.trim()}
                className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                title={
                  supportsTTS()
                    ? "Let the browser read the story aloud"
                    : "TTS not supported"
                }
              >
                {speaking || isSpeaking() ? "Stop reading" : "Read it to me"}
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-gray-800 text-base leading-7 min-h-[4rem]">
            {story || "Your story will appear here..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
