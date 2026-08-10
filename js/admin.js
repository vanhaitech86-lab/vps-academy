// ============================================================
// VPS Academy – Admin Panel Logic
// ============================================================

let currentAdminTab = 'dashboard';

function initAdmin() {
  if (!Auth.requireAdmin()) return;
  loadTab('dashboard');
  // Nav items
  document.querySelectorAll('.admin-nav-item[data-tab]').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      loadTab(item.dataset.tab);
    });
  });
}

function loadTab(tab) {
  currentAdminTab = tab;
  const content = document.getElementById('adminContent');
  const title = document.getElementById('adminPageTitle');
  if (!content) return;
  const titles = {
    dashboard: '📊 Dashboard', users: '👥 Quản lý người dùng',
    courses: '📚 Quản lý khóa học', lessons: '🎥 Quản lý bài học',
    quizzes: '📝 Quản lý bài kiểm tra', results: '🏆 Kết quả học viên',
    categories: '📂 Danh mục', settings: '🌐 Cài đặt website',
  };
  if (title) title.textContent = titles[tab] || tab;
  if (tab === 'dashboard') renderDashboard(content);
  else if (tab === 'users') renderUsers(content);
  else if (tab === 'courses') renderCourses(content);
  else if (tab === 'lessons') renderLessons(content);
  else if (tab === 'quizzes') renderQuizzes(content);
  else if (tab === 'results') renderResults(content);
  else if (tab === 'categories') renderCategories(content);
  else if (tab === 'settings') renderSettings(content);
}

// ─── Dashboard ────────────────────────────────────────────────
function renderDashboard(el) {
  const users = UserDB.getAll();
  const courses = CourseDB.getAll();
  const results = ResultDB.getAll();
  const enrollments = EnrollmentDB.getAll();
  const passedCount = results.filter(r => r.passed).length;
  const avgScore = results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;

  // Chart data (results per course)
  const courseResultCounts = courses.map(c => ({
    name: c.title.substring(0, 20) + '...',
    count: results.filter(r => r.courseId === c.id).length,
  }));
  const maxCount = Math.max(...courseResultCounts.map(c => c.count), 1);

  // Recent results
  const recentResults = [...results].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 8);

  el.innerHTML = `
    <div class="stats-grid fade-in-up">
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(26,58,107,.1)">👥</div>
        <div class="stat-info"><div class="label">Tổng người dùng</div><div class="value">${users.length}</div><div class="change">▲ ${users.filter(u=>u.role==='employee_new').length} nhân viên mới</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(245,166,35,.1)">📚</div>
        <div class="stat-info"><div class="label">Tổng khóa học</div><div class="value">${courses.length}</div><div class="change">▲ ${courses.filter(c=>c.status==='active').length} đang hoạt động</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(40,167,69,.1)">📝</div>
        <div class="stat-info"><div class="label">Bài kiểm tra đã nộp</div><div class="value">${results.length}</div><div class="change" style="color:var(--success);">✅ ${passedCount} đạt yêu cầu</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(0,198,255,.1)">⭐</div>
        <div class="stat-info"><div class="label">Điểm trung bình</div><div class="value">${avgScore}%</div><div class="change">📊 ${enrollments.length} lượt đăng ký</div></div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
      <!-- Chart -->
      <div class="admin-table-card">
        <div class="table-header"><span class="table-title">📈 Bài nộp theo khóa học</span></div>
        <div style="padding:24px;">
          <div class="chart-bars">
            ${courseResultCounts.map(c => `
              <div class="chart-bar-wrap">
                <div class="chart-bar" style="height:${Math.round((c.count/maxCount)*100)}px" title="${c.count} bài nộp"></div>
                <div class="chart-bar-label" style="font-size:9px;text-align:center;width:40px;">${c.count}</div>
              </div>
            `).join('')}
          </div>
          <div style="display:flex;gap:4px;margin-top:8px;">
            ${courseResultCounts.map((c, i) => `<div style="flex:1;font-size:9px;color:var(--gray-500);text-align:center;overflow:hidden;">${i+1}</div>`).join('')}
          </div>
          <div style="margin-top:8px;font-size:11px;color:var(--gray-400);">Số thứ tự tương ứng với khóa học theo thứ tự</div>
        </div>
      </div>
      <!-- Phân bổ user -->
      <div class="admin-table-card">
        <div class="table-header"><span class="table-title">👥 Phân bổ người dùng</span></div>
        <div style="padding:24px;">
          ${Object.entries(ROLE_LABELS).map(([role, label]) => {
            const count = users.filter(u => u.role === role).length;
            const pct = Math.round((count / Math.max(users.length, 1)) * 100);
            return `
              <div style="margin-bottom:14px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <span style="font-size:13px;font-weight:600;color:var(--gray-700);">${label}</span>
                  <span style="font-size:13px;color:var(--gray-500);">${count} người (${pct}%)</span>
                </div>
                <div class="progress-bar" style="height:8px;">
                  <div class="progress-fill" style="width:${pct}%;background:${ROLE_COLORS[role]}"></div>
                </div>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- Recent Results -->
    <div class="admin-table-card">
      <div class="table-header">
        <span class="table-title">🕐 Kết quả gần đây</span>
        <button class="btn btn-primary btn-sm" onclick="loadTab('results')">Xem tất cả</button>
      </div>
      ${recentResults.length ? `
        <table class="data-table">
          <thead><tr><th>Học viên</th><th>Khóa học</th><th>Điểm</th><th>Kết quả</th><th>Ngày nộp</th></tr></thead>
          <tbody>
            ${recentResults.map(r => {
              const u = UserDB.getById(r.userId);
              const c = CourseDB.getById(r.courseId);
              return `<tr>
                <td><div class="user-cell"><div class="avatar">${u ? u.name.charAt(0) : '?'}</div><div><div class="u-name">${u ? u.name : 'Đã xóa'}</div><div class="u-email">${u ? u.email : ''}</div></div></div></td>
                <td style="font-size:13px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c ? c.title : 'Đã xóa'}</td>
                <td><strong style="font-size:16px;color:${r.passed ? 'var(--success)' : 'var(--danger)'};">${r.score}%</strong></td>
                <td><span class="badge ${r.passed ? 'badge-active' : 'badge-inactive'}">${r.passed ? '✅ Đạt' : '❌ Chưa đạt'}</span></td>
                <td style="font-size:13px;color:var(--gray-500);">${formatDate(r.submittedAt)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>` : `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Chưa có kết quả</div></div>`}
    </div>`;
}

// ─── Users ─────────────────────────────────────────────────────
function renderUsers(el) {
  const users = UserDB.getAll();
  el.innerHTML = `
    <div class="admin-table-card">
      <div class="table-header">
        <span class="table-title">Danh sách người dùng (${users.length})</span>
        <div class="table-actions">
          <input type="text" class="search-input" id="userSearch" placeholder="Tìm kiếm..." oninput="filterUsers(this.value)">
          <button class="btn btn-primary btn-sm" onclick="openUserModal()">+ Thêm người dùng</button>
        </div>
      </div>
      <table class="data-table" id="usersTable">
        <thead><tr><th>Người dùng</th><th>Vai trò</th><th>Phòng ban</th><th>Trạng thái</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
        <tbody id="usersBody">${renderUsersRows(users)}</tbody>
      </table>
    </div>
    ${userModal()}`;
}

function renderUsersRows(users) {
  return users.map(u => `
    <tr id="user-row-${u.id}">
      <td><div class="user-cell">
        <div class="avatar" style="background:${ROLE_COLORS[u.role]}">${u.name.charAt(0)}</div>
        <div><div class="u-name">${u.name}</div><div class="u-email">${u.email}</div></div>
      </div></td>
      <td><span class="badge badge-${u.role}">${ROLE_LABELS[u.role]}</span></td>
      <td style="font-size:13px;">${u.department || '–'}</td>
      <td><span class="badge badge-${u.status}">${u.status === 'active' ? '✅ Hoạt động' : '❌ Vô hiệu'}</span></td>
      <td style="font-size:13px;color:var(--gray-500);">${formatDate(u.createdAt)}</td>
      <td><div class="action-btns">
        <button class="action-btn edit" onclick="openUserModal(${u.id})">✏️ Sửa</button>
        ${u.role !== 'admin' ? `<button class="action-btn del" onclick="deleteUser(${u.id})">🗑️ Xóa</button>` : ''}
      </div></td>
    </tr>`).join('');
}

window.filterUsers = function(q) {
  const users = UserDB.getAll().filter(u => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()));
  const body = document.getElementById('usersBody');
  if (body) body.innerHTML = renderUsersRows(users);
};

function userModal() {
  return `
  <div class="modal-overlay" id="userModal">
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title" id="userModalTitle">Thêm người dùng</h2>
        <button class="modal-close" onclick="closeModal('userModal')">✕</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="umId">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Họ và tên <span class="required">*</span></label><input type="text" class="form-control" id="umName" placeholder="Nguyễn Văn A"></div>
          <div class="form-group"><label class="form-label">Email <span class="required">*</span></label><input type="email" class="form-control" id="umEmail" placeholder="email@vps.vn"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Mật khẩu</label><input type="password" class="form-control" id="umPass" placeholder="Để trống = không thay đổi"></div>
          <div class="form-group"><label class="form-label">Số điện thoại</label><input type="tel" class="form-control" id="umPhone" placeholder="0901234567"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Vai trò <span class="required">*</span></label>
            <select class="form-control" id="umRole">
              <option value="employee_new">Nhân viên mới</option>
              <option value="employee_old">Nhân viên</option>
              <option value="customer">Khách hàng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <div class="form-group"><label class="form-label">Phòng ban</label><input type="text" class="form-control" id="umDept" placeholder="Phòng Môi giới"></div>
        </div>
        <div class="form-group"><label class="form-label">Trạng thái</label>
          <select class="form-control" id="umStatus">
            <option value="active">Hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('userModal')">Hủy</button>
        <button class="btn btn-primary" onclick="saveUser()">💾 Lưu</button>
      </div>
    </div>
  </div>`;
}

