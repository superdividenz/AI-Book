// Simple Web Speech API wrapper for text-to-speech

let currentUtterance = null;

export function supportsTTS() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stop() {
  try {
    if (supportsTTS()) {
      window.speechSynthesis.cancel();
    }
  } catch (_) {
    // no-op
  } finally {
    currentUtterance = null;
  }
}

export function isSpeaking() {
  return supportsTTS() && window.speechSynthesis.speaking;
}

export function getVoices() {
  if (!supportsTTS()) return [];
  try {
    return window.speechSynthesis.getVoices?.() || [];
  } catch (_) {
    return [];
  }
}

export function loadVoices(timeoutMs = 2000) {
  return new Promise((resolve) => {
    if (!supportsTTS()) return resolve([]);

    const existing = getVoices();
    if (existing.length > 0) return resolve(existing);

    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      resolve(getVoices());
    };

    const onChange = () => finish();
    window.speechSynthesis.onvoiceschanged = onChange;
    // Fallback in case event never fires
    setTimeout(finish, timeoutMs);
  });
}

// Return a small curated list of English voices if available
export function curateVoices(allVoices) {
  const voices = Array.isArray(allVoices) ? allVoices : getVoices();
  if (!voices || voices.length === 0) return [];

  const regions = [
    /en(-|_)?US/i,
    /en(-|_)?GB/i,
    /en(-|_)?AU/i,
    /en(-|_)?CA/i,
    /en(-|_)?IN/i,
  ];

  const picked = [];
  const seen = new Set();
  for (const re of regions) {
    const v = voices.find((vv) => re.test(vv.lang) && !seen.has(vv.voiceURI || vv.name));
    if (v) {
      picked.push(v);
      seen.add(v.voiceURI || v.name);
    }
  }
  // If not enough, fill with first few remaining distinct voices
  if (picked.length < 3) {
    for (const v of voices) {
      const key = v.voiceURI || v.name;
      if (!seen.has(key)) {
        picked.push(v);
        seen.add(key);
      }
      if (picked.length >= 5) break;
    }
  }
  return picked.slice(0, 5);
}

export function speak(text, { rate = 1, pitch = 1, volume = 1, voiceURI, voiceName } = {}) {
  return new Promise((resolve, reject) => {
    if (!supportsTTS()) {
      return reject(new Error("Text-to-speech is not supported in this browser."));
    }

    if (!text || !text.trim()) {
      return resolve();
    }

    // Stop any existing speech first
    stop();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = volume;

    // Choose a voice if requested, else pick an English default
    const setPreferredVoice = () => {
      try {
        const voices = getVoices();
        let chosen = null;
        if (voiceURI) {
          chosen = voices.find((v) => v.voiceURI === voiceURI) || null;
        }
        if (!chosen && voiceName) {
          chosen = voices.find((v) => v.name === voiceName) || null;
        }
        if (!chosen) {
          chosen = voices.find((v) => /en(-|_)?(US|GB)?/i.test(v.lang)) || voices[0];
        }
        if (chosen) utter.voice = chosen;
      } catch (_) {
        // ignore voice selection errors
      }
    };

    setPreferredVoice();
    // Some browsers load voices async
    if (getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => setPreferredVoice();
    }

    utter.onend = () => {
      currentUtterance = null;
      resolve();
    };
    utter.onerror = (e) => {
      currentUtterance = null;
      reject(e.error || new Error("TTS error"));
    };

    currentUtterance = utter;
    window.speechSynthesis.speak(utter);
  });
}
