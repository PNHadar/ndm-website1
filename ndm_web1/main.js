import './style.css';

// Determine relative base prefix from current path so links work identically on localhost and /ndm-website1/
function getRelativeRoot() {
  const path = window.location.pathname;
  if (
    path.includes('/research/epilepsy-neuromodulation') ||
    path.includes('/research/cognition-sleep') ||
    path.includes('/research/neurotechnology') ||
    path.includes('/research/cancer-neuroscience') ||
    path.includes('/research/ai-neurology')
  ) {
    return '../../';
  }
  if (
    path.includes('/research') ||
    path.includes('/people') ||
    path.includes('/resources') ||
    path.includes('/contact')
  ) {
    return '../';
  }
  return './';
}

// 1. Theme Management (Bright MGB Daylight default / MGB Deep Cobalt secondary)
function initTheme() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const getEffectiveTheme = () => {
    const explicit = root.getAttribute('data-theme');
    if (explicit === 'dark' || explicit === 'light') return explicit;
    return 'light';
  };

  const updateToggleUI = () => {
    if (!toggleBtn) return;
    const current = getEffectiveTheme();
    toggleBtn.setAttribute('aria-label', `Switch to ${current === 'dark' ? 'bright MGB daylight' : 'MGB cobalt'} theme`);
    toggleBtn.innerHTML = current === 'dark'
      ? '<span aria-hidden="true">☀</span><span>MGB Bright</span>'
      : '<span aria-hidden="true">◑</span><span>MGB Cobalt</span>';
  };

  try {
    const saved = localStorage.getItem('neurohints-mgb-theme');
    if (saved === 'dark' || saved === 'light') {
      root.setAttribute('data-theme', saved);
    } else {
      root.setAttribute('data-theme', 'light');
    }
  } catch (_) {
    root.setAttribute('data-theme', 'light');
  }

  updateToggleUI();

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try {
        localStorage.setItem('neurohints-mgb-theme', next);
      } catch (_) {}
      updateToggleUI();
    });
  }

  mediaQuery.addEventListener('change', () => {
    updateToggleUI();
  });
}

// 2. Mobile Navigation Menu + Scroll-Driven Shrinking Header Fallback
function initNavigation() {
  const btn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('.nav-links');

  if (btn && nav) {
    btn.addEventListener('click', () => {
      const isExpanded = nav.classList.toggle('show');
      btn.setAttribute('aria-expanded', String(isExpanded));
      btn.innerHTML = isExpanded ? '<span aria-hidden="true">✕</span>' : '<span aria-hidden="true">☰</span>';
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('show')) {
        nav.classList.remove('show');
        btn.setAttribute('aria-expanded', 'false');
        btn.innerHTML = '<span aria-hidden="true">☰</span>';
        btn.focus();
      }
    });
  }

  // Fallback for browsers that don't support CSS scroll-driven animations
  if (!CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)')) {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('is-scrolled', window.scrollY > 36);
      }, { passive: true });
    }
  }
}

// 3. Reveal Animations with Failsafe
function initScrollReveal() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    elements.forEach((el) => observer.observe(el));
  }

  // Failsafe so no content ever remains invisible
  setTimeout(() => {
    elements.forEach((el) => el.classList.add('visible'));
  }, 900);
}

// 4. Native <dialog> Invoker Commands & Light-Dismiss Fallbacks
function initDialogs() {
  // Fallback for browsers without native Invoker Commands (commandForElement on HTMLButtonElement.prototype)
  if (!('commandForElement' in HTMLButtonElement.prototype)) {
    document.addEventListener('click', (event) => {
      const btn = event.target.closest('button[commandfor]');
      if (!btn) return;
      const targetId = btn.getAttribute('commandfor');
      const cmd = btn.getAttribute('command');
      const target = document.getElementById(targetId);
      if (!target || !(target instanceof HTMLDialogElement)) return;

      if (cmd === 'show-modal') {
        if (!target.open) target.showModal();
      } else if (cmd === 'close') {
        if (target.open) target.close();
      }
    });
  }

  // Fallback for browsers without native <dialog closedby="any"> support
  const bindDialogLightDismiss = (dialog) => {
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (isDialogContent) return;
        dialog.close();
      });
    }
  };

  document.querySelectorAll('dialog').forEach(bindDialogLightDismiss);
}

