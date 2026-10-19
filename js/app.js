/**
 * Application logic for Courses Website (1:1 Replica)
 * Optimized for Mobile, Tablets & GitHub Pages
 */

let COURSES = {};
let currentCourseKey = '';
let currentCourse = null;
let currentMonthId = '';
let LESSONS = [];
let currentLessonIdx = 0;
let currentVideoIdx = 0;
let currentQuiz = null;

// Base path helper for GitHub Pages and local subdirectories
function getBasePath() {
  const p = window.location.pathname;
  return p.substring(0, p.lastIndexOf('/') + 1) || './';
}

function resolveUrl(url) {
  if (!url || url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('#')) {
    return url;
  }
  return getBasePath() + url.replace(/^\//, '');
}

const ICONS = {
  grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7l10-5 10 5-10 5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  cal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  pen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  shop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
  help: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
  menu: `<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
  chevron: `<svg class="nav-chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/><path d="M14 3v5h5"/></svg>`,
  hw: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.07 0l2-2a5 5 0 00-7.07-7.07l-1.15 1.15"/><path d="M14 11a5 5 0 00-7.07 0l-2 2A5 5 0 0012 20.07l1.15-1.15"/></svg>`,
  dl: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`
};

function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

// Convert video URL to embeddable player URL without triggering domain restrictions
function getEmbedUrl(rawUrl, timeSec = 0) {
  if (!rawUrl) return '';
  const url = String(rawUrl).trim();
  try {
    const u = new URL(url, window.location.href);
    const host = u.hostname.toLowerCase();

    // YouTube
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '');
      const t = timeSec > 0 ? `&start=${timeSec}` : '';
      return `https://www.youtube.com/embed/${id}?autoplay=0${t}`;
    }
    if (host.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) {
        return timeSec > 0 ? `${url}?start=${timeSec}` : url;
      }
      const v = u.searchParams.get('v');
      const t = timeSec > 0 ? `&start=${timeSec}` : '';
      if (v) return `https://www.youtube.com/embed/${v}?autoplay=0${t}`;
    }
    // Rutube
    if (host.includes('rutube.ru')) {
      const m = u.pathname.match(/^\/(?:video|play\/embed)\/([a-zA-Z0-9_-]+)/);
      const base = m ? `https://rutube.ru/play/embed/${m[1]}` : url;
      return timeSec > 0 ? `${base}?t=${timeSec}` : base;
    }
    // rickege.com
    if (host.includes('rickege.com')) {
      let rUrl = url;
      if (!rUrl.includes('play=1')) {
        rUrl += (rUrl.includes('?') ? '&play=1' : '?play=1');
      }
      if (timeSec > 0) {
        rUrl += `&t=${timeSec}`;
      }
      return rUrl;
    }
    // watch.school-such.site (Authorized host - do not rewrite to kinescope.io to avoid 403 Forbidden)
    if (host.includes('school-such.site')) {
      return url;
    }
    return url;
  } catch (e) {
    return url;
  }
}

// Initialise Theme
function initTheme() {
  const saved = localStorage.getItem('course_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeBtn();
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('course_theme', next);
  updateThemeBtn();
}

function updateThemeBtn() {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  btn.innerHTML = (isDark ? ICONS.sun : ICONS.moon) + `<span>${isDark ? 'Светлая тема' : 'Тёмная тема'}</span>`;
}

// Sidebar toggle & mobile handling
function initSidebar() {
  const app = document.querySelector('.app');
  let collapsed = localStorage.getItem('course_sidebar_collapsed');
  if (collapsed === null) collapsed = '1';
  if (app && window.innerWidth > 820) {
    app.classList.toggle('sidebar-collapsed', collapsed === '1');
  }

  const burger = document.getElementById('burgerBtn');
  const overlay = document.getElementById('sidebarOverlay');
  const sidebar = document.getElementById('sidebar');

  if (burger && overlay && sidebar) {
    burger.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      burger.classList.toggle('open', open);
      overlay.classList.toggle('show', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      burger.classList.remove('open');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    });

    // Auto-close on mobile when selecting a course or section
    sidebar.addEventListener('click', e => {
      if (e.target.closest('a') || e.target.closest('button')) {
        if (window.innerWidth <= 820 && !e.target.closest('#sidebarCollapseBtn')) {
          sidebar.classList.remove('open');
          burger.classList.remove('open');
          overlay.classList.remove('show');
          document.body.style.overflow = '';
        }
      }
    });
  }
}

