(function (G) {
  const KEY = 'bokchi-save-v1';

  G.storage = {
    load() {
      try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },
    save(state) {
      try {
        state.meta.savedAt = Date.now();
        localStorage.setItem(KEY, JSON.stringify(state));
        return true;
      } catch (e) {
        return false;
      }
    },
    wipe() {
      try { localStorage.removeItem(KEY); } catch (e) { /* 무시 */ }
    },
  };
})(globalThis.G);