window.openUserModal = function(id) {
  const titleEl = document.getElementById('userModalTitle');
  const idEl = document.getElementById('umId');
  if (id) {
    const u = UserDB.getById(id);
    if (!u) return;
    if (titleEl) titleEl.textContent = 'Chỉnh sửa người dùng';
    if (idEl) idEl.value = u.id;
    document.getElementById('umName').value = u.name;
    document.getElementById('umEmail').value = u.email;
    document.getElementById('umPass').value = '';
    document.getElementById('umPhone').value = u.phone || '';
    document.getElementById('umRole').value = u.role;
    document.getElementById('umDept').value = u.department || '';
    document.getElementById('umStatus').value = u.status;
  } else {
    if (titleEl) titleEl.textContent = 'Thêm người dùng';
    if (idEl) idEl.value = '';
    ['umName','umEmail','umPass','umPhone','umDept'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('umRole').value = 'employee_new';
    document.getElementById('umStatus').value = 'active';
  }
  openModal('userModal');
};

window.saveUser = function() {
  const id = document.getElementById('umId').value;
  const name = document.getElementById('umName').value.trim();
  const email = document.getElementById('umEmail').value.trim();
  const pass = document.getElementById('umPass').value;
  const phone = document.getElementById('umPhone').value.trim();
  const role = document.getElementById('umRole').value;
  const dept = document.getElementById('umDept').value.trim();
  const status = document.getElementById('umStatus').value;
  if (!name || !email) { showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error'); return; }
  if (!id && !pass) { showToast('Vui lòng nhập mật khẩu cho người dùng mới', 'error'); return; }
  const data = { name, email, role, phone, department: dept, status };
  if (pass) data.password = pass;
  if (id) { UserDB.update(id, data); showToast('Cập nhật người dùng thành công!', 'success'); }
  else { 
    const existing = UserDB.getByEmail(email);
    if (existing) { showToast('Email đã tồn tại trong hệ thống!', 'error'); return; }
    UserDB.create({ ...data, password: pass }); 
    showToast('Thêm người dùng thành công!', 'success'); 
  }
  closeModal('userModal');
  renderUsers(document.getElementById('adminContent'));
};

window.deleteUser = function(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
  UserDB.delete(id);
  showToast('Đã xóa người dùng', 'success');
  renderUsers(document.getElementById('adminContent'));
};

// ─── Courses ───────────────────────────────────────────────────
function renderCourses(el) {
  const courses = CourseDB.getAll();
  const categories = CategoryDB.getAll();
  el.innerHTML = `
    <div class="admin-table-card">
      <div class="table-header">
        <span class="table-title">Danh sách khóa học (${courses.length})</span>
        <div class="table-actions">
          <input type="text" class="search-input" id="courseSearch" placeholder="Tìm kiếm..." oninput="filterCoursesAdmin(this.value)">
          <button class="btn btn-primary btn-sm" onclick="openCourseModal()">+ Thêm khóa học</button>
        </div>
      </div>
      <table class="data-table">
        <thead><tr><th>Khóa học</th><th>Danh mục</th><th>Cấp độ</th><th>Đối tượng</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody id="coursesBody">${renderCourseRows(courses, categories)}</tbody>
      </table>
    </div>
    ${courseModal(categories)}`;
}

function renderCourseRows(courses, categories) {
  return courses.map(c => {
    const cat = CategoryDB.getById(c.categoryId);
    return `<tr>
      <td><div style="max-width:280px"><div style="font-weight:600;color:var(--gray-800);font-size:14px;">${c.title}</div><div style="font-size:12px;color:var(--gray-500);">👨‍🏫 ${c.instructor}</div></div></td>
      <td><span style="font-size:13px;">${cat ? cat.icon + ' ' + cat.name : '–'}</span></td>
      <td><span class="badge" style="background:${LEVEL_COLORS[c.level]}22;color:${LEVEL_COLORS[c.level]};">${c.level}</span></td>
      <td style="font-size:12px;">${c.allowedRoles.map(r => `<span class="badge badge-${r}" style="margin-right:2px;">${ROLE_LABELS[r]}</span>`).join('')}</td>
      <td><span class="badge badge-${c.status}">${c.status === 'active' ? '✅ Hoạt động' : '⏸ Ẩn'}</span></td>
      <td><div class="action-btns">
        <button class="action-btn view" onclick="window.location='course-detail.html?id=${c.id}'">👁️ Xem</button>
        <button class="action-btn edit" onclick="openCourseModal(${c.id})">✏️ Sửa</button>
        <button class="action-btn del" onclick="deleteCourse(${c.id})">🗑️</button>
      </div></td>
    </tr>`;
  }).join('');
}

window.filterCoursesAdmin = function(q) {
  const courses = CourseDB.getAll().filter(c => c.title.toLowerCase().includes(q.toLowerCase()) || c.instructor.toLowerCase().includes(q.toLowerCase()));
  const body = document.getElementById('coursesBody');
  if (body) body.innerHTML = renderCourseRows(courses, CategoryDB.getAll());
};

function courseModal(categories) {
  return `
  <div class="modal-overlay" id="courseModal">
    <div class="modal" style="max-width:720px;">
      <div class="modal-header">
        <h2 class="modal-title" id="courseModalTitle">Thêm khóa học</h2>
        <button class="modal-close" onclick="closeModal('courseModal')">✕</button>
      </div>
      <div class="modal-body" style="max-height:75vh;overflow-y:auto;">
        <input type="hidden" id="cmId">

        <!-- Tabs -->
        <div style="display:flex;gap:4px;margin-bottom:20px;background:var(--gray-100);border-radius:8px;padding:4px;">
          <button type="button" onclick="switchCourseTab('basic')" id="tabBasic" class="tab-btn-active" style="flex:1;padding:8px;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;background:white;color:var(--primary);box-shadow:var(--shadow-sm);">📋 Thông tin cơ bản</button>
          <button type="button" onclick="switchCourseTab('content')" id="tabContent" style="flex:1;padding:8px;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;background:transparent;color:var(--gray-500);">📝 Nội dung & Mục tiêu</button>
          <button type="button" onclick="switchCourseTab('access')" id="tabAccess" style="flex:1;padding:8px;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;background:transparent;color:var(--gray-500);">🔐 Phân quyền</button>
        </div>

        <!-- Tab 1: Basic -->
        <div id="courseTabBasic">
          <div class="form-group"><label class="form-label">Tên khóa học <span class="required">*</span></label><input type="text" class="form-control" id="cmTitle" placeholder="Tên khóa học"></div>
          <div class="form-group"><label class="form-label">Mô tả ngắn</label><textarea class="form-control" id="cmDesc" rows="2" placeholder="Mô tả ngắn gọn về khóa học..."></textarea></div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Danh mục</label>
              <select class="form-control" id="cmCat">
                ${categories.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label class="form-label">Cấp độ</label>
              <select class="form-control" id="cmLevel">
                <option value="Cơ bản">Cơ bản</option>
                <option value="Trung cấp">Trung cấp</option>
                <option value="Nâng cao">Nâng cao</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label class="form-label">Giảng viên</label><input type="text" class="form-control" id="cmInstructor" placeholder="Tên giảng viên – Chức danh"></div>
            <div class="form-group"><label class="form-label">Thời lượng</label><input type="text" class="form-control" id="cmDuration" placeholder="6 giờ 30 phút"></div>
          </div>
          <div class="form-group"><label class="form-label">🖼️ URL hình ảnh thumbnail (để trống = dùng icon danh mục)</label><input type="url" class="form-control" id="cmThumbnail" placeholder="https://..."></div>
          <div class="form-group"><label class="form-label">Tags (cách nhau bởi dấu phẩy)</label><input type="text" class="form-control" id="cmTags" placeholder="tag1, tag2, tag3"></div>
          <div class="form-group"><label class="form-label">Trạng thái</label>
            <select class="form-control" id="cmStatus">
              <option value="active">✅ Hoạt động (Hiển thị)</option>
              <option value="draft">🔒 Ẩn (Nháp)</option>
            </select>
          </div>
        </div>

        <!-- Tab 2: Content -->
        <div id="courseTabContent" style="display:none;">
          <div class="form-group">
            <label class="form-label">🎯 Mục tiêu khóa học</label>
            <div style="font-size:12px;color:var(--gray-400);margin-bottom:6px;">Liệt kê những gì học viên sẽ đạt được (mỗi dòng một mục tiêu)</div>
            <textarea class="form-control" id="cmObjectives" rows="4" placeholder="- Hiểu được nguyên lý vận hành của máy photocopy&#10;- Biết cách bảo trì định kỳ&#10;- Xử lý được các sự cố thường gặp"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">📋 Đề cương / Nội dung khóa học</label>
            <div style="font-size:12px;color:var(--gray-400);margin-bottom:6px;">Tóm tắt các chương/phần của khóa học</div>
            <textarea class="form-control" id="cmOutline" rows="6" placeholder="Chương 1: Giới thiệu tổng quan&#10;- Bài 1.1: Lịch sử và phân loại&#10;- Bài 1.2: Các thành phần chính&#10;&#10;Chương 2: Vận hành cơ bản&#10;- Bài 2.1: Khởi động và tắt máy"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">⚠️ Yêu cầu tiên quyết</label>
            <textarea class="form-control" id="cmPrerequisites" rows="2" placeholder="Không yêu cầu kiến thức nền tảng. Phù hợp cho người mới bắt đầu."></textarea>
          </div>
        </div>

        <!-- Tab 3: Access -->
        <div id="courseTabAccess" style="display:none;">
          <div class="form-group"><label class="form-label">👥 Đối tượng học <span class="required">*</span></label>
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${Object.entries(ROLE_LABELS).map(([role, label]) => `
                <label style="display:flex;align-items:center;gap:12px;padding:12px 16px;border:2px solid var(--gray-200);border-radius:var(--radius);cursor:pointer;transition:all .2s;" onclick="this.style.borderColor=this.querySelector('input').checked?'var(--gray-200)':'var(--primary)';this.style.background=this.querySelector('input').checked?'':'rgba(26,58,107,.04)';">
                  <input type="checkbox" value="${role}" class="cm-role-cb" style="width:18px;height:18px;cursor:pointer;">
                  <span style="font-size:14px;font-weight:600;color:var(--gray-700);">${label}</span>
                </label>`).join('')}
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('courseModal')">Hủy</button>
        <button class="btn btn-primary" onclick="saveCourse()">💾 Lưu khóa học</button>
      </div>
    </div>
  </div>`;
}

window.switchCourseTab = function(tab) {
  ['basic','content','access'].forEach(t => {
    document.getElementById('courseTab' + t.charAt(0).toUpperCase() + t.slice(1)).style.display = t === tab ? 'block' : 'none';
    const btn = document.getElementById('tab' + t.charAt(0).toUpperCase() + t.slice(1));
    if (btn) {
      btn.style.background = t === tab ? 'white' : 'transparent';
      btn.style.color = t === tab ? 'var(--primary)' : 'var(--gray-500)';
      btn.style.boxShadow = t === tab ? 'var(--shadow-sm)' : 'none';
    }
  });
};

window.openCourseModal = function(id) {
  const titleEl = document.getElementById('courseModalTitle');
  const cats = CategoryDB.getAll();
  const catSelect = document.getElementById('cmCat');
  if (catSelect) catSelect.innerHTML = cats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');
  // Reset to first tab
  if (window.switchCourseTab) switchCourseTab('basic');
  if (id) {
    const c = CourseDB.getById(id);
    if (!c) return;
    if (titleEl) titleEl.textContent = 'Chỉnh sửa khóa học';
    document.getElementById('cmId').value = c.id;
    document.getElementById('cmTitle').value = c.title;
    document.getElementById('cmDesc').value = c.description;
    document.getElementById('cmCat').value = c.categoryId;
    document.getElementById('cmLevel').value = c.level;
    document.getElementById('cmInstructor').value = c.instructor;
    document.getElementById('cmDuration').value = c.duration;
    document.getElementById('cmTags').value = (c.tags || []).join(', ');
    document.getElementById('cmStatus').value = c.status;
    // New content fields
    const thumbnailEl = document.getElementById('cmThumbnail');
    if (thumbnailEl) thumbnailEl.value = c.thumbnail || '';
    const objEl = document.getElementById('cmObjectives');
    if (objEl) objEl.value = (c.objectives || []).join('\n');
    const outlineEl = document.getElementById('cmOutline');
    if (outlineEl) outlineEl.value = c.outline || '';
    const prereqEl = document.getElementById('cmPrerequisites');
    if (prereqEl) prereqEl.value = c.prerequisites || '';
    document.querySelectorAll('.cm-role-cb').forEach(cb => {
      cb.checked = c.allowedRoles.includes(cb.value);
    });
  } else {
    if (titleEl) titleEl.textContent = 'Thêm khóa học';
    document.getElementById('cmId').value = '';
    ['cmTitle','cmDesc','cmInstructor','cmDuration','cmTags'].forEach(i => document.getElementById(i).value = '');
    ['cmThumbnail','cmObjectives','cmOutline','cmPrerequisites'].forEach(i => { const el = document.getElementById(i); if(el) el.value=''; });
    document.getElementById('cmLevel').value = 'Cơ bản';
    document.getElementById('cmStatus').value = 'active';
    document.querySelectorAll('.cm-role-cb').forEach(cb => { cb.checked = false; });
  }
  openModal('courseModal');
};

window.saveCourse = function() {
  const id = document.getElementById('cmId').value;
  const title = document.getElementById('cmTitle').value.trim();
  const roles = [...document.querySelectorAll('.cm-role-cb:checked')].map(cb => cb.value);
  if (!title) { showToast('Vui lòng nhập tên khóa học', 'error'); return; }
  if (!roles.length) { showToast('Vui lòng chọn ít nhất một đối tượng học', 'error'); return; }
  const data = {
    title,
    description: document.getElementById('cmDesc').value.trim(),
    categoryId: parseInt(document.getElementById('cmCat').value),
    level: document.getElementById('cmLevel').value,
    instructor: document.getElementById('cmInstructor').value.trim(),
    duration: document.getElementById('cmDuration').value.trim(),
    tags: document.getElementById('cmTags').value.split(',').map(t => t.trim()).filter(Boolean),
    status: document.getElementById('cmStatus').value,
    thumbnail: (document.getElementById('cmThumbnail') || {}).value || '',
    objectives: ((document.getElementById('cmObjectives') || {}).value || '').split('\n').filter(l => l.trim()),
    outline: (document.getElementById('cmOutline') || {}).value || '',
    prerequisites: (document.getElementById('cmPrerequisites') || {}).value || '',
    allowedRoles: roles,
    rating: 4.5, totalLessons: 0, lessonIds: [],
  };
  if (id) { CourseDB.update(id, data); showToast('Cập nhật khóa học thành công!', 'success'); }
  else { CourseDB.create(data); showToast('Thêm khóa học thành công!', 'success'); }
  closeModal('courseModal');
  renderCourses(document.getElementById('adminContent'));
};

window.deleteCourse = function(id) {
  if (!confirm('Bạn có chắc muốn xóa khóa học này? Tất cả bài học liên quan cũng sẽ bị xóa.')) return;
  CourseDB.delete(id);
  LessonDB.getAll().filter(l => l.courseId === id).forEach(l => LessonDB.delete(l.id));
  showToast('Đã xóa khóa học', 'success');
  renderCourses(document.getElementById('adminContent'));
};

// ─── Lessons ───────────────────────────────────────────────────
function renderLessons(el) {
  const courses = CourseDB.getAll();
  const lessons = LessonDB.getAll();
  let selectedCourse = courses[0];
  
  el.innerHTML = `
    <div class="admin-table-card" style="margin-bottom:20px;">
      <div class="table-header">
        <div style="display:flex;align-items:center;gap:12px;">
          <span class="table-title">Chọn khóa học:</span>
          <select class="filter-select" id="lessonCourseFilter" onchange="filterLessonsByCourse(this.value)" style="min-width:260px;">
            ${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
          </select>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openLessonModal()">+ Thêm bài học</button>
      </div>
    </div>
    <div id="lessonsTableWrap">${renderLessonTable(selectedCourse ? lessons.filter(l => l.courseId === selectedCourse.id) : [], selectedCourse)}</div>
    ${lessonModal(courses)}`;
  
  if (selectedCourse) window._currentLessonCourseId = selectedCourse.id;
}

window.filterLessonsByCourse = function(courseId) {
  window._currentLessonCourseId = parseInt(courseId);
  const lessons = LessonDB.getByCourse(courseId);
  const course = CourseDB.getById(courseId);
  const wrap = document.getElementById('lessonsTableWrap');
  if (wrap) wrap.innerHTML = renderLessonTable(lessons, course);
};

function renderLessonTable(lessons, course) {
  return `
    <div class="admin-table-card">
      <div class="table-header">
        <span class="table-title">Bài học trong: ${course ? course.title : ''} (${lessons.length} bài)</span>
      </div>
      <table class="data-table">
        <thead><tr><th>#</th><th>Tên bài học</th><th>Thời lượng</th><th>Video URL</th><th>Tài liệu</th><th>Thao tác</th></tr></thead>
        <tbody>${lessons.length ? lessons.map(l => `
          <tr>
            <td style="font-weight:700;color:var(--primary);">${l.order}</td>
            <td><div style="font-weight:600;font-size:14px;">${l.title}</div><div style="font-size:12px;color:var(--gray-500);">${l.description.substring(0,60)}...</div></td>
            <td style="font-size:13px;">🕐 ${l.duration}</td>
            <td style="font-size:12px;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--primary);">${l.videoUrl ? '<a href="' + l.videoUrl + '" target="_blank" style="color:var(--primary);">🎥 Xem</a>' : '–'}</td>
            <td style="font-size:12px;">${l.docName ? '📄 ' + l.docName : '–'}</td>
            <td><div class="action-btns">
              <button class="action-btn edit" onclick="openLessonModal(${l.id})">✏️ Sửa</button>
              <button class="action-btn del" onclick="deleteLesson(${l.id})">🗑️</button>
            </div></td>
          </tr>`).join('') : '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--gray-500);">Chưa có bài học nào. Nhấn "+ Thêm bài học" để bắt đầu.</td></tr>'}
        </tbody>
      </table>
    </div>`;
}

function lessonModal(courses) {
  return `
  <div class="modal-overlay" id="lessonModal">
    <div class="modal" style="max-width:700px;">
      <div class="modal-header">
        <h2 class="modal-title" id="lessonModalTitle">Thêm bài học</h2>
        <button class="modal-close" onclick="closeModal('lessonModal')">✕</button>
      </div>
      <div class="modal-body" style="max-height:80vh;overflow-y:auto;">
        <input type="hidden" id="lmId">

        <div class="form-row">
          <div class="form-group"><label class="form-label">Khóa học</label>
            <select class="form-control" id="lmCourse">
              ${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Số thứ tự</label><input type="number" class="form-control" id="lmOrder" min="1" value="1"></div>
        </div>
        <div class="form-group"><label class="form-label">Tên bài học <span class="required">*</span></label><input type="text" class="form-control" id="lmTitle" placeholder="Bài 1: Giới thiệu..."></div>
        <div class="form-group"><label class="form-label">Mô tả bài học</label><textarea class="form-control" id="lmDesc" rows="2" placeholder="Nội dung bài học..."></textarea></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Thời lượng</label><input type="text" class="form-control" id="lmDuration" placeholder="30 phút"></div>
          <div class="form-group"><label class="form-label">Loại</label>
            <select class="form-control" id="lmType"><option value="video">Video</option><option value="document">Tài liệu</option></select>
          </div>
        </div>

        <!-- ══ VIDEO ══════════════════════════════════════════════ -->
        <hr style="margin:14px 0;border-color:var(--gray-200);">
        <div style="font-size:13px;font-weight:700;color:var(--primary);margin-bottom:12px;">🎥 Cài đặt Video</div>

        <!-- Tab switcher: Upload vs URL -->
        <div style="display:flex;gap:0;border:1px solid var(--gray-200);border-radius:var(--radius-sm);overflow:hidden;margin-bottom:14px;width:fit-content;">
          <button id="videoTabUpload" onclick="switchVideoTab('upload')"
            style="padding:8px 20px;font-size:13px;font-weight:600;background:var(--primary);color:white;border:none;cursor:pointer;">
            📁 Tải lên từ máy
          </button>
          <button id="videoTabUrl" onclick="switchVideoTab('url')"
            style="padding:8px 20px;font-size:13px;font-weight:600;background:white;color:var(--gray-500);border:none;cursor:pointer;">
            🔗 Dán link URL
          </button>
        </div>

        <!-- Upload zone -->
        <div id="videoPanelUpload">
          <div id="videoDropZone" onclick="document.getElementById('videoFileInput').click()"
            style="border:2px dashed var(--gray-300);border-radius:var(--radius);padding:28px;text-align:center;cursor:pointer;background:var(--gray-50);transition:all .2s;"
            ondragover="event.preventDefault();this.style.borderColor='var(--primary)';this.style.background='rgba(26,58,107,.04)';"
            ondragleave="this.style.borderColor='var(--gray-300)';this.style.background='var(--gray-50)';"
            ondrop="handleVideoFileDrop(event)">
            <div style="font-size:36px;margin-bottom:8px;">🎬</div>
            <div style="font-size:14px;font-weight:600;color:var(--gray-700);">Kéo thả video vào đây hoặc nhấn để chọn file</div>
            <div style="font-size:12px;color:var(--gray-400);margin-top:6px;">Hỗ trợ: MP4, WebM, AVI, MOV · Dung lượng tối đa khuyến nghị 500MB</div>
          </div>
          <input type="file" id="videoFileInput" accept="video/*" style="display:none" onchange="handleVideoFileSelect(this)">
          <div id="videoUploadInfo" style="display:none;margin-top:10px;"></div>
        </div>

        <!-- URL input -->
        <div id="videoPanelUrl" style="display:none;">
          <div class="form-group">
            <label class="form-label">URL Video (YouTube, Google Drive, hoặc link trực tiếp)</label>
            <input type="url" class="form-control" id="lmVideoUrl" placeholder="https://www.youtube.com/embed/VIDEO_ID hoặc https://drive.google.com/...">
            <div class="form-hint">
              YouTube embed: https://www.youtube.com/embed/<strong>VIDEO_ID</strong><br>
              Google Drive: Share → Bất kỳ ai có link → Copy link
            </div>
          </div>
        </div>
        <!-- Hidden field lưu nguồn video -->
        <input type="hidden" id="lmVideoSource" value="url">

        <!-- ══ TÀI LIỆU ═══════════════════════════════════════════ -->
        <hr style="margin:14px 0;border-color:var(--gray-200);">
        <div style="font-size:13px;font-weight:700;color:var(--primary);margin-bottom:12px;">📄 Tài liệu (Chỉ xem online – Không tải về máy)</div>

        <div class="form-group">
          <label class="form-label">Tên hiển thị tài liệu</label>
          <input type="text" class="form-control" id="lmDocName" placeholder="Hướng dẫn cài đặt máy in.pdf">
        </div>

        <!-- Tab: Upload vs URL -->
        <div style="display:flex;gap:0;border:1px solid var(--gray-200);border-radius:var(--radius-sm);overflow:hidden;margin-bottom:14px;width:fit-content;">
          <button id="docTabUpload" onclick="switchDocTab('upload')"
            style="padding:8px 20px;font-size:13px;font-weight:600;background:var(--primary);color:white;border:none;cursor:pointer;">
            📁 Tải lên từ máy
          </button>
          <button id="docTabUrl" onclick="switchDocTab('url')"
            style="padding:8px 20px;font-size:13px;font-weight:600;background:white;color:var(--gray-500);border:none;cursor:pointer;">
            🔗 Dán link URL
          </button>
        </div>

        <!-- Doc upload zone -->
        <div id="docPanelUpload">
          <div id="docDropZone" onclick="document.getElementById('docFileInput').click()"
            style="border:2px dashed var(--gray-300);border-radius:var(--radius);padding:24px;text-align:center;cursor:pointer;background:var(--gray-50);transition:all .2s;"
            ondragover="event.preventDefault();this.style.borderColor='var(--primary)';this.style.background='rgba(26,58,107,.04)';"
            ondragleave="this.style.borderColor='var(--gray-300)';this.style.background='var(--gray-50)';"
            ondrop="handleDocFileDrop(event)">
            <div style="font-size:36px;margin-bottom:8px;">📄</div>
            <div style="font-size:14px;font-weight:600;color:var(--gray-700);">Kéo thả tài liệu vào đây hoặc nhấn để chọn file</div>
            <div style="font-size:12px;color:var(--gray-400);margin-top:6px;">Hỗ trợ: PDF, Word, Excel, PowerPoint · Dung lượng tối đa 50MB</div>
          </div>
          <input type="file" id="docFileInput" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx" style="display:none" onchange="handleDocFileSelect(this)">
          <div id="docUploadInfo" style="display:none;margin-top:10px;"></div>
        </div>

        <!-- Doc URL input -->
        <div id="docPanelUrl" style="display:none;">
          <div class="form-group">
            <label class="form-label">Link tài liệu (Google Drive hoặc URL PDF)</label>
            <input type="url" class="form-control" id="lmDocUrl" placeholder="https://drive.google.com/file/d/ID/view">
            <div class="form-hint">Google Drive: Share → Bất kỳ ai có link → Sao chép link</div>
          </div>
        </div>
        <input type="hidden" id="lmDocSource" value="url">

        <!-- ══ CÂU HỎI TƯƠNG TÁC ═══════════════════════════════════ -->
        <hr style="margin:14px 0;border-color:var(--gray-200);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
          <div style="font-size:13px;font-weight:700;color:var(--primary);">🎯 Câu hỏi tương tác trong video</div>
          <button type="button" class="btn btn-primary btn-sm" onclick="addInteractiveQ()">+ Thêm câu hỏi</button>
        </div>
        <div style="font-size:12px;color:var(--gray-500);margin-bottom:10px;">Câu hỏi sẽ bật ra tự động tại thời điểm chỉ định. Học viên phải trả lời đúng mới xem tiếp.</div>
        <div id="lmIQList" style="display:flex;flex-direction:column;gap:10px;"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('lessonModal')">Hủy</button>
        <button class="btn btn-primary" onclick="saveLesson()">💾 Lưu bài học</button>
      </div>
    </div>
  </div>`;
}

// ── Tab switchers ─────────────────────────────────────────────
window.switchVideoTab = function(tab) {
  const isUpload = tab === 'upload';
  document.getElementById('videoPanelUpload').style.display = isUpload ? 'block' : 'none';
  document.getElementById('videoPanelUrl').style.display    = isUpload ? 'none'  : 'block';
  document.getElementById('videoTabUpload').style.cssText   = isUpload
    ? 'padding:8px 20px;font-size:13px;font-weight:600;background:var(--primary);color:white;border:none;cursor:pointer;'
    : 'padding:8px 20px;font-size:13px;font-weight:600;background:white;color:var(--gray-500);border:none;cursor:pointer;';
  document.getElementById('videoTabUrl').style.cssText      = isUpload
    ? 'padding:8px 20px;font-size:13px;font-weight:600;background:white;color:var(--gray-500);border:none;cursor:pointer;'
    : 'padding:8px 20px;font-size:13px;font-weight:600;background:var(--primary);color:white;border:none;cursor:pointer;';
  document.getElementById('lmVideoSource').value = tab;
};

window.switchDocTab = function(tab) {
  const isUpload = tab === 'upload';
  document.getElementById('docPanelUpload').style.display = isUpload ? 'block' : 'none';
  document.getElementById('docPanelUrl').style.display    = isUpload ? 'none'  : 'block';
  document.getElementById('docTabUpload').style.cssText   = isUpload
    ? 'padding:8px 20px;font-size:13px;font-weight:600;background:var(--primary);color:white;border:none;cursor:pointer;'
    : 'padding:8px 20px;font-size:13px;font-weight:600;background:white;color:var(--gray-500);border:none;cursor:pointer;';
  document.getElementById('docTabUrl').style.cssText      = isUpload
    ? 'padding:8px 20px;font-size:13px;font-weight:600;background:white;color:var(--gray-500);border:none;cursor:pointer;'
    : 'padding:8px 20px;font-size:13px;font-weight:600;background:var(--primary);color:white;border:none;cursor:pointer;';
  document.getElementById('lmDocSource').value = tab;
};

// ── Upload handlers – Video ───────────────────────────────────
window.handleVideoFileDrop = function(e) {
  e.preventDefault();
  document.getElementById('videoDropZone').style.borderColor = 'var(--gray-300)';
  document.getElementById('videoDropZone').style.background  = 'var(--gray-50)';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('video/')) processVideoFile(file);
  else showToast('Vui lòng chọn file video!', 'error');
};

window.handleVideoFileSelect = function(input) {
  const file = input.files[0];
  if (file) processVideoFile(file);
};

function processVideoFile(file) {
  const info = document.getElementById('videoUploadInfo');
  info.style.display = 'block';
  info.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:rgba(26,58,107,.05);border-radius:var(--radius);border:1px solid var(--gray-200);">
      <span style="font-size:24px;">🎬</span>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;color:var(--gray-800);">${file.name}</div>
        <div style="font-size:12px;color:var(--gray-500);">${FileStore.formatSize(file.size)}</div>
        <div style="margin-top:8px;">
          <div style="height:6px;background:var(--gray-200);border-radius:99px;overflow:hidden;">
            <div id="videoUploadBar" style="height:100%;background:var(--primary);border-radius:99px;width:0%;transition:width .3s;"></div>
          </div>
          <div id="videoUploadPct" style="font-size:11px;color:var(--gray-500);margin-top:4px;">Đang chuẩn bị...</div>
        </div>
      </div>
    </div>`;

  // Lưu file vào IndexedDB
  const tempId = 'temp_video_' + Date.now();
  window._pendingVideoFileId = tempId;
  window._pendingVideoFile   = file;

  FileStore.saveFile(tempId, file, pct => {
    const bar = document.getElementById('videoUploadBar');
    const pctEl = document.getElementById('videoUploadPct');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct < 100 ? `Đang lưu... ${pct}%` : '✅ Đã lưu thành công!';
  }).then(() => {
    const pctEl = document.getElementById('videoUploadPct');
    if (pctEl) pctEl.innerHTML = '✅ <strong>Đã lưu thành công!</strong> Nhấn "Lưu bài học" để hoàn tất.';
    const bar = document.getElementById('videoUploadBar');
    if (bar) { bar.style.width = '100%'; bar.style.background = 'var(--success)'; }
    // Tự điền tên tài liệu
    const dur = document.getElementById('lmDuration');
    if (dur && !dur.value) dur.value = '30 phút';
  }).catch(err => {
    showToast('Lỗi lưu file: ' + err.message, 'error');
  });
}

// ── Upload handlers – Document ────────────────────────────────
window.handleDocFileDrop = function(e) {
  e.preventDefault();
  document.getElementById('docDropZone').style.borderColor = 'var(--gray-300)';
  document.getElementById('docDropZone').style.background  = 'var(--gray-50)';
  const file = e.dataTransfer.files[0];
  if (file) processDocFile(file);
};

window.handleDocFileSelect = function(input) {
  const file = input.files[0];
  if (file) processDocFile(file);
};

function processDocFile(file) {
  const info = document.getElementById('docUploadInfo');
  info.style.display = 'block';
  info.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:rgba(26,58,107,.05);border-radius:var(--radius);border:1px solid var(--gray-200);">
      <span style="font-size:24px;">📄</span>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;color:var(--gray-800);">${file.name}</div>
        <div style="font-size:12px;color:var(--gray-500);">${FileStore.formatSize(file.size)}</div>
        <div style="margin-top:8px;">
          <div style="height:6px;background:var(--gray-200);border-radius:99px;overflow:hidden;">
            <div id="docUploadBar" style="height:100%;background:var(--primary);border-radius:99px;width:0%;transition:width .3s;"></div>
          </div>
          <div id="docUploadPct" style="font-size:11px;color:var(--gray-500);margin-top:4px;">Đang chuẩn bị...</div>
        </div>
      </div>
    </div>`;

  const tempId = 'temp_doc_' + Date.now();
  window._pendingDocFileId = tempId;
  window._pendingDocFile   = file;

  // Tự điền tên tài liệu nếu chưa có
  const docNameEl = document.getElementById('lmDocName');
  if (docNameEl && !docNameEl.value) docNameEl.value = file.name;

  FileStore.saveFile(tempId, file, pct => {
    const bar = document.getElementById('docUploadBar');
    const pctEl = document.getElementById('docUploadPct');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct < 100 ? `Đang lưu... ${pct}%` : '✅ Đã lưu!';
  }).then(() => {
    const pctEl = document.getElementById('docUploadPct');
    if (pctEl) pctEl.innerHTML = '✅ <strong>Đã lưu thành công!</strong> Nhấn "Lưu bài học" để hoàn tất.';
    const bar = document.getElementById('docUploadBar');
    if (bar) { bar.style.width = '100%'; bar.style.background = 'var(--success)'; }
  }).catch(err => {
    showToast('Lỗi lưu tài liệu: ' + err.message, 'error');
  });
}


window._iqCounter = 0;
window.addInteractiveQ = function(q) {
  const list = document.getElementById('lmIQList');
  if (!list) return;
  const idx = window._iqCounter++;
  const div = document.createElement('div');
  div.id = 'iqItem_' + idx;
  div.style.cssText = 'border:1px solid var(--gray-200);border-radius:var(--radius);padding:14px;background:var(--gray-50);position:relative;';
  div.innerHTML = `
    <button onclick="document.getElementById('iqItem_${idx}').remove()" style="position:absolute;top:8px;right:8px;background:none;border:none;font-size:16px;cursor:pointer;color:var(--gray-400);">✕</button>
    <div class="form-row" style="margin-bottom:8px;">
      <div class="form-group">
        <label class="form-label" style="font-size:11px;">⏱ Xuất hiện tại giây thứ</label>
        <input type="number" class="form-control" id="iqTs_${idx}" min="1" placeholder="60" value="${q ? q.timestamp : ''}" style="font-size:13px;">
      </div>
      <div class="form-group" style="flex:3;">
        <label class="form-label" style="font-size:11px;">❓ Câu hỏi</label>
        <input type="text" class="form-control" id="iqTxt_${idx}" placeholder="Nội dung câu hỏi..." value="${q ? q.text : ''}" style="font-size:13px;">
      </div>
    </div>
    ${['A','B','C','D'].map((ltr,i) => `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="width:22px;height:22px;background:var(--primary-dark);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">${ltr}</span>
        <input type="text" class="form-control" id="iqOpt_${idx}_${i}" placeholder="Đáp án ${ltr}" value="${q && q.options[i] ? q.options[i] : ''}" style="font-size:13px;flex:1;">
        <label style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--gray-600);white-space:nowrap;">
          <input type="radio" name="iqCorrect_${idx}" value="${i}" ${q && q.correct === i ? 'checked' : ''}> Đúng
        </label>
      </div>`).join('')}
  `;
  list.appendChild(div);
};

