// ============================================================
// VPS Academy – Enterprise Auth & VPS-Shield™ Security Module
// Bảo mật đa lớp cấp cao cho Tập Đoàn VPS
// ============================================================

const VPSSecurity = (() => {
  const SECRET_SALT = 'VPS_GROUP_SHIELD_2026_ENTERPRISE_KEY_9988';
  const RATE_LIMIT_KEY = 'vps_login_guard';
  const SEC_LOG_KEY = 'vps_security_logs';
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 phút
  const SESSION_TIMEOUT_MS = 45 * 60 * 1000; // 45 phút không tương tác

  // ── 1. Hàm tạo chữ ký số chống giả mạo Session (HMAC-like Hash) ──
  function computeSignature(payloadStr) {
    const raw = payloadStr + '|' + SECRET_SALT;
    let h1 = 0xdeadbeef ^ raw.length;
    let h2 = 0x41c6ce57 ^ raw.length;
    for (let i = 0, ch; i < raw.length; i++) {
      ch = raw.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 'vps_sig_' + (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
  }

  function signSession(user) {
    const now = Date.now();
    const sessionId = 'SID-' + now.toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const core = `${user.id}|${user.role}|${user.email}|${sessionId}`;
    return {
      userId: user.id,
      role: user.role,
      email: user.email,
      sessionId: sessionId,
      loginAt: new Date(now).toISOString(),
      lastActive: now,
      sig: computeSignature(core)
    };
  }

  function verifySession(session) {
    if (!session || !session.userId || !session.role) return false;
    // Hỗ trợ nâng cấp tự động cho phiên cũ chưa có chữ ký
    if (!session.sig || !session.sessionId) {
      const u = typeof UserDB !== 'undefined' ? UserDB.getById(session.userId) : null;
      if (u && u.role === session.role) {
        const upgraded = signSession(u);
        localStorage.setItem(DB_KEYS.session, JSON.stringify(upgraded));
        return true;
      }
      return false;
    }
    const core = `${session.userId}|${session.role}|${session.email}|${session.sessionId}`;
    const expectedSig = computeSignature(core);
    if (session.sig !== expectedSig) {
      logEvent('CRITICAL', 'Phát hiện can thiệp trái phép vào Session (Tampering blocked)');
      return false;
    }
    // Kiểm tra timeout không tương tác
    if (session.lastActive && (Date.now() - session.lastActive > SESSION_TIMEOUT_MS)) {
      logEvent('WARNING', `Phiên đăng nhập của ${session.email} hết hạn do không hoạt động`);
      return false;
    }
    return true;
  }

  // ── 2. Chống Brute-Force (Giới hạn đăng nhập sai) ──────────
  function getRateData() {
    try { return JSON.parse(localStorage.getItem(RATE_LIMIT_KEY) || '{}'); }
    catch { return {}; }
  }

  function checkRateLimit(email) {
    const key = (email || 'global').toLowerCase();
    const data = getRateData();
    const record = data[key];
    if (!record) return { allowed: true };

    if (record.lockedUntil && Date.now() < record.lockedUntil) {
      const remainSec = Math.ceil((record.lockedUntil - Date.now()) / 1000);
      return {
        allowed: false,
        remainSec,
        message: `🛡️ Bảo mật VPS-Shield: Tài khoản tạm khóa do nhập sai quá ${MAX_FAILED_ATTEMPTS} lần. Thử lại sau ${remainSec} giây.`
      };
    }
    if (record.lockedUntil && Date.now() >= record.lockedUntil) {
      delete data[key];
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    }
    return { allowed: true };
  }

  function recordFailedLogin(email) {
    const key = (email || 'global').toLowerCase();
    const data = getRateData();
    const now = Date.now();
    const rec = data[key] || { count: 0, firstAt: now };
    rec.count += 1;
    rec.lastAt = now;

    if (rec.count >= MAX_FAILED_ATTEMPTS) {
      rec.lockedUntil = now + LOCKOUT_DURATION_MS;
      logEvent('ALERT', `Khóa tạm thời 5 phút đối với email "${key}" do đăng nhập sai ${rec.count} lần liên tiếp`);
    } else {
      logEvent('WARNING', `Đăng nhập thất bại (${rec.count}/${MAX_FAILED_ATTEMPTS}) cho tài khoản "${key}"`);
    }
    data[key] = rec;
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    return rec;
  }

  function clearRateLimit(email) {
    const key = (email || 'global').toLowerCase();
    const data = getRateData();
    if (data[key]) {
      delete data[key];
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    }
  }

  // ── 3. Nhật ký An ninh (Security Audit Logs) ────────────────
  function logEvent(level, detail) {
    try {
      const logs = JSON.parse(localStorage.getItem(SEC_LOG_KEY) || '[]');
      logs.unshift({
        id: Date.now(),
        time: new Date().toLocaleString('vi-VN'),
        level,
        detail
      });
      localStorage.setItem(SEC_LOG_KEY, JSON.stringify(logs.slice(0, 40)));
    } catch (e) {}
  }

  function getLogs() {
    try { return JSON.parse(localStorage.getItem(SEC_LOG_KEY) || '[]'); }
    catch { return []; }
  }

  // ── 4. Chống XSS (Input Sanitizer) ──────────────────────────
  function sanitize(str) {
    if (typeof str !== 'string') return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ── 5. Chống Sao chép, Chụp màn hình, In ấn & DevTools ─────
  function initContentProtection() {
    // Chặn phím tắt nguy hiểm
    document.addEventListener('keydown', (e) => {
      const key = (e.key || '').toLowerCase();
      const isInspect =
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (e.ctrlKey && ['u', 's', 'p'].includes(key));

      if (isInspect) {
        e.preventDefault();
        e.stopPropagation();
        logEvent('WARNING', `Chặn tổ hợp phím bảo mật: ${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key}`);
        if (typeof showToast === 'function') {
          showToast('🛡️ VPS-Shield™: Tính năng lưu/in/kiểm tra mã nguồn đã bị khóa để bảo vệ bản quyền Tập Đoàn VPS!', 'warning');
        }
        return false;
      }
    });

    // Phát hiện phím PrintScreen
    document.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('🔒 NỘI DUNG BẢO MẬT TẬP ĐOÀN VPS - NGHIÊM CẤM CHỤP MÀN HÌNH').catch(() => {});
        }
        logEvent('ALERT', 'Phát hiện thao tác chụp màn hình (PrintScreen)');
        if (typeof showToast === 'function') {
          showToast('🛡️ Cảnh báo Bảo mật: Nghiêm cấm chụp màn hình hoặc phát tán tài liệu nội bộ Tập Đoàn VPS!', 'error');
        }
      }
    });

    // Chặn chuột phải trên vùng video, tài liệu, bài thi, hoặc trang bài học
    document.addEventListener('contextmenu', (e) => {
      const isProtectedArea =
        document.body.dataset.page === 'lesson' ||
        window.location.pathname.includes('lesson.html') ||
        window.location.pathname.includes('quiz.html') ||
        e.target.closest('video, iframe, .video-wrapper, #lessonDocArea, #quizApp, .course-thumb, .logo-icon');

      if (isProtectedArea) {
        e.preventDefault();
        if (typeof showToast === 'function') {
          showToast('🛡️ Nội dung được bảo vệ bản quyền bởi Tập Đoàn VPS', 'info', 2000);
        }
      }
    });

    // Chặn kéo thả lưu ảnh/video
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
        e.preventDefault();
      }
    });
  }

  // ── 6. Watermark Định danh Động chống Quay màn hình ─────────
  function initDynamicWatermark() {
    const user = Auth.getCurrentUser();
    const labelName = user ? `${user.name} (${user.email})` : 'Khách truy cập';
    const session = Auth.getSession();
    const sid = session && session.sessionId ? session.sessionId : 'VPS-PROTECTED';

    const targets = document.querySelectorAll('#videoWrap, #lessonDocArea, .quiz-card');
    if (!targets.length) return;

    targets.forEach((container) => {
      if (container.querySelector('.vps-dynamic-watermark')) return;
      const computedPos = window.getComputedStyle(container).position;
      if (computedPos === 'static') container.style.position = 'relative';

      const wm = document.createElement('div');
      wm.className = 'vps-dynamic-watermark';
      container.appendChild(wm);

      function updateWM() {
        const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        wm.textContent = `🛡️ TẬP ĐOÀN VPS • ${labelName} • ${sid} • ${nowStr}`;
        const topPct = 12 + Math.floor(Math.random() * 68);
        const leftPct = 6 + Math.floor(Math.random() * 48);
        wm.style.top = topPct + '%';
        wm.style.left = leftPct + '%';
      }
      updateWM();
      setInterval(updateWM, 4500);
    });
  }

  // ── 7. Tự động gia hạn nhịp tim phiên & Kiểm tra Inactivity ──
  function initSessionHeartbeat() {
    const updateActivity = () => {
      try {
        const raw = localStorage.getItem(DB_KEYS.session);
        if (!raw) return;
        const s = JSON.parse(raw);
        if (s && Date.now() - (s.lastActive || 0) > 30000) {
          s.lastActive = Date.now();
          localStorage.setItem(DB_KEYS.session, JSON.stringify(s));
        }
      } catch (e) {}
    };
    ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach((evt) => {
      window.addEventListener(evt, updateActivity, { passive: true });
    });
  }

  // ── 8. Ẩn nút Bảo mật VPS trên giao diện theo yêu cầu ────
  function initSecurityBadge() {
    const existing = document.getElementById('vpsShieldBtn');
    if (existing) existing.remove();
  }

  function openSecurityModal() {
    let modal = document.getElementById('vpsSecurityModal');
    if (modal) modal.remove();

    const user = Auth.getCurrentUser();
    const session = Auth.getSession();
    const logs = getLogs().slice(0, 6);

    modal = document.createElement('div');
    modal.id = 'vpsSecurityModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,25,55,0.75);backdrop-filter:blur(8px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:16px;';
    modal.innerHTML = `
      <div style="background:#ffffff;border:3px solid #0284c7;border-bottom:8px solid #0054a6;border-radius:24px;max-width:580px;width:100%;overflow:hidden;box-shadow:0 25px 60px rgba(0,0,0,0.45);animation:fadeInUp .25s ease;">
        <div style="background:linear-gradient(135deg,#002b59 0%,#0054a6 55%,#0ea5e9 100%);padding:18px 24px;color:white;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:42px;height:42px;background:#fff;border-radius:12px;padding:3px;display:flex;align-items:center;justify-content:center;border:2px solid #38bdf8;">
              <img src="images/logo-vps.png" alt="VPS" style="width:100%;height:100%;object-fit:contain;">
            </div>
            <div>
              <div style="font-size:17px;font-weight:900;letter-spacing:0.3px;">🛡️ Trung Tâm Bảo Mật VPS-Shield™</div>
              <div style="font-size:11.5px;color:#7dd3fc;font-weight:700;">CẤP ĐỘ BẢO VỆ: ENTERPRISE LEVEL 5 (CAO NHẤT)</div>
            </div>
          </div>
          <button onclick="document.getElementById('vpsSecurityModal').remove()" style="background:rgba(255,255,255,0.2);color:white;border:none;width:32px;height:32px;border-radius:50%;font-size:16px;cursor:pointer;font-weight:700;">✕</button>
        </div>
        <div style="padding:20px 24px;max-height:75vh;overflow-y:auto;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
            <div style="background:#f0f7ff;border:1.5px solid #c5d9ed;border-radius:12px;padding:10px 12px;">
              <div style="font-size:11px;color:#526f8e;font-weight:700;">TRẠNG THÁI PHIÊN</div>
              <div style="font-size:13px;font-weight:800;color:#0054a6;margin-top:2px;">${session ? '🔒 Đã ký số (' + session.sessionId + ')' : '🌐 Phiên công khai bảo vệ'}</div>
            </div>
            <div style="background:#ecfdf5;border:1.5px solid #a7f3d0;border-radius:12px;padding:10px 12px;">
              <div style="font-size:11px;color:#047857;font-weight:700;">CHỐNG GIAN LẬN HỌC TẬP</div>
              <div style="font-size:13px;font-weight:800;color:#059669;margin-top:2px;">✅ Chống tua &amp; Chống tải file</div>
            </div>
          </div>

          <div style="font-size:12.5px;font-weight:800;color:#00356b;text-transform:uppercase;margin-bottom:10px;">7 Lớp Lá Chắn An Ninh Đang Kích Hoạt:</div>
          <div style="display:flex;flex-direction:column;gap:8px;font-size:12.5px;color:#1e3a5f;margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fbff;border-radius:10px;border-left:4px solid #0054a6;">
              <span>🔐</span><div><strong>Chữ ký số Session (Anti-Tamper):</strong> Ngăn chặn chỉnh sửa quyền hạn từ trình duyệt.</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fbff;border-radius:10px;border-left:4px solid #0ea5e9;">
              <span>🛑</span><div><strong>Chống Brute-Force:</strong> Tự động khóa 5 phút nếu đăng nhập sai 5 lần liên tiếp.</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fbff;border-radius:10px;border-left:4px solid #0054a6;">
              <span>⏪</span><div><strong>Chống tua Video &amp; Rời màn hình:</strong> Tua video bị học lại từ đầu; chuyển tab tự động dừng video.</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fbff;border-radius:10px;border-left:4px solid #0ea5e9;">
              <span>🏷️</span><div><strong>Watermark Định danh Động:</strong> Hiển thị tên, email &amp; mã phiên di chuyển trên video và tài liệu.</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8fbff;border-radius:10px;border-left:4px solid #0054a6;">
              <span>🚫</span><div><strong>Chặn Tải tài liệu, In ấn &amp; Phím tắt:</strong> Khóa Ctrl+S, Ctrl+P, Ctrl+U, F12, PrintScreen.</div>
            </div>
          </div>

          ${logs.length ? `
            <div style="font-size:12px;font-weight:800;color:#526f8e;text-transform:uppercase;margin-bottom:6px;">Nhật ký giám sát an ninh gần nhất:</div>
            <div style="background:#0f2540;color:#e2e8f0;border-radius:12px;padding:10px 12px;font-family:monospace;font-size:11px;max-height:110px;overflow-y:auto;">
              ${logs.map(l => `<div style="margin-bottom:4px;"><span style="color:#ffd700;">[${l.time}]</span> <span style="color:${l.level === 'CRITICAL' || l.level === 'ALERT' ? '#ff6b6b' : '#38bdf8'};font-weight:700;">${l.level}:</span> ${sanitize(l.detail)}</div>`).join('')}
            </div>
          ` : ''}

          <div style="margin-top:16px;text-align:right;">
            <button onclick="document.getElementById('vpsSecurityModal').remove()" class="btn-3d btn-3d-primary" style="padding:10px 24px;">Đã hiểu</button>
          </div>
        </div>
      </div>
    `;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    document.body.appendChild(modal);
  }

  return {
    signSession,
    verifySession,
    checkRateLimit,
    recordFailedLogin,
    clearRateLimit,
    logEvent,
    getLogs,
    sanitize,
    initContentProtection,
    initDynamicWatermark,
    initSessionHeartbeat,
    initSecurityBadge,
    openSecurityModal
  };
})();

