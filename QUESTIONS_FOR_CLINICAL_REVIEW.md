# Clinical Review Document: Questions, Tests, Rules & Medical Claims

This document provides a comprehensive inventory of every clinical question, test, scoring algorithm, threshold rule, emergency trigger, and medical claim currently implemented in the **NeuroSathi** application codebase.

---

## 1. Condition-Specific Checks

### 1.1 Condition: Stroke Follow-up

| # | Question or test (exact wording shown to the user) | Answer type (yes/no, 1-5, number, timed test) | How it is scored or used | Triggers "Needs doctor visit" or "urgent"? (yes/no and the exact rule) |
|---|---|---|---|---|
| 1 | **1. Motor Tapping Test (10s per hand)**<br>*"Tap rapidly with index finger for 10 seconds per hand."*<br>Spoken instruction: *"Finger tapping test. Tap as fast as possible for 10 seconds with each hand."*<br>Button: *"Start Left Hand (10s)"* / *"TAP! Left Hand"* | Timed test (10 seconds) | Records the total tap count for the Left Hand over 10 seconds. Stored in `assessments.motor.leftTaps`. Used to calculate 3-week rolling average vs. baseline (weeks 1–3). | **Yes ("Needs doctor visit")**: Triggers if 3-week rolling average tapping speed drops $\ge$ clinical threshold (default 20%) below baseline. |
| 2 | **Motor Tapping Test — Right Hand (10s)**<br>Button: *"Start Right Hand (10s)"* / *"TAP! Right Hand"* | Timed test (10 seconds) | Records total tap count for the Right Hand. Combined with Left Hand to compute average bilateral tapping speed and bilateral difference (`Math.abs(left - right)`). | **Yes ("Needs doctor visit")**: Triggers if combined bilateral tapping speed drops $\ge$ clinical threshold (default 20%) below baseline. |
| 3 | **Caregiver Daily Activity: Eating**<br>*"1. Eating without help?"* | Yes / No | Assesses functional independence in feeding (ADL). Stored in `strokeQuestions.eating`. | **Yes ("Needs doctor visit")**: Triggers if answered **"No"** (new dependency in feeding). |
| 4 | **Caregiver Daily Activity: Dressing**<br>*"2. Dressing without help?"* | Yes / No | Assesses functional independence in self-care/dressing. Stored in `strokeQuestions.dressing`. | **Yes ("Needs doctor visit")**: Triggers if answered **"No"** (new dependency in dressing). |
| 5 | **Caregiver Daily Activity: Walking**<br>*"3. Walking without help?"* | Yes / No | Assesses functional ambulation and fall vulnerability. Stored in `strokeQuestions.walking`. | **Yes ("Needs doctor visit")**: Triggers if answered **"No"** (loss of unassisted ambulation). |
| 6 | **Caregiver Daily Activity: Speech**<br>*"4. Speech clear?"* | Yes / No | Screens for new or worsening dysarthria/aphasia. Stored in `strokeQuestions.speech`. | **Yes ("Needs doctor visit")**: Triggers if answered **"No"** (unclear speech). |
| 7 | **Caregiver Daily Activity: Medicines**<br>*"5. Medicines taken regularly?"* | Yes / No | Measures compliance with secondary stroke prevention regimen (antiplatelets, statins, antihypertensives). Stored in `strokeQuestions.medicines`. | **Yes ("Needs doctor visit")**: Triggers if answered **"No"** (sub-therapeutic prevention risk). |
| 8 | **Urgent Warning Check**<br>*"🚨 Urgent Check: New weakness, speech change, or confusion since last check?"*<br>*"If yes, flags immediate emergency assistance with 108 ambulance and e-Sanjeevani."* | Yes / No | Screens for acute recurrent stroke or transient ischemic attack (TIA). Stored in `strokeUrgent`. | **Yes ("Needs urgent medical advice")**: If answered **"Yes"**, immediately overrides routine flow to trigger *"Needs urgent medical advice"*, displaying the 108 Emergency Ambulance call button and direct e-Sanjeevani tele-consult link. |
| 9 | **Visit Note Card**<br>*"Anything else bothering you?"*<br>*"Record a short voice note or type any other symptoms, discomfort, or caregiver observations."*<br>Options: *"Speak"* (up to 60s) / *"Type"* (max 500 characters) | Audio recording (up to 60s) or text (up to 500 chars) | Stored locally in IndexedDB (voice note) and localStorage (typed note). Displayed verbatim in Doctor Summary and OPD Parchi. Not automatically parsed or scored. | **No**: Qualitative clinical narrative for clinician review. |

