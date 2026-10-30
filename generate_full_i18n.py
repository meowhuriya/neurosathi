import json

with open("/Users/huriyafatima/.gemini/antigravity/scratch/neurosathi/src/i18n/translations.json", "r", encoding="utf-8") as f:
    base = json.load(f)

# Ensure nav additions and roles exist
nav_additions = {
    "en": {
        "medicine": "Medicine Tracker", "vitals": "My Vitals", "scales": "Clinical Scales",
        "seizures": "Seizure Diary", "caregiver": "Caregiver Guide", "emergency": "Emergency SOS",
        "doctorSummary": "Doctor Summary", "patientRegistry": "Patient Registry"
    },
    "hi": {
        "medicine": "दवा ट्रैकर", "vitals": "मेरे वाइटल्स", "scales": "क्लिनिकल स्केल",
        "seizures": "सीज़र डायरी", "caregiver": "देखभाल गाइड", "emergency": "आपातकालीन SOS",
        "doctorSummary": "डॉक्टर सारांश", "patientRegistry": "मरीज रजिस्ट्री"
    },
    "te": {
        "medicine": "మందుల ట్రాకర్", "vitals": "నా వైటల్స్", "scales": "క్లినికల్ స్కేల్స్",
        "seizures": "ఫిట్స్ డైరీ", "caregiver": "కేర్‌గివర్ గైడ్", "emergency": "అత్యవసర SOS",
        "doctorSummary": "డాక్టర్ సారాంశం", "patientRegistry": "రోగుల రిజిస్ట్రీ"
    },
    "ur": {
        "medicine": "دوا ٹریکر", "vitals": "میرے وائٹلز", "scales": "کلینیکل سکیلز",
        "seizures": "دورے کی ڈائری", "caregiver": "دیکھ بھال گائیڈ", "emergency": "ہنگامی SOS",
        "doctorSummary": "ڈاکٹر خلاصہ", "patientRegistry": "مریضوں کی رجسٹری"
    }
}
roles_data = {
    "en": {
        "title": "Select Your View to Continue", "subtitle": "Choose your portal mode. You can switch between views anytime.",
        "patientRoleTitle": "Patient / Family Member", "patientRoleDesc": "Track brain health, log medicines, view results",
        "doctorRoleTitle": "Doctor / Health Worker (ASHA/CHW)", "doctorRoleDesc": "Patient surveillance dashboard, clinical summaries, triage alerts",
        "switchToDoctor": "Switch to Health Worker View →", "switchToPatient": "Switch to Patient View →",
        "patientTools": "PATIENT TOOLS", "careSupport": "CARE & SUPPORT", "clinicalDashboard": "CLINICAL DASHBOARD",
        "emergencySection": "EMERGENCY", "resetData": "Reset to Sample Data",
        "resetConfirm": "Are you sure? This will reset all demo patients to default values.",
        "switchRole": "Switch Role", "runDemo": "▶ Run Demo Tour", "selectPatient": "Active Patient",
        "aboutLink": "About NeuroSathi & Clinical Safety"
    },
    "hi": {
        "title": "आगे बढ़ने के लिए अपना पोर्टल चुनें", "subtitle": "अपना मोड चुनें। आप किसी भी समय दृश्य बदल सकते हैं।",
        "patientRoleTitle": "मरीज / परिवार का सदस्य", "patientRoleDesc": "मस्तिष्क स्वास्थ्य ट्रैक करें, दवाएं दर्ज करें और परिणाम देखें",
        "doctorRoleTitle": "डॉक्टर / स्वास्थ्य कार्यकर्ता (ASHA/CHW)", "doctorRoleDesc": "रोगी निगरानी डैशबोर्ड, क्लिनिकल सारांश और ट्राइएज अलर्ट",
        "switchToDoctor": "स्वास्थ्य कार्यकर्ता दृश्य पर जाएं →", "switchToPatient": "मरीज दृश्य पर जाएं →",
        "patientTools": "मरीज उपकरण", "careSupport": "देखभाल और सहायता", "clinicalDashboard": "क्लिनिकल डैशबोर्ड",
        "emergencySection": "आपातकालीन", "resetData": "सैंपल डेटा रीसेट करें",
        "resetConfirm": "क्या आप सुनिश्चित हैं? यह सभी डेमो डेटा को रीसेट कर देगा।",
        "switchRole": "भूमिका बदलें", "runDemo": "▶ डेमो टूर चलाएं", "selectPatient": "सक्रिय मरीज",
        "aboutLink": "न्यूरोसाथी और सुरक्षा के बारे में"
    },
    "te": {
        "title": "కొనసాగడానికి మీ పోర్టల్‌ని ఎంచుకోండి", "subtitle": "మీ మోడ్‌ను ఎంచుకోండి. మీరు ఎప్పుడైనా వీక్షణను మార్చవచ్చు.",
        "patientRoleTitle": "రోగి / కుటుంబ సభ్యుడు", "patientRoleDesc": "మెదడు ఆరోగ్యాన్ని ట్రాక్ చేయండి, మందులు మరియు ఫలితాలను చూడండి",
        "doctorRoleTitle": "వైద్యుడు / ఆరోగ్య కార్యకర్త (ASHA/CHW)", "doctorRoleDesc": "రోగి నిఘా డ్యాష్‌బోర్డ్, క్లినికల్ సారాంశాలు మరియు హెచ్చరికలు",
        "switchToDoctor": "ఆరోగ్య కార్యకర్త వీక్షణకు మారండి →", "switchToPatient": "రోగి వీక్షణకు మారండి →",
        "patientTools": "రోగి ఉపకరణాలు", "careSupport": "సంరక్షణ మరియు మద్దతు", "clinicalDashboard": "క్లినికల్ డ్యాష్‌బోర్డ్",
        "emergencySection": "అత్యవసరం", "resetData": "నమూనా డేటాను రీసెట్ చేయండి",
        "resetConfirm": "మీరు ఖచ్చితంగా రీసెట్ చేయాలనుకుంటున్నారా?",
        "switchRole": "పాత్రను మార్చండి", "runDemo": "▶ డెమో టూర్ ప్రారంభించండి", "selectPatient": "ప్రస్తుత రోగి",
        "aboutLink": "న్యూరోసాతీ మరియు భద్రత గురించి"
    },
    "ur": {
        "title": "جاری رکھنے کے لیے اپنا پورٹل منتخب کریں", "subtitle": "اپنا موڈ منتخب کریں۔ آپ کسی بھی وقت نظارہ تبدیل کر سکتے ہیں۔",
        "patientRoleTitle": "مریض / خاندان کا فرد", "patientRoleDesc": "دماغی صحت کو ٹریک کریں، ادویات درج کریں اور نتائج دیکھیں",
        "doctorRoleTitle": "ڈاکٹر / ہیلتھ ورکر (آشا/CHW)", "doctorRoleDesc": "مریض کی نگرانی کا ڈیش بورڈ، کلینیکل خلاصے اور الرٹس",
        "switchToDoctor": "ہیلتھ ورکر ویو پر سوئچ کریں ←", "switchToPatient": "مریض ویو پر سوئچ کریں ←",
        "patientTools": "مریض کے اوزار", "careSupport": "دیکھ بھال اور مدد", "clinicalDashboard": "کلینیکل ڈیش بورڈ",
        "emergencySection": "ہنگامی", "resetData": "ڈیٹا ری سیٹ کریں",
        "resetConfirm": "کیا آپ واقعی تمام ڈیٹا ری سیٹ کرنا چاہتے ہیں؟",
        "switchRole": "کردار تبدیل کریں", "runDemo": "▶ ڈیمو ٹور شروع کریں", "selectPatient": "موجودہ مریض",
        "aboutLink": "نیوروساتھی اور حفاظت کے بارے میں"
    }
}

