// ============================================================
// VPS Academy – App Logic (Homepage & Courses)
// ============================================================

// ─── Hero Slider ──────────────────────────────────────────────
let sliderIndex = 0;
let sliderTimer = null;

function initSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;

  function goTo(idx) {
    slides.forEach((s, i) => s.classList.toggle('active', i === idx));
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    sliderIndex = idx;
  }

  function next() { goTo((sliderIndex + 1) % slides.length); }
  function prev() { goTo((sliderIndex - 1 + slides.length) % slides.length); }

  const nextBtn = document.getElementById('sliderNext');
  const prevBtn = document.getElementById('sliderPrev');
  if (nextBtn) nextBtn.addEventListener('click', () => { clearInterval(sliderTimer); next(); sliderTimer = setInterval(next, 5000); });
  if (prevBtn) prevBtn.addEventListener('click', () => { clearInterval(sliderTimer); prev(); sliderTimer = setInterval(next, 5000); });

  dots.forEach((dot, i) => dot.addEventListener('click', () => { clearInterval(sliderTimer); goTo(i); sliderTimer = setInterval(next, 5000); }));
  sliderTimer = setInterval(next, 5000);
  goTo(0);
}

// ─── Course Card Builder ───────────────────────────────────────
function buildCourseCard(course, currentUser) {
  const category = CategoryDB.getById(course.categoryId);
  const catName = category ? category.name : '';
  const catColor = category ? category.color : '#1a3a6b';
  const enrolled = currentUser ? EnrollmentDB.isEnrolled(currentUser.id, course.id) : false;
  const progress = currentUser ? ProgressDB.get(currentUser.id, course.id) : { completedLessons: [] };
  const pct = Math.round((progress.completedLessons.length / Math.max(course.totalLessons, 1)) * 100);
  const levelColor = LEVEL_COLORS[course.level] || '#28a745';

  return `
    <div class="course-card fade-in-up" onclick="window.location='course-detail.html?id=${course.id}'">
      <div class="course-thumb">
        <div style="width:100%;height:100%;background:linear-gradient(135deg,${catColor},${catColor}aa);display:flex;align-items:center;justify-content:center;font-size:52px;">
          ${category ? category.icon : '📚'}
        </div>
        <div class="course-thumb-overlay"></div>
        <div class="course-play-btn">▶</div>
        <span class="course-level-badge" style="background:${levelColor};color:white;">${course.level}</span>
      </div>
      <div class="course-body">
        <div class="course-category" style="color:${catColor}">${catName}</div>
        <div class="course-title">${course.title}</div>
        <div class="course-instructor">${course.instructor}</div>
        <div class="course-meta">
          <div class="course-meta-item"><span class="mi">🕐</span>${course.duration}</div>
          <div class="course-meta-item"><span class="mi">📚</span>${course.totalLessons} bài học</div>
        </div>
        <div class="course-rating">
          <span class="stars">${generateStars(course.rating)}</span>
          <span class="rating-val">${course.rating}</span>
        </div>
        ${enrolled && pct > 0 ? `<div style="margin-top:10px"><div style="font-size:11px;color:var(--gray-500);margin-bottom:4px;">Tiến độ: ${pct}%</div><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div></div>` : ''}
        <div class="course-footer">
          <span class="course-enroll-count">👥 ${course.enrollCount || 0} học viên</span>
          <span class="course-cta ${enrolled ? 'enrolled'  : ''}">${enrolled ? '▶ Tiếp tục' : 'Đăng ký'}</span>
        </div>
      </div>
    </div>`;
}

// ─── Load Homepage ─────────────────────────────────────────────
function loadHomepage() {
  const user = Auth.getCurrentUser();
  const allCourses = user ? CourseDB.getByRole(user.role) : CourseDB.getAll().filter(c => c.status === 'active');
  const categories = CategoryDB.getAll();

  // Category bar
  const catBar = document.getElementById('categoryBar');
  if (catBar) {
    catBar.innerHTML = `
      <div class="cat-item active" data-cat="all" onclick="filterCourses('all', this)">
        <span class="cat-icon">🏠</span>
        <span class="cat-label">Tất cả</span>
      </div>
      ${categories.map(c => `
        <div class="cat-item${c.id === 8 ? ' cat-highlight' : ''}" data-cat="${c.id}" onclick="filterCourses('${c.id}', this)">
          <span class="cat-icon">${c.icon}</span>
          <span class="cat-label">${c.name}</span>
        </div>
      `).join('')}`;
  }

  // Render courses
  renderCourseGrid(allCourses, user);

  // Stats
  const totalUsers = UserDB.getAll().length;
  const totalCourses = CourseDB.getAll().length;
  const totalResults = ResultDB.getAll().length;
  setElText('statUsers', totalUsers);
  setElText('statCourses', totalCourses);
  setElText('statResults', totalResults);
}