function collectInteractiveQs() {
  const list = document.getElementById('lmIQList');
  if (!list) return [];
  const items = list.querySelectorAll('[id^="iqItem_"]');
  const result = [];
  items.forEach(item => {
    const idx = item.id.replace('iqItem_', '');
    const ts   = parseInt(document.getElementById('iqTs_'  + idx)?.value);
    const txt  = document.getElementById('iqTxt_' + idx)?.value?.trim();
    const opts = [0,1,2,3].map(i => document.getElementById(`iqOpt_${idx}_${i}`)?.value?.trim() || '');
    const corEl = item.querySelector(`input[name="iqCorrect_${idx}"]:checked`);
    const cor  = corEl ? parseInt(corEl.value) : 0;
    if (ts && txt && opts.some(Boolean)) {
      result.push({ id: Date.now() + Math.random(), timestamp: ts, text: txt, options: opts, correct: cor });
    }
  });
  return result;
}

window.openLessonModal = function(id) {
  const titleEl = document.getElementById('lessonModalTitle');
  const iqList  = document.getElementById('lmIQList');
  window._iqCounter = 0;
  if (iqList) iqList.innerHTML = '';

  if (id) {
    const l = LessonDB.getById(id);
    if (!l) return;
    if (titleEl) titleEl.textContent = 'Chỉnh sửa bài học';
    document.getElementById('lmId').value       = l.id;
    document.getElementById('lmCourse').value   = l.courseId;
    document.getElementById('lmOrder').value    = l.order;
    document.getElementById('lmTitle').value    = l.title;
    document.getElementById('lmDesc').value     = l.description;
    document.getElementById('lmDuration').value = l.duration;
    document.getElementById('lmVideoUrl').value = l.videoUrl || '';
    document.getElementById('lmDocName').value  = l.docName  || '';
    document.getElementById('lmType').value     = l.type     || 'video';
    const docUrlEl = document.getElementById('lmDocUrl');
    if (docUrlEl) docUrlEl.value = l.docUrl || '';
    // Load interactive questions
    (l.interactiveQs || []).forEach(q => window.addInteractiveQ(q));
  } else {
    if (titleEl) titleEl.textContent = 'Thêm bài học';
    document.getElementById('lmId').value = '';
    if (window._currentLessonCourseId) document.getElementById('lmCourse').value = window._currentLessonCourseId;
    const lessons = window._currentLessonCourseId ? LessonDB.getByCourse(window._currentLessonCourseId) : [];
    document.getElementById('lmOrder').value = lessons.length + 1;
    ['lmTitle','lmDesc','lmDuration','lmVideoUrl','lmDocName'].forEach(i => document.getElementById(i).value = '');
    const docUrlEl = document.getElementById('lmDocUrl');
    if (docUrlEl) docUrlEl.value = '';
    document.getElementById('lmType').value = 'video';
  }
  openModal('lessonModal');
};

