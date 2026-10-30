# NeuroSathi — Brain Health Monitoring & Care-Linkage Platform

> **A low-cost brain-health monitoring and care-linkage platform for low-income patients in India with neurological conditions (multiple sclerosis, epilepsy, stroke follow-up).**

Built for the **Seva First Innovation Challenge (SFIC)** by **Delhi Technological University (DTU)**, a national innovation competition addressing healthcare equity and accessibility for *Viksit Bharat*.

---

## 🌟 Key Highlights

- **100% Client-Side & Zero Server Cost**: Fully functional in the browser with `localStorage` persistence. No backend server or paid APIs required.
- **Offline Capable PWA**: Bundled with a Service Worker and Web App Manifest (`manifest.json`) so the entire application shell runs offline after first load.
- **Multilingual (4 Regional Languages)**: English, Hindi (हिन्दी), Telugu (తెలుగు), and Urdu (اردو), with instant toggling and centralized i18n structure.
- **Clinically Inspired Longitudinal Tracking**: 8-week surveillance of motor function (finger tapping), cognitive processing speed (symbol matching), speech duration, and functional symptom composite ratings.
- **Automated Sustained Decline Detection**: Flags patients when a 3-week rolling average drops >20% below baseline across ≥2 clinical measures.
- **Care Linkage**: Connects patients with official government healthcare portals including Ayushman Bharat PM-JAY, e-Sanjeevani Tele-OPD, Jan Aushadhi generic stores, Tele-MANAS, and Telangana Aarogyasri.
- **Community Health Worker (ASHA) Surveillance**: Dedicated dashboard for grassroots surveillance, simulated WhatsApp alerts, and follow-up appointment tracking.
- **5-Minute SFIC Automated Video Demo Mode**: One-click "▶ Run Demo" button runs an automated, narrated tour across the entire end-to-end clinical workflow.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Setup & Startup
```bash
# 1. Navigate to project directory
cd neurosathi

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser. Sample longitudinal data for 8 patients is pre-loaded into localStorage immediately.

---

## 🚢 How to Deploy

Build optimized production assets:
```bash
npm run build
```

This creates the standalone distribution in `dist/`.

### Deploy to GitHub Pages:
The app uses React Router's `HashRouter` (`/#/...`) and Vite's relative base path (`base: './'`), making it directly compatible with GitHub Pages:
1. Push your repository to GitHub.
2. In GitHub repository settings, go to **Pages**.
3. Under **Build and deployment**, select **GitHub Actions** or choose the branch (`gh-pages` / `main` with `/dist` folder).