---

### 1.2 Condition: Epilepsy

| # | Question or test (exact wording shown to the user) | Answer type (yes/no, 1-5, number, timed test) | How it is scored or used | Triggers "Needs doctor visit" or "urgent"? (yes/no and the exact rule) |
|---|---|---|---|---|
| 1 | **1. Number of seizures since last check**<br>Options: `['0', '1', '2-3', '4+']` | Categorical / Number (`'0'`, `'1'`, `'2-3'`, `'4+'`) | Quantifies breakthrough seizure frequency since the previous visit. Stored in `epilepsyCheck.seizures`. | **Yes ("Needs doctor visit")**: Triggers if answered **'1'**, **'2-3'**, or **'4+'** (seizure count $\ge 1$). |
| 2 | **2. Missed medicine doses**<br>Options: `['None', '1 - 2 doses', 'Many doses']` | Categorical (`'none'`, `'1-2'`, `'many'`) | Evaluates anti-seizure medication (ASM) adherence. Stored in `epilepsyCheck.missedDoses`. | **Yes ("Needs doctor visit")**: Triggers if answered **'1 - 2 doses'** or **'Many doses'** (ASM non-adherence is the primary modifiable trigger for breakthrough events). |
| 3 | **3. Known triggers identified**<br>Options: `['Poor sleep', 'Fever', 'None']` | Categorical (`'poor-sleep'`, `'fever'`, `'none'`) | Identifies acute precipitating factors for doctor documentation and patient counseling. Stored in `epilepsyCheck.triggers`. | **No**: Contextual clinical documentation. |
| 4 | **4. Any injury from seizure?**<br>Options: `['Yes (Cut/fall/burn)', 'No injury']` | Yes / No | Screens for secondary trauma (head trauma, lacerations, burns, fractures). Stored in `epilepsyCheck.injury`. | **Yes ("Needs doctor visit")**: Triggers if answered **"Yes"**. |
| 5 | **🚨 Urgent Check: Status Epilepticus Warning**<br>*"A seizure lasting over 5 minutes, or no recovery between seizures?"*<br>*"Status epilepticus warning sign. Requires immediate 108 emergency response."* | Yes / No | Screens for status epilepticus (neurological medical emergency). Stored in `epilepsyUrgent`. | **Yes ("Needs urgent medical advice")**: If answered **"Yes"**, immediately triggers *"Needs urgent medical advice"*, displaying the 108 Emergency Ambulance call button. |
| 6 | **Visit Note Card**<br>*"Anything else bothering you?"* (Speak / Type) | Audio recording (up to 60s) or text (up to 500 chars) | Stored in IndexedDB / localStorage for doctor review. | **No**. |

---

### 1.3 Condition: Parkinson's