window.saveLesson = function() {
  const id    = document.getElementById('lmId').value;
  const title = document.getElementById('lmTitle').value.trim();
  if (!title) { showToast('Vui lòng nhập tên bài học', 'error'); return; }
  const courseId     = parseInt(document.getElementById('lmCourse').value);
  const videoSource  = (document.getElementById('lmVideoSource') || {}).value || 'url';
  const docSource    = (document.getElementById('lmDocSource')   || {}).value || 'url';

  // Xác định ID vĩnh viễn cho lesson
  const lessonId = id ? parseInt(id) : Date.now();

  // Video: commit pending upload
  let videoUrl     = '';
  let videoFileId  = window._existingVideoFileId || '';
  if (videoSource === 'upload' && window._pendingVideoFileId) {
    // Rename temp file ID sang permanent ID
    const permVideoId = 'video_' + lessonId;
    FileStore.getFile(window._pendingVideoFileId).then(data => {
      if (data) FileStore.saveFile(permVideoId, new File([_dataUrlToBlob(data)], window._pendingVideoFile?.name || 'video', { type: window._pendingVideoFile?.type }));
      FileStore.deleteFile(window._pendingVideoFileId);
    });
    videoFileId = permVideoId;
    videoUrl    = 'local:' + permVideoId;
  } else if (videoSource === 'upload' && videoFileId) {
    videoUrl = 'local:' + videoFileId;
  } else if (videoSource === 'url') {
    const urlEl = document.getElementById('lmVideoUrl');
    videoUrl    = urlEl ? urlEl.value.trim() : '';
    videoFileId = '';
  }

  // Document: commit pending upload
  let docUrl    = '';
  let docFileId = window._existingDocFileId || '';
  if (docSource === 'upload' && window._pendingDocFileId) {
    const permDocId = 'doc_' + lessonId;
    FileStore.getFile(window._pendingDocFileId).then(data => {
      if (data) FileStore.saveFile(permDocId, new File([_dataUrlToBlob(data)], window._pendingDocFile?.name || 'doc', { type: window._pendingDocFile?.type }));
      FileStore.deleteFile(window._pendingDocFileId);
    });
    docFileId = permDocId;
    docUrl    = 'local:' + permDocId;
  } else if (docSource === 'upload' && docFileId) {
    docUrl = 'local:' + docFileId;
  } else if (docSource === 'url') {
    const urlEl = document.getElementById('lmDocUrl');
    docUrl      = urlEl ? urlEl.value.trim() : '';
    docFileId   = '';
  }

  const data = {
    courseId,
    title,
    description:   document.getElementById('lmDesc').value.trim(),
    duration:      document.getElementById('lmDuration').value.trim() || '30 phút',
    order:         parseInt(document.getElementById('lmOrder').value) || 1,
    videoUrl,
    videoFileId,
    docName:       document.getElementById('lmDocName').value.trim(),
    docUrl,
    docFileId,
    type:          document.getElementById('lmType').value,
    interactiveQs: collectInteractiveQs(),
  };

  if (id) {
    LessonDB.update(id, data);
    showToast('Cập nhật bài học thành công!', 'success');
  } else {
    // Đảm bảo ID khớp với file ID đã commit
    const lessonData = { ...data, id: lessonId };
    const allLessons = LessonDB.getAll();
    allLessons.push(lessonData);
    const { setDB, DB_KEYS } = _getDBHelpers();
    setDB(DB_KEYS.lessons, allLessons);
    const course = CourseDB.getById(courseId);
    if (course) CourseDB.update(courseId, { totalLessons: LessonDB.getByCourse(courseId).length });
    showToast('Thêm bài học thành công!', 'success');
  }

  // Reset pending
  window._pendingVideoFileId = null;
  window._pendingDocFileId   = null;
  window._existingVideoFileId = null;
  window._existingDocFileId   = null;

  closeModal('lessonModal');
  filterLessonsByCourse(courseId);
};

