export function requestNotificationPermission() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function notify(title, body) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "granted") {
    try {
      new Notification(title, { body });
    } catch (e) {
      // Some browsers throw if not focused correctly; fail silently.
    }
  }
}

// Each alarm sound is defined as a small sequence of [frequency, startOffset, duration].
const ALARM_PATTERNS = {
  chime: {
    label: "Chime",
    wave: "sine",
    notes: [
      [523.25, 0, 0.5],
      [659.25, 0.15, 0.5],
      [783.99, 0.3, 0.55],
    ],
  },
  bell: {
    label: "Bell",
    wave: "triangle",
    notes: [
      [880, 0, 0.9],
      [880, 0.35, 0.6],
    ],
  },
  digital: {
    label: "Digital Beep",
    wave: "square",
    notes: [
      [660, 0, 0.12],
      [660, 0.18, 0.12],
      [660, 0.36, 0.12],
    ],
  },
  gentle: {
    label: "Gentle Tone",
    wave: "sine",
    notes: [
      [392, 0, 0.8],
      [523.25, 0.4, 0.9],
    ],
  },
};

export const ALARM_SOUND_OPTIONS = Object.entries(ALARM_PATTERNS).map(([id, v]) => ({
  id,
  label: v.label,
}));

export function playChime(soundId = "chime", volume = 0.5) {
  const pattern = ALARM_PATTERNS[soundId] || ALARM_PATTERNS.chime;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioCtx();
    const clampedVolume = Math.min(1, Math.max(0, volume));
    pattern.notes.forEach(([freq, offset, duration]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = pattern.wave;
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = ctx.currentTime + offset;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(clampedVolume * 0.4, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.start(start);
      osc.stop(start + duration + 0.05);
    });
  } catch (e) {
    // Audio not available; fail silently.
  }
}

export function previewSound(soundId, volume) {
  playChime(soundId, volume);
}
