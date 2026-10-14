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
function initLanguage() {
  const langBtns = document.querySelectorAll('[data-lang]');
  if (!langBtns.length) return;

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
    document.querySelectorAll('[data-lang-text]').forEach(el => {
      const key = el.dataset.langText;
      const texts = translations[lang] || translations.es;
      if (texts[key]) el.innerHTML = texts[key];
    });
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
      const key = el.dataset.langPlaceholder;
      const texts = translations[lang] || translations.es;
      if (texts[key]) el.placeholder = texts[key];
    });
  }
}

const translations = {
  es: {
    'hero-title': 'LUCAS',
    'hero-title-accent': 'CHACON',
    'hero-subtitle': 'Ingeniero de Software e IA',
    'hero-desc': 'Construyo software escalable y automatizaciones que optimizan procesos.',
    'hero-cta': 'Ver Trabajos',
    'menu-home': 'Home',
    'menu-work': 'Work',
    'menu-about': 'About',
    'menu-contact': 'Contact',
    'about-title': 'Sobre Mí',
    'about-number': '02',
    'about-desc': 'Especializado en IA generativa, RAG e ingeniería de datos.',
    'about-p1': 'Especializado en <strong>IA generativa</strong>: LLMs, arquitecturas <strong>RAG</strong> y agentes de IA aplicados a producto. Diseño motores conversacionales y automatizaciones end-to-end apoyándome en modelos de Machine Learning.',
    'about-p2': 'Arquitecturas de IA en cloud: <strong>Azure</strong> (OpenAI, AI Search, Functions, Blob Storage, Application Insights) y <strong>AWS</strong> (Bedrock, EC2). Desarrollo <strong>pipelines ETL</strong> con Python y PostgreSQL (pgvector), orquestación con n8n y despliegues con Docker.',
    'about-p3': 'Stack: <strong>Python (FastAPI), Java (Spring Boot)</strong>, JavaScript y Tailwind; PostgreSQL/pgvector, Pandas, Scikit-learn, LightGBM y XGBoost; Git, Docker y Linux.',
    'about-skills-title': 'Competencias',
    'about-cv': 'Descargar CV',
    'work-title': 'Trabajos',
    'work-number': '01',
    'work-desc': 'Proyectos seleccionados que muestran mi experiencia.',
    'contact-title': 'Contacto',
    'contact-number': '03',
    'contact-desc': 'Trabajemos juntos. Cuéntame sobre tu proyecto.',
    'contact-info-title': 'Hablemos',
    'contact-info-text': 'Estoy abierto a colaboraciones, oportunidades laborales o simplemente una charla sobre tecnología. No dudes en contactarme.',
    'contact-form-subject': 'Asunto',
    'contact-form-message': 'Mensaje',
    'contact-form-submit': 'Enviar Mensaje',
    'scroll-text': 'Desplázate',
    'footer-text': '© 2026 Lucas Chacon. Todos los derechos reservados.',
    'work-tag-1': 'Proyecto Destacado',
    'work-title-1': 'BotFarma',
    'work-desc-1': 'Chatbot farmacéutico con IA que optimiza la consulta y gestión del sector salud. Arquitectura RAG, motor conversacional, aplicación full-stack e infraestructura cloud.',
    'work-tag-2': 'Proyecto Destacado',
    'work-title-2': 'UFC Rivals',
    'work-desc-2': 'Plataforma web para análisis de peleas UFC con simulación por IA. Autenticación segura, estadísticas y predicciones interactivas.',
    'work-tag-3': 'Proyecto Destacado',
    'work-title-3': 'E-Commerce Sales Forecast',
    'work-desc-3': 'Pipeline completo de ciencia de datos para análisis predictivo del comportamiento del consumidor con más de 540K registros.',
    'preview-default-title': 'Selecciona un proyecto',
    'preview-default-desc': 'Pasa el ratón o haz clic en un proyecto para ver y fijar los detalles.',
    'preview-link-label': 'Ver proyecto',
  },
  en: {
    'hero-title': 'LUCAS',
    'hero-title-accent': 'CHACON',
    'hero-subtitle': 'Software & AI Engineer',
    'hero-desc': 'I build scalable software and automations that streamline processes.',
    'hero-cta': 'View Work',
    'menu-home': 'Home',
    'menu-work': 'Work',
    'menu-about': 'About',
    'menu-contact': 'Contact',
    'about-title': 'About Me',
    'about-number': '02',
    'about-desc': 'Specialized in generative AI, RAG and data engineering.',
    'about-p1': 'Specialized in <strong>generative AI</strong>: LLMs, <strong>RAG</strong> architectures and AI agents applied to product. I design conversational engines and end-to-end automations powered by Machine Learning models.',
    'about-p2': 'AI architectures on the cloud: <strong>Azure</strong> (OpenAI, AI Search, Functions, Blob Storage, Application Insights) and <strong>AWS</strong> (Bedrock, EC2). I build <strong>ETL pipelines</strong> with Python and PostgreSQL (pgvector), orchestration with n8n, and deployments with Docker.',
    'about-p3': 'Stack: <strong>Python (FastAPI), Java (Spring Boot)</strong>, JavaScript and Tailwind; PostgreSQL/pgvector, Pandas, Scikit-learn, LightGBM and XGBoost; Git, Docker and Linux.',
    'about-skills-title': 'Skills',
    'about-cv': 'Download CV',
    'work-title': 'Work',
    'work-number': '01',
    'work-desc': 'Selected projects showcasing my expertise.',
    'contact-title': 'Contact',
    'contact-number': '03',
    'contact-desc': 'Let\'s work together. Tell me about your project.',
    'contact-info-title': 'Let\'s Talk',
    'contact-info-text': 'I\'m open to collaborations, job opportunities, or just a chat about technology. Don\'t hesitate to reach out.',
    'contact-form-subject': 'Subject',
    'contact-form-message': 'Message',
    'contact-form-submit': 'Send Message',
    'scroll-text': 'Scroll',
    'footer-text': '© 2026 Lucas Chacon. All rights reserved.',
    'work-tag-1': 'Featured Project',
    'work-title-1': 'BotFarma',
    'work-desc-1': 'AI-powered pharmacy chatbot that streamlines consultation and management in the healthcare sector. RAG architecture, conversational engine, full-stack app, and cloud infrastructure.',
    'work-tag-2': 'Featured Project',
    'work-title-2': 'UFC Rivals',
    'work-desc-2': 'Web platform for UFC fight analysis with AI simulation. Secure authentication, statistics, and interactive predictions.',
    'work-tag-3': 'Featured Project',
    'work-title-3': 'E-Commerce Sales Forecast',
    'work-desc-3': 'Complete data science pipeline for predictive analysis of consumer behavior with over 540K records.',
    'preview-default-title': 'Select a project',
    'preview-default-desc': 'Hover over or click a project to view and pin its details.',
    'preview-link-label': 'View project',
  },
};

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
  const items = document.querySelectorAll('.work-list-item');
  const previewDefault = document.getElementById('preview-default');
  const previewContent = document.getElementById('preview-content');
  const previewTitle = document.getElementById('preview-title');
  const previewDesc = document.getElementById('preview-desc');
  const previewTags = document.getElementById('preview-tags');
  const previewLink = document.getElementById('preview-link');
  const previewImage = document.getElementById('preview-image');
  const previewImg = document.getElementById('preview-img');

  if (!items.length || !previewTitle) return;

  const showDefault = () => {
    if (previewDefault) previewDefault.style.display = 'block';
    if (previewContent) previewContent.style.display = 'none';
  };

  const showPreview = (title, desc, tags, link, image) => {
    if (previewDefault) previewDefault.style.display = 'none';
    if (previewContent) previewContent.style.display = 'block';
    previewTitle.textContent = title;
    previewDesc.textContent = desc;
    if (previewTags) {
      previewTags.innerHTML = tags.split(',').map(t => `<span>${t.trim()}</span>`).join('');
    }
    if (previewImage && previewImg) {
      if (image) {
        previewImg.src = image;
        previewImg.alt = title;
        previewImage.style.display = 'block';
      } else {
        previewImg.removeAttribute('src');
        previewImage.style.display = 'none';
      }
    }
    if (previewLink) {
      if (link) {
        previewLink.style.display = 'inline-flex';
        previewLink.href = link;
      } else {
        previewLink.style.display = 'none';
      }
    }
  };

  showDefault();

  let lockedItem = null;

  const previewItem = (item) => {
    showPreview(
      item.dataset.previewTitle || '',
      item.dataset.previewDesc || '',
      item.dataset.previewTags || '',
      item.dataset.previewLink || '',
      item.dataset.previewImage || ''
    );
  };

  const setActive = (item) => {
    items.forEach(el => el.classList.toggle('active', el === item));
  };

  items.forEach(item => {
    item.addEventListener('mouseenter', () => previewItem(item));
    item.addEventListener('mouseleave', () => {
      if (lockedItem) previewItem(lockedItem);
      else showDefault();
    });
    item.addEventListener('click', () => {
      lockedItem = item;
      setActive(item);
      previewItem(item);
    });
  });
}

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.overflow = 'hidden';
  initLoader();
  if (!('ontouchstart' in window)) initCursor();
  init3D();
  initMenu();
  initTheme();
  initLanguage();
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