// Helpers
function _dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}
function _getDBHelpers() {
  // Expose internal DB helpers – they are defined in data.js global scope
  return { setDB: window._setDB || ((k,v) => localStorage.setItem(k, JSON.stringify(v))), DB_KEYS: window.DB_KEYS };
}


window.deleteLesson = function(id) {
  if (!confirm('Xóa bài học này?')) return;
  const lesson = LessonDB.getById(id);
  if (!lesson) return;
  const courseId = lesson.courseId;
  LessonDB.delete(id);
  const lessonCount = LessonDB.getByCourse(courseId).length;
  CourseDB.update(courseId, { totalLessons: lessonCount });
  showToast('Đã xóa bài học', 'success');
  filterLessonsByCourse(courseId);
};

// ─── Quizzes ───────────────────────────────────────────────────
function renderQuizzes(el) {
  const quizzes = QuizDB.getAll();
  el.innerHTML = `
    <div class="admin-table-card">
      <div class="table-header">
        <span class="table-title">Quản lý bài kiểm tra (${quizzes.length})</span>
        <button class="btn btn-primary btn-sm" onclick="openQuizModal()">+ Tạo bài kiểm tra</button>
      </div>
      <table class="data-table">
        <thead><tr><th>Bài kiểm tra</th><th>Khóa học</th><th>Số câu</th><th>Thời gian</th><th>Điểm đạt</th><th>Thao tác</th></tr></thead>
        <tbody>${quizzes.map(q => {
          const c = CourseDB.getById(q.courseId);
          return `<tr>
            <td style="font-weight:600;">${q.title}</td>
            <td style="font-size:13px;">${c ? c.title.substring(0,40) + '...' : '–'}</td>
            <td><span class="badge badge-active">${q.questions.length} câu</span></td>
            <td>⏱ ${q.timeLimit} phút</td>
            <td>${q.passingScore}%</td>
            <td><div class="action-btns">
              <button class="action-btn edit" onclick="openQuizModal(${q.id})">✏️ Sửa</button>
              <button class="action-btn del" onclick="deleteQuiz(${q.id})">🗑️</button>
            </div></td>
          </tr>`;
        }).join('')}
        </tbody>
      </table>
    </div>
    ${quizModalHTML()}`;
}

