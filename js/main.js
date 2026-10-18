import * as THREE from 'three';

// ─── Loader ───────────────────────────────────────────────
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const firstVisit = !sessionStorage.getItem('visited');
  if (!firstVisit) {
    loader.style.display = 'none';
    document.querySelectorAll('.fade-in').forEach(el => {
      el.style.animationPlayState = 'running';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    document.body.style.overflow = '';
    return;
  }

  sessionStorage.setItem('visited', 'true');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.querySelectorAll('.fade-in').forEach(el => el.style.animationPlayState = 'running');
    document.body.style.overflow = '';
  }, 2500);
}

// ─── Custom Cursor ───────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function updateCursor() {
    cursorX += (mouseX - cursorX) * 0.2;
    cursorY += (mouseY - cursorY) * 0.2;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  document.querySelectorAll('a, button, input, textarea, .work-card, .hero-cta, .work-list-item').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// ─── Three.js 3D Scene ──────────────────────────────────
function init3D() {
  const canvas = document.getElementById('three-canvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  camera.position.z = 10;

  const geometries = [
    new THREE.ConeGeometry(1, 1.6, 24),
    new THREE.DodecahedronGeometry(0.9, 0),
    new THREE.CylinderGeometry(0.7, 0.7, 1.4, 24),
    new THREE.OctahedronGeometry(1.1, 0),
  ];

  const colors = [
    new THREE.Color('#4f8cff'),
    new THREE.Color('#f5f5f5'),
    new THREE.Color('#93bbff'),
    new THREE.Color('#7c3aed'),
  ];

  const meshes = geometries.map((geo, i) => {
    const wireframe = i !== 2;
    const mat = new THREE.MeshStandardMaterial({
      color: colors[i],
      wireframe,
      transparent: true,
      opacity: 0.2 + Math.random() * 0.15,
      roughness: 0.5,
      metalness: 0.4,
      side: i === 2 ? THREE.DoubleSide : THREE.FrontSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 4 - 1
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    mesh.userData = {
      rotSpeed: { x: (Math.random() - 0.5) * 0.008, y: (Math.random() - 0.5) * 0.008 },
      floatSpeed: 0.15 + Math.random() * 0.25,
      floatOffset: Math.random() * Math.PI * 2,
      basePos: mesh.position.clone(),
    };
    scene.add(mesh);
    return mesh;
  });

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
  dirLight.position.set(3, 5, 5);
  scene.add(dirLight);
  const dirLight2 = new THREE.DirectionalLight(0x4f8cff, 0.4);
  dirLight2.position.set(-4, -2, 3);
  scene.add(dirLight2);

  let mouse3D = { x: 0, y: 0 };
  let targetMouse3D = { x: 0, y: 0 };
  let hoverMode = 'none';

  document.addEventListener('mousemove', e => {
    targetMouse3D.x = (e.clientX / window.innerWidth) * 2 - 1;
    targetMouse3D.y = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  const heroHoverFirst = document.querySelectorAll('.hero-hover-first');
  const heroHoverLast = document.querySelectorAll('.hero-hover-last');
  heroHoverFirst.forEach(zone => {
    zone.addEventListener('mouseenter', () => { hoverMode = 'first'; });
    zone.addEventListener('mouseleave', () => { hoverMode = 'none'; });
  });
  heroHoverLast.forEach(zone => {
    zone.addEventListener('mouseenter', () => { hoverMode = 'last'; });
    zone.addEventListener('mouseleave', () => { hoverMode = 'none'; });
  });

  function animate() {
    requestAnimationFrame(animate);

    mouse3D.x += (targetMouse3D.x - mouse3D.x) * 0.05;
    mouse3D.y += (targetMouse3D.y - mouse3D.y) * 0.05;

    const time = Date.now() * 0.001;

    meshes.forEach((mesh, i) => {
      mesh.rotation.x += mesh.userData.rotSpeed.x;
      mesh.rotation.y += mesh.userData.rotSpeed.y;

      const float = Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 0.4;
      mesh.position.y = mesh.userData.basePos.y + float;

      if (hoverMode === 'first') {
        const targetX = mouse3D.x * 2;
        const targetY = mouse3D.y * 2;
        mesh.position.x += (targetX - mesh.position.x) * 0.015;
        mesh.position.z += (-2 - mesh.position.z) * 0.01;
        mesh.rotation.x += 0.005 * (i % 2 === 0 ? 1 : -1);
        mesh.rotation.y += 0.005;
        mesh.material.opacity = Math.min(mesh.material.opacity + 0.01, 0.6);
        const pulse = 1 + Math.sin(time * 2 + i) * 0.12;
        mesh.scale.setScalar(pulse);
      } else if (hoverMode === 'last') {
        const angle = time * 0.8 + i * 1.5;
        const radius = 2 + Math.sin(time * 0.5 + i) * 0.5;
        const orbitX = Math.cos(angle) * radius * 0.5 + mouse3D.x * 1.5;
        const orbitY = Math.sin(angle) * radius * 0.3 + mouse3D.y * 1.2;
        mesh.position.x += (orbitX - mesh.position.x) * 0.02;
        mesh.position.y += (orbitY - (mesh.userData.basePos.y + float)) * 0.02;
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.015;
        mesh.material.opacity = Math.min(mesh.material.opacity + 0.015, 0.8);
        mesh.scale.setScalar(1 + Math.sin(time * 3 + i * 2) * 0.1);
      } else {
        mesh.position.x += (mesh.userData.basePos.x + mouse3D.x * 1.2 - mesh.position.x) * 0.008;
        mesh.position.z += (mesh.userData.basePos.z - mesh.position.z) * 0.008;
        mesh.material.opacity = Math.max(mesh.material.opacity - 0.008, 0.15);
        mesh.scale.setScalar(1);
      }
    });

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

// ─── Menu Overlay ────────────────────────────────────────
function initMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const menuOverlay = document.getElementById('menu-overlay');
  const menuClose = document.getElementById('menu-close');

  if (!menuBtn || !menuOverlay) return;

  function openMenu() {
    menuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  menuBtn.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  menuOverlay.addEventListener('click', e => {
    if (e.target === menuOverlay) closeMenu();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  menuOverlay.querySelectorAll('.menu-nav a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// ─── Theme Toggle ────────────────────────────────────────
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const sunPath = 'M12 5V1.5M12 19V22.5M5 12H1.5M19 12H22.5M7.05 7.05L4.58 4.58M16.95 7.05l2.47-2.47M16.95 16.95l2.48 2.48M7.05 16.95l-2.47 2.48M16 12a4 4 0 11-8 0 4 4 0 018 0z';
  const moonPath = 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z';

  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.add('light');
    toggle.querySelector('svg path').setAttribute('d', moonPath);
  }

  toggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light');
    toggle.querySelector('svg path').setAttribute('d', isLight ? moonPath : sunPath);
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}

// ─── Language Switcher ───────────────────────────────────

// ─── Translations ────────────────────────────────────────
let translations = null;
let workPreviewRefresh = null;
async function loadTranslations() {
  try {
    const base = new URL('../public/locales/', import.meta.url);
    const [esRes, enRes] = await Promise.all([
      fetch(new URL('es.json', base)),
      fetch(new URL('en.json', base))
    ]);
    const es = await esRes.json();
    const en = await enRes.json();
    translations = { es, en };
  } catch (e) {
    try {
      // fallback to current path context
      const [esRes, enRes] = await Promise.all([
        fetch('/public/locales/es.json'),
        fetch('/public/locales/en.json')
      ]);
      const es = await esRes.json();
      const en = await enRes.json();
      translations = { es, en };
    } catch (e2) {
      translations = { es: {}, en: {} };
    }
  }
  return translations;
}

async function initLanguage() {
  const langBtns = document.querySelectorAll('[data-lang]');
  if (!langBtns.length) return;

  await loadTranslations();

  const saved = localStorage.getItem('lang') || 'es';
  setLanguage(saved);

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      setLanguage(lang);
      localStorage.setItem('lang', lang);
    });
  });

  function setLanguage(lang) {
    langBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.lang === lang));
    const t = (translations && (translations[lang] || translations.es)) || {};
    document.querySelectorAll('[data-lang-text]').forEach(el => {
      const key = el.dataset.langText;
      if (t[key] != null) el.innerHTML = t[key];
    });
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
      const key = el.dataset.langPlaceholder;
      if (t[key] != null) el.placeholder = t[key];
    });
    if (typeof workPreviewRefresh === 'function') {
      workPreviewRefresh();
    }
  }
}



// ─── Contact Form ──────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const subject = document.getElementById('subject')?.value.trim() || '';
    const message = document.getElementById('message')?.value.trim() || '';

    const mailto = `mailto:l.chaconlanga3@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
  });
}

// ─── Work Page Preview ─────────────────────────────────────
function initWorkPreview() {
  const list = document.getElementById('work-list');
  const previewDefault = document.getElementById('preview-default');
  const previewContent = document.getElementById('preview-content');
  const previewTitle = document.getElementById('preview-title');
  const previewDesc = document.getElementById('preview-desc');
  const previewTags = document.getElementById('preview-tags');
  const previewLink = document.getElementById('preview-link');
  const previewImage = document.getElementById('preview-image');
  const previewImg = document.getElementById('preview-img');

  if (!list || !previewTitle) return;

  const cursor = document.getElementById('cursor');
  let lockedIndex = 0;
  let items = [];

  const showDefault = () => {
    if (previewDefault) previewDefault.style.display = 'block';
    if (previewContent) previewContent.style.display = 'none';
  };

  const showPreview = (work) => {
    if (previewDefault) previewDefault.style.display = 'none';
    if (previewContent) previewContent.style.display = 'block';
    previewTitle.textContent = work.title || '';
    previewDesc.textContent = work.desc || '';
    if (previewTags) {
      previewTags.innerHTML = (work.tags || []).map(tag => `<span>${tag}</span>`).join('');
    }
    if (previewImage && previewImg) {
      if (work.image) {
        previewImg.src = `../public/img/${work.image}`;
        previewImg.alt = work.title || '';
        previewImage.style.display = 'block';
      } else {
        previewImg.removeAttribute('src');
        previewImage.style.display = 'none';
      }
    }
    if (previewLink) {
      if (work.link) {
        previewLink.style.display = 'inline-flex';
        previewLink.href = work.link;
      } else {
        previewLink.style.display = 'none';
      }
    }
  };

  const setActive = () => {
    items.forEach((el, i) => el.classList.toggle('active', i === lockedIndex));
  };

  function render() {
    const lang = localStorage.getItem('lang') || 'es';
    const t = (translations && (translations[lang] || translations.es)) || {};
    const works = Array.isArray(t.works) ? t.works : [];

    list.innerHTML = works.map(() => `
      <div class="work-list-item">
        <span class="work-num"></span>
        <h3></h3>
        <p></p>
      </div>
    `).join('');

    items = Array.from(list.querySelectorAll('.work-list-item'));
    items.forEach((item, i) => {
      const work = works[i];
      item.querySelector('.work-num').textContent = String(i + 1).padStart(2, '0');
      item.querySelector('h3').textContent = work.title || '';
      item.querySelector('p').textContent = work.desc || '';

      if (cursor) {
        item.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        item.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
      }

      item.addEventListener('mouseenter', () => showPreview(work));
      item.addEventListener('mouseleave', () => {
        if (items[lockedIndex]) showPreview(works[lockedIndex]);
        else showDefault();
      });
      item.addEventListener('click', () => {
        lockedIndex = i;
        setActive();
        showPreview(work);
      });
    });

    if (works.length) {
      lockedIndex = Math.min(lockedIndex, works.length - 1);
      setActive();
      showPreview(works[lockedIndex]);
    } else {
      showDefault();
    }
  }

  workPreviewRefresh = render;
  render();
}

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  document.body.style.overflow = 'hidden';
  initLoader();
  if (!('ontouchstart' in window)) initCursor();
  init3D();
  initMenu();
  initTheme();
  await initLanguage();
  initContactForm();
  initWorkPreview();

  const skillBars = document.querySelectorAll('.skill-bar-fill');
  if (skillBars.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width || '0%';
          entry.target.classList.add('animate');
        }
      });
    }, { threshold: 0.5 });
    skillBars.forEach(bar => observer.observe(bar));
  }
});