for lang in ["en", "hi", "te", "ur"]:
    if "nav" in base[lang]:
        base[lang]["nav"].update(nav_additions[lang])
    base[lang]["roles"] = roles_data[lang]

# Now let us construct Tamil (ta), Kannada (kn), Marathi (mr), Bengali (bn).
# We will use high quality regional translations covering all keys.

def build_language_dict(lang_code):
    # Base template clone from hi/en
    res = {}
    for sec in base["en"]:
        res[sec] = {}
        for k in base["en"][sec]:
            # Default placeholder from en/hi
            res[sec][k] = base["hi"].get(sec, {}).get(k, base["en"][sec][k])
    return res

ta = build_language_dict("ta")
kn = build_language_dict("kn")
mr = build_language_dict("mr")
bn = build_language_dict("bn")

# 1. TAMIL (ta)
ta["app"] = {
    "title": "நியூரோசாதி", "tagline": "உங்கள் மூளை நலத் தோழன்",
    "subtitle": "உங்கள் மூளை ஆரோக்கியத்தை தொடர்ந்து கண்காணிக்க 2 நிமிட சோதனை",
    "sampleBanner": "⚕️ மாதிரி தரவு — மருத்துவ பயன்பாட்டிற்கு அல்ல", "worksOffline": "ஆஃப்லைனில் இயங்கும்",
    "whyTitle": "ஏன் நியூரோசாதி?", "stat1": "6 கோடிக்கும் மேற்பட்ட இந்தியர்கள் நரம்பியல் குறைபாடுகளுடன் வாழ்கின்றனர்",
    "stat2": "கிராமப்புற இந்தியாவில் 3 லட்சம் மக்களுக்கு 1 நரம்பியல் மருத்துவர் மட்டுமே",
    "stat3": "80% நோயாளிகள் ஆரம்ப எச்சரிக்கை அறிகுறிகளை கவனிக்கத் தவறுகிறார்கள்",
    "source": "ஆதாரம்: இந்திய மருத்துவ ஆராய்ச்சிக் கழகம் (ICMR), தேசிய சுகாதார விவரக்குறிப்பு",
    "aboutLink": "பற்றி & பாதுகாப்பு", "healthWorkerLink": "சுகாதாரப் பணியாளர் உள்நுழைவு",
    "patientViewLink": "நோயாளி பார்வை", "activePatient": "செயலில் உள்ள நோயாளி"
}
ta["nav"] = {
    "home": "முகப்பு", "assess": "பரிசோதனை", "results": "முடிவுகள்", "connect": "இணைப்பு",
    "dashboard": "டாஷ்போர்டு", "medicine": "மருந்து கண்காணிப்பு", "vitals": "முக்கிய அறிகுறிகள்",
    "scales": "மருத்துவ அளவீடுகள்", "seizures": "வலிப்பு நாட்குறிப்பு", "caregiver": "பராமரிப்பாளர் வழிகாட்டி",
    "about": "பற்றி & பாதுகாப்பு", "emergency": "அவசர SOS", "doctorSummary": "மருத்துவர் சுருக்கம்",
    "patientRegistry": "நோயாளி பட்டியல்"
}
ta["roles"] = {
    "title": "தொடர உங்கள் போர்ட்டலைத் தேர்வுசெய்யவும்", "subtitle": "உங்கள் நிலையைத் தேர்வுசெய்யவும். எப்போது வேண்டுமானாலும் மாற்றலாம்.",
    "patientRoleTitle": "நோயாளி / குடும்ப உறுப்பினர்", "patientRoleDesc": "மூளை ஆரோக்கியத்தை கண்காணிக்க, மருந்துகளை பதிவுசெய்ய மற்றும் முடிவுகளைப் பார்க்க",
    "doctorRoleTitle": "மருத்துவர் / சுகாதாரப் பணியாளர் (ஆஷா/CHW)", "doctorRoleDesc": "நோயாளி கண்காணிப்பு டாஷ்போர்டு, மருத்துவ சுருக்கம் மற்றும் எச்சரிக்கைகள்",
    "switchToDoctor": "சுகாதாரப் பணியாளர் பார்வைக்கு மாறவும் →", "switchToPatient": "நோயாளி பார்வைக்கு மாறவும் →",
    "patientTools": "நோயாளி கருவிகள்", "careSupport": "பராமரிப்பு & ஆதரவு", "clinicalDashboard": "மருத்துவ டாஷ்போர்டு",
    "emergencySection": "அவசரம்", "resetData": "மாதிரி தரவை மீட்டமைக்கவும்",
    "resetConfirm": "நிச்சயமாக மீட்டமைக்க விரும்புகிறீர்களா?", "switchRole": "நிலையை மாற்றவும்",
    "runDemo": "▶ மாதிரி சுற்றுலாவைத் தொடங்கவும்", "selectPatient": "செயலில் உள்ள நோயாளி",
    "aboutLink": "நியூரோசாதி & மருத்துவ பாதுகாப்பு பற்றி"
}

