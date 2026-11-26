// ============================================================
// VPS Academy – Cloud Database Sync API (Vercel Serverless Function)
// Đồng bộ dữ liệu Người dùng, Khóa học, Bài kiểm tra & Kết quả
// giữa máy Admin và tất cả thiết bị/trình duyệt của nhân sự.
// ============================================================

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const gistId = process.env.VPS_GIST_ID;
  const ghToken = process.env.VPS_GH_TOKEN;

  if (!gistId || !ghToken) {
    return res.status(503).json({
      ok: false,
      error: 'Cloud Database chưa được cấu hình (Missing VPS_GIST_ID / VPS_GH_TOKEN)'
    });
  }

  const gistApiUrl = `https://api.github.com/gists/${gistId}`;
  const ghHeaders = {
    'Authorization': `Bearer ${ghToken}`,
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'VPS-Academy-CloudSync/2.6',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  async function readCloudDB() {
    const r = await fetch(gistApiUrl, { headers: ghHeaders, cache: 'no-store' });
    if (!r.ok) {
      throw new Error(`GitHub Gist read failed: ${r.status}`);
    }
    const gist = await r.json();
    const file = gist.files && gist.files['vps_cloud_db.json'];
    if (!file || !file.content) {
      return { users: [], courses: null, lessons: null, quizzes: null, categories: null, results: [], enrollments: [], progress: [], settings: null };
    }
    try {
      return JSON.parse(file.content);
    } catch {
      return { users: [], courses: null, lessons: null, quizzes: null, categories: null, results: [], enrollments: [], progress: [], settings: null };
    }
  }

  async function writeCloudDB(dbObj) {
    dbObj.updatedAt = new Date().toISOString();
    const r = await fetch(gistApiUrl, {
      method: 'PATCH',
      headers: { ...ghHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: {
          'vps_cloud_db.json': {
            content: JSON.stringify(dbObj)
          }
        }
      })
    });
    if (!r.ok) {
      throw new Error(`GitHub Gist write failed: ${r.status}`);
    }
    return dbObj;
  }

  try {
    if (req.method === 'GET') {
      const db = await readCloudDB();
      return res.status(200).json({ ok: true, data: db });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const current = await readCloudDB();

      // 1. Merge / Update Users
      if (Array.isArray(body.users)) {
        if (body.replaceUsers === true) {
          current.users = body.users;
        } else {
          const map = new Map();
          (current.users || []).forEach(u => {
            if (u && u.email) map.set(u.email.trim().toLowerCase(), u);
          });
          body.users.forEach(u => {
            if (u && u.email) {
              const key = u.email.trim().toLowerCase();
              map.set(key, { ...(map.get(key) || {}), ...u, email: key });
            }
          });
          current.users = Array.from(map.values());
        }
      }

      // Single user upsert or delete
      if (body.upsertUser && body.upsertUser.email) {
        const u = body.upsertUser;
        const cleanEmail = u.email.trim().toLowerCase();
        const list = Array.isArray(current.users) ? current.users : [];
        const idx = list.findIndex(x => String(x.id) === String(u.id) || (x.email || '').trim().toLowerCase() === cleanEmail);
        if (idx >= 0) {
          list[idx] = { ...list[idx], ...u, email: cleanEmail };
        } else {
          list.push({ ...u, email: cleanEmail });
        }
        current.users = list;
      }

      if (body.deleteUserId !== undefined) {
        const delId = String(body.deleteUserId);
        const delEmail = (body.deleteUserEmail || '').trim().toLowerCase();
        current.users = (current.users || []).filter(u =>
          String(u.id) !== delId && (!delEmail || (u.email || '').trim().toLowerCase() !== delEmail)
        );
      }

      // 2. Update Courses / Lessons / Quizzes / Categories / Settings if provided
      if (Array.isArray(body.courses)) current.courses = body.courses;
      if (Array.isArray(body.lessons)) current.lessons = body.lessons;
      if (Array.isArray(body.quizzes)) current.quizzes = body.quizzes;
      if (Array.isArray(body.categories)) current.categories = body.categories;
      if (body.settings && typeof body.settings === 'object') current.settings = body.settings;

      // 3. Merge Results, Enrollments, Progress (so student results sync back to Admin)
      if (Array.isArray(body.results)) {
        const rMap = new Map();
        (current.results || []).forEach(r => rMap.set(`${r.userId}_${r.courseId}`, r));
        body.results.forEach(r => rMap.set(`${r.userId}_${r.courseId}`, r));
        current.results = Array.from(rMap.values());
      }
      if (Array.isArray(body.enrollments)) {
        const eMap = new Map();
        (current.enrollments || []).forEach(e => eMap.set(`${e.userId}_${e.courseId}`, e));
        body.enrollments.forEach(e => eMap.set(`${e.userId}_${e.courseId}`, e));
        current.enrollments = Array.from(eMap.values());
      }
      if (Array.isArray(body.progress)) {
        const pMap = new Map();
        (current.progress || []).forEach(p => pMap.set(`${p.userId}_${p.courseId}`, p));
        body.progress.forEach(p => {
          const key = `${p.userId}_${p.courseId}`;
          const prev = pMap.get(key);
          if (prev) {
            const mergedLessons = Array.from(new Set([...(prev.completedLessons || []), ...(p.completedLessons || [])]));
            pMap.set(key, { ...prev, ...p, completedLessons: mergedLessons });
          } else {
            pMap.set(key, p);
          }
        });
        current.progress = Array.from(pMap.values());
      }

      const saved = await writeCloudDB(current);
      return res.status(200).json({ ok: true, data: saved });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
};