window.VPSSecurity = VPSSecurity;

// ============================================================
// Auth Controller
// ============================================================
const Auth = {
  // Get & verify current session
  getSession() {
    try {
      const raw = localStorage.getItem(DB_KEYS.session);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (!VPSSecurity.verifySession(session)) {
        localStorage.removeItem(DB_KEYS.session);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  },

  // Check if logged in
  isLoggedIn() { return !!this.getSession(); },

  // Get current user
  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    return UserDB.getById(session.userId);
  },

  // Login with Rate Limit & Signed Session
  login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. Check Brute-Force Lockout
    const guard = VPSSecurity.checkRateLimit(cleanEmail);
    if (!guard.allowed) {
      return { success: false, message: guard.message };
    }

    const user = UserDB.getByEmail(cleanEmail);
    if (!user) {
      VPSSecurity.recordFailedLogin(cleanEmail);
      return { success: false, message: 'Email không tồn tại trong hệ thống' };
    }
    if (user.password !== password) {
      const rec = VPSSecurity.recordFailedLogin(cleanEmail);
      const remain = Math.max(0, 5 - rec.count);
      return {
        success: false,
        message: remain > 0
          ? `Mật khẩu không chính xác (Còn ${remain} lần thử trước khi khóa bảo mật)`
          : 'Tài khoản đã bị tạm khóa 5 phút do nhập sai 5 lần!'
      };
    }
    if (user.status !== 'active') {
      return { success: false, message: 'Tài khoản đã bị vô hiệu hóa' };
    }

    // 2. Clear failed attempts & create signed session
    VPSSecurity.clearRateLimit(cleanEmail);
    const signedSession = VPSSecurity.signSession(user);
    localStorage.setItem(DB_KEYS.session, JSON.stringify(signedSession));
    VPSSecurity.logEvent('INFO', `Đăng nhập thành công: ${user.email} (${user.role})`);
    return { success: true, user };
  },

  // Logout
  logout() {
    const u = this.getCurrentUser();
    if (u) VPSSecurity.logEvent('INFO', `Đăng xuất tài khoản: ${u.email}`);
    localStorage.removeItem(DB_KEYS.session);
    window.location.href = 'auth.html';
  },

  // Check role permission
  hasRole(role) {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.role === role;
  },

  // Toàn quyền Tập đoàn: Admin, CEO, Tổng Giám Đốc
  hasFullAccess(userObj) {
    const user = userObj || this.getCurrentUser();
    if (!user) return false;
    return ['admin', 'ceo', 'general_director'].includes(user.role);
  },

  // Giám đốc Đơn vị thành viên
  isUnitDirector(userObj) {
    const user = userObj || this.getCurrentUser();
    if (!user) return false;
    return user.role === 'unit_director';
  },

  // Được phép truy cập trang Quản trị (Admin, CEO, TGĐ, Giám đốc Đơn vị)
  canAccessAdmin(userObj) {
    const user = userObj || this.getCurrentUser();
    return this.hasFullAccess(user) || this.isUnitDirector(user);
  },

  // Check if admin / full access
  isAdmin() { return this.canAccessAdmin(); },

  // Can access course (kiểm tra cả Vai trò và Đơn vị)
  canAccessCourse(course) {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (this.hasFullAccess(user)) return true;
    const roleAllowed = this.isUnitDirector(user) || (course.allowedRoles || []).includes(user.role);
    const unitAllowed = !course.allowedUnits || !course.allowedUnits.length || course.allowedUnits.includes('ALL') || !user.unit || course.allowedUnits.includes(user.unit);
    return roleAllowed && unitAllowed;
  },

  // Require login – redirect to auth if not logged in
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = 'auth.html';
      return false;
    }
    return true;
  },

  // Require admin or unit director – redirect if not authorized
  requireAdmin() {
    if (!this.isLoggedIn()) {
      window.location.href = 'auth.html';
      return false;
    }
    if (!this.canAccessAdmin()) {
      VPSSecurity.logEvent('ALERT', 'Ngăn chặn truy cập trái phép vào trang Quản trị (Admin Panel)');
      showToast('🛡️ Bạn không có quyền truy cập trang Quản trị!', 'error');
      setTimeout(() => window.location.href = 'index.html', 1200);
      return false;
    }
    return true;
  },

  // Update password
  updatePassword(userId, oldPass, newPass) {
    const user = UserDB.getById(userId);
    if (!user) return { success: false, message: 'Không tìm thấy người dùng' };
    if (user.password !== oldPass) return { success: false, message: 'Mật khẩu cũ không đúng' };
    UserDB.update(userId, { password: newPass });
    VPSSecurity.logEvent('INFO', `Đổi mật khẩu thành công cho user ID ${userId}`);
    return { success: true };
  },
};