| # | Question or test (exact wording shown to the user) | Answer type (yes/no, 1-5, number, timed test) | How it is scored or used | Triggers "Needs doctor visit" or "urgent"? (yes/no and the exact rule) |
|---|---|---|---|---|
| 1 | **1. Finger Tapping (Speed & Slowing Test, 10s)**<br>*"Evaluates motor speed and fatigue-related slowing over 10 seconds."*<br>Spoken instruction: *"Finger tapping test for Parkinson's. Tap continuously for 10 seconds to detect speed and motor slowing."*<br>Button: *"Start 10s Tapping Test"* / *"TAP! Keep Tapping"* | Timed test (10 seconds) | Counts total taps, taps in first 5s, and taps in second 5s. Calculates motor fatigue / progressive decrement: `slowingPct = ((firstHalf - secondHalf) / firstHalf) * 100`. Sets `slowingDetected = true` if slowing $\ge 20\%$. Also compares total speed against baseline. | **Yes ("Needs doctor visit")**: Triggers if overall tapping speed drops $\ge$ threshold (default 20%) below baseline **OR** if motor fatigue slowing $\ge 20\%$ (`slowingDetected = true`). |
| 2 | **Motor Symptoms: Tremor, Stiffness, Falls**<br>*"1. More tremor, stiffness, or falls since last check?"* | Yes / No | Screens for motor fluctuation, worsening bradykinesia/rigidity, or postural instability. Stored in `parkinsonQuestions.moreTremorStiffnessFalls`. | **Yes ("Needs doctor visit")**: Triggers if answered **"Yes"**. |
| 3 | **Medication Timing Compliance**<br>*"2. Medicines taken on time?"*<br>Options: `['Yes (On time)', 'No (Missed/delayed)']` | Yes / No | Assesses Levodopa dose timing fidelity and wearing-off motor complications. Stored in `parkinsonQuestions.medicinesOnTime`. | **Yes ("Needs doctor visit")**: Triggers if answered **"No (Missed/delayed)"**. |
| 4 | **Visit Note Card**<br>*"Anything else bothering you?"* (Speak / Type) | Audio recording (up to 60s) or text (up to 500 chars) | Stored in IndexedDB / localStorage for doctor review. | **No**. |

---

### 1.4 Condition: Multiple Sclerosis (MS)

| # | Question or test (exact wording shown to the user) | Answer type (yes/no, 1-5, number, timed test) | How it is scored or used | Triggers "Needs doctor visit" or "urgent"? (yes/no and the exact rule) |
|---|---|---|---|---|
| 1 | **1. Finger Tapping (10s per hand)**<br>*"Tap rapidly with index finger for 10 seconds per hand."*<br>Spoken instruction: *"MS finger tapping test. Tap as fast as possible for 10 seconds with each hand."*<br>Buttons: *"Start Left Hand (10s)"* / *"Start Right Hand (10s)"* | Timed test (10 seconds per hand) | Counts left and right taps over 10s. Computes average tapping speed: `((leftTaps + rightTaps) / 2)`. Compared against 3-week baseline average. | **Yes ("Needs doctor visit")**: Triggers if 3-week rolling average tapping speed drops $\ge$ threshold (default 20%) below baseline. |
| 2 | **2. Symbol Matching Test (30 seconds)**<br>*"Tap the matching number for each symbol."*<br>Reference Key: `★ = 1`, `● = 2`, `▲ = 3`, `■ = 4`<br>Spoken instruction: *"Symbol matching test. Tap the number matching the symbol on the screen."* | Timed test (30 seconds) | Adaptation of the Symbol Digit Modalities Test (SDMT). Counts total correct matches in 30 seconds and records average reaction latency in milliseconds (`avgReactionMs`). | **Yes ("Needs doctor visit")**: Triggers if correct matches drop $\ge$ threshold (default 20%) **OR** reaction time latency slows $\ge 20\%$. (Also evaluated under the multi-measure decline rule). |
| 3 | **3. Fatigue Severity Rating**<br>*"Fatigue severity rating"*<br>Options: `[1, 2, 3, 4, 5]`<br>Labels: *"1 - Minimal"*, *"5 - Severe"* | 1–5 rating scale | Quantifies fatigue symptom severity. Stored in `msQuestions.fatigue`. Incorporated into the composite symptom score. | **Yes ("Needs doctor visit")**: Contributes to symptom score decline if composite drops $\ge$ threshold. |
| 4 | **Walking or Balance Worse?**<br>*"Walking or balance worse?"* | Yes / No | Screens for cerebellar, sensory ataxia, or pyramidal tract exacerbation. Stored in `msQuestions.walkingWorse`. | **Yes ("Needs doctor visit")**: Triggers if answered **"Yes"**. |
| 5 | **Vision Worse?**<br>*"Vision worse?"* | Yes / No | Screens for optic neuritis, visual acuity loss, or diplopia. Stored in `msQuestions.visionWorse`. | **Yes ("Needs doctor visit")**: Triggers if answered **"Yes"**. |
| 6 | **Visit Note Card**<br>*"Anything else bothering you?"* (Speak / Type) | Audio recording (up to 60s) or text (up to 500 chars) | Stored in IndexedDB / localStorage for doctor review. | **No**. |

