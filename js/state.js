const memory = new Map();

export const storage = {
  get(key, fallback = null) {
    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (err) {
      return memory.has(key) ? memory.get(key) : fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      memory.set(key, value);
    }
  },
};

let lastFocusedElement = null;

export function getLastFocused() {
  return lastFocusedElement;
}

export function setLastFocused(el) {
  lastFocusedElement = el;
}