### Deploy to Netlify / Vercel:
Drag and drop the `dist/` directory onto [Netlify Drop](https://app.netlify.com/drop) or link the repository with build command `npm run build` and publish directory `dist`.

---

## 📱 List of All 11 Screens

1. **Home / Patient Check-in (`src/pages/Home.jsx`)**: Welcome portal with multilingual selection, active patient switcher, core epidemiological problem statistics (ICMR/NHP data), and direct CTA to start assessments.
2. **Motor Assessment (`src/pages/MotorAssessment.jsx`)**: 10-second bilateral finger tapping test measuring left and right hand speed and lateralized motor asymmetry.
3. **Processing Speed (`src/pages/ProcessingSpeed.jsx`)**: 30-second symbol-digit modalities test (SDMT) measuring correct matches, errors, and average reaction time in milliseconds.
4. **Speech Assessment (`src/pages/SpeechAssessment.jsx`)**: Natural reading fluency exercise capturing speech duration in seconds via the browser's `MediaRecorder` API with an offline fallback.
5. **Quick Symptom Check (`src/pages/SymptomQuestions.jsx`)**: 4-question tap-only survey (energy, walking balance, vision, and mood) using an accessible 1–5 visual emoji scale.
6. **Results & Trends (`src/pages/Results.jsx`)**: Longitudinal 8-week Recharts visualization featuring baseline dashed reference lines and real-time clinical threshold adjustment.
7. **Doctor Summary (`src/pages/DoctorSummary.jsx`)**: One-page auto-generated clinician report with baseline-to-recent comparison tables, observation narrative, clipboard copy, and print-optimized PDF formatting.
8. **Connect to Affordable Care (`src/pages/FindCare.jsx`)**: Directory linking patients to e-Sanjeevani, PM-JAY, Jan Aushadhi, Tele-MANAS, state-specific programs (e.g., Aarogyasri in Telangana), pre-visit checklist, and sample hospital OPDs.
9. **Follow-Up & Reminders (`src/pages/FollowUp.jsx`)**: Doctor visit confirmation triage, appointment reminder schedule stored in `localStorage`, and automated ASHA notification logging.
10. **ASHA / Community Health Worker Dashboard (`src/pages/HealthWorkerDashboard.jsx`)**: Surveillance portal displaying total monitored patients, flagged decline alerts, unconfirmed visits, WhatsApp alert simulation, and searchable patient tables.
11. **About & Safety (`src/pages/About.jsx`)**: Complete scientific and ethical disclosure covering clinical origins, DPDPA 2023 data sovereignty, known prototype limitations, impact comparison, 4-phase roadmap, and Viksit Bharat vision.

---

## ⚙️ How to Change the Clinical Threshold

The decline detection algorithm flags patients when their 3-week rolling average drops below `(baseline × (1 - threshold))` on 2 or more measures.

### 1. In the Running UI (Dynamic)
On the **Results & Trends** screen (`/results`), use the **"⚕ Clinical Threshold"** slider to adjust the sensitivity dynamically between **10% and 40%** (default: **20%**).

### 2. In Code (Default Baseline Value)
- **File**: [`src/App.jsx`](file:///src/App.jsx)
  - **Variable**: `threshold` (default state parameter passed to `useLocalStorage('neurosathi_clinical_threshold', 0.20)`)
- **File**: [`src/utils/scoring.js`](file:///src/utils/scoring.js)
  - **Function & Default Argument**: `evaluatePatientDecline(assessments, threshold = 0.20)`

```javascript
// CLINICAL THRESHOLD: Decline flagged when 3-week rolling average drops >threshold below baseline on ≥2 measures. Configurable by clinical advisor. Not clinically validated.
export function evaluatePatientDecline(assessments, threshold = 0.20) {
  // modify threshold value here (e.g., 0.15 for 15% or 0.25 for 25%)
}
```

---

## 🌐 How to Add a New Language

All interface strings are centralized in a single internationalization JSON file:
- **File path**: [`src/i18n/translations.json`](file:///src/i18n/translations.json)

To add a new language (for example, Tamil `ta` or Marathi `mr`):

1. Open [`src/i18n/translations.json`](file:///src/i18n/translations.json).
2. Copy the `"en"` block and add a new top-level key:
   ```json
   {
     "en": { ... },
     "hi": { ... },
     "te": { ... },
     "ur": { ... },
     "ta": {
       "app": { "title": "நியூரோசாதி", ... },
       "nav": { ... },
       ...
     }
   }
   ```
3. Add the language entry to the selector list in [`src/components/LanguageSelector.jsx`](file:///src/components/LanguageSelector.jsx):
   ```javascript
   const LANGUAGES = [
     { code: 'en', label: 'English', flag: '🇬🇧' },
     { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
     { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
     { code: 'ur', label: 'اردو', flag: '🇮🇳' },
     { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' }
   ];
   ```

No changes to business logic or routing are required.

---

## ⚠️ Known Limitations (Ethical & Scientific Transparency)

1. **Clinical Validation**: Assessments are clinically inspired by standard tools (finger tapping tests, SDMT) but have not yet been evaluated in formal clinical trials.
2. **Speech Acoustics**: Speech assessment currently records and logs duration only; automated phonetic or acoustic NLP analysis is planned for Phase 3.
3. **Government Scheme Integration**: Direct links to official portals (e-Sanjeevani, PM-JAY, Aarogyasri) are active; live API single sign-on is slated for future PHC pilots.
4. **Hospital Directory**: The directory displays representative sample hospital OPDs; live National Health Mission (NHM) directory sync is planned.
5. **Threshold Configuration**: The default 20% decline threshold represents an advisory starting point configured with clinical input, rather than a definitive medical cutoff.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

Built for **Viksit Bharat** — affordable neurological care monitoring for every Indian 🇮🇳