---

### 1.5 Other Conditions in Registry (Default Behavior)

If a patient is registered with any condition other than Stroke, Epilepsy, Parkinson's, or MS:
- The application **"uses the default tapping/reaction check"** (the MS multi-domain check):
  1. 10-second finger tapping test (Left & Right hands).
  2. 30-second symbol-matching test (SDMT adaptation).
  3. Fatigue rating (1–5) and general symptom questions.

---

### 1.6 Alternative Observational Checklist (When Patient Cannot Do Motor/Screen Tests)

Activated when the ASHA or caregiver toggles: *"Patient cannot do the tapping/reaction tests"*.
Badge: *"Draft - clinical advisor to finalize"*.

| # | Question or test (exact wording shown to the user) | Answer type (yes/no, 1-5, number, timed test) | How it is scored or used | Triggers "Needs doctor visit" or "urgent"? (yes/no and the exact rule) |
|---|---|---|---|---|
| 1 | *"1. New or worsening weakness, drowsiness, or confusion"*<br>Badge: `Urgent flag` | Yes / No | Screens for acute neurological deterioration, stroke recurrence, or altered mental status. | **Yes ("Needs urgent medical advice")**: If answered **"Yes"**, triggers urgent triage alert with Call 108 Ambulance and e-Sanjeevani. |
| 2 | *"2. Trouble swallowing or choking"*<br>Badge: `Urgent flag` | Yes / No | Screens for bulbar dysfunction, acute dysphagia, and aspiration pneumonia risk. | **Yes ("Needs urgent medical advice")**: If answered **"Yes"**, triggers urgent triage alert with Call 108 Ambulance and e-Sanjeevani. |
| 3 | *"3. Fever or chest infection signs"*<br>Badge: `Urgent flag` | Yes / No | Screens for sepsis, aspiration pneumonitis, or systemic infection triggering neurological collapse. | **Yes ("Needs urgent medical advice")**: If answered **"Yes"**, triggers urgent triage alert with Call 108 Ambulance and e-Sanjeevani. |
| 4 | *"4. Seizure since last visit"*<br>Badge: `Urgent flag` | Yes / No | Screens for new-onset seizures, cluster seizures, or post-stroke epilepsy. | **Yes ("Needs urgent medical advice")**: If answered **"Yes"**, triggers urgent triage alert with Call 108 Ambulance and e-Sanjeevani. |
| 5 | *"5. Pressure sores, not eating or drinking, or missed medicines"* | Yes / No | Screens for immobilization complications, dehydration/cachexia, and pharmacotherapy failure. | **Yes ("Needs doctor visit")**: If answered **"Yes"** (and questions 1–4 are "No"), triggers routine medical visit recommendation. |
| 6 | *"6. Caregiver struggling to cope"* | Yes / No | Screens for caregiver burnout, caregiver depression, and breakdown of home caregiving support. | Contributes to observational visit record; prompts social and PHC supportive intervention. |

---

### 1.7 Patient / Family View (Home Mode)

Accessible from the first screen *"Who are you?"* $\rightarrow$ *"Patient or family"*:
- **Input Check**: Runs the identical condition-specific check described above (`MotorAssessment.jsx` with `role="patient"`), but simplified with minimal text, large buttons, preset examiner, and a `ListenButton` on instructions. Includes the *"Anything else bothering you?"* voice or typed note.
- **Result Screen (`/patient/result`)**:
  - **Single Plain Sentence**:
    - If stable: **"Looks stable. Next check in 2 weeks."**
    - If decline flagged or urgent: **"Please see a doctor soon."**
  - **Listen Button**: Built-in speech synthesis reads the single sentence aloud in English (`en-IN`), Hindi (`hi-IN`), Telugu (`te-IN`), or Urdu (`ur-PK`).
  - **ONE Big Action Button**: *"Call for help / Book free doctor consult"* linking directly to e-Sanjeevani (`https://esanjeevani.mohfw.gov.in`).
  - **Doctor Card Button**: *"Show my doctor card (Parchi with QR)"* displaying the 1-page clinical parchi with an SVG QR code for OPD scanning.
  - **Strict Constraint**: **No charts, no percentages, no thresholds, and no scores** are shown in this view.
  - **Emergency 108 Button**: A large red emergency callout is permanently visible: *"Call 108 Ambulance (Free 24x7)"*.

