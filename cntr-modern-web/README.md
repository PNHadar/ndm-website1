# MGH Center for Neurotechnology and Neurorecovery (CNTR) — Modernized Web Application

A complete, self-contained modernization of [https://www.cntr.mgh.harvard.edu/](https://www.cntr.mgh.harvard.edu/), designed in the contemporary style of flagship academic neuroscience and neurotechnology research institutes.

## Quick Start (Run Locally & Share)

### Option 1: Local Server with Clean Routes & LAN Sharing (Recommended)
Run the included zero-dependency Python server from this directory:

```bash
python3 server.py --port 8080
```

- **Open locally:** [http://localhost:8080/](http://localhost:8080/)
- **Share on your Wi-Fi / LAN:** The terminal prints your LAN URL (`http://<your-ip>:8080/`) so colleagues on the same network can browse it immediately.
- **JSON API:** [http://localhost:8080/api/data](http://localhost:8080/api/data)

### Option 2: Direct `index.html` (Zero Server)
You can also double-click `index.html` to open it directly in any browser (`file://`), or zip the `cntr-modern-web/` folder and send it to anyone.

---

## Complete Coverage of All Sub-Directories & Sections

All 18 static pages and 141 dynamic sub-pages from `cntr.mgh.harvard.edu` are preserved and modernized:

1. **Home (`/`)**: Hero overview, institutional metrics, 5 Core Challenges, Clinical Programs, featured Research Labs, recent Publications, and latest Podcast & News.
2. **About (`/about`)**: Mission, translational bench-to-bedside model, headquarters info, and Executive Leadership.
3. **Five Core Challenges (`/challenges`)**: Communication, Mobility, Seizures, Consciousness, and Cognition & Brain Health.
4. **Research Laboratories (`/research`)**: All **16 Laboratories, Consortia, and Centers** (`Brain Recovery Lab`, `BrainGate`, `Cash Lab`, `Center for Value-Based Health Care and Sciences`, `Chu Lab`, `Deep Brain Stimulation Program`, `Division of Neurotherapeutics`, `Laboratory for Translational Neurorecovery (LTNr)`, `Lam Lab`, `McCance Center for Brain Health`, `Network Stimulation Laboratory`, `Neural Prosthetic Research Lab`, `Neuroimaging of Coma and Consciousness Lab (NICC)`, `Paralysis Center`, `Precision Medicine Lab`, `Ziv Lab`) with domain filters and instant search.
5. **Our Team & Collaborators (`/ourteam` & `/our-team-collaborators` + `/our-team-1/<slug>`)**: All **90 Team Members & Collaborators** across 6 categories (`Leadership`, `Faculty`, `Research Scientists`, `Research Team Management`, `Collaborators`, `Alumni`) with instant search, role tabs, and full biography modals.
6. **Clinical Programs (`/clinical-programs` + 4 Dedicated Clinic Subpages)**:
   - `/adult-epilepsy-service` — **MGH Adult Epilepsy Service**
   - `/emerging-consciousness-program` — **MGH Takesian Family Emerging Consciousness Program**
   - `/neurorecovery-clinic` — **MGH NeuroRecovery Clinic**
   - `/brain-computer-interface-clinic` — **MGH Brain-Computer Interface (BCI) Clinic**
7. **Clinical Trials (`/clinical-trials`)**: Featured interventional and observational clinical trials with recruitment status filters, Principal Investigators, sponsors, and direct ClinicalTrials.gov links.
8. **Publications (`/publications`)**: Searchable bibliography of recent peer-reviewed publications with PubMed & PDF links, plus direct access to the 1,500+ paper PubMed archive.
9. **The CNTR Podcast (`/podcast` + `/podcast-episodes/episode-<1..15>`)**: All **15 episodes** with guest profiles, show notes, and Spotify, Apple Podcasts, YouTube, and Vimeo links.
10. **News & Media (`/news` + `/news/<slug>`)**: All **29 news articles** and media features (*60 Minutes*, *Harvard Gazette*, *Financial Times*, *NEJM*, *Nature*).
11. **Join Us / Careers (`/jobs` + `/jobs/<slug>`)**: All **7 open positions** (T32 Postdoctoral Training Program, Postdoctoral Research Fellows, Clinical Fellowship in NeuroRecovery, Clinical Research Coordinators) with full descriptions, requirements, and application links.
12. **Inquiries & Services (`/inquiry-services-page`)** & **Support Us (`/support-us`)**: Accessible inquiry form and MGH Giving philanthropy integration.