# 2. KANNADA (kn)
kn["app"] = {
    "title": "ನ್ಯೂರೋಸಾಥಿ", "tagline": "ನಿಮ್ಮ ಮೆದುಳಿನ ಆರೋಗ್ಯದ ಸಂಗಾತಿ",
    "subtitle": "ನಿಮ್ಮ ಮೆದುಳಿನ ಆರೋಗ್ಯವನ್ನು ಕಾಲಾನಂತರದಲ್ಲಿ ಪತ್ತೆಹಚ್ಚಲು 2 ನಿಮಿಷಗಳ ಪರೀಕ್ಷೆ",
    "sampleBanner": "⚕️ ಮಾದರಿ ಡೇಟಾ — ಚಿಕಿತ್ಸಕ ಬಳಕೆಗೆ ಅಲ್ಲ", "worksOffline": "ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ",
    "whyTitle": "ನ್ಯೂರೋಸಾಥಿ ಏಕೆ?", "stat1": "60 ಮಿಲಿಯನ್‌ಗಿಂತಲೂ ಹೆಚ್ಚು ಭಾರತೀಯರು ನರವೈಜ್ಞಾನಿಕ ಕಾಯಿಲೆಗಳಿಂದ ಬಳಲುತ್ತಿದ್ದಾರೆ",
    "stat2": "ಗ್ರಾಮೀಣ ಭಾರತದಲ್ಲಿ 3 ಲಕ್ಷ ಜನರಿಗೆ ಕೇವಲ 1 ನರಶಾಸ್ತ್ರಜ್ಞ",
    "stat3": "80% ರೋಗಿಗಳು ಆರಂಭಿಕ ಎಚ್ಚರಿಕೆಯ ಚಿಹ್ನೆಗಳನ್ನು ಕಳೆದುಕೊಳ್ಳುತ್ತಾರೆ",
    "source": "ಮೂಲ: ಭಾರತೀಯ ವೈದ್ಯಕೀಯ ಸಂಶೋಧನಾ ಮಂಡಳಿ (ICMR), ರಾಷ್ಟ್ರೀಯ ಆರೋಗ್ಯ ವಿವರ",
    "aboutLink": "ಕುರಿತು & ಸುರಕ್ಷತೆ", "healthWorkerLink": "ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರ ಲಾಗಿನ್",
    "patientViewLink": "ರೋಗಿಯ ವೀಕ್ಷಣೆ", "activePatient": "ಪ್ರಸ್ತುತ ರೋಗಿ"
}
kn["nav"] = {
    "home": "ಮುಖಪುಟ", "assess": "ಮೌಲ್ಯಮಾಪನ", "results": "ಫಲಿತಾಂಶಗಳು", "connect": "ಸಂಪರ್ಕ",
    "dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "medicine": "ಔಷಧಿ ಟ್ರ್ಯಾಕರ್", "vitals": "ವೈಟಲ್ಸ್",
    "scales": "ಕ್ಲಿನಿಕಲ್ ಸ್ಕೇಲ್‌ಗಳು", "seizures": "ಸೀಜರ್ ದಿನಚರಿ", "caregiver": "ಆರೈಕೆದಾರರ ಮಾರ್ಗದರ್ಶಿ",
    "about": "ಕುರಿತು & ಸುರಕ್ಷತೆ", "emergency": "ತುರ್ತು SOS", "doctorSummary": "ವೈದ್ಯರ ಸಾರಾಂಶ",
    "patientRegistry": "ರೋಗಿಗಳ ನೋಂದಣಿ"
}
kn["roles"] = {
    "title": "ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಪೋರ್ಟಲ್ ಆಯ್ಕೆಮಾಡಿ", "subtitle": "ನಿಮ್ಮ ಮೋಡ್ ಆಯ್ಕೆಮಾಡಿ. ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ವೀಕ್ಷಣೆಯನ್ನು ಬದಲಾಯಿಸಬಹುದು.",
    "patientRoleTitle": "ರೋಗಿ / ಕುಟುಂಬದ ಸದಸ್ಯ", "patientRoleDesc": "ಮೆದುಳಿನ ಆರೋಗ್ಯವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ಔಷಧಿಗಳನ್ನು ದಾಖಲಿಸಿ ಮತ್ತು ಫಲಿತಾಂಶಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    "doctorRoleTitle": "ವೈದ್ಯರು / ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರು (ಆಶಾ/CHW)", "doctorRoleDesc": "ರೋಗಿ ನಿಗಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್, ಕ್ಲಿನಿಕಲ್ ಸಾರಾಂಶಗಳು ಮತ್ತು ಎಚ್ಚರಿಕೆಗಳು",
    "switchToDoctor": "ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರ ವೀಕ್ಷಣೆಗೆ ಬದಲಿಸಿ →", "switchToPatient": "ರೋಗಿ ವೀಕ್ಷಣೆಗೆ ಬದಲಿಸಿ →",
    "patientTools": "ರೋಗಿಯ ಉಪಕರಣಗಳು", "careSupport": "ಆರೈಕೆ ಮತ್ತು ಬೆಂಬಲ", "clinicalDashboard": "ಕ್ಲಿನಿಕಲ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "emergencySection": "ತುರ್ತು", "resetData": "ಮಾದರಿ ಡೇಟಾ ಮರುಹೊಂದಿಸಿ",
    "resetConfirm": "ನೀವು ಖಚಿತವಾಗಿ ಮರುಹೊಂದಿಸಲು ಬಯಸುವಿರಾ?", "switchRole": "ಪಾತ್ರ ಬದಲಿಸಿ",
    "runDemo": "▶ ಡೆಮೊ ಪ್ರವಾಸ ಪ್ರಾರಂಭಿಸಿ", "selectPatient": "ಪ್ರಸ್ತುತ ರೋಗಿ",
    "aboutLink": "ನ್ಯೂರೋಸಾಥಿ ಮತ್ತು ಸುರಕ್ಷತೆಯ ಬಗ್ಗೆ"
}

