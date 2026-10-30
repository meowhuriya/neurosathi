import json
import re

with open("/Users/huriyafatima/.gemini/antigravity/scratch/neurosathi/src/i18n/translations.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Helper to add nav & role keys
nav_additions = {
    "en": {
        "medicine": "Medicine Tracker",
        "vitals": "My Vitals",
        "scales": "Clinical Scales",
        "seizures": "Seizure Diary",
        "caregiver": "Caregiver Guide",
        "emergency": "Emergency SOS",
        "doctorSummary": "Doctor Summary",
        "patientRegistry": "Patient Registry"
    },
    "hi": {
        "medicine": "दवा ट्रैकर",
        "vitals": "मेरे वाइटल्स",
        "scales": "क्लिनिकल स्केल",
        "seizures": "सीज़र डायरी",
        "caregiver": "देखभाल गाइड",
        "emergency": "आपातकालीन SOS",
        "doctorSummary": "डॉक्टर सारांश",
        "patientRegistry": "मरीज रजिस्ट्री"
    },
    "te": {
        "medicine": "మందుల ట్రాకర్",
        "vitals": "నా వైటల్స్",
        "scales": "క్లినికల్ స్కేల్స్",
        "seizures": "ఫిట్స్ డైరీ",
        "caregiver": "కేర్‌గివర్ గైడ్",
        "emergency": "అత్యవసర SOS",
        "doctorSummary": "డాక్టర్ సారాంశం",
        "patientRegistry": "రోగుల రిజిస్ట్రీ"
    },
    "ur": {
        "medicine": "دوا ٹریکر",
        "vitals": "میرے وائٹلز",
        "scales": "کلینیکل سکیلز",
        "seizures": "دورے کی ڈائری",
        "caregiver": "دیکھ بھال گائیڈ",
        "emergency": "ہنگامی SOS",
        "doctorSummary": "ڈاکٹر خلاصہ",
        "patientRegistry": "مریضوں کی رجسٹری"
    }
}

roles_data = {
    "en": {
        "title": "Select Your View to Continue",
        "subtitle": "Choose your portal mode. You can switch between views anytime.",
        "patientRoleTitle": "Patient / Family Member",
        "patientRoleDesc": "Track brain health, log daily medicines, check vitals & review test results",
        "doctorRoleTitle": "Doctor / Health Worker (ASHA/CHW)",
        "doctorRoleDesc": "Patient surveillance dashboard, longitudinal clinical summaries & triage alerts",
        "switchToDoctor": "Switch to Health Worker View →",
        "switchToPatient": "Switch to Patient View →",
        "patientTools": "PATIENT TOOLS",
        "careSupport": "CARE & SUPPORT",
        "clinicalDashboard": "CLINICAL DASHBOARD",
        "emergencySection": "EMERGENCY",
        "resetData": "Reset to Sample Data",
        "resetConfirm": "Are you sure? This will reset all demo patients to default values.",
        "switchRole": "Switch Role",
        "runDemo": "▶ Run Demo Tour",
        "selectPatient": "Active Patient",
        "aboutLink": "About NeuroSathi & Clinical Safety"
    },
    "hi": {
        "title": "आगे बढ़ने के लिए अपना पोर्टल चुनें",
        "subtitle": "अपना मोड चुनें। आप किसी भी समय दृश्य बदल सकते हैं।",
        "patientRoleTitle": "मरीज / परिवार का सदस्य",
        "patientRoleDesc": "मस्तिष्क स्वास्थ्य ट्रैक करें, दवाएं दर्ज करें और परिणाम देखें",
        "doctorRoleTitle": "डॉक्टर / स्वास्थ्य कार्यकर्ता (ASHA/CHW)",
        "doctorRoleDesc": "रोगी निगरानी डैशबोर्ड, क्लिनिकल सारांश और ट्राइएज अलर्ट",
        "switchToDoctor": "स्वास्थ्य कार्यकर्ता दृश्य पर जाएं →",
        "switchToPatient": "मरीज दृश्य पर जाएं →",
        "patientTools": "मरीज उपकरण",
        "careSupport": "देखभाल और सहायता",
        "clinicalDashboard": "क्लिनिकल डैशबोर्ड",
        "emergencySection": "आपातकालीन",
        "resetData": "सैंपल डेटा रीसेट करें",
        "resetConfirm": "क्या आप सुनिश्चित हैं? यह सभी डेमो डेटा को रीसेट कर देगा।",
        "switchRole": "भूमिका बदलें",
        "runDemo": "▶ डेमो टूर चलाएं",
        "selectPatient": "सक्रिय मरीज",
        "aboutLink": "न्यूरोसाथी और सुरक्षा के बारे में"
    },
    "te": {
        "title": "కొనసాగడానికి మీ పోర్టల్‌ని ఎంచుకోండి",
        "subtitle": "మీ మోడ్‌ను ఎంచుకోండి. మీరు ఎప్పుడైనా వీక్షణను మార్చవచ్చు.",
        "patientRoleTitle": "రోగి / కుటుంబ సభ్యుడు",
        "patientRoleDesc": "మెదడు ఆరోగ్యాన్ని ట్రాక్ చేయండి, మందులు మరియు ఫలితాలను చూడండి",
        "doctorRoleTitle": "వైద్యుడు / ఆరోగ్య కార్యకర్త (ASHA/CHW)",
        "doctorRoleDesc": "రోగి నిఘా డ్యాష్‌బోర్డ్, క్లినికల్ సారాంశాలు మరియు హెచ్చరికలు",
        "switchToDoctor": "ఆరోగ్య కార్యకర్త వీక్షణకు మారండి →",
        "switchToPatient": "రోగి వీక్షణకు మారండి →",
        "patientTools": "రోగి ఉపకరణాలు",
        "careSupport": "సంరక్షణ మరియు మద్దతు",
        "clinicalDashboard": "క్లినికల్ డ్యాష్‌బోర్డ్",
        "emergencySection": "అత్యవసరం",
        "resetData": "నమూనా డేటాను రీసెట్ చేయండి",
        "resetConfirm": "మీరు ఖచ్చితంగా రీసెట్ చేయాలనుకుంటున్నారా?",
        "switchRole": "పాత్రను మార్చండి",
        "runDemo": "▶ డెమో టూర్ ప్రారంభించండి",
        "selectPatient": "ప్రస్తుత రోగి",
        "aboutLink": "న్యూరోసాతీ మరియు భద్రత గురించి"
    },
    "ur": {
        "title": "جاری رکھنے کے لیے اپنا پورٹل منتخب کریں",
        "subtitle": "اپنا موڈ منتخب کریں۔ آپ کسی بھی وقت نظارہ تبدیل کر سکتے ہیں۔",
        "patientRoleTitle": "مریض / خاندان کا فرد",
        "patientRoleDesc": "دماغی صحت کو ٹریک کریں، ادویات درج کریں اور نتائج دیکھیں",
        "doctorRoleTitle": "ڈاکٹر / ہیلتھ ورکر (آشا/CHW)",
        "doctorRoleDesc": "مریض کی نگرانی کا ڈیش بورڈ، کلینیکل خلاصے اور الرٹس",
        "switchToDoctor": "ہیلتھ ورکر ویو پر سوئچ کریں ←",
        "switchToPatient": "مریض ویو پر سوئچ کریں ←",
        "patientTools": "مریض کے اوزار",
        "careSupport": "دیکھ بھال اور مدد",
        "clinicalDashboard": "کلینیکل ڈیش بورڈ",
        "emergencySection": "ہنگامی",
        "resetData": "ڈیٹا ری سیٹ کریں",
        "resetConfirm": "کیا آپ واقعی تمام ڈیٹا ری سیٹ کرنا چاہتے ہیں؟",
        "switchRole": "کردار تبدیل کریں",
        "runDemo": "▶ ڈیمو ٹور شروع کریں",
        "selectPatient": "موجودہ مریض",
        "aboutLink": "نیوروساتھی اور حفاظت کے بارے میں"
    }
}

for lang in ["en", "hi", "te", "ur"]:
    data[lang]["nav"].update(nav_additions[lang])
    data[lang]["roles"] = roles_data[lang]

print("Updated 4 base languages with nav additions and roles.")
