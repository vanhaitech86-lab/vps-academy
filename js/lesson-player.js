// ============================================================
// VPS Academy – Protected Video Player v1.0
// Tính năng:
//   1. Anti-scrub: tua nhanh bị phạt, học lại từ đầu
//   2. No download: tài liệu chỉ xem online
//   3. Interactive video: câu hỏi bật ra theo timestamp
// ============================================================

(function () {
  'use strict';

  // ─── Cấu hình ──────────────────────────────────────────────
  const SEEK_TOLERANCE_SEC = 3;   // cho phép jump tối đa 3s
  const SAVE_INTERVAL_MS  = 2000; // lưu tiến độ mỗi 2 giây

  // ─── State ─────────────────────────────────────────────────
  let ytPlayer       = null;
  let maxWatched     = 0;   // thời điểm xa nhất đã xem được
  let lastTime       = 0;
  let monitorTimer   = null;
  let saveTimer      = null;
  let interactionPaused = false;
  let sessionKey     = '';
  let interactiveQs  = [];   // [{id, timestamp, text, options, correct}]
  let answeredSet    = new Set();
  let videoDuration  = 0;
  let lessonCompleted = false;

  // ─── Public API ────────────────────────────────────────────
  window.VPSPlayer = {

    init: function (courseId, lessonId, videoUrl, questions) {
      sessionKey     = 'vps_watch_' + courseId + '_' + lessonId;
      maxWatched     = parseFloat(localStorage.getItem(sessionKey) || '0');
      interactiveQs  = questions || [];

      if (!videoUrl) {
        _showNoVideo('Video chưa được thiết lập cho bài học này');
        return;
      }

      // 1. Xử lý local file (đã upload từ máy tính - lưu dạng Blob trong IndexedDB)
      if (videoUrl.startsWith('local:')) {
        const fileId = videoUrl.replace('local:', '');
        FileStore.getFile(fileId).then(blob => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            _loadHTML5Player(blobUrl, true);
          } else {
            _showNoVideo('Video tải lên hiện chưa có sẵn ở trình duyệt này. Admin cần dùng link Google Drive/YouTube để phát trên mọi thiết bị.');
          }
        }).catch(() => _showNoVideo('Không thể đọc video từ bộ nhớ trình duyệt'));
        return;
      }

      // 2. Xử lý Google Drive video URL
      const gdriveId = _extractGDriveId(videoUrl);
      if (gdriveId) {
        _loadGDrivePlayer(gdriveId);
        return;
      }

      // 3. Xử lý YouTube URL
      const videoId = _extractYTId(videoUrl);
      if (videoId) {
        _loadYTPlayer(videoId);
        return;
      }

      // 4. Video MP4/WebM URL thông thường
      _loadHTML5Player(videoUrl, false);
    },

    // Gọi khi bấm nút "Đánh dấu hoàn thành" từ bên ngoài
    isWatchedEnough: function () {
      if (videoDuration <= 0) return true; // không có video → cho phép
      return (maxWatched / videoDuration) >= 0.85; // phải xem ≥ 85%
    },
  };

  // ─── YouTube IFrame API ────────────────────────────────────
  function _loadYTPlayer(videoId) {
    const wrap = document.getElementById('videoWrap');
    if (!wrap) return;
    wrap.innerHTML = '<div id="ytPlayerDiv"></div>';

    if (window.YT && window.YT.Player) {
      _createYT(videoId);
    } else {
      // Load script
      if (!document.getElementById('ytApiScript')) {
        const s = document.createElement('script');
        s.id  = 'ytApiScript';
        s.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(s);
      }
      window.onYouTubeIframeAPIReady = () => _createYT(videoId);
    }
  }

  function _createYT(videoId) {
    ytPlayer = new YT.Player('ytPlayerDiv', {
      width: '100%', height: '100%',
      videoId: videoId,
      playerVars: {
        rel: 0,
        modestbranding: 1,
        disablekb: 1,          // tắt phím tắt (arrow keys seek)
        fs: 1,
        controls: 1,
        cc_load_policy: 0,
        iv_load_policy: 3,
        playsinline: 1,
      },
      events: {
        onReady:       _onYTReady,
        onStateChange: _onYTState,
      }
    });
  }

  function _onYTReady(e) {
    videoDuration = ytPlayer.getDuration() || 0;
    _startMonitor();
    // Resume từ vị trí đã xem (nếu có)
    if (maxWatched > 5 && maxWatched < videoDuration - 5) {
      ytPlayer.seekTo(maxWatched, true);
    }
  }

  function _onYTState(e) {
    if (e.data === YT.PlayerState.ENDED) {
      _onVideoEnd();
    }
    if (e.data === YT.PlayerState.PLAYING) {
      videoDuration = ytPlayer.getDuration() || videoDuration;
    }
  }

  // ─── Monitor playback (anti-scrub + interactive) ───────────
  function _startMonitor() {
    clearInterval(monitorTimer);
    monitorTimer = setInterval(_tick, 800);

    clearInterval(saveTimer);
    saveTimer = setInterval(_saveProgress, SAVE_INTERVAL_MS);
  }

  function _tick() {
    if (!ytPlayer || interactionPaused) return;
    let cur;
    try { cur = ytPlayer.getCurrentTime(); } catch (e) { return; }

    // ── Anti-scrub check ──
    // Nếu nhảy quá SEEK_TOLERANCE_SEC giây so với maxWatched → vi phạm
    if (cur > maxWatched + SEEK_TOLERANCE_SEC && cur > lastTime + SEEK_TOLERANCE_SEC) {
      _handleViolation();
      return;
    }

    // Cập nhật max đã xem
    if (cur > maxWatched) maxWatched = cur;
    lastTime = cur;

    // Cập nhật UI progress
    _updateProgress(cur, videoDuration);

    // ── Interactive questions ──
    for (const q of interactiveQs) {
      if (!answeredSet.has(q.id) && cur >= q.timestamp && cur < q.timestamp + 1.5) {
        _triggerQuestion(q);
        break;
      }
    }
  }

  function _saveProgress() {
    if (maxWatched > 0) {
      localStorage.setItem(sessionKey, maxWatched.toFixed(2));
    }
  }

  // ─── Vi phạm – tua nhanh ────────────────────────────────────
  function _handleViolation() {
    if (!ytPlayer) return;

    // Dừng và reset về đầu
    ytPlayer.pauseVideo();
    maxWatched = 0;
    lastTime   = 0;
    localStorage.removeItem(sessionKey);
    ytPlayer.seekTo(0, true);

    // Hiện cảnh báo
    _showOverlay('violation');
  }

  // ─── Interactive Question ────────────────────────────────────
  function _triggerQuestion(q) {
    if (!ytPlayer) return;
    ytPlayer.pauseVideo();
    interactionPaused = true;

    const modal   = document.getElementById('iqModal');
    const qText   = document.getElementById('iqText');
    const optsBox = document.getElementById('iqOptions');
    const result  = document.getElementById('iqResult');
    if (!modal) return;

    qText.textContent = q.text;
    result.style.display = 'none';
    result.className = 'iq-result';

    optsBox.innerHTML = q.options.map((opt, i) => `
      <button class="iq-opt" data-idx="${i}" onclick="_handleIQAnswer(${i},${q.correct},${q.id},${q.timestamp},this)">
        <span class="iq-opt-letter">${'ABCD'[i]}</span>
        <span class="iq-opt-text">${opt}</span>
      </button>
    `).join('');

    modal.classList.add('show');
  }

  window._handleIQAnswer = function (selected, correct, qId, timestamp, btn) {
    const optsBox = document.getElementById('iqOptions');
    const result  = document.getElementById('iqResult');
    optsBox.querySelectorAll('.iq-opt').forEach(b => (b.disabled = true));

    if (selected === correct) {
      btn.classList.add('correct');
      result.innerHTML  = '✅ Chính xác! Tiếp tục xem video...';
      result.className  = 'iq-result success';
      result.style.display = 'block';
      answeredSet.add(qId);
      setTimeout(() => {
        document.getElementById('iqModal').classList.remove('show');
        interactionPaused = false;
        ytPlayer && ytPlayer.playVideo();
      }, 1500);
    } else {
      btn.classList.add('wrong');
      optsBox.querySelectorAll('.iq-opt')[correct].classList.add('correct');
      result.innerHTML  = '❌ Chưa đúng! Video sẽ quay lại 15 giây để bạn xem lại phần này.';
      result.className  = 'iq-result error';
      result.style.display = 'block';
      setTimeout(() => {
        document.getElementById('iqModal').classList.remove('show');
        interactionPaused = false;
        if (ytPlayer) {
          const seekBack = Math.max(0, timestamp - 15);
          maxWatched = seekBack;
          lastTime   = seekBack;
          ytPlayer.seekTo(seekBack, true);
          ytPlayer.playVideo();
        } else if (window._html5Vid) {
          const seekBack = Math.max(0, timestamp - 15);
          maxWatched = seekBack;
          window._html5Vid.currentTime = seekBack;
          window._html5Vid.play();
        }
      }, 2800);
    }
  };

  // ─── Video kết thúc ────────────────────────────────────────
  function _onVideoEnd() {
    maxWatched = videoDuration;
    _saveProgress();
    lessonCompleted = true;
    _showOverlay('complete');

    // Mở khóa nút hoàn thành
    const btn = document.getElementById('completeLessonBtn');
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.classList.remove('locked');
    }
  }

  // ─── HTML5 player fallback ──────────────────────────────────
  function _loadHTML5Player(url, isLocal) {
    const wrap = document.getElementById('videoWrap');
    if (!wrap) return;
    wrap.innerHTML = '';

    const vid = document.createElement('video');
    vid.src      = url;
    vid.controls = true;
    vid.style    = 'width:100%;height:100%;background:#000;object-fit:contain;';
    vid.controlsList = 'nodownload';
    vid.disablePictureInPicture = true;
    if (isLocal) vid.setAttribute('playsinline', '');
    wrap.appendChild(vid);

    let html5Max = maxWatched;

    vid.addEventListener('loadedmetadata', () => {
      videoDuration = vid.duration;
      if (html5Max > 5 && html5Max < videoDuration - 5) vid.currentTime = html5Max;
      // Mở khóa nút hoàn thành sau khi video load xong
      const btn = document.getElementById('completeLessonBtn');
      if (btn && videoDuration > 0) { btn.disabled = false; btn.classList.remove('locked'); }
    });

    vid.addEventListener('seeking', () => {
      const seekTo = vid.currentTime;
      if (seekTo > html5Max + SEEK_TOLERANCE_SEC) {
        vid.currentTime = 0;
        html5Max = 0;
        maxWatched = 0;
        localStorage.removeItem(sessionKey);
        _showOverlay('violation');
      }
    });

    vid.addEventListener('timeupdate', () => {
      if (vid.currentTime > html5Max) html5Max = vid.currentTime;
      if (vid.currentTime > maxWatched) maxWatched = vid.currentTime;
      _updateProgress(vid.currentTime, videoDuration);
    });

    vid.addEventListener('ended', _onVideoEnd);

    setInterval(() => localStorage.setItem(sessionKey, maxWatched.toFixed(2)), SAVE_INTERVAL_MS);
  }

  // ─── UI Helpers ─────────────────────────────────────────────
  function _updateProgress(cur, total) {
    if (!total) return;
    const pct = Math.min(100, (cur / total) * 100);
    const fill  = document.getElementById('vpProgressFill');
    const label = document.getElementById('vpProgressLabel');
    const time  = document.getElementById('vpTime');
    if (fill)  fill.style.width = pct + '%';
    if (label) label.textContent = Math.round(pct) + '%';
    if (time)  time.textContent  = _fmt(cur) + ' / ' + _fmt(total);
  }

  function _fmt(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + String(sec).padStart(2, '0');
  }

  function _loadGDrivePlayer(gdriveId) {
    const wrap = document.getElementById('videoWrap');
    if (!wrap) return;
    const embedUrl = `https://drive.google.com/file/d/${gdriveId}/preview`;
    wrap.innerHTML = `<iframe src="${embedUrl}" style="width:100%;height:100%;border:none;background:#000;" allow="autoplay" allowfullscreen></iframe>`;
    const btn = document.getElementById('completeLessonBtn');
    if (btn) { btn.disabled = false; btn.classList.remove('locked'); }
  }

  function _showNoVideo(msg) {
    const wrap = document.getElementById('videoWrap');
    if (wrap) wrap.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#0d1f3c;color:rgba(255,255,255,.8);gap:12px;padding:24px;text-align:center;">
        <span style="font-size:48px;">📹</span>
        <span style="font-size:15px;font-weight:600;max-width:480px;line-height:1.4;">${msg || 'Video đang được cập nhật'}</span>
        <span style="font-size:12px;color:rgba(255,255,255,.5);">Vui lòng kiểm tra lại cấu hình bài học hoặc xem tài liệu bên dưới</span>
      </div>`;
  }

  function _showOverlay(type) {
    const ov = document.getElementById('vpOverlay');
    if (!ov) return;
    if (type === 'violation') {
      ov.innerHTML = `
        <div class="vp-overlay-box warning">
          <div class="vp-ov-icon">⚠️</div>
          <div class="vp-ov-title">Vi phạm – Tua nhanh không được phép!</div>
          <div class="vp-ov-msg">Bạn đã cố gắng tua nhanh video.<br>Video sẽ được <strong>đặt lại từ đầu</strong> để đảm bảo bạn học đủ nội dung.</div>
          <div class="vp-ov-countdown" id="ovCountdown">Tiếp tục sau 5 giây...</div>
        </div>`;
      ov.style.display = 'flex';
      let n = 5;
      const cd = setInterval(() => {
        n--;
        const el = document.getElementById('ovCountdown');
        if (el) el.textContent = 'Tiếp tục sau ' + n + ' giây...';
        if (n <= 0) {
          clearInterval(cd);
          ov.style.display = 'none';
          ytPlayer && ytPlayer.playVideo();
        }
      }, 1000);
    } else if (type === 'complete') {
      ov.innerHTML = `
        <div class="vp-overlay-box success">
          <div class="vp-ov-icon">🎉</div>
          <div class="vp-ov-title">Hoàn thành bài học!</div>
          <div class="vp-ov-msg">Bạn đã xem xong video này.<br>Nhấn <strong>"Đánh dấu hoàn thành"</strong> để chuyển sang bài tiếp theo.</div>
          <button onclick="document.getElementById('vpOverlay').style.display='none'" style="margin-top:16px;padding:10px 24px;background:var(--success);color:white;border:none;border-radius:99px;font-size:14px;font-weight:700;cursor:pointer;">OK</button>
        </div>`;
      ov.style.display = 'flex';
    }
  }

  function _extractGDriveId(url) {
    if (!url) return null;
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return m ? m[1] : null;
  }

  function _extractYTId(url) {
    if (!url) return null;
    url = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    const patterns = [
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return null;
  }
})();