function renderCourseGrid(courses, user) {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;
  if (!courses.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">📚</div>
      <div class="empty-title">Không có khóa học nào</div>
      <div class="empty-desc">Hiện chưa có khóa học phù hợp với quyền truy cập của bạn.</div>
    </div>`;
    return;
  }
  grid.innerHTML = courses.map(c => buildCourseCard(c, user)).join('');
}

window.filterCourses = function(catId, el) {
  document.querySelectorAll('.cat-item').forEach(i => i.classList.remove('active'));
  if (el) el.classList.add('active');
  const user = Auth.getCurrentUser();
  const allCourses = user ? CourseDB.getByRole(user.role) : CourseDB.getAll().filter(c => c.status === 'active');
  const filtered = catId === 'all' ? allCourses : allCourses.filter(c => c.categoryId === parseInt(catId));
  renderCourseGrid(filtered, user);
};

// ─── Load Courses Page ─────────────────────────────────────────
function loadCoursesPage() {
  const user = Auth.getCurrentUser();
  const allCourses = user ? CourseDB.getByRole(user.role) : CourseDB.getAll().filter(c => c.status === 'active');
  const categories = CategoryDB.getAll();
  const params = new URLSearchParams(window.location.search);
  const searchQ = (params.get('q') || '').toLowerCase();
  const catFilter = params.get('cat') || '';
  const levelFilter = params.get('level') || '';

  let filtered = allCourses;
  if (searchQ) filtered = filtered.filter(c => c.title.toLowerCase().includes(searchQ) || c.description.toLowerCase().includes(searchQ) || c.instructor.toLowerCase().includes(searchQ));
  if (catFilter) filtered = filtered.filter(c => c.categoryId === parseInt(catFilter));
  if (levelFilter) filtered = filtered.filter(c => c.level === levelFilter);

  // Category filter
  const catSelect = document.getElementById('catFilter');
  if (catSelect) {
    catSelect.innerHTML = `<option value="">Tất cả danh mục</option>` + categories.map(c => `<option value="${c.id}" ${c.id == catFilter ? 'selected' : ''}>${c.name}</option>`).join('');
    catSelect.addEventListener('change', applyFilters);
  }

  // Level filter
  const levelSelect = document.getElementById('levelFilter');
  if (levelSelect) {
    levelSelect.value = levelFilter;
    levelSelect.addEventListener('change', applyFilters);
  }

  // Search
  const searchInput = document.getElementById('courseSearch');
  if (searchInput) {
    searchInput.value = params.get('q') || '';
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyFilters(); });
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) searchBtn.addEventListener('click', applyFilters);
  }

  setElText('filterCount', `Tìm thấy ${filtered.length} khóa học`);
  renderCourseGrid(filtered, user);
}

function applyFilters() {
  const q = document.getElementById('courseSearch')?.value || '';
  const cat = document.getElementById('catFilter')?.value || '';
  const level = document.getElementById('levelFilter')?.value || '';
  const url = new URL(window.location);
  if (q) url.searchParams.set('q', q); else url.searchParams.delete('q');
  if (cat) url.searchParams.set('cat', cat); else url.searchParams.delete('cat');
  if (level) url.searchParams.set('level', level); else url.searchParams.delete('level');
  window.history.replaceState({}, '', url);
  loadCoursesPage();
}

// ─── Load Course Detail ────────────────────────────────────────
function loadCourseDetail() {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('id');
  if (!courseId) { window.location.href = 'courses.html'; return; }

  const course = CourseDB.getById(courseId);
  if (!course) { window.location.href = 'courses.html'; return; }

  const user = Auth.getCurrentUser();
  const canAccess = user ? Auth.canAccessCourse(course) : false;
  const enrolled = user ? EnrollmentDB.isEnrolled(user.id, courseId) : false;
  const progress = user ? ProgressDB.get(user.id, courseId) : { completedLessons: [] };
  const category = CategoryDB.getById(course.categoryId);
  const lessons = LessonDB.getByCourse(courseId);
  const quiz = QuizDB.getByCourse(courseId);
  const existingResult = user ? ResultDB.getUserCourseResult(user.id, courseId) : null;

  document.title = `${course.title} – VPS Academy`;

  setElHTML('courseTitle', course.title);
  setElHTML('courseDesc', course.description);
  setElHTML('courseInstructor', `👨‍🏫 ${course.instructor}`);
  setElHTML('courseDuration', `🕐 ${course.duration}`);
  setElHTML('courseLessons', `📚 ${course.totalLessons} bài học`);
  setElHTML('courseLevel', `📊 ${course.level}`);
  setElHTML('courseRating', `⭐ ${course.rating}/5`);
  setElHTML('courseCategory', category ? category.name : '');
  setElHTML('courseEnrollCount', `👥 ${course.enrollCount} học viên`);

  // Tags
  const tagsCont = document.getElementById('courseTags');
  if (tagsCont && course.tags) tagsCont.innerHTML = course.tags.map(t => `<span class="tag">#${t}</span>`).join('');

  // Allowed roles
  const rolesEl = document.getElementById('courseRoles');
  if (rolesEl) {
    rolesEl.innerHTML = course.allowedRoles.map(r => `<span class="pill" style="background:${ROLE_COLORS[r]}22;color:${ROLE_COLORS[r]};margin-right:6px;">${ROLE_LABELS[r]}</span>`).join('');
  }

  // Enroll button
  const enrollBtn = document.getElementById('enrollBtn');
  if (enrollBtn) {
    if (!user) {
      enrollBtn.textContent = '🔐 Đăng nhập để học';
      enrollBtn.onclick = () => window.location.href = 'auth.html?redirect=' + encodeURIComponent(window.location.href);
    } else if (!canAccess) {
      enrollBtn.textContent = '🔒 Không có quyền truy cập';
      enrollBtn.disabled = true;
      enrollBtn.style.background = 'var(--gray-300)';
    } else if (enrolled) {
      enrollBtn.textContent = '▶ Tiếp tục học';
      enrollBtn.onclick = () => {
        const firstLesson = lessons[0];
        if (firstLesson) window.location.href = `lesson.html?course=${courseId}&lesson=${firstLesson.id}`;
      };
      enrollBtn.classList.add('enrolled');
    } else {
      enrollBtn.textContent = '✅ Đăng ký khóa học';
      enrollBtn.onclick = () => {
        EnrollmentDB.enroll(user.id, courseId);
        showToast('Đã đăng ký khóa học thành công!', 'success');
        setTimeout(() => window.location.reload(), 800);
      };
    }
  }

  // Quiz button
  const quizBtn = document.getElementById('quizBtn');
  if (quizBtn) {
    if (!user || !canAccess) { quizBtn.style.display = 'none'; }
    else if (!enrolled) { quizBtn.style.display = 'none'; }
    else {
      quizBtn.style.display = 'flex';
      if (existingResult) {
        quizBtn.innerHTML = `📊 Xem kết quả (${existingResult.score}%)`;
        quizBtn.onclick = () => window.location.href = `quiz.html?course=${courseId}&review=1`;
      } else {
        quizBtn.innerHTML = `📝 Làm bài kiểm tra`;
        quizBtn.onclick = () => window.location.href = `quiz.html?course=${courseId}`;
      }
    }
  }

  // Lesson list
  const lessonListEl = document.getElementById('lessonList');
  if (lessonListEl) {
    const pct = Math.round((progress.completedLessons.length / Math.max(course.totalLessons, 1)) * 100);
    lessonListEl.innerHTML = `
      <div class="lesson-list-header">
        <span class="lesson-list-title">📋 Nội dung khóa học</span>
        ${enrolled ? `<span style="font-size:13px;color:var(--gray-500)">Hoàn thành: ${pct}%</span>` : ''}
      </div>
      ${lessons.map((l, i) => {
        const done = progress.completedLessons.includes(l.id);
        const canOpen = user && canAccess && enrolled;
        return `
          <div class="lesson-item ${done ? 'completed' : ''}" onclick="${canOpen ? `window.location='lesson.html?course=${courseId}&lesson=${l.id}'` : ''}">
            <div class="lesson-num">${done ? '✓' : i + 1}</div>
            <div class="lesson-info">
              <div class="lesson-name">${l.title}</div>
              <div class="lesson-dur">🕐 ${l.duration}${l.docName ? ' · 📄 Có tài liệu' : ''}</div>
            </div>
            ${done ? '<span class="lesson-check">✅</span>' : (canOpen ? '<span style="color:var(--gray-400);font-size:18px;">›</span>' : '<span style="font-size:16px;">🔒</span>')}
          </div>`;
      }).join('')}
      ${quiz ? `
        <div class="lesson-item" style="background:rgba(245,166,35,.05);border-left:3px solid var(--secondary);" 
          onclick="${user && enrolled ? `window.location='quiz.html?course=${courseId}'` : ''}">
          <div class="lesson-num" style="background:var(--secondary);color:white;">📝</div>
          <div class="lesson-info">
            <div class="lesson-name">${quiz.title}</div>
            <div class="lesson-dur">⏱ ${quiz.timeLimit} phút · ${quiz.questions.length} câu hỏi</div>
          </div>
          ${existingResult ? `<span class="pill" style="background:var(--success);color:white;">${existingResult.score}%</span>` : '<span style="color:var(--secondary);font-size:18px;">›</span>'}
        </div>` : ''}`;
  }

  // Progress bar header
  if (enrolled && user) {
    const pct = Math.round((progress.completedLessons.length / Math.max(course.totalLessons, 1)) * 100);
    const progressEl = document.getElementById('courseProgress');
    if (progressEl) {
      progressEl.innerHTML = `
        <div style="font-size:13px;color:rgba(255,255,255,.7);margin-bottom:8px;">Tiến độ của bạn: ${pct}%</div>
        <div class="progress-bar" style="height:8px;">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>`;
    }
  }
}

// ─── Load Lesson Page ──────────────────────────────────────────
function loadLessonPage() {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get('course');
  const lessonId = params.get('lesson');
  if (!courseId || !lessonId) { window.location.href = 'courses.html'; return; }

  const user = Auth.getCurrentUser();
  if (!Auth.requireLogin()) return;

  const course = CourseDB.getById(courseId);
  const lesson = LessonDB.getById(lessonId);
  if (!course || !lesson) { window.location.href = 'courses.html'; return; }

  if (!Auth.canAccessCourse(course)) {
    showToast('Bạn không có quyền truy cập khóa học này', 'error');
    setTimeout(() => window.location.href = 'courses.html', 1500);
    return;
  }

  // Auto-enroll
  EnrollmentDB.enroll(user.id, courseId);

  const lessons = LessonDB.getByCourse(courseId);
  const currentIdx = lessons.findIndex(l => l.id === parseInt(lessonId));
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;
  const progress = ProgressDB.get(user.id, courseId);

  document.title = `${lesson.title} – VPS Academy`;

  // ── Lesson list sidebar ──────────────────────────────────────
  const sidebarList = document.getElementById('sidebarLessonList');
  if (sidebarList) {
    const quiz = QuizDB.getByCourse(courseId);
    sidebarList.innerHTML = lessons.map((l, i) => {
      const done   = progress.completedLessons.includes(l.id);
      const active = l.id === parseInt(lessonId);
      return `
        <div class="lesson-item ${done ? 'completed' : ''} ${active ? 'active' : ''}"
          onclick="window.location='lesson.html?course=${courseId}&lesson=${l.id}'">
          <div class="lesson-num">${done ? '✓' : i + 1}</div>
          <div class="lesson-info">
            <div class="lesson-name">${l.title}</div>
            <div class="lesson-dur">🕐 ${l.duration}${l.videoUrl ? ' · 🎥' : ''}${l.docName ? ' · 📄' : ''}</div>
          </div>
          ${done ? '<span class="lesson-check">✅</span>' : (active ? '<span style="color:var(--secondary);font-size:16px;">▶</span>' : '')}
        </div>`;
    }).join('') + (quiz ? `
      <div class="lesson-item" onclick="window.location='quiz.html?course=${courseId}'" style="background:rgba(245,166,35,.08);">
        <div class="lesson-num" style="background:var(--secondary);color:white;">📝</div>
        <div class="lesson-info"><div class="lesson-name">Bài kiểm tra</div><div class="lesson-dur">${quiz.timeLimit} phút · ${quiz.questions.length} câu</div></div>
      </div>` : '');
  }

  // ── Navigation buttons ───────────────────────────────────────
  const prevBtn = document.getElementById('prevLessonBtn');
  const nextBtn = document.getElementById('nextLessonBtn');
  if (prevBtn) {
    if (prevLesson) { prevBtn.onclick = () => window.location.href = `lesson.html?course=${courseId}&lesson=${prevLesson.id}`; }
    else { prevBtn.disabled = true; prevBtn.style.opacity = '.4'; }
  }
  if (nextBtn) {
    if (nextLesson) { nextBtn.onclick = () => window.location.href = `lesson.html?course=${courseId}&lesson=${nextLesson.id}`; }
    else {
      nextBtn.textContent = '📝 Làm bài kiểm tra';
      nextBtn.onclick = () => window.location.href = `quiz.html?course=${courseId}`;
    }
  }
}


// ─── Utility ───────────────────────────────────────────────────
function setElText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setElHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

// ─── Global Search ─────────────────────────────────────────────
function initGlobalSearch() {
  const form = document.getElementById('globalSearchForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = document.getElementById('globalSearchInput')?.value?.trim();
      if (q) window.location.href = `courses.html?q=${encodeURIComponent(q)}`;
    });
  }
}

// ─── Init Page ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initGlobalSearch();
  const page = document.body.dataset.page;
  if (page === 'home') { initSlider(); loadHomepage(); }
  else if (page === 'courses') loadCoursesPage();
  else if (page === 'course-detail') loadCourseDetail();
  else if (page === 'lesson') loadLessonPage();
});