function quizModalHTML() {
  const courses = CourseDB.getAll();
  return `
  <div class="modal-overlay" id="quizModal">
    <div class="modal" style="max-width:700px;">
      <div class="modal-header">
        <h2 class="modal-title" id="quizModalTitle">Tạo bài kiểm tra</h2>
        <button class="modal-close" onclick="closeModal('quizModal')">✕</button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="qmId">
        <div class="form-row">
          <div class="form-group"><label class="form-label">Tên bài kiểm tra <span class="required">*</span></label><input type="text" class="form-control" id="qmTitle" placeholder="Kiểm tra: Tên khóa học"></div>
          <div class="form-group"><label class="form-label">Khóa học</label>
            <select class="form-control" id="qmCourse">${courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}</select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Thời gian (phút)</label><input type="number" class="form-control" id="qmTime" value="20" min="5"></div>
          <div class="form-group"><label class="form-label">Điểm đạt yêu cầu (%)</label><input type="number" class="form-control" id="qmPass" value="70" min="50" max="100"></div>
        </div>
        <div class="divider"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h4 style="font-weight:700;color:var(--gray-800);">📝 Câu hỏi</h4>
          <button class="btn btn-primary btn-sm" onclick="addQuestion()">+ Thêm câu hỏi</button>
        </div>
        <div id="questionsContainer"></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="closeModal('quizModal')">Hủy</button>
        <button class="btn btn-primary" onclick="saveQuiz()">💾 Lưu bài kiểm tra</button>
      </div>
    </div>
  </div>`;
}

let _editQuizQuestions = [];

function renderQuestionsUI() {
  const cont = document.getElementById('questionsContainer');
  if (!cont) return;
  if (!_editQuizQuestions.length) {
    cont.innerHTML = '<div style="text-align:center;padding:24px;color:var(--gray-500);background:var(--gray-50);border-radius:var(--radius);">Chưa có câu hỏi. Nhấn "Thêm câu hỏi" để bắt đầu.</div>';
    return;
  }
  cont.innerHTML = _editQuizQuestions.map((q, qi) => `
    <div style="background:var(--gray-50);border-radius:var(--radius);padding:16px;margin-bottom:16px;border:1px solid var(--gray-200);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <span style="font-weight:700;color:var(--primary);">Câu ${qi + 1}</span>
        <button onclick="removeQuestion(${qi})" style="margin-left:auto;background:var(--danger);color:white;border:none;border-radius:99px;padding:4px 10px;font-size:12px;cursor:pointer;">Xóa</button>
      </div>
      <div class="form-group" style="margin-bottom:12px;">
        <input type="text" class="form-control" placeholder="Nội dung câu hỏi..." value="${q.text}" oninput="_editQuizQuestions[${qi}].text=this.value">
      </div>
      ${q.options.map((opt, oi) => `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <input type="radio" name="correct-${qi}" value="${oi}" ${q.correct === oi ? 'checked' : ''} onchange="_editQuizQuestions[${qi}].correct=${oi}" style="width:16px;height:16px;accent-color:var(--success);" title="Đáp án đúng">
          <input type="text" class="form-control" style="flex:1;padding:8px 12px;" placeholder="Đáp án ${String.fromCharCode(65+oi)}..." value="${opt}" oninput="_editQuizQuestions[${qi}].options[${oi}]=this.value">
        </div>`).join('')}
      <div style="font-size:12px;color:var(--gray-500);margin-top:4px;">💡 Click vào radio button để chọn đáp án đúng</div>
    </div>`).join('');
}

window.addQuestion = function() {
  _editQuizQuestions.push({ id: Date.now(), text: '', options: ['', '', '', ''], correct: 0 });
  renderQuestionsUI();
};

window.removeQuestion = function(idx) {
  _editQuizQuestions.splice(idx, 1);
  renderQuestionsUI();
};

