/* ═══════════════════════════════════════════
   NAJAD MUSAB VK — Portfolio Script
   Three.js particles · GSAP animations
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────
     1. THREE.JS BACKGROUND CANVAS
  ───────────────────────────────── */
  (function initThree() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 6;

    /* Floating soft spheres */
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const blobs = [];
    const blobData = [
      { pos: [-3.5, 2, -2], scale: 1.8, color: 0xc9d9fc, opacity: 0.18 },
      { pos: [4,  -1.5, -3], scale: 2.2, color: 0xf0e4cc, opacity: 0.15 },
      { pos: [0.5, -3, -1.5], scale: 1.2, color: 0xd4e6fa, opacity: 0.20 },
      { pos: [-5, -2,  -4],  scale: 2.8, color: 0xfde0a0, opacity: 0.10 },
      { pos: [3,   3,  -5],  scale: 2.0, color: 0xe8effc, opacity: 0.12 },
    ];

    blobData.forEach(d => {
      const mat = new THREE.MeshBasicMaterial({
        color: d.color,
        transparent: true,
        opacity: d.opacity,
      });
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(...d.pos);
      mesh.scale.setScalar(d.scale);
      scene.add(mesh);
      blobs.push({ mesh, speed: 0.0004 + Math.random() * 0.0003, offset: Math.random() * Math.PI * 2 });
    });

    /* Tiny floating particles */
    const particleCount = 60;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 14;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xc9a96e, size: 0.035, transparent: true, opacity: 0.5 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    /* Mouse parallax */
    let mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 0.6;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.4;
    });

    /* Resize */
    window.addEventListener('resize', () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    });

    /* Animate */
    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      t += 0.004;
      blobs.forEach(b => {
        b.mesh.position.y += Math.sin(t + b.offset) * b.speed;
        b.mesh.position.x += Math.cos(t * 0.7 + b.offset) * b.speed * 0.5;
      });
      particles.rotation.y = t * 0.02;
      camera.position.x += (mouseX - camera.position.x) * 0.05;
      camera.position.y += (-mouseY - camera.position.y) * 0.05;
      renderer.render(scene, camera);
    }
    animate();
  })();


  /* ─────────────────────────────
     2. GSAP SCROLL TRIGGER SETUP
  ───────────────────────────────── */
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* Hero entrance */
  const heroItems = document.querySelectorAll('.hero-left .reveal-up');
  gsap.to(heroItems, {
    opacity: 1,
    y: 0,
    duration: 1.1,
    ease: 'power3.out',
    stagger: 0.18,
    delay: 0.3,
  });
  gsap.to('.hero-right.reveal-scale', {
    opacity: 1,
    scale: 1,
    duration: 1.3,
    ease: 'power3.out',
    delay: 0.5,
  });

  /* Generic section fade-up */
  gsap.utils.toArray([
    '.section-label',
    '.section-heading',
    '.about-body',
    '.about-tags',
    '.skill-item',
    '.project-row',
    '.tl-item',
    '.ach-card',
    '.step',
    '.contact-sub',
    '.contact-info',
    '.contact-form',
  ]).forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 45 },
      {
        opacity: 1, y: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );
  });

  /* About photo */
  gsap.fromTo('.about-photo',
    { opacity: 0, x: 50 },
    {
      opacity: 1, x: 0,
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#about', start: 'top 70%' },
    }
  );

  /* Skill bars */
  document.querySelectorAll('.skill-fill').forEach(bar => {
    const target = bar.dataset.width;
    ScrollTrigger.create({
      trigger: bar,
      start: 'top 85%',
      onEnter: () => {
        gsap.to(bar, { width: target + '%', duration: 1.3, ease: 'power2.out' });
      },
    });
  });

  /* Achievement numbers count-up */
  function animateValue(el, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    function update(now) {
      const elapsed = Math.min((now - startTime) / duration, 1);
      const ease = elapsed < 0.5 ? 2 * elapsed * elapsed : -1 + (4 - 2 * elapsed) * elapsed;
      const val = start + range * ease;
      const original = el.dataset.original || el.textContent;
      el.dataset.original = original;
      if (original.includes('.')) {
        el.textContent = val.toFixed(1);
      } else if (original.includes('+')) {
        el.textContent = Math.floor(val) + '+';
      } else if (!isNaN(Number(original))) {
        el.textContent = Math.floor(val);
      } else {
        return; // non-numeric, skip
      }
      if (elapsed < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  document.querySelectorAll('.ach-num').forEach(el => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        const txt = el.textContent.trim();
        if (txt === '3.8') animateValue(el, 0, 3.8, 1400);
        else if (txt === '1st') { /* static */ }
        else if (txt === '10+') animateValue(el, 0, 10, 1200);
      },
    });
  });

  /* Project rows parallax tilt */
  document.querySelectorAll('.proj-img-wrap').forEach(wrap => {
    wrap.addEventListener('mousemove', e => {
      const rect = wrap.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      gsap.to(wrap, {
        rotationY: dx * 10,
        rotationX: -dy * 8,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 800,
      });
    });
    wrap.addEventListener('mouseleave', () => {
      gsap.to(wrap, { rotationY: 0, rotationX: 0, duration: 0.7, ease: 'power2.out' });
    });
  });


  /* ─────────────────────────────
     3. NAVBAR SCROLL BEHAVIOUR
  ───────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });


  /* ─────────────────────────────
     4. SMOOTH ANCHOR SCROLL
  ───────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = navbar.getBoundingClientRect().height;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
      // close mobile menu if open
      mobileMenu.classList.remove('open');
      burger.classList.remove('active');
    });
  });


  /* ─────────────────────────────
     5. MOBILE MENU BURGER
  ───────────────────────────────── */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burger.classList.toggle('active', open);
  });


  /* ─────────────────────────────
     6. CONTACT FORM
  ───────────────────────────────── */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;
      btn.textContent = 'Sent ✓';
      btn.style.background = '#6ebd96';
      btn.style.borderColor = '#6ebd96';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        btn.style.borderColor = '';
        form.reset();
      }, 2800);
    });
  }


  /* ─────────────────────────────
     7. HERO PHOTO 3D PARALLAX
  ───────────────────────────────── */
  const photoFrame = document.querySelector('.photo-frame');
  if (photoFrame) {
    window.addEventListener('mousemove', e => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      gsap.to(photoFrame, {
        rotationY: dx * 8,
        rotationX: -dy * 6,
        y: dy * -12,
        duration: 0.8,
        ease: 'power2.out',
        transformPerspective: 900,
      });
    });
  }

});