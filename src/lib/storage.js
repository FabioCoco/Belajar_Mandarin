// Satu-satunya pintu akses localStorage. Semua dibungkus try/catch karena
// storage bisa melempar error (mode privat, diblokir, penuh).
const PREFIX = 'pbm:';

export function loadJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* abaikan */
  }
}