// ─── Toast Notification ───────────────────────────────────────
function showToast(message, type = 'success', duration = 3000) {
  const existing = document.querySelector('.vps-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `vps-toast vps-toast--${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: '🛡️' };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, duration);
}

// ─── Modal Helper ─────────────────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) { modal.style.display = 'none'; document.body.style.overflow = ''; }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
    document.body.style.overflow = '';
  }
});

// ─── Update Header Auth State ─────────────────────────────────
function updateHeaderAuth() {
  const isAuthPage = window.location.pathname.endsWith('auth.html') || document.querySelector('.auth-page');
  if (!isAuthPage && !Auth.isLoggedIn()) {
    window.location.href = 'auth.html';
    return;
  }

  const user = Auth.getCurrentUser();
  const loginBtn = document.getElementById('loginBtn');
  const userMenu = document.getElementById('userMenu');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  const adminLink = document.getElementById('adminNavLink');
  const regBtn = document.getElementById('registerNavBtn');
  const roleBadge = document.getElementById('userRoleBadge');

  if (regBtn) regBtn.style.display = 'none';

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (userName) userName.textContent = user.name;
    if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();
    if (adminLink) adminLink.style.display = Auth.canAccessAdmin(user) ? 'flex' : 'none';
    if (roleBadge) {
      const rLabel = (typeof ROLE_LABELS !== 'undefined' && ROLE_LABELS[user.role]) ? ROLE_LABELS[user.role] : user.role;
      roleBadge.textContent = user.unit ? `${rLabel} • ${user.unit}` : rLabel;
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }
}

// Initialize Auth & VPS-Shield Security on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderAuth();
  VPSSecurity.initContentProtection();
  VPSSecurity.initSessionHeartbeat();
  VPSSecurity.initSecurityBadge();
  setTimeout(() => VPSSecurity.initDynamicWatermark(), 350);

  document.querySelectorAll('[data-action="logout"]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); Auth.logout(); });
  });

  const userAvatarBtn = document.getElementById('userAvatarBtn');
  const userDropdown = document.getElementById('userDropdown');
  if (userAvatarBtn && userDropdown) {
    userAvatarBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('open');
    });
    document.addEventListener('click', () => userDropdown.classList.remove('open'));
  }
});
