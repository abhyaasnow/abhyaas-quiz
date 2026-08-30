export interface Question {
  id: string;
  subjectId: 'polity' | 'history' | 'economy' | 'geography' | 'csat' | 'current-affairs';
  subjectName: string;
  topic: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctAnswer: number; // 0, 1, 2, or 3
  explanationEn: string;
  explanationHi: string;
}

export const SUBJECT_METADATA: Record<string, { title: string; subtitle: string; icon: string; color: string }> = {
  polity: {
    title: 'Indian Polity & Governance',
    subtitle: 'भारतीय राजव्यवस्था एवं संविधान',
    icon: 'Landmark',
    color: 'blue',
  },
  history: {
    title: 'Indian History & National Movement',
    subtitle: 'भारतीय इतिहास एवं राष्ट्रीय आंदोलन',
    icon: 'Scroll',
    color: 'amber',
  },
  economy: {
    title: 'Indian Economy & Financial Systems',
    subtitle: 'भारतीय अर्थव्यवस्था एवं विकास',
    icon: 'TrendingUp',
    color: 'emerald',
  },
  geography: {
    title: 'Geography & Environment',
    subtitle: 'भूगोल, पर्यावरण एवं पारिस्थितिकी',
    icon: 'Globe',
    color: 'teal',
  },
  csat: {
    title: 'CSAT & Logical Reasoning',
    subtitle: 'सिविल सेवा अभिवृत्ति परीक्षा एवं तर्कशक्ति',
    icon: 'Brain',
    color: 'purple',
  },
  'current-affairs': {
    title: 'Daily Current Affairs & Editorial Analysis',
    subtitle: 'दैनिक समसामयिकी एवं महत्वपूर्ण घटनाक्रम',
    icon: 'Sparkles',
    color: 'rose',
  },
};