function toggleDesktopSidebar() {
  if (window.innerWidth <= 820) return;
  const app = document.querySelector('.app');
  if (!app) return;
  const collapsed = app.classList.toggle('sidebar-collapsed');
  localStorage.setItem('course_sidebar_collapsed', collapsed ? '1' : '0');
  const b = document.getElementById('sidebarCollapseBtn');
  if (b) b.title = collapsed ? 'Развернуть меню' : 'Свернуть меню';
}

function filterSidebarCourses(value) {
  const q = String(value || '').trim().toLowerCase();
  document.querySelectorAll('.nav-course-link').forEach(a => {
    const show = !q || String(a.dataset.search || '').includes(q);
    a.classList.toggle('hidden-by-search', !show);
  });
}

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const schools = {};
  Object.keys(COURSES).forEach(k => {
    const c = COURSES[k];
    const sName = c.school_title || c.school || 'Курсы';
    if (!schools[sName]) schools[sName] = [];
    schools[sName].push({ key: k, course: c });
  });

  let groupsHtml = '';
  Object.keys(schools).forEach(sName => {
    const items = schools[sName];
    const listHtml = items.map(({ key, course }) => {
      const active = key === currentCourseKey ? ' active' : '';
      const search = [course.title, course.tag, sName].join(' ').toLowerCase();
      return `<a href="?c=${encodeURIComponent(key)}" class="nav-item nav-course-link${active}" data-search="${escapeHTML(search)}" data-label="${escapeHTML(course.title)}">
        ${ICONS.pen}<span>${escapeHTML(course.title)}</span>
      </a>`;
    }).join('');

    groupsHtml += `
      <div class="nav-group open">
        <button type="button" class="nav-group-title">
          <span class="group-emoji">🏫</span>
          <span class="group-name">${escapeHTML(sName)}</span>
          <span class="group-count">${items.length}</span>
        </button>
        <div class="nav-group-body">${listHtml}</div>
      </div>
    `;
  });

  sidebar.innerHTML = `
    <div class="sidebar-head">
      <button type="button" class="sidebar-collapse-btn" id="sidebarCollapseBtn" onclick="toggleDesktopSidebar()" title="Свернуть/развернуть меню">
        ${ICONS.menu}<span>Курсы</span>
      </button>
    </div>
    <div class="sidebar-search">
      <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/></svg>
      <input id="sidebarCourseSearch" type="search" placeholder="Найти курс..." autocomplete="off" oninput="filterSidebarCourses(this.value)">
    </div>
    <button type="button" class="nav-item" onclick="openScheduleModal()" data-label="Расписание">${ICONS.cal}<span>Расписание</span></button>
    <div class="nav-divider"></div>
    ${groupsHtml}
    <div class="nav-divider"></div>
    <button type="button" class="nav-item" id="themeToggleBtn" onclick="toggleTheme()" data-label="Тема">${ICONS.moon}<span>Тёмная тема</span></button>
  `;
  updateThemeBtn();
}

