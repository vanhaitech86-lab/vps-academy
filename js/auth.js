// ============================================================
// VPS Academy – Auth Module
// ============================================================

const Auth = {
  // Get current session
  getSession() {
    try { return JSON.parse(localStorage.getItem(DB_KEYS.session)); }
    catch { return null; }
  },

  // Check if logged in
  isLoggedIn() { return !!this.getSession(); },

  // Get current user
  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    return UserDB.getById(session.userId);
  },

  // Login
  login(email, password) {
    const user = UserDB.getByEmail(email);
    if (!user) return { success: false, message: 'Email không tồn tại trong hệ thống' };
    if (user.password !== password) return { success: false, message: 'Mật khẩu không chính xác' };
    if (user.status !== 'active') return { success: false, message: 'Tài khoản đã bị vô hiệu hóa' };
    const session = { userId: user.id, role: user.role, loginAt: new Date().toISOString() };
    localStorage.setItem(DB_KEYS.session, JSON.stringify(session));
    return { success: true, user };
  },

  // Logout
  logout() {
    localStorage.removeItem(DB_KEYS.session);
    window.location.href = 'auth.html';
  },

  // Check role permission
  hasRole(role) {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.role === role;
  },

  // Check if admin
  isAdmin() { return this.hasRole('admin'); },

  // Can access course
  canAccessCourse(course) {
    const user = this.getCurrentUser();
    if (!user) return false;
    return course.allowedRoles.includes(user.role);
  },

  // Require login – redirect to auth if not logged in
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.href);
      return false;
    }
    return true;
  },

  // Require admin – redirect if not admin
  requireAdmin() {
    if (!this.isLoggedIn()) {
      window.location.href = 'auth.html';
      return false;
    }
    if (!this.isAdmin()) {
      showToast('Bạn không có quyền truy cập trang này', 'error');
      setTimeout(() => window.location.href = 'index.html', 1500);
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
    return { success: true };
  },
};

// ─── Toast Notification ───────────────────────────────────────
function showToast(message, type = 'success', duration = 3000) {
  const existing = document.querySelector('.vps-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `vps-toast vps-toast--${type}`;
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
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

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
    document.body.style.overflow = '';
  }
});

// ─── Update Header Auth State ─────────────────────────────────
function updateHeaderAuth() {
  const user = Auth.getCurrentUser();
  const loginBtn = document.getElementById('loginBtn');
  const userMenu = document.getElementById('userMenu');
  const userName = document.getElementById('userName');
  const userAvatar = document.getElementById('userAvatar');
  const adminLink = document.getElementById('adminNavLink');

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (userMenu) userMenu.style.display = 'flex';
    if (userName) userName.textContent = user.name;
    if (userAvatar) userAvatar.textContent = user.name.charAt(0).toUpperCase();
    if (adminLink) adminLink.style.display = user.role === 'admin' ? 'flex' : 'none';
  } else {
    if (loginBtn) loginBtn.style.display = 'flex';
    if (userMenu) userMenu.style.display = 'none';
    if (adminLink) adminLink.style.display = 'none';
  }
}

// Attach logout handlers
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderAuth();
  document.querySelectorAll('[data-action="logout"]').forEach(el => {
    el.addEventListener('click', (e) => { e.preventDefault(); Auth.logout(); });
  });
  // User dropdown toggle
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
