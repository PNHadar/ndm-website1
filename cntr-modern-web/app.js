(function () {
  "use strict";

  const DATA = window.CNTR_DATA || {};

  // State
  const state = {
    route: "/",
    subItem: null,
    labFilter: "All",
    labQuery: "",
    teamRole: "All",
    teamLetter: "All",
    teamQuery: "",
    pubYear: "All",
    pubQuery: "",
    pubView: "table",
    trialStatus: "All",
    trialQuery: "",
    newsCategory: "All",
    newsQuery: "",
    podcastQuery: "",
    jobQuery: ""
  };

  // Utility: Escape HTML safely
  function esc(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initials(name) {
    if (!name) return "CN";
    const clean = name.replace(/,.*$/, "").trim();
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // Classify lab domain for filtering
  function getLabDomain(lab) {
    const text = ((lab.name || "") + " " + (lab.bio || "")).toLowerCase();
    const domains = [];
    if (text.includes("prosthetic") || text.includes("braingate") || text.includes("interface") || text.includes("bci")) {
      domains.push("Brain-Computer Interfaces");
    }
    if (text.includes("coma") || text.includes("consciousness") || text.includes("nicc")) {
      domains.push("Coma & Consciousness");
    }
    if (text.includes("epilepsy") || text.includes("seizure") || text.includes("stimulation") || text.includes("neurotherapeutics") || text.includes("cash") || text.includes("chu") || text.includes("lam")) {
      domains.push("Epilepsy & Neuromodulation");
    }
    if (text.includes("recovery") || text.includes("stroke") || text.includes("paralysis") || text.includes("rehabilitation") || text.includes("ltnr")) {
      domains.push("Stroke & NeuroRecovery");
    }
    if (text.includes("health") || text.includes("precision") || text.includes("value") || text.includes("ziv") || text.includes("mccance")) {
      domains.push("Brain Health & Precision Medicine");
    }
    return domains.length ? domains : ["Translational Neuroscience"];
  }

  // Navigation helper (supports both History API when served over HTTP and hash fallback for file://)
  function navigate(path, push = true) {
    let cleanPath = path || "/";
    if (cleanPath.startsWith("#")) cleanPath = cleanPath.slice(1) || "/";
    if (!cleanPath.startsWith("/")) cleanPath = "/" + cleanPath;

    let baseRoute = cleanPath;
    let subSlug = null;

    if (cleanPath.startsWith("/our-team-1/")) {
      baseRoute = "/ourteam";
      subSlug = cleanPath;
    } else if (cleanPath.startsWith("/podcast-episodes/")) {
      baseRoute = "/podcast";
      subSlug = cleanPath;
    } else if (cleanPath.startsWith("/news/")) {
      baseRoute = "/news";
      subSlug = cleanPath;
    } else if (cleanPath.startsWith("/jobs/")) {
      baseRoute = "/jobs";
      subSlug = cleanPath;
    } else if (cleanPath === "/our-team-collaborators") {
      baseRoute = "/our-team-collaborators";
      state.teamRole = "Collaborators";
    }

    state.route = baseRoute;
    state.subItem = subSlug;

    if (push) {
      if (window.location.protocol === "file:") {
        window.location.hash = cleanPath;
      } else {
        try {
          window.history.pushState({ path: cleanPath }, "", cleanPath);
        } catch (err) {
          window.location.hash = cleanPath;
        }
      }
    }

    renderApp();
    window.scrollTo({ top: 0, behavior: "instant" });

    if (subSlug) {
      openDeepLinkModal(subSlug);
    }
  }

  function openDeepLinkModal(slug) {
    if (slug.startsWith("/our-team-1/")) {
      const person = (DATA.team || []).find((p) => p.slug === slug);
      if (person) openPersonModal(person.id);
    } else if (slug.startsWith("/podcast-episodes/")) {
      const ep = (DATA.podcasts || []).find((p) => p.slug === slug || `/podcast-episodes/episode-${p.number}` === slug || `/podcast-episodes/${p.number}` === slug);
      if (ep) openPodcastModal(ep.number);
    } else if (slug.startsWith("/news/")) {
      const item = (DATA.news || []).find((n) => n.slug === slug || n.slug === decodeURIComponent(slug));
      if (item) openNewsModal(item.id);
    } else if (slug.startsWith("/jobs/")) {
      const job = (DATA.jobs || []).find((j) => j.slug === slug);
      if (job) openJobModal(job.id);
    }
  }

  // Update active nav links
  function updateActiveNav() {
    const links = document.querySelectorAll("[data-route]");
    links.forEach((a) => {
      const r = a.getAttribute("data-route");
      const isClinicalSub = ["/adult-epilepsy-service", "/emerging-consciousness-program", "/neurorecovery-clinic", "/brain-computer-interface-clinic"].includes(state.route);
      if (r === state.route || (r === "/clinical-programs" && isClinicalSub) || (r === "/ourteam" && state.route === "/our-team-collaborators")) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  // Views
  function renderHome() {
    const featuredLabs = (DATA.labs || []).slice(0, 6);
    const featuredNews = (DATA.news || []).slice(0, 4);
    const recentPubs = (DATA.publications || []).slice(0, 5);
    const latestEp = (DATA.podcasts || [])[0];

    return `
      <section class="hero">
        <div class="container hero__grid">
          <div>
            <div class="hero__eyebrow">
              <span>Massachusetts General Hospital &bull; Harvard Medical School</span>
            </div>
            <h1 class="hero__title">
              Restoring Nervous System Function Through <span>Neurotechnology</span> &amp; Clinical Discovery
            </h1>
            <p class="hero__lead">
              ${esc(DATA.meta.tagline)} We unite neurologists, neurosurgeons, neural engineers, and rehabilitation scientists across 16 specialized laboratories and 4 clinical programs.
            </p>
            <div class="hero__actions">
              <a href="/research" data-nav="/research" class="btn btn--primary">Explore 16 Research Labs</a>
              <a href="/clinical-programs" data-nav="/clinical-programs" class="btn btn--crimson">Clinical Care &amp; Referrals</a>
              <a href="/publications" data-nav="/publications" class="btn btn--outline" style="color:#f8fafc;border-color:rgba(255,255,255,0.35);">Recent Publications</a>
            </div>
            <div class="hero__stats">
              ${(DATA.meta.stats || [])
                .map(
                  (s) => `
                <div class="stat-card">
                  <div class="stat-card__value tabular-nums">${esc(s.value)}</div>
                  <div class="stat-card__label">${esc(s.label)}</div>
                </div>`
                )
                .join("")}
            </div>
          </div>
          <div class="hero__visual">
            <img
              src="https://static.wixstatic.com/media/e6c040_c34d897b84aa419aa29eb878b2a586cb~mv2.jpg"
              alt="High-resolution human brain tractography and neurotechnology research at MGH CNTR"
              class="hero__visual-img"
              width="640"
              height="400"
              fetchpriority="high"
              decoding="async"
            />
            <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;flex-wrap:wrap;">
              <div>
                <div class="mono" style="font-size:0.74rem;color:#7dd3fc;text-transform:uppercase;">Featured Breakthrough</div>
                <div style="font-weight:600;font-size:0.95rem;color:#ffffff;">BrainGate Neural Interface &amp; Human Connectomics</div>
              </div>
              <a href="/challenges" data-nav="/challenges" class="btn btn--sm btn--primary">5 Core Challenges &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      <!-- 5 Core Challenges Preview -->
      <section class="section">
        <div class="container">
          <div class="section-header">
            <div>
              <div class="section-eyebrow">Translational Mission</div>
              <h2 class="section-title">Five Core Neurological Challenges</h2>
            </div>
            <a href="/challenges" data-nav="/challenges" class="btn btn--outline btn--sm">View Challenge Architecture &rarr;</a>
          </div>
          <div class="grid-auto">
            ${(DATA.challenges || [])
              .map(
                (c) => `
              <div class="card-wrap">
                <article class="card">
                  <div>
                    <span class="card__badge">Challenge ${esc(c.number)}</span>
                    <h3 class="card__title mt-md">${esc(c.title)}</h3>
                    <p class="card__body" style="margin-block-start:0.5rem;"><strong>Clinical Need:</strong> ${esc(c.problem)}</p>
                    <p class="card__body" style="margin-block-start:0.5rem;"><strong>CNTR Approach:</strong> ${esc(c.solution)}</p>
                  </div>
                </article>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <!-- Clinical Programs Highlight -->
      <section class="section section-deferred" style="background:var(--surface-elevated);border-block:1px solid var(--border-subtle);">
        <div class="container">
          <div class="section-header">
            <div>
              <div class="section-eyebrow">Bench-to-Bedside Care</div>
              <h2 class="section-title">Translational Clinical Programs</h2>
            </div>
            <a href="/clinical-programs" data-nav="/clinical-programs" class="btn btn--outline btn--sm">All Clinical Programs &rarr;</a>
          </div>
          <div class="grid-auto">
            ${(DATA.clinicalPrograms || [])
              .map(
                (cp) => `
              <div class="card-wrap">
                <article class="card">
                  <div>
                    <img src="${esc(cp.image)}" alt="${esc(cp.name)}" class="card__media" width="480" height="270" loading="lazy" decoding="async" />
                    <span class="card__badge">${esc(cp.shortName)}</span>
                    <h3 class="card__title" style="margin-block-start:0.5rem;">${esc(cp.name)}</h3>
                    <p class="card__body" style="margin-block-start:0.4rem;">${esc(cp.tagline)}</p>
                  </div>
                  <div class="card__footer">
                    <span class="card__meta mono">Tel: ${esc(cp.phone)}</span>
                    <a href="${esc(cp.slug)}" data-nav="${esc(cp.slug)}" class="btn btn--sm btn--primary">Program Details &rarr;</a>
                  </div>
                </article>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </section>

      <!-- Featured Research Labs -->
      <section class="section section-deferred">
        <div class="container">
          <div class="section-header">
            <div>
              <div class="section-eyebrow">Interdisciplinary Discovery</div>
              <h2 class="section-title">Research Laboratories &amp; Centers</h2>
            </div>
            <a href="/research" data-nav="/research" class="btn btn--primary btn--sm">View All 16 Labs &rarr;</a>
          </div>
          <div class="grid-auto">
            ${featuredLabs.map(renderLabCard).join("")}
          </div>
        </div>
      </section>

      <!-- Latest Publications & Podcast Split -->
      <section class="section section-deferred" style="background:var(--surface-elevated);border-block:1px solid var(--border-subtle);">
        <div class="container split-layout">
          <div>
            <div class="section-header">
              <div>
                <div class="section-eyebrow">Scientific Output</div>
                <h2 class="section-title">Recent Publications</h2>
              </div>
              <a href="/publications" data-nav="/publications" class="btn btn--outline btn--sm">All Publications &rarr;</a>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              ${recentPubs
                .map(
                  (pub) => `
                <article class="card" style="padding:1rem;">
                  <div style="display:flex;justify-content:space-between;gap:0.5rem;align-items:baseline;">
                    <span class="card__badge">${esc(pub.authorJournal)}</span>
                    <time class="card__meta mono" datetime="${esc(pub.date)}">${esc(pub.date)}</time>
                  </div>
                  <h3 style="font-size:1rem;margin-block:0.35rem;">${esc(pub.title)}</h3>
                  <div style="display:flex;gap:0.75rem;font-size:0.85rem;">
                    ${pub.pubMedUrl ? `<a href="${esc(pub.pubMedUrl)}" target="_blank" rel="noopener">PubMed &nearr;</a>` : ""}
                    ${pub.pdfUrl ? `<a href="${esc(pub.pdfUrl)}" target="_blank" rel="noopener">Full Text / PDF &nearr;</a>` : ""}
                  </div>
                </article>`
                )
                .join("")}
            </div>
          </div>

          <div>
            <div class="section-header">
              <div>
                <div class="section-eyebrow">Conversations in Neurotechnology</div>
                <h2 class="section-title">The CNTR Podcast</h2>
              </div>
              <a href="/podcast" data-nav="/podcast" class="btn btn--outline btn--sm">All 15 Episodes &rarr;</a>
            </div>
            ${
              latestEp
                ? `
              <article class="card">
                <div>
                  <span class="card__badge card__badge--crimson">Latest &bull; ${esc(latestEp.episodeLabel)}</span>
                  <h3 class="card__title" style="margin-block-start:0.5rem;">${esc(latestEp.title)}</h3>
                  <p class="card__meta" style="margin-block:0.25rem 0.65rem;">Guest: <strong>${esc(latestEp.guest)}</strong></p>
                  <p class="card__body">${esc(latestEp.description.slice(0, 320))}...</p>
                </div>
                <div class="card__footer">
                  <button type="button" class="btn btn--sm btn--primary" data-open-podcast="${esc(latestEp.number)}">Listen &amp; Read Notes</button>
                  <div style="display:flex;gap:0.6rem;font-size:0.84rem;">
                    ${latestEp.spotify ? `<a href="${esc(latestEp.spotify)}" target="_blank" rel="noopener">Spotify &nearr;</a>` : ""}
                    ${latestEp.applePodcast ? `<a href="${esc(latestEp.applePodcast)}" target="_blank" rel="noopener">Apple &nearr;</a>` : ""}
                    ${latestEp.youtube ? `<a href="${esc(latestEp.youtube)}" target="_blank" rel="noopener">YouTube &nearr;</a>` : ""}
                  </div>
                </div>
              </article>`
                : ""
            }

            <div class="mt-md">
              <div class="section-eyebrow">Latest News &amp; Media</div>
              <div style="display:flex;flex-direction:column;gap:0.65rem;margin-block-start:0.5rem;">
                ${featuredNews
                  .map(
                    (n) => `
                  <article class="card" style="padding:0.9rem;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                      <span class="card__badge">${esc(n.category)}</span>
                      <time class="card__meta mono">${esc(n.date)}</time>
                    </div>
                    <h4 style="font-size:0.96rem;margin-block-start:0.25rem;">
                      <a href="${esc(n.slug)}" data-nav="${esc(n.slug)}" style="text-decoration:none;color:inherit;">${esc(n.title)}</a>
                    </h4>
                  </article>`
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderAbout() {
    const leadership = (DATA.team || []).filter((t) => t.roleGroup === "Leadership");
    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">MGH Department of Neurology &bull; About CNTR</div>
          <h1 class="page-banner__title">About the Center for Neurotechnology and Neurorecovery</h1>
          <p class="page-banner__sub">${esc(DATA.meta.mission)}</p>
        </div>
      </header>

      <section class="section">
        <div class="container split-layout">
          <div>
            <div class="section-eyebrow">Our Vision &amp; Model</div>
            <h2 class="section-title mb-md">Bridging Engineering, Neuroscience, and Clinical Care</h2>
            <p class="mb-md">
              Founded within the Massachusetts General Hospital Department of Neurology, the Center for Neurotechnology and Neurorecovery (CNTR) brings together clinician-scientists, neural engineers, neurosurgeons, physiatrists, and computational scientists in a unified collaborative environment.
            </p>
            <p class="mb-md">
              Unlike traditional academic silos where device engineering and clinical neurology operate separately, CNTR embeds engineers directly into neurocritical care units, epilepsy monitoring units, stroke recovery clinics, and operating rooms — ensuring that technological innovations directly address urgent patient needs.
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-block-start:1.5rem;">
              <a href="/challenges" data-nav="/challenges" class="btn btn--primary">Explore Our 5 Challenges</a>
              <a href="/ourteam" data-nav="/ourteam" class="btn btn--outline">Meet All 90+ Team Members</a>
              <a href="/inquiry-services-page" data-nav="/inquiry-services-page" class="btn btn--outline">Inquire or Collaborate</a>
            </div>
          </div>
          <div class="card">
            <span class="card__badge">Center Headquarters</span>
            <h3 class="card__title">MGH CNTR at 101 Merrimac</h3>
            <p class="card__body">
              <strong>Address:</strong> ${esc(DATA.meta.address.suite)}, ${esc(DATA.meta.address.street)}, ${esc(DATA.meta.address.city)}, ${esc(DATA.meta.address.state)} ${esc(DATA.meta.address.zip)}<br/>
              <strong>Phone:</strong> ${esc(DATA.meta.phone)}<br/>
              <strong>Institution:</strong> ${esc(DATA.meta.institution)}
            </p>
            <div class="card__footer">
              <a href="/jobs" data-nav="/jobs" class="btn btn--sm btn--primary">Open Positions (${(DATA.jobs || []).length})</a>
              <a href="/support-us" data-nav="/support-us" class="btn btn--sm btn--crimson">Support CNTR</a>
            </div>
          </div>
        </div>
      </section>

      <section class="section" style="background:var(--surface-elevated);border-block-start:1px solid var(--border-subtle);">
        <div class="container">
          <div class="section-header">
            <div>
              <div class="section-eyebrow">Executive Direction</div>
              <h2 class="section-title">CNTR Leadership</h2>
            </div>
            <a href="/ourteam" data-nav="/ourteam" class="btn btn--outline btn--sm">Full Faculty &amp; Staff Directory &rarr;</a>
          </div>
          <div class="grid-team">
            ${leadership.map(renderPersonCard).join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderChallenges() {
    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">Research Strategy &bull; Core Focus Areas</div>
          <h1 class="page-banner__title">Five Core Neurological Challenges</h1>
          <p class="page-banner__sub">
            CNTR organizes its translational research, clinical trials, and engineering innovation around five fundamental capabilities disrupted by nervous system disease or injury.
          </p>
        </div>
      </header>
      <section class="section">
        <div class="container" style="display:flex;flex-direction:column;gap:1.25rem;">
          ${(DATA.challenges || [])
            .map(
              (c) => `
            <article class="card" style="padding:var(--space-lg);">
              <div class="split-layout" style="align-items:center;">
                <div>
                  <span class="card__badge">Challenge ${esc(c.number)}</span>
                  <h2 style="font-family:var(--font-serif);font-size:var(--step-2);margin-block:0.4rem;">${esc(c.title)}</h2>
                  <p class="card__body"><strong>The Clinical Challenge:</strong> ${esc(c.problem)}</p>
                </div>
                <div style="background:var(--surface-elevated);padding:var(--space-md);border-radius:var(--radius-md);border-inline-start:4px solid var(--accent-primary);">
                  <div class="mono" style="font-size:0.75rem;text-transform:uppercase;color:var(--accent-primary);font-weight:600;margin-block-end:0.35rem;">Translational Neurotechnology Solution</div>
                  <p class="card__body">${esc(c.solution)}</p>
                </div>
              </div>
            </article>`
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderLabCard(lab) {
    const domains = getLabDomain(lab);
    return `
      <div class="card-wrap">
        <article class="card">
          <div>
            ${
              lab.image
                ? `<img src="${esc(lab.image)}" alt="${esc(lab.name)}" class="card__media" width="480" height="270" loading="lazy" decoding="async" />`
                : ""
            }
            <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-block-end:0.4rem;">
              ${domains.map((d) => `<span class="card__badge">${esc(d)}</span>`).join("")}
            </div>
            <h3 class="card__title">${esc(lab.name)}</h3>
            ${lab.pi ? `<p class="card__meta" style="margin-block-start:0.25rem;">Leadership / PI: <strong>${esc(lab.pi)}</strong></p>` : ""}
            <p class="card__body" style="margin-block-start:0.55rem;">${esc(lab.bio)}</p>
          </div>
          <div class="card__footer">
            ${
              lab.url
                ? `<a href="${esc(lab.url)}" target="_blank" rel="noopener" class="btn btn--sm btn--primary">Visit Lab Website &nearr;</a>`
                : `<span class="card__meta">MGH CNTR Research Group</span>`
            }
          </div>
        </article>
      </div>
    `;
  }

  function renderResearch() {
    const domains = [
      "All",
      "Brain-Computer Interfaces",
      "Coma & Consciousness",
      "Epilepsy & Neuromodulation",
      "Stroke & NeuroRecovery",
      "Brain Health & Precision Medicine"
    ];

    const filtered = (DATA.labs || []).filter((lab) => {
      const matchDomain = state.labFilter === "All" || getLabDomain(lab).includes(state.labFilter);
      const q = state.labQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        (lab.name || "").toLowerCase().includes(q) ||
        (lab.pi || "").toLowerCase().includes(q) ||
        (lab.bio || "").toLowerCase().includes(q);
      return matchDomain && matchQuery;
    });

    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">MGH CNTR &bull; Research Directory</div>
          <h1 class="page-banner__title">Research Laboratories, Consortia &amp; Centers</h1>
          <p class="page-banner__sub">
            Explore all ${(DATA.labs || []).length} specialized research groups, translational laboratories, and multi-institutional consortia affiliated with CNTR.
          </p>
        </div>
      </header>

      <section class="section">
        <div class="container">
          <search class="filter-bar" aria-label="Filter research laboratories">
            <div class="filter-bar__row">
              <div class="search-input-wrap">
                <span class="search-input-icon" aria-hidden="true">&#128269;</span>
                <input
                  type="search"
                  id="lab-search-input"
                  class="search-input"
                  placeholder="Search labs by name, Principal Investigator, or research method..."
                  value="${esc(state.labQuery)}"
                  aria-label="Search laboratories"
                />
              </div>
              <span class="card__meta mono">Showing ${filtered.length} of ${(DATA.labs || []).length} labs</span>
            </div>
            <div class="pill-group" role="group" aria-label="Research domain filter">
              ${domains
                .map(
                  (d) => `
                <button type="button" class="filter-pill" data-lab-domain="${esc(d)}" aria-pressed="${state.labFilter === d}">
                  ${esc(d)}
                </button>`
                )
                .join("")}
            </div>
          </search>

          <div class="grid-auto">
            ${
              filtered.length
                ? filtered.map(renderLabCard).join("")
                : `<div class="card"><p>No laboratories matched your filter criteria. Try clearing the search query.</p></div>`
            }
          </div>
        </div>
      </section>
    `;
  }

  function renderPersonCard(p) {
    return `
      <article class="person-card">
        <div class="person-card__img-wrap">
          ${
            p.photo
              ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" class="person-card__img" width="320" height="320" loading="lazy" decoding="async" />`
              : `<div class="person-card__initials" aria-hidden="true">${esc(initials(p.name))}</div>`
          }
        </div>
        <div class="person-card__body">
          <span class="card__badge">${esc(p.roleGroup)}</span>
          <h3 style="font-size:1.05rem;margin-block-start:0.2rem;">${esc(p.name)}</h3>
          ${p.jobTitle ? `<p class="card__meta" style="color:var(--accent-primary);font-weight:600;">${esc(p.jobTitle)}</p>` : ""}
          ${p.shortDescription ? `<p class="card__body" style="font-size:0.86rem;">${esc(p.shortDescription)}</p>` : ""}
          <div style="margin-block-start:auto;padding-block-start:0.75rem;display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
            <button type="button" class="btn btn--sm btn--outline" data-open-person="${esc(p.id)}">View Bio</button>
            ${p.website ? `<a href="${esc(p.website)}" target="_blank" rel="noopener" style="font-size:0.82rem;">Lab / Site &nearr;</a>` : ""}
          </div>
        </div>
      </article>
    `;
  }

  function renderTeam() {
    const roles = [
      "All",
      "Leadership",
      "Faculty",
      "Research Scientists",
      "Research Team Management",
      "Collaborators",
      "Alumni"
    ];

    const roleCounts = { All: (DATA.team || []).length };
    (DATA.team || []).forEach((p) => {
      roleCounts[p.roleGroup] = (roleCounts[p.roleGroup] || 0) + 1;
    });

    const filtered = (DATA.team || []).filter((p) => {
      const matchRole = state.teamRole === "All" || p.roleGroup === state.teamRole;
      const q = state.teamQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.jobTitle || "").toLowerCase().includes(q) ||
        (p.shortDescription || "").toLowerCase().includes(q) ||
        (p.bio || "").toLowerCase().includes(q);
      return matchRole && matchQuery;
    });

    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">MGH CNTR &bull; People &amp; Collaborators</div>
          <h1 class="page-banner__title">Our Team &amp; Collaborators</h1>
          <p class="page-banner__sub">
            Meet the ${(DATA.team || []).length} physicians, principal investigators, research scientists, engineers, coordinators, collaborators, and alumni driving CNTR's mission.
          </p>
        </div>
      </header>

      <section class="section">
        <div class="container">
          <search class="filter-bar" aria-label="Search and filter team members">
            <div class="filter-bar__row">
              <div class="search-input-wrap">
                <span class="search-input-icon" aria-hidden="true">&#128269;</span>
                <input
                  type="search"
                  id="team-search-input"
                  class="search-input"
                  placeholder="Search by name, clinical specialty, lab, or research interest..."
                  value="${esc(state.teamQuery)}"
                  aria-label="Search team directory"
                />
              </div>
              <span class="card__meta mono">Showing ${filtered.length} of ${(DATA.team || []).length} people</span>
            </div>
            <div class="pill-group" role="group" aria-label="Role category filter">
              ${roles
                .map(
                  (r) => `
                <button type="button" class="filter-pill" data-team-role="${esc(r)}" aria-pressed="${state.teamRole === r}">
                  ${esc(r)} (${roleCounts[r] || 0})
                </button>`
                )
                .join("")}
            </div>
          </search>

          <div class="grid-team">
            ${
              filtered.length
                ? filtered.map(renderPersonCard).join("")
                : `<div class="card"><p>No team members matched your search criteria.</p></div>`
            }
          </div>
        </div>
      </section>
    `;
  }

  function renderClinicalProgramsOverview() {
    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">Patient Care &bull; Massachusetts General Hospital</div>
          <h1 class="page-banner__title">Translational Clinical Programs</h1>
          <p class="page-banner__sub">
            CNTR's four specialized clinical programs translate neurotechnology, multimodal neuroimaging, and interdisciplinary rehabilitation directly into patient care at Massachusetts General Hospital.
          </p>
        </div>
      </header>

      <section class="section">
        <div class="container" style="display:flex;flex-direction:column;gap:var(--space-lg);">
          ${(DATA.clinicalPrograms || [])
            .map(
              (cp) => `
            <article class="card" style="padding:var(--space-lg);">
              <div class="split-layout">
                <div>
                  <span class="card__badge">${esc(cp.shortName)}</span>
                  <h2 style="font-family:var(--font-serif);font-size:var(--step-2);margin-block:0.4rem;">${esc(cp.name)}</h2>
                  <p class="card__body mb-md">${esc(cp.overview)}</p>
                  <h3 style="font-size:0.95rem;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-muted);margin-block-end:0.5rem;" class="mono">Clinical Capabilities &amp; Highlights</h3>
                  <ul style="padding-inline-start:1.25rem;display:flex;flex-direction:column;gap:0.35rem;margin-block-end:var(--space-md);">
                    ${(cp.highlights || []).map((h) => `<li class="card__body">${esc(h)}</li>`).join("")}
                  </ul>
                  <div style="display:flex;flex-wrap:wrap;gap:0.75rem;">
                    <a href="${esc(cp.slug)}" data-nav="${esc(cp.slug)}" class="btn btn--primary">Open Dedicated Clinic Page &rarr;</a>
                    <a href="${esc(cp.externalUrl)}" target="_blank" rel="noopener" class="btn btn--outline">MGH Clinical Portal &nearr;</a>
                  </div>
                </div>
                <div>
                  <img src="${esc(cp.image)}" alt="${esc(cp.name)}" class="card__media" style="aspect-ratio:16/10;" width="560" height="350" loading="lazy" decoding="async" />
                  <div style="background:var(--surface-elevated);padding:1rem;border-radius:var(--radius-sm);margin-block-start:0.75rem;">
                    <div class="mono" style="font-size:0.76rem;color:var(--text-muted);text-transform:uppercase;">Referrals &amp; Appointments</div>
                    <div style="font-weight:700;font-size:1.1rem;margin-block-start:0.2rem;">Phone: ${esc(cp.phone)}</div>
                    <div class="card__meta" style="margin-block-start:0.2rem;">Massachusetts General Hospital, Boston, MA</div>
                  </div>
                </div>
              </div>
            </article>`
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderSingleClinicalProgram(slug) {
    const cp = (DATA.clinicalPrograms || []).find((c) => c.slug === slug) || DATA.clinicalPrograms[0];
    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">
            <a href="/clinical-programs" data-nav="/clinical-programs" style="color:#7dd3fc;">Clinical Programs</a> &bull; ${esc(cp.shortName)}
          </div>
          <h1 class="page-banner__title">${esc(cp.name)}</h1>
          <p class="page-banner__sub">${esc(cp.tagline)}</p>
        </div>
      </header>

      <section class="section">
        <div class="container split-layout">
          <div>
            <h2 class="section-title mb-md">Program Overview</h2>
            <p class="mb-md" style="font-size:var(--step-1);">${esc(cp.overview)}</p>
            <h3 style="font-size:1.15rem;margin-block:1.5rem 0.75rem;">Key Clinical &amp; Diagnostic Services</h3>
            <ul style="padding-inline-start:1.25rem;display:flex;flex-direction:column;gap:0.55rem;margin-block-end:var(--space-lg);">
              ${(cp.highlights || []).map((h) => `<li>${esc(h)}</li>`).join("")}
            </ul>
            <div style="display:flex;flex-wrap:wrap;gap:0.75rem;">
              <a href="${esc(cp.externalUrl)}" target="_blank" rel="noopener" class="btn btn--primary">Official MGH Department Page &nearr;</a>
              <a href="/clinical-trials" data-nav="/clinical-trials" class="btn btn--outline">View Active Clinical Trials</a>
              <a href="/clinical-programs" data-nav="/clinical-programs" class="btn btn--outline">&larr; All Clinical Programs</a>
            </div>
          </div>
          <aside class="card">
            <img src="${esc(cp.image)}" alt="${esc(cp.name)}" class="card__media" width="520" height="300" />
            <span class="card__badge">Patient &amp; Physician Referrals</span>
            <h3 class="card__title">Contact ${esc(cp.shortName)}</h3>
            <p class="card__body">
              <strong>Appointments &amp; Referrals:</strong> <a href="tel:${esc(cp.phone)}">${esc(cp.phone)}</a><br/>
              <strong>CNTR Main Office:</strong> ${esc(DATA.meta.phone)}<br/>
              <strong>Location:</strong> Massachusetts General Hospital, Boston, MA
            </p>
            <div class="card__footer">
              <a href="/inquiry-services-page" data-nav="/inquiry-services-page" class="btn btn--sm btn--primary">Submit Clinical / Research Inquiry</a>
            </div>
          </aside>
        </div>
      </section>
    `;
  }

  function renderClinicalTrials() {
    const statuses = ["All", "Recruiting", "Not Yet Recruiting", "Completed"];
    const filtered = (DATA.clinicalTrials || []).filter((t) => {
      const matchStatus = state.trialStatus === "All" || (t.status || "").toLowerCase() === state.trialStatus.toLowerCase();
      const q = state.trialQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        (t.title || "").toLowerCase().includes(q) ||
        (t.conditions || "").toLowerCase().includes(q) ||
        (t.pi || "").toLowerCase().includes(q) ||
        (t.summary || "").toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });

    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">Clinical Research &bull; Interventional &amp; Observational Studies</div>
          <h1 class="page-banner__title">Clinical Trials</h1>
          <p class="page-banner__sub">
            Investigator-initiated and multi-center clinical trials evaluating novel neurotechnologies, neuroimaging biomarkers, and neurorecovery therapies at MGH.
          </p>
        </div>
      </header>

      <section class="section">
        <div class="container">
          <search class="filter-bar" aria-label="Search clinical trials">
            <div class="filter-bar__row">
              <div class="search-input-wrap">
                <span class="search-input-icon" aria-hidden="true">&#128269;</span>
                <input
                  type="search"
                  id="trial-search-input"
                  class="search-input"
                  placeholder="Search trials by condition (e.g. TBI, coma, stroke, BCI), PI, or keyword..."
                  value="${esc(state.trialQuery)}"
                  aria-label="Search clinical trials"
                />
              </div>
              <span class="card__meta mono">Showing ${filtered.length} featured studies</span>
            </div>
            <div class="pill-group" role="group" aria-label="Study status filter">
              ${statuses
                .map(
                  (s) => `
                <button type="button" class="filter-pill" data-trial-status="${esc(s)}" aria-pressed="${state.trialStatus === s}">
                  ${esc(s)}
                </button>`
                )
                .join("")}
            </div>
          </search>

          <div style="display:flex;flex-direction:column;gap:var(--space-md);">
            ${filtered
              .map(
                (t) => `
              <article class="card">
                <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:0.5rem;align-items:center;">
                  <span class="card__badge ${t.status === "Recruiting" ? "" : "card__badge--crimson"}">${esc(t.status || "Active")}</span>
                  <span class="card__meta mono">Start: ${esc(t.startDate || "Ongoing")} &bull; Target Completion: ${esc(t.completionDate || "Ongoing")}</span>
                </div>
                <h2 class="card__title" style="margin-block-start:0.25rem;">${esc(t.title)}</h2>
                <div style="display:flex;flex-wrap:wrap;gap:1.25rem;font-size:0.9rem;color:var(--text-secondary);">
                  <span><strong>Condition:</strong> ${esc(t.conditions)}</span>
                  <span><strong>Principal Investigator:</strong> ${esc(t.pi)}${t.pi2 ? `, ${esc(t.pi2)}` : ""}</span>
                  <span><strong>Sponsor:</strong> ${esc(t.sponsor)}</span>
                </div>
                <p class="card__body">${esc(t.summary)}</p>
                <div class="card__footer">
                  ${
                    t.url
                      ? `<a href="${esc(t.url)}" target="_blank" rel="noopener" class="btn btn--sm btn--primary">View on ClinicalTrials.gov &nearr;</a>`
                      : ""
                  }
                  <a href="/inquiry-services-page" data-nav="/inquiry-services-page" class="btn btn--sm btn--outline">Inquire About Enrollment</a>
                </div>
              </article>`
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderPublications() {
    const filtered = (DATA.publications || []).filter((p) => {
      const q = state.pubQuery.trim().toLowerCase();
      return (
        !q ||
        (p.title || "").toLowerCase().includes(q) ||
        (p.authorJournal || "").toLowerCase().includes(q)
      );
    });

    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">Peer-Reviewed Literature &bull; MGH CNTR Bibliography</div>
          <h1 class="page-banner__title">Publications</h1>
          <p class="page-banner__sub">
            Selected recent peer-reviewed publications from CNTR faculty, laboratories, and consortia in <em>Nature</em>, <em>NEJM</em>, <em>JAMA Neurology</em>, <em>PNAS</em>, <em>Stroke</em>, and <em>Neurology</em>.
          </p>
        </div>
      </header>

      <section class="section">
        <div class="container">
          <search class="filter-bar" aria-label="Search publications">
            <div class="filter-bar__row">
              <div class="search-input-wrap">
                <span class="search-input-icon" aria-hidden="true">&#128269;</span>
                <input
                  type="search"
                  id="pub-search-input"
                  class="search-input"
                  placeholder="Filter publications by title, first author (e.g. Edlow, Hochberg, Sarkis), or journal..."
                  value="${esc(state.pubQuery)}"
                  aria-label="Filter publications"
                />
              </div>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/?term=Center+for+Neurotechnology+and+Neurorecovery+Massachusetts+General+Hospital"
                target="_blank"
                rel="noopener"
                class="btn btn--outline btn--sm"
              >
                Full PubMed Archive (1,500+ Papers) &nearr;
              </a>
            </div>
          </search>

          <div class="table-scroll" role="region" aria-label="Publications table" tabindex="0">
            <table class="pub-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Title</th>
                  <th scope="col">Authors &amp; Journal</th>
                  <th scope="col">Links</th>
                </tr>
              </thead>
              <tbody>
                ${filtered
                  .map(
                    (pub) => `
                  <tr>
                    <td class="mono" style="white-space:nowrap;color:var(--text-muted);">${esc(pub.date)}</td>
                    <td style="font-weight:600;color:var(--text-primary);">${esc(pub.title)}</td>
                    <td><span class="card__badge">${esc(pub.authorJournal)}</span></td>
                    <td style="white-space:nowrap;">
                      <div style="display:flex;gap:0.65rem;align-items:center;">
                        ${pub.pubMedUrl ? `<a href="${esc(pub.pubMedUrl)}" target="_blank" rel="noopener" class="btn btn--sm btn--outline">PubMed &nearr;</a>` : ""}
                        ${pub.pdfUrl ? `<a href="${esc(pub.pdfUrl)}" target="_blank" rel="noopener" class="btn btn--sm btn--primary">PDF / DOI &nearr;</a>` : ""}
                      </div>
                    </td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;
  }

  function renderPodcasts() {
    const filtered = (DATA.podcasts || []).filter((ep) => {
      const q = state.podcastQuery.trim().toLowerCase();
      return (
        !q ||
        (ep.title || "").toLowerCase().includes(q) ||
        (ep.guest || "").toLowerCase().includes(q) ||
        (ep.description || "").toLowerCase().includes(q)
      );
    });

    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">Audio &amp; Video Series &bull; 15 Episodes</div>
          <h1 class="page-banner__title">The CNTR Podcast</h1>
          <p class="page-banner__sub">
            In-depth conversations with leading neuroscientists, clinicians, and engineers on visual prosthetics, brain-computer interfaces, high-resolution connectomics, neurorecovery, and neuroethics.
          </p>
        </div>
      </header>

      <section class="section">
        <div class="container">
          <search class="filter-bar" aria-label="Search podcast episodes">
            <div class="filter-bar__row">
              <div class="search-input-wrap">
                <span class="search-input-icon" aria-hidden="true">&#128269;</span>
                <input
                  type="search"
                  id="podcast-search-input"
                  class="search-input"
                  placeholder="Search episodes by guest name, topic, or technology..."
                  value="${esc(state.podcastQuery)}"
                  aria-label="Search podcast episodes"
                />
              </div>
              <span class="card__meta mono">Showing ${filtered.length} of ${(DATA.podcasts || []).length} episodes</span>
            </div>
          </search>

          <div class="grid-auto">
            ${filtered
              .map(
                (ep) => `
              <div class="card-wrap">
                <article class="card">
                  <div>
                    ${
                      ep.image
                        ? `<img src="${esc(ep.image)}" alt="${esc(ep.title)}" class="card__media" width="480" height="270" loading="lazy" decoding="async" />`
                        : ""
                    }
                    <span class="card__badge mono">${esc(ep.episodeLabel)}</span>
                    <h2 class="card__title" style="margin-block-start:0.4rem;">${esc(ep.title)}</h2>
                    ${ep.guest ? `<p class="card__meta" style="margin-block:0.25rem 0.5rem;">Guest: <strong>${esc(ep.guest)}</strong></p>` : ""}
                    <p class="card__body">${esc(ep.description.slice(0, 220))}${ep.description.length > 220 ? "..." : ""}</p>
                  </div>
                  <div class="card__footer">
                    <button type="button" class="btn btn--sm btn--primary" data-open-podcast="${esc(ep.number)}">Episode Notes &amp; Player</button>
                    <div style="display:flex;gap:0.5rem;font-size:0.82rem;">
                      ${ep.spotify ? `<a href="${esc(ep.spotify)}" target="_blank" rel="noopener">Spotify</a>` : ""}
                      ${ep.applePodcast ? `<a href="${esc(ep.applePodcast)}" target="_blank" rel="noopener">Apple</a>` : ""}
                      ${ep.youtube ? `<a href="${esc(ep.youtube)}" target="_blank" rel="noopener">YouTube</a>` : ""}
                    </div>
                  </div>
                </article>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderNews() {
    const filtered = (DATA.news || []).filter((n) => {
      const q = state.newsQuery.trim().toLowerCase();
      return (
        !q ||
        (n.title || "").toLowerCase().includes(q) ||
        (n.subtitle || "").toLowerCase().includes(q) ||
        (n.body || "").toLowerCase().includes(q)
      );
    });

    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">Press, Awards &amp; Research Highlights</div>
          <h1 class="page-banner__title">News &amp; Media</h1>
          <p class="page-banner__sub">
            Explore all ${(DATA.news || []).length} news dispatches, media appearances (60 Minutes, Harvard Gazette, Financial Times, NPR), and clinical milestones from MGH CNTR.
          </p>
        </div>
      </header>

      <section class="section">
        <div class="container">
          <search class="filter-bar" aria-label="Search news articles">
            <div class="filter-bar__row">
              <div class="search-input-wrap">
                <span class="search-input-icon" aria-hidden="true">&#128269;</span>
                <input
                  type="search"
                  id="news-search-input"
                  class="search-input"
                  placeholder="Search news stories, investigators, or press outlets..."
                  value="${esc(state.newsQuery)}"
                  aria-label="Search news"
                />
              </div>
              <span class="card__meta mono">Showing ${filtered.length} of ${(DATA.news || []).length} articles</span>
            </div>
          </search>

          <div class="grid-auto">
            ${filtered
              .map(
                (n) => `
              <div class="card-wrap">
                <article class="card">
                  <div>
                    ${
                      n.image
                        ? `<img src="${esc(n.image)}" alt="${esc(n.title)}" class="card__media" width="480" height="270" loading="lazy" decoding="async" />`
                        : ""
                    }
                    <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
                      <span class="card__badge">${esc(n.category)}</span>
                      <time class="card__meta mono">${esc(n.date)}</time>
                    </div>
                    <h2 class="card__title" style="margin-block-start:0.45rem;">${esc(n.title)}</h2>
                    ${n.subtitle ? `<p class="card__meta" style="margin-block-start:0.25rem;">${esc(n.subtitle)}</p>` : ""}
                    <p class="card__body" style="margin-block-start:0.5rem;">${esc((n.body || "").slice(0, 190))}${(n.body || "").length > 190 ? "..." : ""}</p>
                  </div>
                  <div class="card__footer">
                    <button type="button" class="btn btn--sm btn--outline" data-open-news="${esc(n.id)}">Read Full Story</button>
                    ${
                      n.externalLinks && n.externalLinks[0]
                        ? `<a href="${esc(n.externalLinks[0])}" target="_blank" rel="noopener" style="font-size:0.84rem;">Source Link &nearr;</a>`
                        : ""
                    }
                  </div>
                </article>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderJobs() {
    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">Careers, Fellowships &amp; Training</div>
          <h1 class="page-banner__title">Join Us at MGH CNTR</h1>
          <p class="page-banner__sub">
            We are actively recruiting postdoctoral research fellows, clinical fellows, T32 trainees, and clinical research coordinators across our laboratories and clinical programs.
          </p>
        </div>
      </header>

      <section class="section">
        <div class="container" style="display:flex;flex-direction:column;gap:var(--space-md);">
          ${(DATA.jobs || [])
            .map(
              (job) => `
            <article class="card">
              <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:0.5rem;">
                <span class="card__badge">${esc(job.organization)}</span>
                <span class="card__meta mono">Boston, MA &bull; Full-Time</span>
              </div>
              <h2 class="card__title">${esc(job.title)}</h2>
              <p class="card__body">${esc((job.aboutRole || "").slice(0, 340))}...</p>
              <div class="card__footer">
                <button type="button" class="btn btn--sm btn--primary" data-open-job="${esc(job.id)}">View Full Role &amp; Requirements</button>
                <a href="${esc(job.applyUrl)}" target="_blank" rel="noopener" class="btn btn--sm btn--outline">Apply Direct &nearr;</a>
              </div>
            </article>`
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function renderSupportUs() {
    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">Philanthropy &amp; Impact</div>
          <h1 class="page-banner__title">Support the Center for Neurotechnology and Neurorecovery</h1>
          <p class="page-banner__sub">
            Philanthropic support enables high-risk, high-reward translational research, clinical fellowships, and rapid deployment of neurotechnologies for patients with severe neurological injury.
          </p>
        </div>
      </header>

      <section class="section">
        <div class="container split-layout">
          <div class="card" style="padding:var(--space-lg);">
            <span class="card__badge card__badge--crimson">MGH Giving Portal</span>
            <h2 class="section-title" style="margin-block:0.4rem;">Accelerate Neurorecovery Discovery</h2>
            <p class="card__body mb-md">
              Gifts to the MGH Center for Neurotechnology and Neurorecovery directly fund pilot clinical trials, next-generation neural interface engineering, neuroimaging of coma and consciousness, and interdisciplinary training fellowships.
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:0.75rem;margin-block-start:1rem;">
              <a href="${esc(DATA.meta.givingUrl)}" target="_blank" rel="noopener" class="btn btn--crimson">Donate via Mass General Giving &nearr;</a>
              <a href="/inquiry-services-page" data-nav="/inquiry-services-page" class="btn btn--outline">Contact Development &amp; Leadership</a>
            </div>
          </div>
          <div class="card" style="padding:var(--space-lg);">
            <span class="card__badge">Areas of Impact</span>
            <h3 class="card__title">Where Your Support Goes</h3>
            <ul style="padding-inline-start:1.25rem;display:flex;flex-direction:column;gap:0.5rem;">
              <li><strong>Emerging Consciousness &amp; Coma Recovery:</strong> Expanding diagnostic fMRI/EEG and targeted arousal therapies.</li>
              <li><strong>Brain-Computer Interfaces:</strong> Advancing speech and motor restoration through clinical neural interface trials.</li>
              <li><strong>Next-Generation Fellows:</strong> Supporting T32 postdoctoral scientists and clinical neurorecovery fellows.</li>
            </ul>
          </div>
        </div>
      </section>
    `;
  }

  function renderInquiry() {
    return `
      <header class="page-banner">
        <div class="container">
          <div class="page-banner__crumb">Contact &bull; Research &amp; Clinical Inquiries</div>
          <h1 class="page-banner__title">Inquiries, Collaborations &amp; Services</h1>
          <p class="page-banner__sub">
            Connect with MGH CNTR regarding clinical trial eligibility, research collaborations, fellowship opportunities, or clinical program referrals.
          </p>
        </div>
      </header>

      <section class="section">
        <div class="container split-layout">
          <div class="card" style="padding:var(--space-lg);">
            <h2 class="section-title mb-md">Submit an Inquiry</h2>
            <form id="cntr-inquiry-form" class="form-grid" novalidate>
              <div class="form-grid form-grid--2col">
                <div class="form-field">
                  <label for="inq-name">Full Name *</label>
                  <input type="text" id="inq-name" name="name" class="form-control" required autocomplete="name" aria-describedby="inq-name-err" />
                  <span id="inq-name-err" class="form-error">Please enter your full name.</span>
                </div>
                <div class="form-field">
                  <label for="inq-email">Email Address *</label>
                  <input type="email" id="inq-email" name="email" class="form-control" required autocomplete="email" aria-describedby="inq-email-err" />
                  <span id="inq-email-err" class="form-error">Please enter a valid email address.</span>
                </div>
              </div>
              <div class="form-grid form-grid--2col">
                <div class="form-field">
                  <label for="inq-topic">Inquiry Topic *</label>
                  <select id="inq-topic" name="topic" class="form-control" required>
                    <option value="">Select a category...</option>
                    <option value="clinical-trial">Clinical Trial Participation</option>
                    <option value="clinical-program">Clinical Program Referral (Epilepsy, Coma, BCI, NeuroRecovery)</option>
                    <option value="research-collab">Academic / Industry Research Collaboration</option>
                    <option value="fellowship">Postdoctoral Fellowship / Career Inquiry</option>
                    <option value="media">Press &amp; Media Inquiry</option>
                  </select>
                  <span class="form-error">Please select an inquiry topic.</span>
                </div>
                <div class="form-field">
                  <label for="inq-org">Affiliation / Institution (Optional)</label>
                  <input type="text" id="inq-org" name="organization" class="form-control" autocomplete="organization" />
                </div>
              </div>
              <div class="form-field">
                <label for="inq-message">Message *</label>
                <textarea id="inq-message" name="message" rows="5" class="form-control" required aria-describedby="inq-msg-hint inq-msg-err"></textarea>
                <span id="inq-msg-hint" class="form-hint">Please do not include confidential Protected Health Information (PHI) in this web form.</span>
                <span id="inq-msg-err" class="form-error">Please enter your inquiry message.</span>
              </div>
              <div>
                <button type="submit" class="btn btn--primary">Send Inquiry to MGH CNTR</button>
                <p id="inq-status" role="status" aria-live="polite" style="margin-block-start:0.75rem;font-weight:600;color:var(--status-success);"></p>
              </div>
            </form>
          </div>

          <aside class="card" style="padding:var(--space-lg);">
            <span class="card__badge">Direct Contact Directory</span>
            <h3 class="card__title">MGH CNTR Headquarters</h3>
            <p class="card__body">
              <strong>Address:</strong><br/>
              MGH Center for Neurotechnology and Neurorecovery<br/>
              ${esc(DATA.meta.address.suite)}, ${esc(DATA.meta.address.street)}<br/>
              ${esc(DATA.meta.address.city)}, ${esc(DATA.meta.address.state)} ${esc(DATA.meta.address.zip)}
            </p>
            <p class="card__body">
              <strong>Main Phone:</strong> <a href="tel:6177249247">${esc(DATA.meta.phone)}</a><br/>
              <strong>Adult Epilepsy Service:</strong> <a href="tel:6177263311">(617) 726-3311</a><br/>
              <strong>NeuroRecovery Clinic:</strong> <a href="tel:6177262000">(617) 726-2000</a>
            </p>
          </aside>
        </div>
      </section>
    `;
  }

  // Modal Dialog Openers
  function openModalWithContent(title, badge, bodyHtml) {
    const dialog = document.getElementById("detail-dialog");
    const titleEl = document.getElementById("detail-dialog-title");
    const badgeEl = document.getElementById("detail-dialog-badge");
    const bodyEl = document.getElementById("detail-dialog-body");
    if (!dialog || !titleEl || !bodyEl) return;

    titleEl.textContent = title;
    badgeEl.textContent = badge || "MGH CNTR";
    bodyEl.innerHTML = bodyHtml;
    if (!dialog.open) {
      dialog.showModal();
    }
  }

  function openPersonModal(personId) {
    const p = (DATA.team || []).find((x) => x.id === personId);
    if (!p) return;
    const html = `
      <div style="display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;">
        ${
          p.photo
            ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" style="inline-size:6.5rem;block-size:6.5rem;border-radius:var(--radius-md);object-fit:cover;" />`
            : `<div class="person-card__initials" style="inline-size:5.5rem;block-size:5.5rem;border-radius:var(--radius-md);font-size:1.75rem;">${esc(initials(p.name))}</div>`
        }
        <div>
          <h3 style="font-size:1.35rem;">${esc(p.name)}</h3>
          ${p.jobTitle ? `<p style="color:var(--accent-primary);font-weight:600;">${esc(p.jobTitle)}</p>` : ""}
          ${p.shortDescription ? `<p class="card__meta">${esc(p.shortDescription)}</p>` : ""}
          ${p.website ? `<p style="margin-block-start:0.35rem;"><a href="${esc(p.website)}" target="_blank" rel="noopener">External Profile / Lab Website &nearr;</a></p>` : ""}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0.75rem;border-block-start:1px solid var(--border-subtle);padding-block-start:1rem;">
        ${
          p.bio
            ? p.bio
                .split(/\n\n+/)
                .map((para) => `<p>${esc(para)}</p>`)
                .join("")
            : `<p>${esc(p.shortDescription || "Affiliated investigator and team member at the MGH Center for Neurotechnology and Neurorecovery.")}</p>`
        }
      </div>
    `;
    openModalWithContent(p.name, p.roleGroup, html);
  }

  function openPodcastModal(epNum) {
    const ep = (DATA.podcasts || []).find((x) => String(x.number) === String(epNum));
    if (!ep) return;
    const html = `
      <div>
        ${ep.guest ? `<p style="font-size:1.05rem;margin-block-end:0.75rem;"><strong>Featured Guest:</strong> ${esc(ep.guest)}</p>` : ""}
        <div style="display:flex;flex-wrap:wrap;gap:0.65rem;margin-block-end:1.25rem;">
          ${ep.spotify ? `<a href="${esc(ep.spotify)}" target="_blank" rel="noopener" class="btn btn--sm btn--primary">Listen on Spotify &nearr;</a>` : ""}
          ${ep.applePodcast ? `<a href="${esc(ep.applePodcast)}" target="_blank" rel="noopener" class="btn btn--sm btn--outline">Apple Podcasts &nearr;</a>` : ""}
          ${ep.youtube ? `<a href="${esc(ep.youtube)}" target="_blank" rel="noopener" class="btn btn--sm btn--outline">Watch on YouTube &nearr;</a>` : ""}
          ${ep.vimeo ? `<a href="${esc(ep.vimeo)}" target="_blank" rel="noopener" class="btn btn--sm btn--outline">Vimeo &nearr;</a>` : ""}
        </div>
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          ${(ep.description || "")
            .split(/\n\n+/)
            .map((para) => `<p>${esc(para)}</p>`)
            .join("")}
        </div>
      </div>
    `;
    openModalWithContent(ep.title, ep.episodeLabel, html);
  }

  function openNewsModal(newsId) {
    const n = (DATA.news || []).find((x) => x.id === newsId);
    if (!n) return;
    const html = `
      <div>
        <p class="card__meta mono" style="margin-block-end:0.5rem;">Published: ${esc(n.date)} ${n.author ? `&bull; ${esc(n.author)}` : ""}</p>
        ${n.subtitle ? `<p style="font-size:1.1rem;font-weight:600;margin-block-end:1rem;">${esc(n.subtitle)}</p>` : ""}
        ${n.image ? `<img src="${esc(n.image)}" alt="${esc(n.title)}" class="card__media" style="margin-block-end:1rem;" />` : ""}
        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          ${(n.body || "")
            .split(/\n\n+/)
            .map((para) => `<p>${esc(para)}</p>`)
            .join("")}
        </div>
        ${
          n.externalLinks && n.externalLinks.length
            ? `<div style="margin-block-start:1.25rem;padding-block-start:1rem;border-block-start:1px solid var(--border-subtle);display:flex;flex-wrap:wrap;gap:0.75rem;">
                ${n.externalLinks.map((u) => `<a href="${esc(u)}" target="_blank" rel="noopener" class="btn btn--sm btn--primary">Read External Source / Paper &nearr;</a>`).join("")}
               </div>`
            : ""
        }
      </div>
    `;
    openModalWithContent(n.title, n.category, html);
  }

  function openJobModal(jobId) {
    const j = (DATA.jobs || []).find((x) => x.id === jobId);
    if (!j) return;
    const html = `
      <div>
        <p class="card__meta" style="margin-block-end:1rem;"><strong>Institution:</strong> ${esc(j.organization)}</p>
        <h3 style="font-size:1.05rem;margin-block-end:0.5rem;">About the Role</h3>
        <div style="display:flex;flex-direction:column;gap:0.65rem;margin-block-end:1.25rem;">
          ${(j.aboutRole || "")
            .split(/\n\n+/)
            .map((para) => `<p>${esc(para)}</p>`)
            .join("")}
        </div>
        ${
          j.requirements && j.requirements.length
            ? `<h3 style="font-size:1.05rem;margin-block-end:0.5rem;">Principal Duties &amp; Qualifications</h3>
               <ul style="padding-inline-start:1.25rem;display:flex;flex-direction:column;gap:0.4rem;margin-block-end:1.25rem;">
                 ${j.requirements.map((r) => `<li>${esc(r)}</li>`).join("")}
               </ul>`
            : ""
        }
        <a href="${esc(j.applyUrl)}" target="_blank" rel="noopener" class="btn btn--primary">Apply for This Position &nearr;</a>
      </div>
    `;
    openModalWithContent(j.title, "Open Position", html);
  }

  // Main Render Dispatcher
  function renderApp() {
    const main = document.getElementById("main-content");
    if (!main) return;

    let html = "";
    switch (state.route) {
      case "/":
        html = renderHome();
        break;
      case "/about":
        html = renderAbout();
        break;
      case "/challenges":
        html = renderChallenges();
        break;
      case "/research":
        html = renderResearch();
        break;
      case "/ourteam":
      case "/our-team-collaborators":
        html = renderTeam();
        break;
      case "/clinical-programs":
        html = renderClinicalProgramsOverview();
        break;
      case "/adult-epilepsy-service":
      case "/emerging-consciousness-program":
      case "/neurorecovery-clinic":
      case "/brain-computer-interface-clinic":
        html = renderSingleClinicalProgram(state.route);
        break;
      case "/clinical-trials":
        html = renderClinicalTrials();
        break;
      case "/publications":
        html = renderPublications();
        break;
      case "/podcast":
        html = renderPodcasts();
        break;
      case "/news":
        html = renderNews();
        break;
      case "/jobs":
        html = renderJobs();
        break;
      case "/support-us":
        html = renderSupportUs();
        break;
      case "/inquiry-services-page":
        html = renderInquiry();
        break;
      default:
        html = renderHome();
    }

    main.innerHTML = html;
    updateActiveNav();
    bindViewEvents();
  }

  function bindViewEvents() {
    const labInput = document.getElementById("lab-search-input");
    if (labInput) {
      labInput.addEventListener("input", (e) => {
        state.labQuery = e.target.value;
        const pos = e.target.selectionStart;
        renderApp();
        const next = document.getElementById("lab-search-input");
        if (next) {
          next.focus();
          next.setSelectionRange(pos, pos);
        }
      });
    }

    const teamInput = document.getElementById("team-search-input");
    if (teamInput) {
      teamInput.addEventListener("input", (e) => {
        state.teamQuery = e.target.value;
        const pos = e.target.selectionStart;
        renderApp();
        const next = document.getElementById("team-search-input");
        if (next) {
          next.focus();
          next.setSelectionRange(pos, pos);
        }
      });
    }

    const pubInput = document.getElementById("pub-search-input");
    if (pubInput) {
      pubInput.addEventListener("input", (e) => {
        state.pubQuery = e.target.value;
        const pos = e.target.selectionStart;
        renderApp();
        const next = document.getElementById("pub-search-input");
        if (next) {
          next.focus();
          next.setSelectionRange(pos, pos);
        }
      });
    }

    const trialInput = document.getElementById("trial-search-input");
    if (trialInput) {
      trialInput.addEventListener("input", (e) => {
        state.trialQuery = e.target.value;
        const pos = e.target.selectionStart;
        renderApp();
        const next = document.getElementById("trial-search-input");
        if (next) {
          next.focus();
          next.setSelectionRange(pos, pos);
        }
      });
    }

    const podcastInput = document.getElementById("podcast-search-input");
    if (podcastInput) {
      podcastInput.addEventListener("input", (e) => {
        state.podcastQuery = e.target.value;
        const pos = e.target.selectionStart;
        renderApp();
        const next = document.getElementById("podcast-search-input");
        if (next) {
          next.focus();
          next.setSelectionRange(pos, pos);
        }
      });
    }

    const newsInput = document.getElementById("news-search-input");
    if (newsInput) {
      newsInput.addEventListener("input", (e) => {
        state.newsQuery = e.target.value;
        const pos = e.target.selectionStart;
        renderApp();
        const next = document.getElementById("news-search-input");
        if (next) {
          next.focus();
          next.setSelectionRange(pos, pos);
        }
      });
    }

    const form = document.getElementById("cntr-inquiry-form");
    if (form) {
      const syncAria = (el) => {
        try {
          if (CSS.supports("selector(:user-invalid)")) {
            el.setAttribute("aria-invalid", el.matches(":user-invalid") ? "true" : "false");
          } else {
            el.setAttribute("aria-invalid", !el.checkValidity() ? "true" : "false");
          }
        } catch (err) {}
      };
      form.querySelectorAll(".form-control").forEach((ctrl) => {
        ctrl.addEventListener("blur", () => {
          ctrl.classList.add("is-touched");
          syncAria(ctrl);
        });
        ctrl.addEventListener("input", () => {
          if (ctrl.hasAttribute("aria-invalid")) syncAria(ctrl);
        });
      });
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        form.querySelectorAll(".form-control").forEach((ctrl) => {
          ctrl.classList.add("is-touched");
          syncAria(ctrl);
        });
        if (!form.checkValidity()) {
          const firstInvalid = form.querySelector(":invalid");
          if (firstInvalid) firstInvalid.focus();
          return;
        }
        const statusEl = document.getElementById("inq-status");
        if (statusEl) {
          statusEl.textContent = "Thank you! Your inquiry has been recorded for the MGH CNTR team.";
        }
        form.reset();
        form.querySelectorAll(".form-control").forEach((ctrl) => {
          ctrl.classList.remove("is-touched");
          ctrl.removeAttribute("aria-invalid");
        });
      });
    }
  }

  // Global Command Search across all collections
  function runGlobalSearch(query) {
    const resultsEl = document.getElementById("global-search-results");
    if (!resultsEl) return;
    const q = (query || "").trim().toLowerCase();
    if (!q) {
      resultsEl.innerHTML = `<p class="card__meta">Type above to search across all 16 Labs, 90 Team Members, 20 Publications, 6 Clinical Trials, 4 Clinical Programs, 15 Podcast Episodes, 29 News Articles, and 7 Open Jobs.</p>`;
      return;
    }

    const hits = [];
    (DATA.clinicalPrograms || []).forEach((cp) => {
      if ((cp.name + " " + cp.overview).toLowerCase().includes(q)) {
        hits.push({ type: "Clinical Program", title: cp.name, sub: cp.tagline, nav: cp.slug });
      }
    });
    (DATA.labs || []).forEach((l) => {
      if ((l.name + " " + l.pi + " " + l.bio).toLowerCase().includes(q)) {
        hits.push({ type: "Research Lab", title: l.name, sub: l.pi, nav: "/research" });
      }
    });
    (DATA.team || []).forEach((p) => {
      if ((p.name + " " + p.jobTitle + " " + p.shortDescription).toLowerCase().includes(q)) {
        hits.push({ type: `Team (${p.roleGroup})`, title: p.name, sub: p.jobTitle || p.shortDescription, personId: p.id });
      }
    });
    (DATA.publications || []).forEach((pub) => {
      if ((pub.title + " " + pub.authorJournal).toLowerCase().includes(q)) {
        hits.push({ type: "Publication", title: pub.title, sub: `${pub.authorJournal} (${pub.date})`, nav: "/publications" });
      }
    });
    (DATA.podcasts || []).forEach((ep) => {
      if ((ep.title + " " + ep.guest + " " + ep.description).toLowerCase().includes(q)) {
        hits.push({ type: "Podcast", title: `${ep.episodeLabel}: ${ep.title}`, sub: ep.guest, podcastNum: ep.number });
      }
    });
    (DATA.news || []).forEach((n) => {
      if ((n.title + " " + n.body).toLowerCase().includes(q)) {
        hits.push({ type: "News", title: n.title, sub: n.date, newsId: n.id });
      }
    });
    (DATA.jobs || []).forEach((j) => {
      if ((j.title + " " + j.aboutRole).toLowerCase().includes(q)) {
        hits.push({ type: "Open Position", title: j.title, sub: j.organization, jobId: j.id });
      }
    });

    if (!hits.length) {
      resultsEl.innerHTML = `<p class="card__meta">No matches found for "${esc(query)}".</p>`;
      return;
    }

    resultsEl.innerHTML = hits
      .slice(0, 18)
      .map(
        (h) => `
      <div class="card" style="padding:0.75rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">
          <span class="card__badge">${esc(h.type)}</span>
          ${
            h.nav
              ? `<a href="${esc(h.nav)}" data-nav="${esc(h.nav)}" class="btn btn--sm btn--outline">Open &rarr;</a>`
              : h.personId
              ? `<button type="button" class="btn btn--sm btn--outline" data-open-person="${esc(h.personId)}">Open Bio &rarr;</button>`
              : h.podcastNum
              ? `<button type="button" class="btn btn--sm btn--outline" data-open-podcast="${esc(h.podcastNum)}">Listen &rarr;</button>`
              : h.newsId
              ? `<button type="button" class="btn btn--sm btn--outline" data-open-news="${esc(h.newsId)}">Read &rarr;</button>`
              : `<button type="button" class="btn btn--sm btn--outline" data-open-job="${esc(h.jobId)}">View Role &rarr;</button>`
          }
        </div>
        <div style="font-weight:600;margin-block-start:0.25rem;">${esc(h.title)}</div>
        ${h.sub ? `<div class="card__meta">${esc(h.sub)}</div>` : ""}
      </div>`
      )
      .join("");
  }

  // Initialization
  document.addEventListener("DOMContentLoaded", () => {
    // Sticky header scroll sentinel (IntersectionObserver instead of scroll listener)
    const sentinel = document.getElementById("scroll-sentinel");
    const header = document.querySelector(".site-header");
    if (sentinel && header && "IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        ([entry]) => {
          header.setAttribute("data-scrolled", String(!entry.isIntersecting));
        },
        { threshold: 0 }
      );
      obs.observe(sentinel);
    }

    // Theme toggle button
    const themeBtn = document.getElementById("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const root = document.documentElement;
        const current = root.getAttribute("data-theme");
        const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const isDark = current === "dark" || (!current && sysDark);
        const next = isDark ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try {
          localStorage.setItem("cntr-theme", next);
        } catch (e) {}
      });
    }

    // Dialog light-dismiss fallback for browsers without closedby="any"
    if (!("closedBy" in HTMLDialogElement.prototype)) {
      document.querySelectorAll("dialog.site-dialog").forEach((dlg) => {
        dlg.addEventListener("click", (event) => {
          if (event.target !== dlg) return;
          const rect = dlg.getBoundingClientRect();
          const isDialogContent =
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width;
          if (isDialogContent) return;
          dlg.close();
        });
      });
    }

    // Global Search modal
    const searchDialog = document.getElementById("search-dialog");
    const searchOpenBtn = document.getElementById("open-search-btn");
    const globalSearchInput = document.getElementById("global-search-input");

    if (searchOpenBtn && searchDialog) {
      searchOpenBtn.addEventListener("click", () => {
        searchDialog.showModal();
        if (globalSearchInput) {
          globalSearchInput.focus();
          runGlobalSearch(globalSearchInput.value);
        }
      });
    }

    if (globalSearchInput) {
      globalSearchInput.addEventListener("input", (e) => {
        runGlobalSearch(e.target.value);
      });
    }

    // Cmd/Ctrl+K shortcut
    window.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (searchDialog) {
          searchDialog.showModal();
          if (globalSearchInput) globalSearchInput.focus();
        }
      }
    });

    // Mobile drawer
    const mobileDrawer = document.getElementById("mobile-nav-dialog");
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    if (mobileMenuBtn && mobileDrawer) {
      mobileMenuBtn.addEventListener("click", () => mobileDrawer.showModal());
    }

    // Global delegated click handling
    document.body.addEventListener("click", (e) => {
      const navEl = e.target.closest("[data-nav]");
      if (navEl) {
        e.preventDefault();
        const targetRoute = navEl.getAttribute("data-nav");
        if (searchDialog && searchDialog.open) searchDialog.close();
        if (mobileDrawer && mobileDrawer.open) mobileDrawer.close();
        navigate(targetRoute);
        return;
      }

      const labDomainBtn = e.target.closest("[data-lab-domain]");
      if (labDomainBtn) {
        state.labFilter = labDomainBtn.getAttribute("data-lab-domain");
        renderApp();
        return;
      }

      const teamRoleBtn = e.target.closest("[data-team-role]");
      if (teamRoleBtn) {
        state.teamRole = teamRoleBtn.getAttribute("data-team-role");
        renderApp();
        return;
      }

      const trialStatusBtn = e.target.closest("[data-trial-status]");
      if (trialStatusBtn) {
        state.trialStatus = trialStatusBtn.getAttribute("data-trial-status");
        renderApp();
        return;
      }

      const personBtn = e.target.closest("[data-open-person]");
      if (personBtn) {
        if (searchDialog && searchDialog.open) searchDialog.close();
        openPersonModal(personBtn.getAttribute("data-open-person"));
        return;
      }

      const podcastBtn = e.target.closest("[data-open-podcast]");
      if (podcastBtn) {
        if (searchDialog && searchDialog.open) searchDialog.close();
        openPodcastModal(podcastBtn.getAttribute("data-open-podcast"));
        return;
      }

      const newsBtn = e.target.closest("[data-open-news]");
      if (newsBtn) {
        if (searchDialog && searchDialog.open) searchDialog.close();
        openNewsModal(newsBtn.getAttribute("data-open-news"));
        return;
      }

      const jobBtn = e.target.closest("[data-open-job]");
      if (jobBtn) {
        if (searchDialog && searchDialog.open) searchDialog.close();
        openJobModal(jobBtn.getAttribute("data-open-job"));
        return;
      }

      const closeBtn = e.target.closest("[data-close-dialog]");
      if (closeBtn) {
        const dlg = closeBtn.closest("dialog");
        if (dlg) dlg.close();
      }
    });

    // Handle browser back/forward
    window.addEventListener("popstate", () => {
      const initial = window.location.hash ? window.location.hash.slice(1) : window.location.pathname;
      navigate(initial || "/", false);
    });

    window.addEventListener("hashchange", () => {
      if (window.location.hash) {
        navigate(window.location.hash.slice(1), false);
      }
    });

    // Initial route resolution
    const startRoute = window.location.hash
      ? window.location.hash.slice(1)
      : window.location.pathname && window.location.pathname !== "/index.html"
      ? window.location.pathname
      : "/";
    navigate(startRoute, false);
  });
})();