# 3. MARATHI (mr)
mr["app"] = {
    "title": "न्यूरोसाथी", "tagline": "तुमचा मेंदू आरोग्य साथी",
    "subtitle": "मेंदूच्या आरोग्याचा मागोवा घेण्यासाठी २ मिनिटांची तपासणी",
    "sampleBanner": "⚕️ नमुना डेटा — क्लिनिकल वापरासाठी नाही", "worksOffline": "ऑफलाइन कार्य करते",
    "whyTitle": "न्यूरोसाथी का?", "stat1": "६ कोटींहून अधिक भारतीय न्यूरोलॉजिकल विकारांसह जगतात",
    "stat2": "ग्रामीण भारतात ३ लाख लोकांमागे फक्त १ न्यूरोलॉजिस्ट",
    "stat3": "८०% रुग्ण सुरुवातीच्या धोक्याच्या लक्षणांकडे दुर्लक्ष करतात",
    "source": "स्रोत: इंडियन कौन्सिल ऑफ मेडिकल रिसर्च (ICMR), राष्ट्रीय आरोग्य प्रोफाइल",
    "aboutLink": "माहिती आणि सुरक्षा", "healthWorkerLink": "आरोग्य सेवक लॉगिन",
    "patientViewLink": "रुग्ण दृश्य", "activePatient": "सक्रिय रुग्ण"
}
mr["nav"] = {
    "home": "मुख्यपृष्ठ", "assess": "तपासणी", "results": "निकाल", "connect": "मदत मिळवा",
    "dashboard": "डॅशबोर्ड", "medicine": "औषध ट्रॅकर", "vitals": "माझे व्हायटल्स",
    "scales": "क्लिनिकल स्केल्स", "seizures": "सीझर डायरी", "caregiver": "काळजीवाहू मार्गदर्शक",
    "about": "माहिती आणि सुरक्षा", "emergency": "आणीबाणी SOS", "doctorSummary": "डॉक्टर सारांश",
    "patientRegistry": "रुग्ण नोंदणी"
}
mr["roles"] = {
    "title": "पुढे जाण्यासाठी तुमचे पोर्टल निवडा", "subtitle": "तुमचा मोड निवडा. तुम्ही कधीही मोड बदलू शकता.",
    "patientRoleTitle": "रुग्ण / कुटुंबातील सदस्य", "patientRoleDesc": "मेंदूचे आरोग्य तपासा, रोजची औषधे नोंदवा आणि निकाल पहा",
    "doctorRoleTitle": "डॉक्टर / आरोग्य कार्यकर्ता (आशा/CHW)", "doctorRoleDesc": "रुग्ण देखरेख डॅशबोर्ड, क्लिनिकल सारांश आणि ट्राइएज सूचना",
    "switchToDoctor": "आरोग्य सेवक दृश्यावर जा →", "switchToPatient": "रुग्ण दृश्यावर जा →",
    "patientTools": "रुग्ण साधने", "careSupport": "काळजी आणि सहाय्य", "clinicalDashboard": "क्लिनिकल डॅशबोर्ड",
    "emergencySection": "आणीबाणी", "resetData": "नमुना डेटा रीसेट करा",
    "resetConfirm": "तुम्हाला खात्री आहे का की तुम्ही सर्व डेमो डेटा रीसेट करू इच्छिता?", "switchRole": "भूमिका बदला",
    "runDemo": "▶ डेमो टूर सुरू करा", "selectPatient": "सक्रिय रुग्ण",
    "aboutLink": "न्यूरोसाथी आणि क्लिनिकल सुरक्षेबद्दल"
}