// Schedule Modal
function openScheduleModal() {
  const modal = document.getElementById('scheduleModal');
  const img = document.getElementById('scheduleImg');
  const dl = document.getElementById('scheduleDownloadBtn');
  if (!modal) return;

  const rawPath = currentCourse?.schedule || 'files/egeland/photos/photo_1@19-10-2026_19-26-14.jpg';
  const fullPath = resolveUrl(rawPath);

  if (img) img.src = fullPath;
  if (dl) dl.href = fullPath;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeScheduleModal(e) {
  if (e && e.target && e.target.classList.contains('schedule-card')) return;
  const modal = document.getElementById('scheduleModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Load Course Config & Months (GitHub Pages safe)
async function loadCourseConfig() {
  const params = new URLSearchParams(window.location.search);
  const requestedKey = params.get('c');

  try {
    const res = await fetch(resolveUrl('data/courses.json'));
    if (!res.ok) throw new Error('Cannot load courses.json');
    COURSES = await res.json();
  } catch (err) {
    console.error('Failed to load courses.json:', err);
  }

  currentCourseKey = requestedKey && COURSES[requestedKey] ? requestedKey : Object.keys(COURSES)[0];
  currentCourse = COURSES[currentCourseKey];

  if (!currentCourse) {
    console.error('No courses configured');
    return;
  }

  document.title = (currentCourse.title || 'Курс') + ' · Boton';
  document.getElementById('courseTag').textContent = currentCourse.tag || 'Курс';
  document.getElementById('courseTitle').textContent = currentCourse.title || currentCourse.h1 || '';

  renderSidebar();
  renderMonthSelect();
  initLikes();
}

function renderMonthSelect() {
  const select = document.querySelector('.month-select');
  if (!select) return;

  const months = currentCourse.months || [];
  if (!months.length) {
    select.innerHTML = '<option>Основной модуль</option>';
    loadLessons();
    return;
  }

  select.innerHTML = months.map(m => `<option value="${escapeHTML(m.id)}">${escapeHTML(m.title)}</option>`).join('');
  currentMonthId = months[0].id;

  select.addEventListener('change', e => {
    currentMonthId = e.target.value;
    loadLessons();
  });

  loadLessons();
}

// Load Lessons
async function loadLessons() {
  const listEl = document.getElementById('lessonList');
  listEl.innerHTML = '<div style="padding:14px;color:var(--text-3);font-size:12.5px;font-weight:600">⏳ Загрузка уроков...</div>';

  const months = currentCourse.months || [];
  const curMonth = months.find(m => m.id === currentMonthId) || months[0];
  const rawDataPath = curMonth ? curMonth.dataPath : `data/courses/${currentCourseKey}/lessons.json`;

  try {
    const res = await fetch(resolveUrl(rawDataPath));
    if (!res.ok) throw new Error('HTTP ' + res.status);
    LESSONS = await res.json();
  } catch (e) {
    console.warn('Could not load lessons from ' + rawDataPath, e);
    LESSONS = [];
  }

  document.getElementById('lessonsTitle').textContent = `Уроки · ${LESSONS.length}`;
  renderLessonList();

  const match = window.location.hash.match(/^#lesson-(\d+)$/);
  const startIdx = match ? Math.min(parseInt(match[1], 10), Math.max(0, LESSONS.length - 1)) : 0;
  selectLesson(startIdx, false);
}

function renderLessonList() {
  const listEl = document.getElementById('lessonList');
  if (!LESSONS.length) {
    listEl.innerHTML = '<div style="padding:14px;color:var(--text-3);font-size:13px;text-align:center">📌 Уроки ещё не добавлены</div>';
    return;
  }

  listEl.innerHTML = LESSONS.map((l, i) => {
    const numDisplay = l.num || (i + 1);
    const dateDisplay = l.date || '';
    return `
      <button type="button" class="lesson-item${i === currentLessonIdx ? ' active' : ''}" data-idx="${i}" onclick="selectLesson(${i}, true)">
        <span class="lesson-num">${escapeHTML(numDisplay)}</span>
        <span class="lesson-body">
          ${dateDisplay ? `<span class="lesson-date">${escapeHTML(dateDisplay)}</span>` : ''}
          <span class="lesson-name">${escapeHTML(l.name || l.title || '')}</span>
        </span>
      </button>
    `;
  }).join('');
}

// Select lesson (with mobile auto-scroll to player)
function selectLesson(idx, isUserClick = false) {
  if (idx < 0 || idx >= LESSONS.length) return;
  currentLessonIdx = idx;
  const lesson = LESSONS[idx];

  history.replaceState(null, '', `#lesson-${idx}`);

  document.querySelectorAll('.lesson-item').forEach(b => b.classList.remove('active'));
  const curBtn = document.querySelector(`.lesson-item[data-idx="${idx}"]`);
  if (curBtn) curBtn.classList.add('active');

  const titleDisplay = (lesson.num && !lesson.name.startsWith('Урок') ? lesson.num + '. ' : '') + (lesson.name || lesson.title || '');
  document.getElementById('lessonHeader').textContent = titleDisplay;

  renderLessonVideo(lesson);
  renderLessonMaterials(lesson);
  renderLessonQuiz(lesson);

  // Smooth scroll up to player on mobile / tablet when user taps a lesson
  if (isUserClick && window.innerWidth <= 1100) {
    const playerWrap = document.getElementById('playerWrap');
    if (playerWrap) {
      playerWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

// Render Video & Multi-video chips
function renderLessonVideo(lesson) {
  const frame = document.getElementById('videoFrame');
  const empty = document.getElementById('playerEmpty');
  const openBtn = document.getElementById('videoOpenBtn');
  const selector = document.getElementById('videoSelector');
  const chipsBox = document.getElementById('videoChips');

  let videos = [];
  if (Array.isArray(lesson.videos) && lesson.videos.length) {
    videos = lesson.videos;
  } else if (Array.isArray(lesson.items)) {
    videos = lesson.items.filter(i => i.type === 'video');
  }

  if (!videos.length) {
    frame.style.display = 'none';
    frame.src = '';
    empty.style.display = 'flex';
    openBtn.style.display = 'none';
    selector.classList.add('hidden');
    renderTimecodes([]);
    return;
  }

  empty.style.display = 'none';
  frame.style.display = 'block';

  if (videos.length > 1) {
    selector.classList.remove('hidden');
    chipsBox.innerHTML = videos.map((v, i) => `
      <button type="button" class="video-chip${i === 0 ? ' active' : ''}" onclick="playVideoIndex(${i})">
        <span class="video-chip-num">${i + 1}</span>
        <span class="video-chip-name">${escapeHTML(v.label || ('Часть ' + (i + 1)))}</span>
      </button>
    `).join('');
  } else {
    selector.classList.add('hidden');
  }

  playVideoIndex(0);
}

function playVideoIndex(i) {
  currentVideoIdx = i;
  const lesson = LESSONS[currentLessonIdx];
  if (!lesson) return;
  const videos = lesson.videos || (lesson.items || []).filter(it => it.type === 'video');
  const v = videos[i];
  if (!v) return;

  document.querySelectorAll('.video-chip').forEach((c, idx) => c.classList.toggle('active', idx === i));

  const frame = document.getElementById('videoFrame');
  const openBtn = document.getElementById('videoOpenBtn');
  
  // Use embed_url directly or getEmbedUrl (maintaining whitelist without 403)
  const embed = v.embed_url || getEmbedUrl(v.url || v.label);
  const rawUrl = v.url || v.label;

  frame.src = embed;
  if (rawUrl) {
    openBtn.href = rawUrl;
    openBtn.style.display = 'inline-flex';
  } else {
    openBtn.style.display = 'none';
  }

  // Render Timecodes for this video
  renderTimecodes(v.chapters || []);
}

// Timecodes & Chapters
function renderTimecodes(chapters) {
  const card = document.getElementById('timecodesCard');
  const list = document.getElementById('timecodesList');
  const count = document.getElementById('timecodesCount');

  if (!chapters || !chapters.length) {
    if (card) card.classList.add('hidden');
    return;
  }

  if (count) count.textContent = chapters.length;
  if (card) {
    card.classList.remove('hidden');
    card.classList.add('open');
  }

  if (list) {
    list.innerHTML = chapters.map((ch, idx) => `
      <button type="button" class="timecode-item${idx === 0 ? ' active' : ''}" data-pos="${ch.position}" onclick="seekToTime(${ch.position}, ${idx})">
        <span class="timecode-badge">${ch.time}</span>
        <span class="timecode-name">${escapeHTML(ch.title || ('Тема ' + (idx + 1)))}</span>
      </button>
    `).join('');
  }
}

function toggleTimecodes() {
  const card = document.getElementById('timecodesCard');
  if (card) card.classList.toggle('open');
}

function seekToTime(seconds, chapterIdx) {
  const frame = document.getElementById('videoFrame');
  if (!frame) return;

  // Highlight active timecode
  document.querySelectorAll('.timecode-item').forEach((it, i) => {
    it.classList.toggle('active', i === chapterIdx);
  });

  // Try postMessage for player seek
  try {
    frame.contentWindow.postMessage({ type: 'player:seek', data: { time: seconds } }, '*');
    frame.contentWindow.postMessage({ event: 'seek', time: seconds }, '*');
    frame.contentWindow.postMessage({ action: 'seek', value: seconds }, '*');
    frame.contentWindow.postMessage(JSON.stringify({ event: 'seek', time: seconds }), '*');
  } catch (e) {}

  // Update ?t= param if needed
  try {
    const curUrl = new URL(frame.src, window.location.href);
    curUrl.searchParams.set('t', seconds);
    curUrl.searchParams.set('start', seconds);
    frame.src = curUrl.toString();
  } catch (e) {}
}

// Render Materials Cards
function renderLessonMaterials(lesson) {
  const box = document.getElementById('materialsBox');
  if (!box) return;

  let lessonFiles = [];
  let homeworkFiles = [];
  let linkFiles = [];
  let otherFiles = [];

  if (lesson.materials || lesson.homework) {
    lessonFiles = lesson.materials || [];
    homeworkFiles = lesson.homework || [];
    linkFiles = lesson.links || [];
  } else if (Array.isArray(lesson.items)) {
    lessonFiles = lesson.items.filter(i => i.type === 'lesson' || i.type === 'pdf');
    homeworkFiles = lesson.items.filter(i => i.type === 'homework' || i.type === 'answer');
    linkFiles = lesson.items.filter(i => ['trainer', 'link', 'url'].includes(i.type));
    otherFiles = lesson.items.filter(i => !['lesson', 'homework', 'answer', 'video', 'pdf', 'trainer', 'link', 'url'].includes(i.type));
  }

  if (!lessonFiles.length && !homeworkFiles.length && !linkFiles.length && !otherFiles.length) {
    box.className = 'materials';
    box.innerHTML = `<div class="mat-card empty">📭 Материалы для этого урока ещё не добавлены</div>`;
    return;
  }

  let html = '', cardCount = 0;

  if (lessonFiles.length) {
    cardCount++;
    html += `
      <div class="mat-card lav">
        <div class="mat-head">
          <div class="mat-icon">${ICONS.file}</div>
          <div>
            <div class="mat-title">Материалы к уроку</div>
            <div class="mat-sub">${lessonFiles.length} ${plural(lessonFiles.length, 'файл', 'файла', 'файлов')}</div>
          </div>
        </div>
        ${lessonFiles.map(renderFileItem).join('')}
      </div>
    `;
  }

  if (homeworkFiles.length) {
    cardCount++;
    html += `
      <div class="mat-card lime">
        <div class="mat-head">
          <div class="mat-icon">${ICONS.hw}</div>
          <div>
            <div class="mat-title">Домашнее задание</div>
            <div class="mat-sub">${homeworkFiles.length} ${plural(homeworkFiles.length, 'файл', 'файла', 'файлов')}</div>
          </div>
        </div>
        ${homeworkFiles.map(renderFileItem).join('')}
      </div>
    `;
  }

  if (linkFiles.length) {
    cardCount++;
    html += `
      <div class="mat-card lav" style="grid-column: 1 / -1">
        <div class="mat-head">
          <div class="mat-icon">${ICONS.link}</div>
          <div>
            <div class="mat-title">Полезные ссылки</div>
            <div class="mat-sub">${linkFiles.length} ${plural(linkFiles.length, 'ссылка', 'ссылки', 'ссылок')}</div>
          </div>
        </div>
        ${linkFiles.map(renderLinkItem).join('')}
      </div>
    `;
  }

  if (otherFiles.length) {
    cardCount++;
    html += `
      <div class="mat-card lav" style="grid-column: 1 / -1">
        <div class="mat-head">
          <div class="mat-icon">${ICONS.file}</div>
          <div>
            <div class="mat-title">Дополнительно</div>
            <div class="mat-sub">${otherFiles.length} ${plural(otherFiles.length, 'файл', 'файла', 'файлов')}</div>
          </div>
        </div>
        ${otherFiles.map(renderFileItem).join('')}
      </div>
    `;
  }

  box.className = 'materials' + (cardCount === 1 ? ' single' : '');
  box.innerHTML = html;
}

function renderFileItem(f) {
  const label = f.label || 'Файл';
  const url = resolveUrl(f.url || '#');
  return `
    <div class="mat-file">
      <a href="${escapeHTML(url)}" target="_blank" rel="noopener" class="mat-file-open" title="${escapeHTML(label)}">
        <span class="mat-file-icon">${ICONS.file}</span>
        <span class="mat-file-name">${escapeHTML(label)}</span>
      </a>
      <a href="${escapeHTML(url)}" download class="mat-file-dl" title="Скачать файл">
        ${ICONS.dl}
      </a>
    </div>
  `;
}

function renderLinkItem(f) {
  const label = f.label || 'Открыть ссылку';
  const url = resolveUrl(f.url || '#');
  return `
    <div class="mat-file">
      <a href="${escapeHTML(url)}" target="_blank" rel="noopener" class="mat-file-open" title="${escapeHTML(label)}">
        <span class="mat-file-icon">${ICONS.link}</span>
        <span class="mat-file-name">${escapeHTML(label)} →</span>
      </a>
    </div>
  `;
}

// Like functionality
function initLikes() {
  const btn = document.getElementById('likeBtn');
  if (!btn) return;
  const likeKey = currentCourse.likeKey || (currentCourseKey + '_likes');
  const isLiked = localStorage.getItem(likeKey + '_user') === '1';
  let count = parseInt(localStorage.getItem(likeKey + '_count'), 10);
  if (isNaN(count)) {
    count = currentCourse.initialLikes || 50;
    localStorage.setItem(likeKey + '_count', count);
  }

  const countEl = document.getElementById('likeCount');
  const hintEl = document.getElementById('likeHint');

  if (countEl) countEl.textContent = count;
  btn.classList.toggle('liked', isLiked);
  if (hintEl && isLiked) hintEl.textContent = 'Спасибо за вашу оценку!';
}

function sendLike() {
  const likeKey = currentCourse.likeKey || (currentCourseKey + '_likes');
  const isLiked = localStorage.getItem(likeKey + '_user') === '1';
  const btn = document.getElementById('likeBtn');
  const countEl = document.getElementById('likeCount');
  const hintEl = document.getElementById('likeHint');

  let count = parseInt(localStorage.getItem(likeKey + '_count'), 10) || 50;

  if (!isLiked) {
    count++;
    localStorage.setItem(likeKey + '_user', '1');
    localStorage.setItem(likeKey + '_count', count);
    if (btn) btn.classList.add('liked');
    if (countEl) countEl.textContent = count;
    if (hintEl) hintEl.textContent = 'Спасибо за вашу оценку!';
  }
}

// KaTeX formatting
function formatQuizText(raw) {
  let s = String(raw ?? '');
  if (!s) return '';
  s = s.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  if (window.katex) {
    const re = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g;
    let parts = [];
    let last = 0, m;
    while ((m = re.exec(s)) !== null) {
      if (m.index > last) parts.push(escapeHTML(s.slice(last, m.index)));
      const chunk = m[1];
      let tex = chunk, display = false;
      if (chunk.startsWith('$$')) { tex = chunk.slice(2, -2); display = true; }
      else if (chunk.startsWith('$')) { tex = chunk.slice(1, -1); }
      else if (chunk.startsWith('\\[')) { tex = chunk.slice(2, -2); display = true; }
      else if (chunk.startsWith('\\(')) { tex = chunk.slice(2, -2); }

      try {
        parts.push(katex.renderToString(tex.trim(), { throwOnError: false, displayMode: display }));
      } catch (e) {
        parts.push(`<code class="math-fallback">${escapeHTML(tex)}</code>`);
      }
      last = m.index + chunk.length;
    }
    if (last < s.length) parts.push(escapeHTML(s.slice(last)));
    return parts.join('').replace(/\n/g, '<br>');
  }

  return escapeHTML(s).replace(/\n/g, '<br>');
}

// Quiz System
function renderLessonQuiz(lesson) {
  const toggleWrap = document.getElementById('quizToggleWrap');
  const wrap = document.getElementById('quizWrap');
  const box = document.getElementById('quizBox');

  currentQuiz = lesson.quiz || null;

  if (!currentQuiz || !Array.isArray(currentQuiz.questions) || !currentQuiz.questions.length) {
    if (toggleWrap) toggleWrap.innerHTML = '';
    if (wrap) wrap.style.maxHeight = '0';
    if (box) box.innerHTML = '';
    return;
  }

  const qCount = currentQuiz.questions.length;

  toggleWrap.innerHTML = `
    <button type="button" class="quiz-toggle" id="quizToggle" onclick="toggleQuiz()">
      <span class="quiz-toggle-left">
        <span class="quiz-toggle-icon">🎯</span>
        <span>
          <span class="quiz-toggle-title">${escapeHTML(currentQuiz.title || 'Автотест')}</span>
          <span class="quiz-toggle-sub">${qCount} ${plural(qCount, 'задание', 'задания', 'заданий')} · нажми, чтобы открыть</span>
        </span>
      </span>
      <span class="quiz-toggle-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
    </button>
  `;

  const itemsHtml = currentQuiz.questions.map((q, i) => {
    const qid = q.id || `q_${i + 1}`;
    const type = q.type || 'single';
    let inputHtml = '';

    if (type === 'text') {
      inputHtml = `<input type="text" class="q-input q-text-input" data-qid="${escapeHTML(qid)}" placeholder="Введи ответ" autocomplete="off">`;
    } else {
      const isMulti = type === 'multi';
      const inputType = isMulti ? 'checkbox' : 'radio';
      const options = q.options || [];
      inputHtml = `
        <div class="q-choice-list">
          ${options.map((opt, j) => `
            <label class="q-choice">
              <input type="${inputType}" name="${escapeHTML(qid)}" value="${j + 1}" class="q-choice-input" data-qid="${escapeHTML(qid)}">
              <span class="q-choice-mark">${j + 1}</span>
              <span>${formatQuizText(opt)}</span>
            </label>
          `).join('')}
        </div>
      `;
    }

    return `
      <div class="q-item" data-qid="${escapeHTML(qid)}">
        <div class="q-num">Задание ${i + 1}</div>
        <div class="q-text">${formatQuizText(q.question || q.text || '')}</div>
        ${inputHtml}
        <div class="q-res"></div>
        <div class="q-explain" style="display:none"></div>
      </div>
    `;
  }).join('');

  box.innerHTML = `
    <div class="quiz">
      <div class="quiz-head">
        <div class="quiz-title"><span>🎯</span>${escapeHTML(currentQuiz.title || 'Автотест')}</div>
        <div class="quiz-progress" id="quizProgress">0 / ${qCount}</div>
      </div>
      ${itemsHtml}
      <div class="quiz-actions">
        <button type="button" class="quiz-btn quiz-btn-check" onclick="checkQuiz()">✓ Проверить ответы</button>
        <button type="button" class="quiz-btn quiz-btn-reset" onclick="resetQuiz()">↻ Пройти заново</button>
      </div>
      <div class="quiz-result" id="quizResult"></div>
    </div>
  `;

  box.querySelectorAll('.q-input, .q-choice-input').forEach(inp => {
    inp.addEventListener('input', updateQuizProgress);
    inp.addEventListener('change', updateQuizProgress);
  });
}

function toggleQuiz() {
  const toggle = document.getElementById('quizToggle');
  const wrap = document.getElementById('quizWrap');
  if (!toggle || !wrap) return;

  const isOpen = toggle.classList.toggle('open');
  if (isOpen) {
    wrap.style.maxHeight = 'none';
    const h = wrap.scrollHeight;
    wrap.style.maxHeight = '0';
    requestAnimationFrame(() => {
      wrap.style.maxHeight = h + 'px';
    });
  } else {
    wrap.style.maxHeight = '0';
  }
}

function updateQuizProgress() {
  if (!currentQuiz) return;
  const box = document.getElementById('quizBox');
  let answered = 0;

  currentQuiz.questions.forEach((q, i) => {
    const qid = q.id || `q_${i + 1}`;
    const item = box.querySelector(`.q-item[data-qid="${qid}"]`);
    if (!item) return;

    if (q.type === 'text') {
      const v = item.querySelector('.q-text-input')?.value.trim();
      if (v) answered++;
    } else {
      if (item.querySelector('input.q-choice-input:checked')) answered++;
    }
  });

  const p = document.getElementById('quizProgress');
  if (p) p.textContent = `${answered} / ${currentQuiz.questions.length}`;
}

function checkQuiz() {
  if (!currentQuiz) return;
  let correctCount = 0;
  const total = currentQuiz.questions.length;

  currentQuiz.questions.forEach((q, i) => {
    const qid = q.id || `q_${i + 1}`;
    const item = document.querySelector(`.q-item[data-qid="${qid}"]`);
    if (!item) return;

    const resEl = item.querySelector('.q-res');
    const expEl = item.querySelector('.q-explain');

    let isCorrect = false;
    let expected = String(q.answer).trim().toLowerCase();

    if (q.type === 'text') {
      const val = (item.querySelector('.q-text-input')?.value || '').trim().toLowerCase();
      isCorrect = val === expected;
    } else if (q.type === 'multi') {
      const checked = Array.from(item.querySelectorAll('input.q-choice-input:checked')).map(c => c.value).sort().join('');
      const expNorm = expected.split('').sort().join('');
      isCorrect = checked === expNorm;
    } else {
      const checked = item.querySelector('input.q-choice-input:checked')?.value;
      isCorrect = checked === expected;
    }

    if (isCorrect) correctCount++;

    resEl.className = 'q-res show ' + (isCorrect ? 'ok' : 'no');
    resEl.innerHTML = isCorrect ? '✓ Верно!' : '✕ Неверно';

    if (q.explanation) {
      expEl.innerHTML = `
        <div class="q-explain-title">💡 Разбор решения</div>
        ${!isCorrect ? `<b>Правильный ответ:</b> ${escapeHTML(q.answer)}<br>` : ''}
        ${formatQuizText(q.explanation)}
      `;
      expEl.style.display = 'block';
    } else if (!isCorrect) {
      expEl.innerHTML = `<b>Правильный ответ:</b> ${escapeHTML(q.answer)}`;
      expEl.style.display = 'block';
    }
  });

  const percent = Math.round((correctCount / total) * 100);
  const result = document.getElementById('quizResult');
  if (result) {
    const cls = percent === 100 ? 'perfect' : (percent >= 60 ? 'good' : 'bad');
    const title = percent === 100 ? '🏆 Идеально!' : (percent >= 60 ? '👍 Хорошо' : '💪 Продолжай тренировку');
    result.className = 'quiz-result show ' + cls;
    result.innerHTML = `
      <div class="quiz-result-title">${title}</div>
      <div class="quiz-result-score">Результат: ${correctCount} из ${total} · ${percent}%</div>
    `;
  }

  const wrap = document.getElementById('quizWrap');
  if (wrap) wrap.style.maxHeight = wrap.scrollHeight + 'px';
}

function resetQuiz() {
  const box = document.getElementById('quizBox');
  if (!box) return;
  box.querySelectorAll('.q-input, .q-choice-input').forEach(inp => {
    if (inp.type === 'radio' || inp.type === 'checkbox') inp.checked = false;
    else inp.value = '';
  });
  box.querySelectorAll('.q-res').forEach(r => {
    r.className = 'q-res';
    r.innerHTML = '';
  });
  box.querySelectorAll('.q-explain').forEach(e => {
    e.style.display = 'none';
    e.innerHTML = '';
  });
  const res = document.getElementById('quizResult');
  if (res) { res.className = 'quiz-result'; res.innerHTML = ''; }
  updateQuizProgress();
}

// Lightbox
function openQuizImage(src) {
  const box = document.getElementById('imgLightbox');
  const pic = document.getElementById('imgLightboxPic');
  if (!box || !pic) return;
  pic.src = src;
  box.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQuizImage(e) {
  if (e && e.target && e.target.id === 'imgLightboxPic') return;
  const box = document.getElementById('imgLightbox');
  const pic = document.getElementById('imgLightboxPic');
  if (box) box.classList.remove('open');
  if (pic) pic.src = '';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeQuizImage();
    closeScheduleModal();
  }
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebar();
  loadCourseConfig();
});
