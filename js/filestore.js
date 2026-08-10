// ============================================================
// VPS Academy – File Store (IndexedDB + localStorage fallback)
// Lưu trữ video/tài liệu upload từ máy tính của Admin
// ============================================================

const FileStore = (() => {
  const DB_NAME    = 'vps_filestore';
  const DB_VERSION = 1;
  const STORE_NAME = 'files';
  const META_KEY   = 'vps_file_meta'; // localStorage key cho metadata

  let db = null;

  // ── Khởi tạo IndexedDB ────────────────────────────────────
  function openDB() {
    return new Promise((resolve, reject) => {
      if (db) { resolve(db); return; }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE_NAME)) {
          d.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror   = () => reject(req.error);
    });
  }

  // ── Lưu file vào IndexedDB ────────────────────────────────
  async function saveFile(fileId, file, onProgress) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onprogress = e => {
        if (onProgress && e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      reader.onload = () => {
        const dataUrl = reader.result;
        const tx = d.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({
          id: fileId,
          data: dataUrl,
          name: file.name,
          type: file.type,
          size: file.size,
          savedAt: new Date().toISOString(),
        });
        tx.oncomplete = () => {
          // Lưu metadata vào localStorage
          const meta = getMeta();
          meta[fileId] = { name: file.name, type: file.type, size: file.size, savedAt: new Date().toISOString() };
          saveMeta(meta);
          resolve(dataUrl);
        };
        tx.onerror = () => reject(tx.error);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // ── Đọc file từ IndexedDB ─────────────────────────────────
  async function getFile(fileId) {
    const d = await openDB();
    return new Promise((resolve) => {
      const tx = d.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(fileId);
      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror   = () => resolve(null);
    });
  }

  // ── Xóa file ──────────────────────────────────────────────
  async function deleteFile(fileId) {
    const d = await openDB();
    return new Promise((resolve) => {
      const tx = d.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(fileId);
      tx.oncomplete = () => {
        const meta = getMeta();
        delete meta[fileId];
        saveMeta(meta);
        resolve();
      };
    });
  }

  // ── Metadata helpers ──────────────────────────────────────
  function getMeta() {
    try { return JSON.parse(localStorage.getItem(META_KEY) || '{}'); } catch { return {}; }
  }
  function saveMeta(m) { localStorage.setItem(META_KEY, JSON.stringify(m)); }
  function getFileMeta(fileId) { return getMeta()[fileId] || null; }

  // ── Format file size ──────────────────────────────────────
  function formatSize(bytes) {
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1024*1024)  return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024*1024)).toFixed(1) + ' MB';
  }

  // ── Tạo fileId từ bài học + loại ─────────────────────────
  function makeId(lessonId, type) {
    return `lesson_${lessonId}_${type}`;
  }

  return { saveFile, getFile, deleteFile, getFileMeta, getMeta, makeId, formatSize };
})();