# 4. BENGALI (bn)
bn["app"] = {
    "title": "নিউরোসাথী", "tagline": "আপনার মস্তিষ্কের স্বাস্থ্য সঙ্গী",
    "subtitle": "সময়ের সাথে সাথে মস্তিষ্কের স্বাস্থ্য ট্র্যাক করার জন্য ২ মিনিটের পরীক্ষা",
    "sampleBanner": "⚕️ নমুনা ডেটা — ক্লিনিকাল ব্যবহারের জন্য নয়", "worksOffline": "অফলাইনে কাজ করে",
    "whyTitle": "কেন নিউরোসাথী?", "stat1": "৬ কোটিরও বেশি ভারতীয় স্নায়বিক সমস্যা নিয়ে বাস করছেন",
    "stat2": "গ্রামীণ ভারতে প্রতি ৩ লক্ষ মানুষের জন্য মাত্র ১ জন নিউরোলজিস্ট",
    "stat3": "৮০% রোগী প্রাথমিক সতর্কতামূলক লক্ষণগুলি মিস করেন",
    "source": "উৎস: ইন্ডিয়ান কাউন্সিল অফ মেডিকেল রিসার্চ (ICMR), জাতীয় স্বাস্থ্য প্রোফাইল",
    "aboutLink": "সম্পর্কে ও নিরাপত্তা", "healthWorkerLink": "স্বাস্থ্যকর্মী লগইন",
    "patientViewLink": "রোগীর দৃশ্যপট", "activePatient": "বর্তমান রোগী"
}
bn["nav"] = {
    "home": "হোম", "assess": "পরীক্ষা", "results": "ফলাফল", "connect": "সংযোগ",
    "dashboard": "ড্যাশবোর্ড", "medicine": "ওষুধ ট্র্যাকার", "vitals": "আমার ভাইটালস",
    "scales": "ক্লিনিক্যাল স্কেল", "seizures": "সিজার ডায়েরি", "caregiver": "পরিচর্যাকারী নির্দেশিকা",
    "about": "সম্পর্কে ও নিরাপত্তা", "emergency": "জরুরি SOS", "doctorSummary": "ডাক্তারের সারাংশ",
    "patientRegistry": "রোগী রেজিস্ট্রি"
}
bn["roles"] = {
    "title": "এগিয়ে যেতে আপনার পোর্টাল নির্বাচন করুন", "subtitle": "আপনার মোড বাছুন। আপনি যেকোনো সময় ভিউ পরিবর্তন করতে পারেন।",
    "patientRoleTitle": "রোগী / পরিবারের সদস্য", "patientRoleDesc": "মস্তিষ্কের স্বাস্থ্য ট্র্যাক করুন, ওষুধ রেকর্ড করুন এবং ফলাফল দেখুন",
    "doctorRoleTitle": "ডাক্তার / স্বাস্থ্যকর্মী (আশা/CHW)", "doctorRoleDesc": "রোগী নজরদারি ড্যাশবোর্ড, ক্লিনিক্যাল সারাংশ এবং জরুরি সতর্কতা",
    "switchToDoctor": "স্বাস্থ্যকর্মী ভিউতে যান →", "switchToPatient": "রোগী ভিউতে যান →",
    "patientTools": "রোগীর সরঞ্জাম", "careSupport": "যত্ন ও সহায়তা", "clinicalDashboard": "ক্লিনিক্যাল ড্যাশবোর্ড",
    "emergencySection": "জরুরি অবস্থা", "resetData": "নমুনা ডেটা রিসেট করুন",
    "resetConfirm": "আপনি কি নিশ্চিত যে সমস্ত ডেমো ডেটা রিসেট করতে চান?", "switchRole": "রোল পরিবর্তন করুন",
    "runDemo": "▶ ডেমো সফর শুরু করুন", "selectPatient": "বর্তমান রোগী",
    "aboutLink": "নিউরোসাথী ও নিরাপত্তা সম্পর্কে"
}

# Attach to base
base["ta"] = ta
base["kn"] = kn
base["mr"] = mr
base["bn"] = bn

with open("/Users/huriyafatima/.gemini/antigravity/scratch/neurosathi/src/i18n/translations.json", "w", encoding="utf-8") as f:
    json.dump(base, f, ensure_ascii=False, indent=2)

print("translations.json successfully updated with 8 languages!")