window.openQuizModal = function(id) {
  _editQuizQuestions = [];
  if (id) {
    const q = QuizDB.getById(id);
    if (!q) return;
    document.getElementById('quizModalTitle').textContent = 'Chỉnh sửa bài kiểm tra';
    document.getElementById('qmId').value = q.id;
    document.getElementById('qmTitle').value = q.title;
    document.getElementById('qmCourse').value = q.courseId;
    document.getElementById('qmTime').value = q.timeLimit;
    document.getElementById('qmPass').value = q.passingScore;
    _editQuizQuestions = q.questions.map(q => ({ ...q, options: [...q.options] }));
  } else {
    document.getElementById('quizModalTitle').textContent = 'Tạo bài kiểm tra';
    document.getElementById('qmId').value = '';
    ['qmTitle'].forEach(i => document.getElementById(i).value = '');
    document.getElementById('qmTime').value = 20;
    document.getElementById('qmPass').value = 70;
  }
  renderQuestionsUI();
  openModal('quizModal');
};

window.saveQuiz = function() {
  const id = document.getElementById('qmId').value;
  const title = document.getElementById('qmTitle').value.trim();
  if (!title) { showToast('Vui lòng nhập tên bài kiểm tra', 'error'); return; }
  if (!_editQuizQuestions.length) { showToast('Vui lòng thêm ít nhất 1 câu hỏi', 'error'); return; }
  const data = {
    title,
    courseId: parseInt(document.getElementById('qmCourse').value),
    timeLimit: parseInt(document.getElementById('qmTime').value) || 20,
    passingScore: parseInt(document.getElementById('qmPass').value) || 70,
    questions: _editQuizQuestions.map((q, i) => ({ ...q, id: i + 1 })),
  };
  if (id) { QuizDB.update(id, data); showToast('Cập nhật bài kiểm tra thành công!', 'success'); }
  else { QuizDB.create(data); showToast('Tạo bài kiểm tra thành công!', 'success'); }
  closeModal('quizModal');
  renderQuizzes(document.getElementById('adminContent'));
};

window.deleteQuiz = function(id) {
  if (!confirm('Xóa bài kiểm tra này?')) return;
  QuizDB.delete(id);
  showToast('Đã xóa bài kiểm tra', 'success');
  renderQuizzes(document.getElementById('adminContent'));
};

// ─── Results ───────────────────────────────────────────────────
function renderResults(el) {
  const results = [...ResultDB.getAll()].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const users = UserDB.getAll();
  const courses = CourseDB.getAll();

  el.innerHTML = `
    <div class="admin-table-card">
      <div class="table-header">
        <span class="table-title">Kết quả bài kiểm tra (${results.length} bài nộp)</span>
        <div class="table-actions">
          <select class="filter-select" id="resultRoleFilter" onchange="filterResults()">
            <option value="">Tất cả vai trò</option>
            ${Object.entries(ROLE_LABELS).map(([r, l]) => `<option value="${r}">${l}</option>`).join('')}
          </select>
          <select class="filter-select" id="resultCourseFilter" onchange="filterResults()">
            <option value="">Tất cả khóa học</option>
            ${courses.map(c => `<option value="${c.id}">${c.title.substring(0,40)}</option>`).join('')}
          </select>
        </div>
      </div>
      <div id="resultsTableBody">
        ${renderResultRows(results)}
      </div>
    </div>`;
}

function renderResultRows(results) {
  if (!results.length) return '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Chưa có kết quả</div><div class="empty-desc">Học viên chưa nộp bài kiểm tra nào.</div></div>';
  return `<table class="data-table">
    <thead><tr><th>Học viên</th><th>Vai trò</th><th>Khóa học</th><th>Điểm</th><th>Kết quả</th><th>Câu đúng</th><th>Thời gian</th><th>Ngày nộp</th></tr></thead>
    <tbody>${results.map(r => {
      const u = UserDB.getById(r.userId);
      const c = CourseDB.getById(r.courseId);
      const mins = Math.floor((r.timeTaken||0)/60);
      const secs = (r.timeTaken||0) % 60;
      return `<tr>
        <td><div class="user-cell"><div class="avatar" style="background:${u ? ROLE_COLORS[u.role] : '#ccc'}">${u ? u.name.charAt(0) : '?'}</div><div><div class="u-name">${u ? u.name : 'Đã xóa'}</div><div class="u-email">${u ? u.email : ''}</div></div></div></td>
        <td>${u ? `<span class="badge badge-${u.role}">${ROLE_LABELS[u.role]}</span>` : '–'}</td>
        <td style="font-size:13px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c ? c.title : 'Đã xóa'}</td>
        <td><strong style="font-size:18px;color:${r.passed ? 'var(--success)' : 'var(--danger)'};">${r.score}%</strong></td>
        <td><span class="badge ${r.passed ? 'badge-active' : 'badge-inactive'}">${r.passed ? '✅ Đạt' : '❌ Chưa đạt'}</span></td>
        <td style="font-size:13px;">${r.correctCount}/${r.totalQuestions} câu</td>
        <td style="font-size:13px;">⏱ ${mins}:${String(secs).padStart(2,'0')}</td>
        <td style="font-size:12px;color:var(--gray-500);">${formatDate(r.submittedAt)}</td>
      </tr>`;
    }).join('')}</tbody></table>`;
}

window.filterResults = function() {
  const roleF = document.getElementById('resultRoleFilter').value;
  const courseF = document.getElementById('resultCourseFilter').value;
  let results = [...ResultDB.getAll()].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  if (roleF) {
    const uids = UserDB.getAll().filter(u => u.role === roleF).map(u => u.id);
    results = results.filter(r => uids.includes(r.userId));
  }
  if (courseF) results = results.filter(r => r.courseId === parseInt(courseF));
  const body = document.getElementById('resultsTableBody');
  if (body) body.innerHTML = renderResultRows(results);
};