export const QUESTIONS_BANK: Question[] = [
  // ==================== POLITY ====================
  {
    id: 'pol-1',
    subjectId: 'polity',
    subjectName: 'Indian Polity',
    topic: 'Constitutional Framework & Preamble',
    difficulty: 'Moderate',
    questionEn: 'Which of the following statements regarding the Preamble to the Constitution of India is correct?',
    questionHi: 'भारत के संविधान की प्रस्तावना (Preamble) के संबंध में निम्नलिखित में से कौन सा कथन सही है?',
    optionsEn: [
      'It is not a part of the Constitution and has no legal effect.',
      'It is a part of the Constitution and can be amended under Article 368 without altering the basic structure.',
      'It gives discretionary powers to the legislature over fundamental rights.',
      'It cannot be amended under any circumstances.',
    ],
    optionsHi: [
      'यह संविधान का हिस्सा नहीं है और इसका कोई कानूनी प्रभाव नहीं है।',
      'यह संविधान का एक अभिन्न हिस्सा है और मूल ढांचे (Basic Structure) को बदले बिना अनुच्छेद 368 के तहत इसमें संशोधन किया जा सकता है।',
      'यह मौलिक अधिकारों पर विधायिका को विवेकाधीन शक्तियां प्रदान करती है।',
      'किसी भी परिस्थिति में इसमें संशोधन नहीं किया जा सकता।',
    ],
    correctAnswer: 1,
    explanationEn: 'In the landmark Kesavananda Bharati case (1973), the Supreme Court held that the Preamble is an integral part of the Constitution and can be amended under Article 368 subject to the Basic Structure doctrine.',
    explanationHi: 'ऐतिहासिक केशवानंद भारती मामले (1973) में सर्वोच्च न्यायालय ने फैसला दिया कि प्रस्तावना संविधान का अभिन्न अंग है और मूल संरचना के सिद्धांत के अधीन अनुच्छेद 368 के तहत इसमें संशोधन किया जा सकता है।',
  },
  {
    id: 'pol-2',
    subjectId: 'polity',
    subjectName: 'Indian Polity',
    topic: 'Local Self Government (73rd Amendment)',
    difficulty: 'Hard',
    questionEn: 'Under Part IX of the Constitution, which of the following is NOT a mandatory provision for Panchayati Raj institutions?',
    questionHi: 'संविधान के भाग IX के तहत, निम्नलिखित में से कौन सा पंचायती राज संस्थाओं के लिए अनिवार्य (Mandatory) प्रावधान नहीं है?',
    optionsEn: [
      'Establishment of a State Election Commission to conduct panchayat elections.',
      'Providing reservation for Other Backward Classes (OBCs) in panchayats.',
      'Fixing the tenure of Panchayats at five years.',
      'Constitution of a State Finance Commission every five years.',
    ],
    optionsHi: [
      'पंचायत चुनाव कराने के लिए राज्य चुनाव आयोग की स्थापना।',
      'पंचायतों में अन्य पिछड़ा वर्ग (OBC) के लिए आरक्षण प्रदान करना।',
      'पंचायतों का कार्यकाल 5 वर्ष निर्धारित करना।',
      'प्रत्येक 5 वर्ष में राज्य वित्त आयोग का गठन करना।',
    ],
    correctAnswer: 1,
    explanationEn: 'Reservation for OBCs is a voluntary (discretionary) provision left to the discretion of individual State Legislatures under Article 243D(6), whereas SC/ST reservations, 5-year tenure, State Election Commission, and State Finance Commission are mandatory.',
    explanationHi: 'अनुच्छेद 243D(6) के तहत OBC के लिए आरक्षण एक स्वैच्छिक (Discretionary) प्रावधान है जो राज्य विधानमंडलों के विवेक पर निर्भर है, जबकि SC/ST आरक्षण, 5 वर्ष का कार्यकाल, राज्य चुनाव आयोग और राज्य वित्त आयोग अनिवार्य प्रावधान हैं।',
  },

  // ==================== HISTORY ====================
  {
    id: 'hist-1',
    subjectId: 'history',
    subjectName: 'Modern History',
    topic: 'Indian National Movement',
    difficulty: 'Moderate',
    questionEn: 'With reference to the Indian freedom struggle, which of the following events occurred earliest?',
    questionHi: 'भारतीय स्वतंत्रता संग्राम के संदर्भ में, निम्नलिखित में से कौन सी घटना सबसे पहले घटित हुई थी?',
    optionsEn: [
      'Rowlatt Satyagraha',
      'Champaran Satyagraha',
      'Kheda Satyagraha',
      'Ahmedabad Mill Strike',
    ],
    optionsHi: [
      'रौलट सत्याग्रह (Rowlatt Satyagraha)',
      'चंपारण सत्याग्रह (Champaran Satyagraha)',
      'खेड़ा सत्याग्रह (Kheda Satyagraha)',
      'अहमदाबाद मिल मजदूर हड़ताल (Ahmedabad Mill Strike)',
    ],
    correctAnswer: 1,
    explanationEn: 'Chronology: Champaran Satyagraha (April 1917) -> Ahmedabad Mill Strike (Feb-March 1918) -> Kheda Satyagraha (March 1918) -> Rowlatt Satyagraha (April 1919). Champaran was Gandhiji\'s first Civil Disobedience movement in India.',
    explanationHi: 'कालक्रम: चंपारण सत्याग्रह (अप्रैल 1917) -> अहमदाबाद मिल हड़ताल (फरवरी-मार्च 1918) -> खेड़ा सत्याग्रह (मार्च 1918) -> रौलट सत्याग्रह (अप्रैल 1919)। चंपारण भारत में गांधीजी का पहला सविनय अवज्ञा आंदोलन था।',
  },
  {
    id: 'hist-2',
    subjectId: 'history',
    subjectName: 'Modern History',
    topic: 'Constitutional Developments in British India',
    difficulty: 'Hard',
    questionEn: 'Which Act of the British Parliament introduced the system of "Dyarchy" (dual government) at the provincial level in India?',
    questionHi: 'ब्रिटिश संसद के किस अधिनियम ने भारत में प्रांतीय स्तर पर "द्वैध शासन" (Dyarchy) प्रणाली की शुरुआत की थी?',
    optionsEn: [
      'Indian Councils Act, 1909 (Morley-Minto Reforms)',
      'Government of India Act, 1919 (Montagu-Chelmsford Reforms)',
      'Government of India Act, 1935',
      'Charter Act of 1853',
    ],
    optionsHi: [
      'भारतीय परिषद अधिनियम, 1909 (मार्ले-मिंटो सुधार)',
      'भारत सरकार अधिनियम, 1919 (मोंटेग्यू-चेम्सफोर्ड सुधार)',
      'भारत सरकार अधिनियम, 1935',
      'चार्टर अधिनियम, 1853',
    ],
    correctAnswer: 1,
    explanationEn: 'The Government of India Act 1919 introduced Dyarchy in the provinces by dividing provincial subjects into "Transferred" and "Reserved". The 1935 Act later abolished provincial dyarchy and introduced Provincial Autonomy.',
    explanationHi: 'भारत सरकार अधिनियम 1919 ने प्रांतीय विषयों को "हस्तांतरित" और "आरक्षित" में विभाजित करके प्रांतों में द्वैध शासन की शुरुआत की थी। बाद में 1935 के अधिनियम ने प्रांतीय द्वैध शासन को समाप्त कर प्रांतीय स्वायत्तता लागू की।',
  },

  // ==================== ECONOMY ====================
  {
    id: 'eco-1',
    subjectId: 'economy',
    subjectName: 'Indian Economy',
    topic: 'Monetary Policy & RBI',
    difficulty: 'Moderate',
    questionEn: 'When the Reserve Bank of India (RBI) increases the Cash Reserve Ratio (CRR), what is the immediate impact on commercial banks?',
    questionHi: 'जब भारतीय रिज़र्व बैंक (RBI) नकद आरक्षित अनुपात (CRR) बढ़ाता है, तो वाणिज्यिक बैंकों पर इसका तत्काल क्या प्रभाव पड़ता है?',
    optionsEn: [
      'Lendable resources and liquidity in the banking system decrease.',
      'Banks will have more funds to lend to borrowers at lower interest rates.',
      'The government borrowings automatically double.',
      'It has no direct effect on market liquidity.',
    ],
    optionsHi: [
      'बैंकिंग प्रणाली में उधार देने योग्य संसाधन और तरलता (Liquidity) कम हो जाती है।',
      'बैंकों के पास कम ब्याज दरों पर उधार देने के लिए अधिक धन उपलब्ध होता है।',
      'सरकारी उधारी स्वतः दोगुनी हो जाती है।',
      'बाजार की तरलता पर इसका कोई सीधा प्रभाव नहीं पड़ता।',
    ],
    correctAnswer: 0,
    explanationEn: 'An increase in CRR mandates that commercial banks hold a higher percentage of their Net Demand and Time Liabilities (NDTL) in cash with the RBI, thereby sucking out excess liquidity from the market and reducing credit expansion.',
    explanationHi: 'CRR में वृद्धि से वाणिज्यिक बैंकों को अपनी जमा राशि (NDTL) का अधिक हिस्सा RBI के पास नकद के रूप में रखना पड़ता है, जिससे बाजार से अतिरिक्त तरलता समाप्त होती है और ऋण वितरण क्षमता घटती है।',
  },
  {
    id: 'eco-2',
    subjectId: 'economy',
    subjectName: 'Indian Economy',
    topic: 'External Sector & Forex Reserves',
    difficulty: 'Moderate',
    questionEn: 'Which of the following components is NOT included in India\'s Foreign Exchange Reserves managed by the RBI?',
    questionHi: 'RBI द्वारा प्रबंधित भारत के विदेशी मुद्रा भंडार (Forex Reserves) में निम्नलिखित में से कौन सा घटक शामिल नहीं है?',
    optionsEn: [
      'Foreign Currency Assets (FCA)',
      'Gold reserves held by RBI',
      'Special Drawing Rights (SDR) with IMF',
      'Public deposits in domestic commercial banks',
    ],
    optionsHi: [
      'विदेशी मुद्रा परिसंपत्तियां (Foreign Currency Assets)',
      'RBI द्वारा धारित स्वर्ण भंडार (Gold Reserves)',
      'अंतर्राष्ट्रीय मुद्रा कोष (IMF) में विशेष आहरण अधिकार (SDR)',
      'घरेलू वाणिज्यिक बैंकों में जनता की सावधि जमा (Public Deposits)',
    ],
    correctAnswer: 3,
    explanationEn: 'India\'s Forex reserves consist of 4 distinct components: 1. Foreign Currency Assets (FCAs), 2. Gold Reserves, 3. Special Drawing Rights (SDRs), and 4. Reserve Tranche Position (RTP) in the IMF. Public domestic bank deposits are not part of Forex.',
    explanationHi: 'भारत के विदेशी मुद्रा भंडार में 4 घटक होते हैं: 1. विदेशी मुद्रा परिसंपत्तियां (FCA), 2. स्वर्ण भंडार, 3. IMF में विशेष आहरण अधिकार (SDR), और 4. IMF में रिज़र्व ट्रेंच स्थिति (RTP)। घरेलू बैंक जमा इसमें शामिल नहीं हैं।',
  },

  // ==================== GEOGRAPHY & ENVIRONMENT ====================
  {
    id: 'geo-1',
    subjectId: 'geography',
    subjectName: 'Geography',
    topic: 'Indian Physical Geography & Drainage',
    difficulty: 'Moderate',
    questionEn: 'Which of the following peninsular rivers flows westwards and drains into the Arabian Sea through a rift valley?',
    questionHi: 'निम्नलिखित में से कौन सी प्रायद्वीपीय नदी भ्रंश घाटी (Rift Valley) से होकर पश्चिम की ओर बहती है और अरब सागर में गिरती है?',
    optionsEn: [
      'Godavari',
      'Narmada',
      'Mahanadi',
      'Krishna',
    ],
    optionsHi: [
      'गोदावरी',
      'नर्मदा',
      'महानदी',
      'कृष्णा',
    ],
    correctAnswer: 1,
    explanationEn: 'The Narmada and Tapi rivers flow through fault/rift valleys created between the Vindhya and Satpura ranges towards the west into the Gulf of Khambhat (Arabian Sea), forming estuaries rather than deltas.',
    explanationHi: 'नर्मदा और तापी नदियां विंध्य और सतपुड़ा श्रेणियों के बीच बनी भ्रंश घाटी से होकर पश्चिम दिशा में बहती हैं और खंभात की खाड़ी (अरब सागर) में गिरती हैं, और डेल्टा की जगह ज्वारनदमुख (Estuary) बनाती हैं।',
  },

  // ==================== CSAT / REASONING ====================
  {
    id: 'csat-1',
    subjectId: 'csat',
    subjectName: 'CSAT & Reasoning',
    topic: 'Logical Deductions & Syllogism',
    difficulty: 'Easy',
    questionEn: 'Statements:\n1. All IAS officers are dedicated administrators.\n2. Some dedicated administrators are scholars.\n\nConclusions:\nI. Some IAS officers are scholars.\nII. All scholars are IAS officers.',
    questionHi: 'कथन:\n1. सभी IAS अधिकारी समर्पित प्रशासक हैं।\n2. कुछ समर्पित प्रशासक विद्वान हैं।\n\nनिष्कर्ष:\nI. कुछ IAS अधिकारी विद्वान हैं।\nII. सभी विद्वान IAS अधिकारी हैं।',
    optionsEn: [
      'Only Conclusion I follows',
      'Only Conclusion II follows',
      'Both I and II follow',
      'Neither Conclusion I nor II follows',
    ],
    optionsHi: [
      'केवल निष्कर्ष I अनुसरण करता है',
      'केवल निष्कर्ष II अनुसरण करता है',
      'निष्कर्ष I और II दोनों अनुसरण करते हैं',
      'न तो निष्कर्ष I और न ही II अनुसरण करता है',
    ],
    correctAnswer: 3,
    explanationEn: 'From "All A are B" and "Some B are C", no definite conclusion can be drawn between A and C without an overlapping middle term. Hence, neither Conclusion I nor II follows with certainty.',
    explanationHi: '"सभी A, B हैं" और "कुछ B, C हैं" से A और C के बीच कोई निश्चित संबंध नहीं निकाला जा सकता। अतः कोई भी निष्कर्ष निश्चित रूप से मान्य नहीं है।',
  },

  // ==================== CURRENT AFFAIRS ====================
  {
    id: 'ca-1',
    subjectId: 'current-affairs',
    subjectName: 'Current Affairs',
    topic: 'National & Global Governance',
    difficulty: 'Easy',
    questionEn: 'Which digital payment infrastructure developed by NPCI has enabled real-time cross-border remittances and merchant payments across multiple countries?',
    questionHi: 'NPCI द्वारा विकसित किस डिजिटल भुगतान अवसंरचना ने कई देशों में वास्तविक समय में सीमा पार प्रेषण (Cross-border payments) को सक्षम बनाया है?',
    optionsEn: [
      'Unified Payments Interface (UPI)',
      'SWIFT Network',
      'NEFT Protocol',
      'RTGS Core',
    ],
    optionsHi: [
      'यूनिफाइड पेमेंट्स इंटरफेस (UPI)',
      'स्विफ्ट नेटवर्क (SWIFT)',
      'एनईएफटी (NEFT)',
      'आरटीजीएस (RTGS)',
    ],
    correctAnswer: 0,
    explanationEn: 'Unified Payments Interface (UPI), developed by NPCI, has expanded globally, enabling cross-border linkage with Singapore (PayNow), UAE, France, Mauritius, Sri Lanka, and Nepal.',
    explanationHi: 'NPCI द्वारा विकसित यूनिफाइड पेमेंट्स इंटरफेस (UPI) का वैश्विक विस्तार हुआ है, जिसने सिंगापुर (PayNow), यूएई, फ्रांस, मॉरीशस, श्रीलंका और नेपाल के साथ निर्बाध भुगतान सक्षम किया है।',
  },
];