---

## 2. Decline Threshold & Scoring Calculations

All quantitative progression rules are calculated strictly from the longitudinal dataset (`assessments`) using the following algorithms in `src/utils/scoring.js`:

### 2.1 Baseline Calculation
$$Baseline = \frac{1}{\min(3, n)} \sum_{i=1}^{\min(3, n)} x_i$$
- Defined as the arithmetic average of the patient's first 3 longitudinal weekly assessments ($x_1, x_2, x_3$).

### 2.2 Recent Rolling Average Calculation
$$Recent = \frac{1}{3} \sum_{i=n-2}^{n} x_i$$
- Defined as the rolling arithmetic average of the patient's 3 most recent weekly assessments.

### 2.3 Percentage Change Calculations
- **Tapping Speed Drop Percentage**:
  $$TappingDrop\% = \text{round}\left(\frac{Baseline_{taps} - Recent_{taps}}{Baseline_{taps}} \times 100\right)$$
  *(Calculated from bilateral mean taps: $\frac{LeftTaps + RightTaps}{2}$)*
- **Reaction Time Slowed Percentage**:
  $$ReactionSlowed\% = \text{round}\left(\frac{Recent_{ms} - Baseline_{ms}}{Baseline_{ms}} \times 100\right)$$
  *(Calculated from average response latency in milliseconds)*

### 2.4 Clinical Threshold Setting
- **Default value**: **20% (0.20)** everywhere across the app on initial load.
- **Configurable Slider Range**: 10% (0.10, sensitive) to 40% (0.40, conservative) with 5% (0.05) increments.
- **Label**: *"Threshold (set by clinical advisor)"*.

### 2.5 Multi-Measure Sustained Decline Rule (`evaluatePatientDecline`)
A patient is flagged as `isDeclining = true` (triggering *"Needs doctor visit"*) when:
- 3-week rolling average drops $\ge$ threshold below baseline on **$\ge 2$ core measures** simultaneously:
  1. `motorLeft`: Left hand taps
  2. `motorRight`: Right hand taps
  3. `processing`: Correct symbol matches (SDMT)
  4. `symptoms`: Composite symptom rating: $\frac{\text{fatigue} + \text{balance} + \text{vision} + \text{mood}}{4}$

---

## 3. Emergency & 108 Ambulance Rules

The application enforces strict emergency escalation pathways leading directly to `tel:108` (National Ambulance Service) and `tel:112`:

### 3.1 Stroke Emergency Escalation (FAST Protocol)
Evaluated on the Emergency Red Flags screen (`EmergencyRedFlags.jsx`):
1. **F — Face**: *"Ask the person to smile. Does one side of the face droop?"* (Yes / No)
2. **A — Arms**: *"Ask them to raise both arms. Does one arm drift downward?"* (Yes / No)
3. **S — Speech**: *"Ask them to repeat a simple phrase. Is speech slurred or strange?"* (Yes / No)
4. **T — Time Rule**:
   - If **ANY** of Face, Arms, or Speech is **YES**, the system immediately flags:
     - Header: *"⚠ POSSIBLE STROKE — EVERY MINUTE MATTERS"*
     - Action: *"CALL 108 AMBULANCE NOW"* (Primary 64px tap target) and *"CALL 112"*
     - Clinical instructions: Record exact start time, do NOT give food/water (choking risk), do NOT give aspirin unless doctor instructed, lay on side if vomiting.

### 3.2 Seizure Emergency Escalation (Status Epilepticus & High-Risk Criteria)
Evaluated in Step 1 Check, Seizure Diary, and Emergency Red Flags screen:
- Immediate 108 Ambulance call triggered if **ANY** of the following criteria are met:
  1. Seizure lasts **more than 5 minutes** ($>5$ min = operational definition of status epilepticus per ILAE).
  2. Person does not wake up or regain consciousness after the seizure.
  3. A second seizure follows quickly without regaining consciousness in between.
  4. Person is injured, pregnant, or in water during the event.
  5. This is their **first seizure ever**.
  6. Person has difficulty breathing or blue lips (cyanosis) after the seizure.