// ─── Categories ────────────────────────────────────────────────
function renderCategories(el) {
  const cats = CategoryDB.getAll();
  el.innerHTML = `
    <div class="admin-table-card">
      <div class="table-header">
        <span class="table-title">Danh mục (${cats.length})</span>
        <button class="btn btn-primary btn-sm" onclick="openCatModal()">+ Thêm danh mục</button>
      </div>
      <table class="data-table">
        <thead><tr><th>Danh mục</th><th>Icon</th><th>Màu sắc</th><th>Mô tả</th><th>Thao tác</th></tr></thead>
        <tbody>${cats.map(c => `
          <tr>
            <td style="font-weight:600;">${c.name}</td>
            <td style="font-size:24px;">${c.icon}</td>
            <td><div style="display:flex;align-items:center;gap:8px;"><div style="width:24px;height:24px;border-radius:50%;background:${c.color};"></div><span style="font-size:13px;">${c.color}</span></div></td>
            <td style="font-size:13px;color:var(--gray-500);">${c.description || '–'}</td>
            <td><div class="action-btns">
              <button class="action-btn edit" onclick="openCatModal(${c.id})">✏️ Sửa</button>
              <button class="action-btn del" onclick="deleteCat(${c.id})">🗑️</button>
            </div></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div class="modal-overlay" id="catModal">
      <div class="modal" style="max-width:520px;">
        <div class="modal-header"><h2 class="modal-title" id="catModalTitle">Thêm danh mục</h2><button class="modal-close" onclick="closeModal('catModal')">✕</button></div>
        <div class="modal-body">
          <input type="hidden" id="catId">
          <div class="form-group"><label class="form-label">Tên danh mục <span class="required">*</span></label><input type="text" class="form-control" id="catName" placeholder="Tên danh mục"></div>
          
          <!-- Icon Picker -->
          <div class="form-group">
            <label class="form-label">🎨 Chọn icon (click để chọn)</label>
            <div id="catIconPreview" style="font-size:36px;text-align:center;padding:12px;background:var(--gray-50);border-radius:var(--radius);margin-bottom:10px;cursor:default;border:2px solid var(--primary);">📚</div>
            <input type="hidden" id="catIcon" value="📚">
            <div id="iconPickerGrid" style="display:grid;grid-template-columns:repeat(8,1fr);gap:4px;max-height:200px;overflow-y:auto;padding:8px;background:var(--gray-50);border-radius:var(--radius);border:1px solid var(--gray-200);">
            </div>
            <div style="font-size:12px;color:var(--gray-400);margin-top:6px;">Hoặc nhập emoji tùy chỉnh:</div>
            <input type="text" class="form-control" id="catIconCustom" placeholder="Nhập emoji bất kỳ..." maxlength="4" style="margin-top:6px;" oninput="updateIconFromCustom(this.value)">
          </div>

          <div class="form-group"><label class="form-label">Màu chủ đạo</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;" id="colorPalette"></div>
            <input type="color" class="form-control" id="catColor" value="#1a3a6b" style="height:40px;" oninput="updateColorPreview(this.value)">
          </div>
          <div class="form-group"><label class="form-label">Mô tả</label><textarea class="form-control" id="catDesc" rows="2" placeholder="Mô tả danh mục..."></textarea></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('catModal')">Hủy</button>
          <button class="btn btn-primary" onclick="saveCat()">💾 Lưu</button>
        </div>
      </div>
    </div>`;
}

// ─── Icon Picker Helpers ───────────────────────────────────────
const CATEGORY_ICONS = [
  '🤖','🖨️','💻','📹','🔧','💡','📋','🏢','📚','📊','🎓','🔐','💼','🏆',
  '📱','🖥️','⚙️','🔌','📡','🖱️','⌨️','🖨','📄','📁','🗂️','✏️','📝','🔍',
  '💰','📈','📉','🎯','🎪','🏅','⭐','🌟','💎','🔑','🛡️','⚡','🌐','📡',
  '🎬','🎥','📸','🎙️','🔊','📺','📻','🎮','🕹️','🎲','🎭','🎨','✨','🌈',
  '🏗️','🏭','🏬','🏪','🏫','🏛️','🔬','🧪','🧬','🔭','💊','🌱','♻️','🌍',
];
const COLOR_PALETTE = [
  '#1a3a6b','#7c3aed','#0891b2','#059669','#d97706','#f5a623',
  '#e11d48','#28a745','#dc3545','#6366f1','#0ea5e9','#10b981',
  '#f59e0b','#8b5cf6','#ec4899','#14b8a6','#fb923c','#64748b',
];

function initIconPicker(currentIcon, currentColor) {
  // Render icon grid
  const grid = document.getElementById('iconPickerGrid');
  const preview = document.getElementById('catIconPreview');
  const hiddenInput = document.getElementById('catIcon');
  if (!grid) return;
  grid.innerHTML = CATEGORY_ICONS.map(icon => `
    <button type="button" onclick="selectIcon('${icon}')" title="${icon}"
      style="font-size:22px;padding:6px;border:2px solid ${icon===currentIcon?'var(--primary)':'transparent'};
      border-radius:8px;background:${icon===currentIcon?'rgba(26,58,107,.1)':'transparent'};
      cursor:pointer;transition:all .15s;line-height:1;"
      onmouseover="this.style.background='rgba(26,58,107,.08)'"
      onmouseout="this.style.background='${icon===currentIcon?'rgba(26,58,107,.1)':'transparent'}'">
      ${icon}
    </button>`).join('');
  if (preview) preview.textContent = currentIcon || '📚';
  if (hiddenInput) hiddenInput.value = currentIcon || '📚';

  // Render color palette
  const palette = document.getElementById('colorPalette');
  if (palette) {
    palette.innerHTML = COLOR_PALETTE.map(c => `
      <button type="button" onclick="selectColor('${c}')"
        style="width:28px;height:28px;border-radius:50%;background:${c};
        border:3px solid ${c===currentColor?'var(--gray-800)':'transparent'};
        cursor:pointer;transition:transform .15s;"
        onmouseover="this.style.transform='scale(1.2)'"
        onmouseout="this.style.transform='scale(1)'"
        title="${c}"></button>`).join('');
  }
  document.getElementById('catColor').value = currentColor || '#1a3a6b';
}

window.selectIcon = function(icon) {
  document.getElementById('catIcon').value = icon;
  document.getElementById('catIconPreview').textContent = icon;
  document.getElementById('catIconCustom').value = '';
  // Re-highlight
  document.querySelectorAll('#iconPickerGrid button').forEach(btn => {
    const isSelected = btn.textContent.trim() === icon;
    btn.style.border = isSelected ? '2px solid var(--primary)' : '2px solid transparent';
    btn.style.background = isSelected ? 'rgba(26,58,107,.1)' : 'transparent';
  });
};

window.updateIconFromCustom = function(val) {
  if (val.trim()) {
    document.getElementById('catIcon').value = val.trim();
    document.getElementById('catIconPreview').textContent = val.trim();
    document.querySelectorAll('#iconPickerGrid button').forEach(b => { b.style.border='2px solid transparent'; b.style.background='transparent'; });
  }
};

window.selectColor = function(color) {
  document.getElementById('catColor').value = color;
  document.querySelectorAll('#colorPalette button').forEach(btn => {
    btn.style.border = btn.title === color ? '3px solid var(--gray-800)' : '3px solid transparent';
  });
};

window.updateColorPreview = function(color) {
  document.querySelectorAll('#colorPalette button').forEach(btn => {
    btn.style.border = btn.title === color ? '3px solid var(--gray-800)' : '3px solid transparent';
  });
};

window.openCatModal = function(id) {
  if (id) {
    const c = CategoryDB.getById(id);
    if (!c) return;
    document.getElementById('catModalTitle').textContent = 'Chỉnh sửa danh mục';
    document.getElementById('catId').value = c.id;
    document.getElementById('catName').value = c.name;
    document.getElementById('catDesc').value = c.description || '';
    openModal('catModal');
    setTimeout(() => initIconPicker(c.icon, c.color), 50);
  } else {
    document.getElementById('catModalTitle').textContent = 'Thêm danh mục';
    document.getElementById('catId').value = '';
    ['catName','catDesc'].forEach(i => document.getElementById(i).value = '');
    openModal('catModal');
    setTimeout(() => initIconPicker('📚', '#1a3a6b'), 50);
  }
};

window.saveCat = function() {
  const id = document.getElementById('catId').value;
  const name = document.getElementById('catName').value.trim();
  if (!name) { showToast('Vui lòng nhập tên danh mục', 'error'); return; }
  const data = { name, icon: document.getElementById('catIcon').value || '📚', color: document.getElementById('catColor').value, description: document.getElementById('catDesc').value.trim() };
  if (id) { CategoryDB.update(id, data); showToast('Cập nhật danh mục!', 'success'); }
  else { CategoryDB.create(data); showToast('Thêm danh mục!', 'success'); }
  closeModal('catModal');
  renderCategories(document.getElementById('adminContent'));
};

window.deleteCat = function(id) {
  if (!confirm('Xóa danh mục này?')) return;
  CategoryDB.delete(id);
  showToast('Đã xóa danh mục', 'success');
  renderCategories(document.getElementById('adminContent'));
};

// ─── Settings ─────────────────────────────────────────────────
function getSiteSettings() {
  try { return JSON.parse(localStorage.getItem('vps_site_settings')) || {}; } catch { return {}; }
}
function saveSiteSettings(data) {
  const current = getSiteSettings();
  localStorage.setItem('vps_site_settings', JSON.stringify({ ...current, ...data }));
}

function renderSettings(el) {
  const s = getSiteSettings();
  el.innerHTML = `
    <div class="admin-table-card" style="max-width:700px;margin:0 auto;">
      <div class="table-header">
        <span class="table-title">🌐 Cài đặt mạng xã hội & Liên hệ</span>
      </div>
      <div style="padding:28px;display:flex;flex-direction:column;gap:24px;">

        <div style="background:rgba(26,58,107,.04);border-radius:var(--radius);padding:20px;border:1px solid var(--gray-200);">
          <div style="font-size:15px;font-weight:700;color:var(--primary);margin-bottom:16px;">📱 Mạng xã hội</div>
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="form-group" style="margin:0;">
              <label class="form-label">🌐 Facebook Page URL</label>
              <input type="url" id="settingFb" class="form-control" placeholder="https://facebook.com/tenpage" value="${s.facebook||''}">
              <div style="font-size:12px;color:var(--gray-400);margin-top:4px;">Nhập URL trang Facebook của công ty</div>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">▶ YouTube Channel URL</label>
              <input type="url" id="settingYt" class="form-control" placeholder="https://youtube.com/@tenkenhnh" value="${s.youtube||''}">
              <div style="font-size:12px;color:var(--gray-400);margin-top:4px;">Nhập URL kênh YouTube</div>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">Z Zalo OA URL</label>
              <input type="url" id="settingZalo" class="form-control" placeholder="https://zalo.me/.." value="${s.zalo||''}">
              <div style="font-size:12px;color:var(--gray-400);margin-top:4px;">Nhập link Zalo Official Account</div>
            </div>
          </div>
        </div>

        <div style="background:rgba(26,58,107,.04);border-radius:var(--radius);padding:20px;border:1px solid var(--gray-200);">
          <div style="font-size:15px;font-weight:700;color:var(--primary);margin-bottom:16px;">📞 Thông tin liên hệ</div>
          <div style="display:flex;flex-direction:column;gap:14px;">
            <div class="form-group" style="margin:0;">
              <label class="form-label">📞 Hotline</label>
              <input type="text" id="settingPhone" class="form-control" placeholder="0988 739 896" value="${s.phone||'0988 739 896'}">
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">📧 Email liên hệ</label>
              <input type="email" id="settingEmail" class="form-control" placeholder="contact@vpsgroup.vn" value="${s.email||'contact@vpsgroup.vn'}">
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">🌐 Website</label>
              <input type="text" id="settingWeb" class="form-control" placeholder="vpsgroup.vn" value="${s.website||'vpsgroup.vn'}">
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label">📍 Địa chỉ</label>
              <input type="text" id="settingAddr" class="form-control" placeholder="Hà Nội, Việt Nam" value="${s.address||'Hà Nội, Việt Nam'}">
            </div>
          </div>
        </div>

        <div style="display:flex;gap:12px;">
          <button class="btn btn-primary" onclick="saveSettings()" style="flex:1;">💾 Lưu cài đặt</button>
          <button class="btn btn-secondary" onclick="previewSocialLinks()">👁 Xem trước</button>
        </div>

        <div style="background:rgba(40,167,69,.06);border-radius:var(--radius);padding:16px;border:1px solid rgba(40,167,69,.2);font-size:13px;color:var(--gray-600);">
          ℹ️ <strong>Lưu ý:</strong> Sau khi lưu, các link mạng xã hội sẽ hiển thị ở footer trang chủ khi người dùng truy cập. Cài đặt được lưu vào trình duyệt của máy chủ.
        </div>
      </div>
    </div>`;
}

window.saveSettings = function() {
  const s = {
    facebook: document.getElementById('settingFb').value.trim(),
    youtube: document.getElementById('settingYt').value.trim(),
    zalo: document.getElementById('settingZalo').value.trim(),
    phone: document.getElementById('settingPhone').value.trim(),
    email: document.getElementById('settingEmail').value.trim(),
    website: document.getElementById('settingWeb').value.trim(),
    address: document.getElementById('settingAddr').value.trim(),
  };
  saveSiteSettings(s);
  showToast('✅ Đã lưu cài đặt thành công!', 'success');
};

window.previewSocialLinks = function() {
  const s = getSiteSettings();
  alert(`📱 Mạng xã hội hiện tại:\n
🌐 Facebook: ${s.facebook||'Chưa cài đặt'}\n▶ YouTube: ${s.youtube||'Chưa cài đặt'}\nZ Zalo: ${s.zalo||'Chưa cài đặt'}\n\n📞 ${s.phone||'0988 739 896'} | 📧 ${s.email||'contact@vpsgroup.vn'}`);
};

// ─── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initAdmin);
