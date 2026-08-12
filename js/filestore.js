// ============================================================
// VPS Academy – File Store (IndexedDB + localStorage metadata)
// Lưu trữ video/tài liệu upload từ máy tính (lưu dạng Blob trực tiếp)
// ============================================================

const FileStore = (() => {
  const DB_NAME    = 'vps_filestore';
  const DB_VERSION = 1;
  const STORE_NAME = 'files';
  const META_KEY   = 'vps_file_meta';

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

  // ── Lưu file vào IndexedDB (Lưu dạng Blob/File trực tiếp - không cần FileReader) ──
  async function saveFile(fileId, fileBlob) {
    const d = await openDB();
    return new Promise((resolve, reject) => {
      const tx = d.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const record = {
        id: fileId,
        data: fileBlob, // Lưu trực tiếp đối tượng File/Blob
        name: fileBlob.name || 'file',
        type: fileBlob.type || 'application/octet-stream',
        size: fileBlob.size || 0,
        savedAt: new Date().toISOString(),
      };

      store.put(record);

      tx.oncomplete = () => {
        const meta = getMeta();
        meta[fileId] = {
          name: record.name,
          type: record.type,
          size: record.size,
          savedAt: record.savedAt
        };
        saveMeta(meta);
        resolve(record);
      };

      tx.onerror = () => reject(tx.error);
    });
  }

  // ── Đọc file từ IndexedDB (Trả về Blob object) ────────────
  async function getFile(fileId) {
    const d = await openDB();
    return new Promise((resolve) => {
      const tx = d.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(fileId);
      req.onsuccess = () => {
        if (!req.result || !req.result.data) {
          resolve(null);
          return;
        }
        const item = req.result.data;
        if (item instanceof Blob) {
          resolve(item);
        } else if (typeof item === 'string' && item.startsWith('data:')) {
          // Hỗ trợ ngược cho dữ liệu cũ lưu bằng DataURL base64
          resolve(dataUrlToBlob(item));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  }

  // Helper chuyển DataURL cũ sang Blob
  function dataUrlToBlob(dataUrl) {
    try {
      const [header, b64] = dataUrl.split(',');
      const mime = (header.match(/:(.*?);/) || [])[1] || 'application/octet-stream';
      const raw  = atob(b64);
      const arr  = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
      return new Blob([arr], { type: mime });
    } catch { return null; }
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
      tx.onerror = () => resolve();
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
    if (!bytes) return '0 B';
    if (bytes < 1024)       return bytes + ' B';
    if (bytes < 1024*1024)  return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024*1024)).toFixed(1) + ' MB';
  }

  return { saveFile, getFile, deleteFile, getFileMeta, getMeta, formatSize };
})();