### 3.3 Acute Check Red Flags
In Step 1 Check:
- Stroke check: *"New weakness, speech change, or confusion since last check"* = **Yes** $\rightarrow$ Triggers *"Needs urgent medical advice"* with Call 108.
- Epilepsy check: *"A seizure lasting over 5 minutes, or no recovery between seizures"* = **Yes** $\rightarrow$ Triggers *"Needs urgent medical advice"* with Call 108.
- Alternative Observational Checklist: Questions 1, 2, 3, or 4 = **Yes** $\rightarrow$ Triggers *"Needs urgent medical advice"* with Call 108.

---

## 4. Text Making Medical Claims & Clinical Citations

Below is the complete catalog of all epidemiological, clinical, and physiological claims made in user-facing text, tooltips, and code comments:

### 4.1 Epidemiological & Health System Statistics (About & Safety Screen)
1. *"Fewer than 1 neurologist per 100,000 people in India"*
   - Source cited: Published estimates (range approx. 0.3 to 0.96 per 100,000), to be verified.
2. *"India's neurologist-to-patient ratio is nearly 80 times worse than in high-income countries"*
   - Source cited: WHO Global Status Report on Neurological Disorders (2025), as reported by BioSpectrum India, July 2026.
3. *"About 30 million people in India live with neurological disorders (excluding neurotrauma and neuro-infections)"*
   - Source cited: Gourie Devi, Neurology India review (older estimate).

### 4.2 Clinical Rationale Statements & Citations
1. **Motor Tapping**:
   - *"Finger tapping speed correlates with motor function. Asymmetry >20% may indicate lateralized deficit. Threshold configurable."*
2. **Cognitive / Processing Speed**:
   - *"Symbol-digit modalities test (SDMT) is standard in MS monitoring. This is a simplified, non-validated adaptation."*
3. **Stroke Golden Hour**:
   - *"Golden Hour: Emergency intervention within 4.5 hours can prevent permanent brain damage."*
4. **Hypertension & Secondary Stroke Risk**:
   - *"Uncontrolled hypertension is the single largest modifiable risk factor for stroke recurrence (INTERSTROKE study). BP target for secondary stroke prevention: <130/80 mmHg (AHA/ASA 2021). Regular home BP monitoring reduces stroke recurrence by 20%."*
5. **Medication Adherence Cutoff**:
   - *"WHO defines medication adherence <80% as sub-therapeutic for chronic neurological conditions. Non-adherence is the leading modifiable cause of seizure recurrence (ILAE) and secondary stroke events (AHA/ASA)."*
6. **Seizure Monitoring**:
   - *"Seizure diary is the gold standard for epilepsy monitoring per ILAE guidelines. Frequency, duration, and triggers directly inform anti-seizure medication titration. >5 min = status epilepticus."*
7. **Speech Fluency**:
   - *"Speech fluency changes can indicate neurological progression. Full analysis requires validated NLP — not implemented here."*
8. **Voice Notes**:
   - *"Voice notes are played back for the doctor; automatic analysis is a future step."*

### 4.3 Clinician Prompt Phrasing (Doctor Summary & Doctor View)
- Top prompt: *"Suggested for doctor review: continue monitoring / consider specialist tele-consult"*
- Accompanying clinical safeguard: *"Prompt for receiving doctor's clinical judgment based on observed trend. Not a diagnostic instruction."*

### 4.4 Mandatory Safety Disclaimers (Present Across All Screens)
- Universal top banner: *"⚕️ SAMPLE DATA — Not for clinical use"*
- Footer disclaimers:
  - *"Monitoring aid. Not a diagnosis. Sample data."*
  - *"Not a diagnosis — for doctor review and clinical correlation only."*
  - *"Role switching is a prototype demo. A real version needs login and consent."*
  - *"This note stays on this device in the prototype."*
  - *"Designed to keep data on the device in this prototype."*
  - *"DRAFT - clinical advisor to finalize"*

---
*File created for external clinical advisor audit and protocol validation.*