// 5. Multi-Scale Brain Explorer Tabs on Homepage
function initScaleTabs() {
  const tabs = Array.from(document.querySelectorAll('[role="tab"][data-scale-target]'));
  if (!tabs.length) return;

  const activateTab = (selectedTab, moveFocus = false) => {
    const targetId = selectedTab.getAttribute('data-scale-target');
    tabs.forEach((tab) => {
      const isMatch = tab === selectedTab;
      tab.setAttribute('aria-selected', String(isMatch));
      tab.setAttribute('tabindex', isMatch ? '0' : '-1');
    });
    document.querySelectorAll('.scale-panel').forEach((panel) => {
      panel.hidden = panel.id !== targetId;
    });
    if (moveFocus) selectedTab.focus();
  };

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => activateTab(tab, false));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        activateTab(tabs[(idx + 1) % tabs.length], true);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        activateTab(tabs[(idx - 1 + tabs.length) % tabs.length], true);
      }
    });
  });
}

// 6. Live Intracranial Neurophysiology Canvas & Stimulation Console
function initNeuroCanvas() {
  const netCanvas = document.getElementById('cortical-network-canvas');
  const scopeCanvas = document.getElementById('telemetry-scope-canvas');
  if (!netCanvas && !scopeCanvas) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isVisible = true;
  let stimPulseTime = -100;
  let stimMode = 'SPES'; // 'SPES' or 'THETA'
  let t = 0;

  // Trigger buttons
  const spesBtn = document.getElementById('stim-spes-btn');
  const thetaBtn = document.getElementById('stim-theta-btn');
  const statusEl = document.getElementById('telemetry-status-text');

  const triggerStim = (mode) => {
    stimMode = mode;
    stimPulseTime = t;
    if (statusEl) {
      statusEl.textContent = mode === 'THETA'
        ? 'THETA-BURST (100 Hz) • NETWORK REMODELING'
        : 'SPES CCEP EVOKED • LATENCY 3.8 ms';
      setTimeout(() => {
        if (statusEl) statusEl.textContent = 'LIVE sEEG / Neuropixels • 30.0 kHz';
      }, 2600);
    }
  };

  if (spesBtn) spesBtn.addEventListener('click', () => triggerStim('SPES'));
  if (thetaBtn) thetaBtn.addEventListener('click', () => triggerStim('THETA'));

  // Setup cortical connectome nodes
  const nodes = [];
  const numNodes = 42;
  for (let i = 0; i < numNodes; i++) {
    const cluster = i % 3; // 0: purple, 1: green, 2: cyan
    nodes.push({
      x: 0.1 + 0.8 * Math.random(),
      y: 0.12 + 0.76 * Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
      radius: 2.2 + Math.random() * 2.5,
      cluster,
      phase: Math.random() * Math.PI * 2
    });
  }

  const resizeCanvas = (c) => {
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = c.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      c.width = rect.width * dpr;
      c.height = rect.height * dpr;
    }
  };

  resizeCanvas(netCanvas);
  resizeCanvas(scopeCanvas);
  window.addEventListener('resize', () => {
    resizeCanvas(netCanvas);
    resizeCanvas(scopeCanvas);
  }, { passive: true });

  // Pause background rendering when scrolled off-screen
  const heroSection = document.querySelector('.hero');
  if (heroSection && 'IntersectionObserver' in window) {
    const visObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isVisible = entry.isIntersecting;
      });
    }, { threshold: 0.02 });
    visObserver.observe(heroSection);
  }

  const colors = ['#01828e', '#003a96', '#6d28d9'];

  const renderFrame = () => {
    if (isVisible) {
      t += reducedMotion ? 0 : 0.025;
      const dtStim = t - stimPulseTime;

      // Render Cortical Network Mesh
      if (netCanvas && netCanvas.width > 0) {
        const ctx = netCanvas.getContext('2d');
        const w = netCanvas.width;
        const h = netCanvas.height;
        ctx.clearRect(0, 0, w, h);

        // Draw stimulation wave ring if active
        if (dtStim >= 0 && dtStim < 3.2) {
          const waveR = (dtStim / 3.2) * Math.max(w, h) * 0.65;
          ctx.beginPath();
          ctx.arc(w * 0.68, h * 0.46, waveR, 0, Math.PI * 2);
          ctx.strokeStyle = stimMode === 'THETA'
            ? `rgba(109, 40, 217, ${Math.max(0, 0.55 - dtStim * 0.17)})`
            : `rgba(1, 130, 142, ${Math.max(0, 0.55 - dtStim * 0.17)})`;
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          if (!reducedMotion) {
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0.05 || n.x > 0.95) n.vx *= -1;
            if (n.y < 0.08 || n.y > 0.92) n.vy *= -1;
          }
          const px = n.x * w;
          const py = n.y * h;

          // Connect nearby cortical nodes
          for (let j = i + 1; j < nodes.length; j++) {
            const m = nodes[j];
            const dx = (n.x - m.x) * w;
            const dy = (n.y - m.y) * h;
            const dist = Math.hypot(dx, dy);
            const maxDist = Math.min(w, h) * 0.22;
            if (dist < maxDist) {
              const alpha = (1 - dist / maxDist) * 0.24;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(m.x * w, m.y * h);
              ctx.strokeStyle = `rgba(1, 130, 142, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }

          // Node glow
          const pulse = 0.65 + 0.35 * Math.sin(t * 2.2 + n.phase);
          ctx.beginPath();
          ctx.arc(px, py, n.radius * (1 + 0.25 * pulse), 0, Math.PI * 2);
          ctx.fillStyle = colors[n.cluster];
          ctx.fill();
        }
      }

      // Render 3-Channel Intracranial Oscilloscope (MGB Clinical EEG Styling)
      if (scopeCanvas && scopeCanvas.width > 0) {
        const sctx = scopeCanvas.getContext('2d');
        const sw = scopeCanvas.width;
        const sh = scopeCanvas.height;
        sctx.clearRect(0, 0, sw, sh);

        // Subtle clinical EEG grid lines
        sctx.strokeStyle = 'rgba(1, 130, 142, 0.16)';
        sctx.lineWidth = 1;
        for (let gx = 0; gx < sw; gx += sw / 8) {
          sctx.beginPath();
          sctx.moveTo(gx, 0);
          sctx.lineTo(gx, sh);
          sctx.stroke();
        }
        for (let gy = sh / 4; gy < sh; gy += sh / 4) {
          sctx.beginPath();
          sctx.moveTo(0, gy);
          sctx.lineTo(sw, gy);
          sctx.stroke();
        }

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const traceSpecs = [
          { label: 'L2/3 Spindle', color: isDark ? '#d8b4fe' : '#6d28d9', yBase: sh * 0.23, freq: 11.5 },
          { label: 'L5 Neuropixels', color: isDark ? '#55b9d3' : '#003a96', yBase: sh * 0.52, freq: 24.0 },
          { label: 'CCEP / CLoSES', color: isDark ? '#83d37f' : '#01828e', yBase: sh * 0.80, freq: 6.5 }
        ];

        traceSpecs.forEach((tr, idx) => {
          sctx.beginPath();
          sctx.strokeStyle = tr.color;
          sctx.lineWidth = 1.8;

          for (let x = 0; x < sw; x += 2) {
            const normX = x / sw;
            let wave =
              Math.sin((normX * tr.freq + t * 1.8) * Math.PI * 2) * (sh * 0.065) +
              Math.sin((normX * tr.freq * 2.3 - t * 3.1) * Math.PI * 2) * (sh * 0.025);

            // Spindle envelope on trace 0
            if (idx === 0) {
              const env = 0.4 + 0.6 * Math.pow(Math.sin((normX * 1.5 - t * 0.35) * Math.PI), 2);
              wave *= env;
            }

            // Action potential spikes on trace 1
            if (idx === 1) {
              const spikePhase = ((normX * 14 + t * 1.1) % 1 + 1) % 1;
              if (spikePhase < 0.045) {
                wave -= sh * 0.12 * Math.sin((spikePhase / 0.045) * Math.PI);
              }
            }

            // Stimulation artifact + Evoked Potential (CCEP) when stimulated
            if (dtStim >= 0 && dtStim < 2.2) {
              const center = 0.25 + dtStim * 0.28;
              const d = normX - center;
              if (Math.abs(d) < 0.015) {
                // Sharp biphasic stimulation pulse
                wave += (d > 0 ? 1 : -1) * sh * 0.16;
              } else if (d > 0.015 && d < 0.22) {
                // Evoked N1/N2 wave
                const ccep = Math.sin(((d - 0.015) / 0.205) * Math.PI * 2) * Math.exp(-(d - 0.015) * 9);
                wave += ccep * sh * (stimMode === 'THETA' ? 0.18 : 0.13);
              }
            }

            const y = tr.yBase + wave;
            if (x === 0) sctx.moveTo(x, y);
            else sctx.lineTo(x, y);
          }
          sctx.stroke();
        });
      }
    }

    if (!reducedMotion) {
      requestAnimationFrame(renderFrame);
    }
  };

  renderFrame();
}

// 7. People & Publications Interactive Filter & Search
function initFilters() {
  // Publications filter on Resources page
  const pubFilterBtns = document.querySelectorAll('[data-pub-filter]');
  const pubSearchInput = document.getElementById('pub-search-input');
  const pubItems = document.querySelectorAll('.pub-item[data-team]');
  const pubCountEl = document.getElementById('pub-count-badge');

  if (pubItems.length) {
    let activeTeam = 'all';
    let query = '';

    const updatePubs = () => {
      let visibleCount = 0;
      pubItems.forEach((item) => {
        const team = item.getAttribute('data-team') || '';
        const text = (item.textContent || '').toLowerCase();
        const matchesTeam = activeTeam === 'all' || team.includes(activeTeam);
        const matchesQuery = !query || text.includes(query);
        const show = matchesTeam && matchesQuery;
        item.hidden = !show;
        if (show) visibleCount++;
      });
      if (pubCountEl) {
        pubCountEl.textContent = `${visibleCount} ${visibleCount === 1 ? 'Publication' : 'Publications'}`;
      }
    };

    pubFilterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeTeam = btn.getAttribute('data-pub-filter') || 'all';
        pubFilterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        updatePubs();
      });
    });

    if (pubSearchInput) {
      pubSearchInput.addEventListener('input', () => {
        query = pubSearchInput.value.trim().toLowerCase();
        updatePubs();
      });
    }
  }

  // People directory filter on People page
  const roleBtns = document.querySelectorAll('[data-role-filter]');
  const peopleSearch = document.getElementById('people-search-input');
  const personCards = document.querySelectorAll('.person-card[data-role]');

  if (personCards.length && (roleBtns.length || peopleSearch)) {
    let activeRole = 'all';
    let pQuery = '';

    const updatePeople = () => {
      personCards.forEach((card) => {
        const role = card.getAttribute('data-role') || '';
        const text = (card.textContent || '').toLowerCase();
        const matchesRole = activeRole === 'all' || role === activeRole;
        const matchesQuery = !pQuery || text.includes(pQuery);
        card.hidden = !(matchesRole && matchesQuery);
      });
    };

    roleBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeRole = btn.getAttribute('data-role-filter') || 'all';
        roleBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        updatePeople();
      });
    });

    if (peopleSearch) {
      peopleSearch.addEventListener('input', () => {
        pQuery = peopleSearch.value.trim().toLowerCase();
        updatePeople();
      });
    }
  }
}

// 8. Global Command Palette (⌘K / Ctrl+K) across all pages
function initCommandPalette() {
  const rootPrefix = getRelativeRoot();
  const searchBtn = document.getElementById('open-search-btn');

  // Create global search dialog if not already in DOM
  let dialog = document.getElementById('global-search-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'global-search-dialog';
    dialog.className = 'lab-dialog';
    dialog.setAttribute('closedby', 'any');
    dialog.setAttribute('aria-labelledby', 'global-search-title');

    const directoryItems = [
      { title: 'Epilepsy & Neuromodulation Team', category: 'Research Team', url: `${rootPrefix}research/epilepsy-neuromodulation/`, keywords: 'seizure sEEG CCEP stimulation oscillations Cash Salami Zelmann Paulk' },
      { title: 'Cognition & Sleep Team', category: 'Research Team', url: `${rootPrefix}research/cognition-sleep/`, keywords: 'sleep spindles ripples memory dreams NREM cognition Cash Zelmann' },
      { title: 'Neurotechnology Team', category: 'Research Team', url: `${rootPrefix}research/neurotechnology/`, keywords: 'Neuropixels microelectrode BCI BrainGate CLoSES closed-loop Pt nanorods' },
      { title: 'Cancer Neuroscience Team', category: 'Research Team', url: `${rootPrefix}research/cancer-neuroscience/`, keywords: 'glioma tumor infiltration electrocorticography Paulk NIH' },
      { title: 'AI in Neurology & Neuroscience Team', category: 'Research Team', url: `${rootPrefix}research/ai-neurology/`, keywords: 'LLM deep learning sleep EEG brain age biomarkers Hadar' },
      { title: 'Cash Lab — Dr. Sydney Cash, MD, PhD', category: 'Principal Investigator Lab', url: `${rootPrefix}people/#lab-cash`, keywords: 'Division Chief Epilepsy CNTR CDAC BrainGate' },
      { title: 'Paulk Lab — Dr. Angelique Paulk, PhD', category: 'Principal Investigator Lab', url: `${rootPrefix}people/#lab-paulk`, keywords: 'Neuropixels Cancer Neuroscience stimulation microelectrodes' },
      { title: 'Salami Lab — Dr. Pariya Salami, PhD', category: 'Principal Investigator Lab', url: `${rootPrefix}people/#lab-salami`, keywords: 'seizure onset termination dynamics EEG signal processing' },
      { title: 'Zelmann Lab — Dr. Rina Zelmann, PhD', category: 'Principal Investigator Lab', url: `${rootPrefix}people/#lab-zelmann`, keywords: 'CLoSES closed-loop stimulation HFOs sleep spindles iEEG' },
      { title: 'Hadar Lab — Dr. Peter Hadar, MD, MSc (Epilepsy Therapeutics, AI, NeuroEconomics)', category: 'Principal Investigator Lab', url: `${rootPrefix}people/#lab-hadar`, keywords: 'Epilepsy Therapeutics AI NeuroEconomics neurology LLMs sleep EEG biomarkers prompt engineering' },
      { title: 'Publications & Open Science Repository', category: 'Resources', url: `${rootPrefix}resources/#publications`, keywords: 'Nature Neuroscience Nature Communications PNAS Brain Epilepsia papers code' },
      { title: 'Join NeuroHINTS Labs / Contact Us', category: 'Opportunities & Contact', url: `${rootPrefix}contact/`, keywords: 'postdoc graduate student fellowship MGH Harvard Boston Fruit Street' }
    ];

    dialog.innerHTML = `
      <div class="dialog-inner">
        <div class="dialog-header">
          <div>
            <span class="eyebrow" style="margin-block-end:0.35rem;"><span class="eyebrow__dot"></span>Quick Navigation</span>
            <h2 id="global-search-title" style="font-size:1.35rem;margin:0;">Search NeuroHINTS Labs</h2>
          </div>
          <button type="button" class="dialog-close-btn" commandfor="global-search-dialog" command="close" aria-label="Close search dialog">✕</button>
        </div>
        <search>
          <label for="cmd-palette-input" class="visually-hidden">Search teams, labs, people, and publications</label>
          <input
            type="search"
            id="cmd-palette-input"
            class="search-input"
            placeholder="Search research teams, PI labs, Neuropixels, CCEP, sleep spindles, AI..."
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
            style="inline-size:100%;max-inline-size:100%;margin-block-end:1rem;"
          />
        </search>
        <ul id="cmd-palette-results" class="pub-list" role="list" style="max-block-size:20rem;overflow-y:auto;"></ul>
      </div>
    `;
    document.body.appendChild(dialog);

    const input = dialog.querySelector('#cmd-palette-input');
    const list = dialog.querySelector('#cmd-palette-results');
    const closeBtn = dialog.querySelector('.dialog-close-btn');

    const renderResults = (q) => {
      const term = q.trim().toLowerCase();
      const matches = directoryItems.filter((item) =>
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.keywords.toLowerCase().includes(term)
      );
      list.innerHTML = matches.map((item) => `
        <li class="pub-item" style="padding:0.85rem 1.1rem;">
          <a href="${item.url}" style="display:flex;justify-content:space-between;align-items:center;gap:1rem;">
            <div>
              <div style="font-weight:600;color:var(--text-color);">${item.title}</div>
              <div style="font-size:0.78rem;color:var(--text-muted);font-family:var(--font-mono);">${item.category}</div>
            </div>
            <span aria-hidden="true" style="color:var(--primary-color);font-weight:700;">→</span>
          </a>
        </li>
      `).join('');
    };

    renderResults('');
    input.addEventListener('input', () => renderResults(input.value));
    closeBtn.addEventListener('click', () => dialog.close());
  }

  const openPalette = () => {
    if (!dialog.open) {
      dialog.showModal();
      const input = dialog.querySelector('#cmd-palette-input');
      if (input) input.focus();
    }
  };

  if (searchBtn) {
    searchBtn.addEventListener('click', openPalette);
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dialog.open) dialog.close();
      else openPalette();
    }
  });
}

// 9. Contact Form Accessible Feedback
function initContactForm() {
  const form = document.getElementById('neurohints-contact-form');
  const statusBox = document.getElementById('contact-form-status');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    if (statusBox) {
      statusBox.hidden = false;
      statusBox.textContent = '✓ Thank you for reaching out to the NeuroHINTS Labs at MGH / Harvard Medical School. Your inquiry has been prepared.';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initScrollReveal();
  initDialogs();
  initScaleTabs();
  initNeuroCanvas();
  initFilters();
  initCommandPalette();
  initContactForm();
});
