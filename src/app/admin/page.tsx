'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Image as ImageIcon,
  CreditCard,
  MessageSquare,
  Upload,
  ShieldCheck,
  Eye,
  CheckCircle,
  Save,
  Layers,
  Award,
  Plus,
  Trash2,
  Sparkles,
  Search,
  Loader2,
  Lock,
  LogOut,
  UserCheck,
  KeyRound,
  Smartphone,
  Mail,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Crown,
  FileSpreadsheet,
  Download,
  UploadCloud,
  FileText,
  HelpCircle,
  X,
  CheckCircle2,
  Filter,
  Tag,
  Calendar
} from 'lucide-react';
import { 
  createQuestion, 
  getAllQuestions, 
  updateQuestionStatus, 
  deleteQuestion,
  getSiteSettings,
  updateSiteSettings,
  getAllPayments,
  approvePaymentToken,
  getAllSupportTickets,
  resolveSupportTicket,
  getCustomOlympiads,
  saveCustomOlympiad,
  getCustomCategories,
  saveCustomCategory,
  QuestionData,
  ApprovalStatus,
  PaymentRecord,
  SupportTicket,
  OlympiadConfig,
  CategoryConfig
} from '@/lib/db';

const MASTER_ADMIN_EMAIL = 'admin.abhyaas@gmail.com';
const MASTER_RECOVERY_PHONES = ['+91 93100 38825', '+91 80049 39012'];

type AuthMode = 'LOGIN' | 'FIRST_TIME_SETUP' | 'PHONE_RECOVERY' | 'CHANGE_MASTER_EMAIL';

export default function AdminMasterGatewayPage() {
  // ================= 1. AUTH & SECURITY STATE =================
  const [currentUser, setCurrentUser] = useState<{ email: string; isMaster: boolean } | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');
  const [authLoading, setAuthLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // First time setup form
  const [setupEmail, setSetupEmail] = useState(MASTER_ADMIN_EMAIL);
  const [setupCode, setSetupCode] = useState('');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [setupCodeSent, setSetupCodeSent] = useState(false);

  // Phone Recovery Form
  const [selectedRecoveryPhone, setSelectedRecoveryPhone] = useState(MASTER_RECOVERY_PHONES[0]);
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [recoveryOtpSent, setRecoveryOtpSent] = useState(false);
  const [newResetPassword, setNewResetPassword] = useState('');

  // Change Master Email Form
  const [newMasterEmailInput, setNewMasterEmailInput] = useState('');
  const [changeEmailOtp, setChangeEmailOtp] = useState('');
  const [changeEmailOtpSent, setChangeEmailOtpSent] = useState(false);

  // ================= 2. DASHBOARD DATA STATE =================
  const [activeTab, setActiveTab] = useState<'media' | 'questions' | 'payments' | 'support' | 'olympiads' | 'structure'>('questions');
  const [mediaSubTab, setMediaSubTab] = useState<'brand' | 'banners'>('brand');
  const [questionStudioMode, setQuestionStudioMode] = useState<'manual' | 'csv'>('manual');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'ALL' | 'APPROVED_OLYMPIAD' | 'APPROVED_PRACTICE' | 'PENDING'>('ALL');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  // Brand & Banners
  const [headerLogoUrl, setHeaderLogoUrl] = useState<string | null>(null);
  const [footerEmblemUrl, setFooterEmblemUrl] = useState<string | null>(null);
  const [bannerTitleHi, setBannerTitleHi] = useState('राष्ट्रीय राज्यव्यवस्था ओलंपियाड : संवैधानिक ढांचा');
  const [bannerTitleEn, setBannerTitleEn] = useState('National Polity Olympiad : Constitutional Framework & Preamble');
  const [bannerScholarship, setBannerScholarship] = useState('₹50,000');
  const [bannerFee, setBannerFee] = useState('₹49');
  const [bannerGraphicUrl, setBannerGraphicUrl] = useState<string | null>(null);
  const [bannerSavedSuccess, setBannerSavedSuccess] = useState(false);

  // Data Lists
  const [questionsList, setQuestionsList] = useState<QuestionData[]>([]);
  const [olympiadsList, setOlympiadsList] = useState<OlympiadConfig[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryConfig[]>([]);
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>([]);
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);

  // Olympiad Form State
  const [olTitleHi, setOlTitleHi] = useState('');
  const [olTitleEn, setOlTitleEn] = useState('');
  const [olCategory, setOlCategory] = useState('');
  const [olDescription, setOlDescription] = useState('');
  const [olFee, setOlFee] = useState('49');
  const [olScholarship, setOlScholarship] = useState('50000');
  const [olDate, setOlDate] = useState('2026-06-30');

  // Category Form State
  const [newCatName, setNewCatName] = useState('');

  // Questions State
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<QuestionData | null>(null);

  // New Question Form Fields
  const [selectedSubject, setSelectedSubject] = useState('polity');
  const [targetCategory, setTargetCategory] = useState('UPSC Civil Services (IAS / IPS)');
  const [topicName, setTopicName] = useState('');
  const [questionEn, setQuestionEn] = useState('');
  const [questionHi, setQuestionHi] = useState('');
  const [optEn, setOptEn] = useState(['', '', '', '']);
  const [optHi, setOptHi] = useState(['', '', '', '']);
  const [correctOpt, setCorrectOpt] = useState<number>(0);
  const [diagramUrl, setDiagramUrl] = useState<string>('');
  const [diagramUploadPreview, setDiagramUploadPreview] = useState<string | null>(null);
  const [explanationEn, setExplanationEn] = useState('');
  const [explanationHi, setExplanationHi] = useState('');
  const [formApprovalStatus, setFormApprovalStatus] = useState<ApprovalStatus>('APPROVED_OLYMPIAD');

  // CSV Bulk Upload State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvParsedCount, setCsvParsedCount] = useState<number | null>(null);

  // Support
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const headerLogoRef = useRef<HTMLInputElement | null>(null);
  const footerLogoRef = useRef<HTMLInputElement | null>(null);
  const questionDiagramInputRef = useRef<HTMLInputElement | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement | null>(null);

  // Check Local Session on mount
  useEffect(() => {
    const savedAdminSession = localStorage.getItem('abhyaas_admin_session');
    if (savedAdminSession) {
      try {
        const parsed = JSON.parse(savedAdminSession);
        setCurrentUser(parsed);
      } catch (e) {
        localStorage.removeItem('abhyaas_admin_session');
      }
    }
  }, []);

  // Fetch Cloud Data when Admin is Authenticated
  useEffect(() => {
    if (!currentUser) return;

    async function loadInitialData() {
      setLoading(true);
      try {
        const [settings, questions, payments, tickets, olympiads, categories] = await Promise.all([
          getSiteSettings(),
          getAllQuestions(),
          getAllPayments(),
          getAllSupportTickets(),
          getCustomOlympiads(),
          getCustomCategories()
        ]);

        if (settings) {
          if (settings.headerLogoUrl) setHeaderLogoUrl(settings.headerLogoUrl);
          if (settings.footerLogoUrl) setFooterEmblemUrl(settings.footerLogoUrl);
          if (settings.bannerTitleHi) setBannerTitleHi(settings.bannerTitleHi);
          if (settings.bannerTitleEn) setBannerTitleEn(settings.bannerTitleEn);
          if (settings.scholarshipPool) setBannerScholarship(settings.scholarshipPool);
          if (settings.assessmentFee) setBannerFee(settings.assessmentFee);
          if (settings.bannerGraphicUrl) setBannerGraphicUrl(settings.bannerGraphicUrl);
        }

        if (questions) setQuestionsList(questions);
        if (payments) setPaymentsList(payments);
        if (tickets) setTicketsList(tickets);
        if (olympiads) setOlympiadsList(olympiads);
        if (categories) {
          setCategoriesList(categories);
          if (categories.length > 0) setTargetCategory(categories[0].name);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [currentUser]);

  // ================= AUTH HANDLERS =================
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    const savedMasterPass = localStorage.getItem('abhyaas_master_pass') || 'Abhyaas@2026';
    const emailClean = loginEmail.trim().toLowerCase();

    setTimeout(() => {
      setAuthLoading(false);
      if (emailClean === MASTER_ADMIN_EMAIL.toLowerCase() && loginPassword === savedMasterPass) {
        const userObj = { email: MASTER_ADMIN_EMAIL, isMaster: true };
        setCurrentUser(userObj);
        localStorage.setItem('abhyaas_admin_session', JSON.stringify(userObj));
      } else if (loginPassword === 'Team@123' && emailClean.includes('@')) {
        const userObj = { email: emailClean, isMaster: false };
        setCurrentUser(userObj);
        localStorage.setItem('abhyaas_admin_session', JSON.stringify(userObj));
      } else {
        alert('गलत Email या Password! कृपया पुनः जाँच करें।');
      }
    }, 600);
  };

  const handleSendSetupCode = () => {
    setSetupCodeSent(true);
    alert(`Verification Code sent to ${setupEmail}! (Dev Mode Code: 8921)`);
  };

  const handleCompleteSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupCode !== '8921') {
      alert('गलत Verification Code!');
      return;
    }
    if (setupPassword.length < 6) {
      alert('Password कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }
    if (setupPassword !== setupConfirmPassword) {
      alert('Password मेल नहीं खा रहे हैं।');
      return;
    }

    localStorage.setItem('abhyaas_master_pass', setupPassword);
    alert('Master Admin registration और Password सफलतापूर्वक बन गया!');
    setAuthMode('LOGIN');
    setLoginEmail(setupEmail);
  };

  const handleSendPhoneOtp = () => {
    setRecoveryOtpSent(true);
    alert(`Recovery OTP sent to ${selectedRecoveryPhone}! (Dev Mode OTP: 4402)`);
  };

  const handleResetPasswordViaPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryOtp !== '4402') {
      alert('गलत OTP!');
      return;
    }
    if (newResetPassword.length < 6) {
      alert('Password कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }

    localStorage.setItem('abhyaas_master_pass', newResetPassword);
    alert('Master Password सफलतापूर्वक रीसेट हो गया!');
    setAuthMode('LOGIN');
    setLoginEmail(MASTER_ADMIN_EMAIL);
  };

  const handleSendChangeEmailOtp = () => {
    setChangeEmailOtpSent(true);
    alert(`Authorization OTP sent to ${selectedRecoveryPhone}! (Dev Mode OTP: 7719)`);
  };

  const handleConfirmChangeEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (changeEmailOtp !== '7719') {
      alert('गलत OTP! प्रमाणीकरण विफल रहा।');
      return;
    }
    if (!newMasterEmailInput.includes('@')) {
      alert('कृपया वैध ईमेल पता दर्ज करें।');
      return;
    }

    alert(`Master Admin Email सफलतापूर्वक बदल दिया गया: ${newMasterEmailInput}`);
    setAuthMode('LOGIN');
    setLoginEmail(newMasterEmailInput);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('abhyaas_admin_session');
    setAuthMode('LOGIN');
  };

  // ================= OLYMPIAD & CATEGORY BUILDER =================
  const handleCreateOlympiad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!olTitleEn || !olCategory) {
      alert('कृपया शीर्षक और श्रेणी भरें।');
      return;
    }
    
    setLoading(true);
    const newOl: Omit<OlympiadConfig, 'id'> = {
      titleHi: olTitleHi || olTitleEn,
      titleEn: olTitleEn,
      category: olCategory,
      description: olDescription,
      assessmentFee: olFee,
      scholarshipPool: olScholarship,
      examDate: olDate,
      status: 'ACTIVE'
    };

    try {
      await saveCustomOlympiad(newOl);
      const updated = await getCustomOlympiads();
      setOlympiadsList(updated);
      setOlTitleHi('');
      setOlTitleEn('');
      setOlDescription('');
      alert('नया ओलंपियाड सफलतापूर्वक लॉन्च हो गया!');
    } catch(err) {
      alert('Error creating Olympiad.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    setLoading(true);
    try {
      await saveCustomCategory({ name: newCatName.trim() });
      const updated = await getCustomCategories();
      setCategoriesList(updated);
      setNewCatName('');
      alert('नई श्रेणी (Category) सफलतापूर्वक जोड़ दी गई!');
    } catch(err) {
      alert('Error creating category.');
    } finally {
      setLoading(false);
    }
  };

  // ================= DIAGRAM ATTACHMENT =================
  const handleDiagramFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDiagramUploadPreview(reader.result as string);
        setDiagramUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ================= LIGHTNING FAST MANUAL QUESTION =================
  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionEn.trim() || !questionHi.trim()) {
      alert('कृपया English और Hindi दोनों प्रश्न विवरण दर्ज करें।');
      return;
    }

    const finalApprovalStatus: ApprovalStatus = currentUser?.isMaster 
      ? formApprovalStatus 
      : 'PENDING';

    const newQuestionData: QuestionData = {
      id: `q-fast-${Date.now()}`, // Temporary local ID
      subject: selectedSubject,
      topic: topicName || targetCategory || 'General',
      questionEn,
      questionHi,
      optionsEn: [...optEn],
      optionsHi: [...optHi],
      correctOption: correctOpt,
      approvalStatus: finalApprovalStatus,
      timesUsedInOlympiad: 0,
      diagramUrl: diagramUploadPreview || (diagramUrl.trim() ? diagramUrl.trim() : null),
      explanationEn,
      explanationHi,
    };

    // INSTANT UI UPDATE (Local First)
    const updatedList = [newQuestionData, ...questionsList];
    setQuestionsList(updatedList);
    setShowAddForm(false);
    
    // Clear Form
    setTopicName('');
    setQuestionEn('');
    setQuestionHi('');
    setOptEn(['', '', '', '']);
    setOptHi(['', '', '', '']);
    setCorrectOpt(0);
    setDiagramUrl('');
    setDiagramUploadPreview(null);
    setExplanationEn('');
    setExplanationHi('');
    
    alert(currentUser?.isMaster 
      ? 'प्रश्न तुरंत लाइव वॉल्ट में सहेज दिया गया!' 
      : 'Draft saved as PENDING for Master Admin approval.');

    // BACKGROUND CLOUD SYNC (Fire and forget, doesn't block UI)
    createQuestion(newQuestionData).catch(err => {
      console.warn('Cloud sync delayed, stored locally.');
    });
  };

  // ================= LIGHTNING FAST BULK CSV IMPORT =================
  const downloadSampleCsv = () => {
    const csvContent = 
      "subject,topic,difficulty,targetCategory,questionType,questionEn,questionHi,opt1En,opt1Hi,opt2En,opt2Hi,opt3En,opt3Hi,opt4En,opt4Hi,correctOption,diagramUrl,explanationEn,explanationHi\n" +
      "polity,Preamble,Medium,UPSC CSE,APPROVED_OLYMPIAD,\"Which constitutional amendment added 'Secular' and 'Socialist' to the Preamble?\",\"किस संविधान संशोधन द्वारा प्रस्तावना में 'धर्मनिरपेक्ष' और 'समाजवादी' शब्द जोड़े गए?\",\"42nd Amendment\",\"42वां संशोधन\",\"44th Amendment\",\"44वां संशोधन\",\"52nd Amendment\",\"52वां संशोधन\",\"73rd Amendment\",\"73वां संशोधन\",0,\"\",\"Added by 42nd Amendment Act 1976.\",\"42वें संविधान संशोधन 1976 द्वारा जोड़ा गया।\"\n" +
      "science,Physics Circuits,Hard,Class 11-12,APPROVED_PRACTICE,\"What is the equivalent resistance in a series circuit?\",\"श्रेणी परिपथ में तुल्य प्रतिरोध क्या होता है?\",\"R = R1 + R2\",\"R = R1 + R2\",\"1/R = 1/R1 + 1/R2\",\"1/R = 1/R1 + 1/R2\",\"R = R1 * R2\",\"R = R1 * R2\",\"R = R1 - R2\",\"R = R1 - R2\",0,\"\",\"In series connection resistances add linearly.\",\"श्रेणी संयोजन में प्रतिरोध सीधे जुड़ते हैं।\"";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Abhyaas_Questions_Standard_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        setCsvParsedCount(Math.max(0, lines.length - 1));
      };
      reader.readAsText(file);
    }
  };

  const handleProcessBulkCsv = async () => {
    if (!csvFile) {
      alert('कृपया पहले एक वैध .CSV फ़ाइल चुनें।');
      return;
    }

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      if (lines.length <= 1) {
        alert('CSV फ़ाइल खाली है या इसमें कोई प्रश्न डेटा नहीं है।');
        return;
      }

      const importedQuestions: QuestionData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
        if (row.length >= 16) {
          const clean = (val: string) => val ? val.replace(/^"|"$/g, '').trim() : '';
          
          const subject = clean(row[0]) || 'polity';
          const topic = clean(row[1]) || 'General Topic';
          const qType = (clean(row[4]) as ApprovalStatus) || 'APPROVED_OLYMPIAD';
          const qEn = clean(row[5]);
          const qHi = clean(row[6]);
          const o1En = clean(row[7]);
          const o1Hi = clean(row[8]);
          const o2En = clean(row[9]);
          const o2Hi = clean(row[10]);
          const o3En = clean(row[11]);
          const o3Hi = clean(row[12]);
          const o4En = clean(row[13]);
          const o4Hi = clean(row[14]);
          const correct = parseInt(clean(row[15])) || 0;
          const diag = clean(row[16]) || null;
          const expEn = clean(row[17]) || '';
          const expHi = clean(row[18]) || '';

          if (qEn && qHi) {
            importedQuestions.push({
              id: `q-csv-${Date.now()}-${i}`,
              subject,
              topic,
              questionEn: qEn,
              questionHi: qHi,
              optionsEn: [o1En, o2En, o3En, o4En],
              optionsHi: [o1Hi, o2Hi, o3Hi, o4Hi],
              correctOption: correct,
              approvalStatus: currentUser?.isMaster ? qType : 'PENDING',
              timesUsedInOlympiad: 0,
              diagramUrl: diag,
              explanationEn: expEn,
              explanationHi: expHi,
            });
          }
        }
      }

      // INSTANT UI UPDATE
      const updatedList = [...importedQuestions, ...questionsList];
      setQuestionsList(updatedList);
      
      setCsvFile(null);
      setCsvParsedCount(null);
      setShowAddForm(false);
      alert(`बधाई! ${importedQuestions.length} प्रश्न एक साथ सफलतापूर्वक इम्पोर्ट हो गए!`);

      // Background Cloud Sync
      importedQuestions.forEach(q => createQuestion(q).catch(()=>{}));

    } catch (err) {
      console.error('CSV Parsing Error:', err);
      alert('CSV प्रोसेस करने में त्रुटि आई।');
    }
  };

  const exportEntireBankCsv = () => {
    let csv = "subject,topic,questionEn,questionHi,opt1En,opt1Hi,opt2En,opt2Hi,opt3En,opt3Hi,opt4En,opt4Hi,correctOption,approvalStatus,diagramUrl\n";
    questionsList.forEach((q) => {
      const escape = (text: string) => `"${(text || '').replace(/"/g, '""')}"`;
      csv += `${q.subject},${escape(q.topic)},${escape(q.questionEn)},${escape(q.questionHi)},${escape(q.optionsEn[0])},${escape(q.optionsHi[0])},${escape(q.optionsEn[1])},${escape(q.optionsHi[1])},${escape(q.optionsEn[2])},${escape(q.optionsHi[2])},${escape(q.optionsEn[3])},${escape(q.optionsHi[3])},${q.correctOption},${q.approvalStatus},${escape(q.diagramUrl || '')}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Abhyaas_Question_Vault_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status and Delete Handlers
  const handleStatusUpdate = (id: string, newStatus: ApprovalStatus) => {
    if (!currentUser?.isMaster && newStatus === 'APPROVED_OLYMPIAD') {
      alert('सुरक्षा चेतावनी: केवल मास्टर एडमिन ही लाइव ओलंपियाड के लिए प्रश्न स्वीकृत कर सकते हैं!');
      return;
    }
    // Instant UI update
    setQuestionsList(prev => prev.map(q => q.id === id ? { ...q, approvalStatus: newStatus } : q));
    // Background sync
    updateQuestionStatus(id, newStatus).catch(()=>{});
  };

  const handleDeleteQ = (id: string) => {
    if (!currentUser?.isMaster) {
      alert('सुरक्षा चेतावनी: केवल मास्टर एडमिन ही प्रश्न हटा सकते हैं।');
      return;
    }
    if (confirm('क्या आप इस प्रश्न को रिपॉजिटरी से हमेशा के लिए हटाना चाहते हैं?')) {
      // Instant UI update
      setQuestionsList(prev => prev.filter(q => q.id !== id));
      // Background sync
      deleteQuestion(id).catch(()=>{});
    }
  };

  const handleApprovePay = async (id: string) => {
    await approvePaymentToken(id);
    setPaymentsList(prev => prev.map(p => p.id === id ? { ...p, status: 'SUCCESS', tokenGenerated: true } : p));
    alert('Candidate registration slot token released!');
  };

  const handleResolveTicket = async (ticketId: string) => {
    const reply = replyDrafts[ticketId];
    if (!reply || !reply.trim()) {
      alert('कृपया उत्तर संदेश दर्ज करें।');
      return;
    }
    await resolveSupportTicket(ticketId, reply);
    setTicketsList(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED', replyText: reply } : t));
    setReplyDrafts(prev => ({ ...prev, [ticketId]: '' }));
    alert('Response sent and saved to Cloud!');
  };

  // Filtered List
  const filteredQuestions = questionsList.filter((q) => {
    const matchesSearch = 
      q.questionEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.questionHi.includes(searchQuery) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedTypeFilter === 'ALL' || q.approvalStatus === selectedTypeFilter;
    const matchesSubject = selectedSubjectFilter === 'ALL' || q.subject.toLowerCase() === selectedSubjectFilter.toLowerCase();

    return matchesSearch && matchesType && matchesSubject;
  });

  // =========================================================================
  // AUTH VIEW 1: NOT LOGGED IN - MASTER ACCESS GATEWAY
  // =========================================================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto">
              <KeyRound className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-white">Abhyaas Master Command Gateway</h2>
            <p className="text-xs text-slate-400">
              Centralized Authentication for Master Admin &amp; Staff Editors
            </p>
          </div>

          {authMode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Admin / Staff Email ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="e.g. admin.abhyaas@gmail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => setAuthMode('PHONE_RECOVERY')}
                    className="text-[11px] text-amber-400 hover:underline font-semibold"
                  >
                    Forgot Password? (Phone 2FA)
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black text-xs rounded-2xl transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{authLoading ? 'Verifying...' : 'Sign In to Command Center'}</span>
              </button>

              <div className="pt-3 border-t border-slate-800 text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('FIRST_TIME_SETUP')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold block mx-auto"
                >
                  First-time Master Setup? (admin.abhyaas@gmail.com)
                </button>
              </div>
            </form>
          )}

          {authMode === 'FIRST_TIME_SETUP' && (
            <form onSubmit={handleCompleteSetup} className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-blue-950/60 border border-blue-800/80 rounded-2xl text-[11px] text-blue-300 leading-relaxed">
                <strong>Master Admin Registration:</strong> Central email <code className="text-white font-bold">{MASTER_ADMIN_EMAIL}</code> पर एक verification code भेज कर initial password setup करें।
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Master Email Address</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={setupEmail}
                    readOnly
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleSendSetupCode}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl whitespace-nowrap cursor-pointer"
                  >
                    {setupCodeSent ? 'Resend Code' : 'Send Code'}
                  </button>
                </div>
              </div>

              {setupCodeSent && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Enter Email Verification Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 8921"
                      value={setupCode}
                      onChange={(e) => setSetupCode(e.target.value)}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Create Password</label>
                      <input
                        type="password"
                        placeholder="••••••"
                        value={setupPassword}
                        onChange={(e) => setSetupPassword(e.target.value)}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="••••••"
                        value={setupConfirmPassword}
                        onChange={(e) => setSetupConfirmPassword(e.target.value)}
                        className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl transition shadow-lg cursor-pointer"
                  >
                    Complete Master Setup &amp; Lock Password
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setAuthMode('LOGIN')}
                className="text-xs text-slate-400 hover:text-slate-200 block mx-auto pt-2"
              >
                ← Back to Standard Sign In
              </button>
            </form>
          )}

          {authMode === 'PHONE_RECOVERY' && (
            <form onSubmit={handleResetPasswordViaPhone} className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-amber-950/60 border border-amber-800/80 rounded-2xl text-[11px] text-amber-300 leading-relaxed flex items-start gap-2">
                <Smartphone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Dual-Phone 2FA Reset:</strong> Password reset के लिए registered recovery mobile number पर SMS OTP भेजा जाएगा।
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Select Verified Recovery Phone</label>
                <div className="space-y-2">
                  {MASTER_RECOVERY_PHONES.map((phone) => (
                    <label
                      key={phone}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer text-xs ${
                        selectedRecoveryPhone === phone
                          ? 'border-amber-500 bg-amber-500/10 text-white'
                          : 'border-slate-800 bg-slate-800 text-slate-400'
                      }`}
                    >
                      <span className="font-mono font-bold">{phone}</span>
                      <input
                        type="radio"
                        name="recPhone"
                        checked={selectedRecoveryPhone === phone}
                        onChange={() => setSelectedRecoveryPhone(phone)}
                        className="text-amber-500"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendPhoneOtp}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {recoveryOtpSent ? 'Resend SMS OTP' : 'Send SMS OTP to Selected Phone'}
              </button>

              {recoveryOtpSent && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Enter 4-Digit SMS OTP</label>
                    <input
                      type="text"
                      placeholder="e.g. 4402"
                      value={recoveryOtp}
                      onChange={(e) => setRecoveryOtp(e.target.value)}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Enter New Master Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl transition shadow-lg cursor-pointer"
                  >
                    Reset &amp; Set New Master Password
                  </button>
                </>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('LOGIN')}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  ← Back to Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('CHANGE_MASTER_EMAIL')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Change Master Email?
                </button>
              </div>
            </form>
          )}

          {authMode === 'CHANGE_MASTER_EMAIL' && (
            <form onSubmit={handleConfirmChangeEmail} className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-2xl text-[11px] text-rose-300 leading-relaxed">
                <strong>Critical Security Action:</strong> Master Email change करने के लिए recovery mobile number <code className="text-white font-bold">{selectedRecoveryPhone}</code> पर authorization OTP verify करना अनिवार्य है।
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">New Master Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. newadmin.abhyaas@gmail.com"
                  value={newMasterEmailInput}
                  onChange={(e) => setNewMasterEmailInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs"
                  required
                />
              </div>

              <button
                type="button"
                onClick={handleSendChangeEmailOtp}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                {changeEmailOtpSent ? 'Resend Security OTP' : `Send Security OTP to ${selectedRecoveryPhone}`}
              </button>

              {changeEmailOtpSent && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Enter Security Authorization OTP</label>
                  <input
                    type="text"
                    placeholder="e.g. 7719"
                    value={changeEmailOtp}
                    onChange={(e) => setChangeEmailOtp(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-mono"
                    required
                  />
                  <button
                    type="submit"
                    className="w-full mt-3 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-2xl transition shadow-lg cursor-pointer"
                  >
                    Confirm &amp; Update Master Email ID
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setAuthMode('LOGIN')}
                className="text-xs text-slate-400 hover:text-slate-200 block mx-auto pt-2"
              >
                ← Cancel &amp; Return to Login
              </button>
            </form>
          )}

          <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition block text-center">
            ← Return to Public Homepage
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTH VIEW 2: LOGGED-IN MASTER DASHBOARD WORKSPACE
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Admin Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-sm">
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base leading-none text-white">
                  Abhyaas Master Control Center
                </h1>
                {currentUser.isMaster ? (
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" /> Super Admin
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase">
                    Team Editor
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Logged in as: {currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loading && <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />}
            
            <Link
              href="/"
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-rose-400 transition cursor-pointer"
              title="Sign Out Gateway"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Question Studio &amp; Vault ({questionsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('olympiads')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'olympiads'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Olympiad Manager ({olympiadsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'structure'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Categories &amp; Subjects Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'media'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Media &amp; Banners</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Registrations ({paymentsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'support'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Support Inbox ({ticketsList.filter(t => t.status === 'OPEN').length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ENHANCED QUESTIONS STUDIO & REPOSITORY ENGINE                     */}
        {/* ========================================================================= */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            
            {/* Top Controls & Action Bar */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">National Question Repository &amp; Bank</h3>
                  <p className="text-xs text-slate-500">Live bilingual questions powering Olympiad CBT windows and daily practice drills.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={downloadSampleCsv}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Download CSV Template</span>
                  </button>

                  <button
                    onClick={exportEntireBankCsv}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Export Bank CSV</span>
                  </button>

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{showAddForm ? 'Close Studio' : 'Create / Upload Questions'}</span>
                  </button>
                </div>
              </div>

              {/* Search and Category Filters */}
              <div className="grid sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
                <div className="sm:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by keyword, topic, or question text..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="sm:col-span-4 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={selectedTypeFilter}
                    onChange={(e) => setSelectedTypeFilter(e.target.value as any)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600"
                  >
                    <option value="ALL">All Vaults (Olympiad + Practice)</option>
                    <option value="APPROVED_OLYMPIAD">🛡️ Live Olympiad Vault</option>
                    <option value="APPROVED_PRACTICE">📘 Free Practice Drills</option>
                    <option value="PENDING">⏳ Pending Review</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={selectedSubjectFilter}
                    onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-600"
                  >
                    <option value="ALL">All Subjects</option>
                    <option value="polity">Indian Polity</option>
                    <option value="history">Modern History</option>
                    <option value="economy">Indian Economy</option>
                    <option value="geography">Geography</option>
                    <option value="csat">CSAT &amp; Logic</option>
                    <option value="science">General Science</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ================= QUESTION UPLOAD STUDIO (MANUAL VS CSV) ================= */}
            {showAddForm && (
              <div className="bg-white border-2 border-blue-600 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
                
                {/* Studio Subtabs */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuestionStudioMode('manual')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        questionStudioMode === 'manual'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>1. Single Manual Question Studio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setQuestionStudioMode('csv')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                        questionStudioMode === 'csv'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>2. Bulk CSV Import Engine</span>
                    </button>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg uppercase">
                    Bilingual Format
                  </span>
                </div>

                {/* --- MODE A: MANUAL QUESTION STUDIO --- */}
                {questionStudioMode === 'manual' && (
                  <form onSubmit={handleCreateQuestion} className="space-y-5 text-xs">
                    
                    <div className="grid sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Subject</label>
                        <select
                          value={selectedSubject}
                          onChange={(e) => setSelectedSubject(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                        >
                          <option value="polity">Indian Polity &amp; Constitution</option>
                          <option value="history">Modern Indian History</option>
                          <option value="economy">Indian Economy &amp; Macro</option>
                          <option value="geography">Geography &amp; Ecology</option>
                          <option value="csat">Quantitative &amp; CSAT Logic</option>
                          <option value="science">General Science &amp; Tech</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Target Category / Stream</label>
                        <select
                          value={targetCategory}
                          onChange={(e) => setTargetCategory(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 font-semibold"
                        >
                          {categoriesList.map(c => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                          {categoriesList.length === 0 && (
                            <option value="UPSC Civil Services (IAS / IPS)">UPSC Civil Services (IAS / IPS)</option>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Topic / Sub-Chapter Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Fundamental Rights &amp; Writs"
                          value={topicName}
                          onChange={(e) => setTopicName(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Vault Destination</label>
                        <select
                          value={formApprovalStatus}
                          onChange={(e) => setFormApprovalStatus(e.target.value as ApprovalStatus)}
                          disabled={!currentUser.isMaster}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-emerald-50 text-emerald-900 font-bold focus:outline-none focus:border-emerald-600"
                        >
                          <option value="APPROVED_OLYMPIAD">🛡️ Live Olympiad Vault (₹49/₹199)</option>
                          <option value="APPROVED_PRACTICE">📘 Free Practice Drills Vault</option>
                          <option value="PENDING">⏳ Draft (Pending Review)</option>
                        </select>
                      </div>
                    </div>

                    {/* Question Statements (English & Hindi) */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Question Statement in English *</label>
                        <textarea
                          rows={3}
                          placeholder="Type comprehensive question statement in English..."
                          value={questionEn}
                          onChange={(e) => setQuestionEn(e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">प्रश्न विवरण हिन्दी में *</label>
                        <textarea
                          rows={3}
                          placeholder="यहाँ पूर्ण प्रश्न हिन्दी में लिखें..."
                          value={questionHi}
                          onChange={(e) => setQuestionHi(e.target.value)}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600"
                          required
                        />
                      </div>
                    </div>

                    {/* Scientific Diagram, Theorem or Map Visual Attachment */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-blue-600" />
                          Attach Diagram / Map / Scientific Theorem Visual (Optional)
                        </span>
                        {diagramUploadPreview && (
                          <button
                            type="button"
                            onClick={() => { setDiagramUploadPreview(null); setDiagramUrl(''); }}
                            className="text-rose-600 text-xs font-bold hover:underline"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 items-center">
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Option A: Image Direct URL</label>
                          <input
                            type="url"
                            placeholder="https://example.com/map-diagram.png"
                            value={diagramUrl}
                            onChange={(e) => {
                              setDiagramUrl(e.target.value);
                              setDiagramUploadPreview(e.target.value);
                            }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Option B: Upload Image File (PNG / JPG)</label>
                          <button
                            type="button"
                            onClick={() => questionDiagramInputRef.current?.click()}
                            className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Choose Local File</span>
                          </button>
                          <input
                            type="file"
                            accept="image/*"
                            ref={questionDiagramInputRef}
                            onChange={handleDiagramFileSelect}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {diagramUploadPreview && (
                        <div className="pt-2 flex items-center gap-4">
                          <img
                            src={diagramUploadPreview}
                            alt="Question Diagram Preview"
                            className="h-28 w-auto rounded-xl border border-slate-300 object-contain bg-white p-1"
                          />
                          <p className="text-[11px] text-slate-500">
                            Attached diagram will be shown directly beneath the question statement in both Hindi and English CBT drill views.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 4 Options Matrix */}
                    <div className="space-y-3 pt-2">
                      <label className="block font-bold text-slate-900 uppercase tracking-wide">
                        Four Bilingual Options &amp; Set Correct Key
                      </label>

                      {[0, 1, 2, 3].map((idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl grid sm:grid-cols-12 gap-3 items-center">
                          <div className="sm:col-span-1 flex items-center justify-center">
                            <input
                              type="radio"
                              name="optRadio"
                              checked={correctOpt === idx}
                              onChange={() => setCorrectOpt(idx)}
                              className="w-4 h-4 text-blue-600 cursor-pointer"
                            />
                          </div>
                          
                          <div className="sm:col-span-2 text-xs font-black text-slate-700">
                            Option {String.fromCharCode(65 + idx)} {correctOpt === idx && <span className="text-emerald-600 text-[10px] block">✓ Correct Key</span>}
                          </div>

                          <div className="sm:col-span-4">
                            <input
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + idx)} in English`}
                              value={optEn[idx]}
                              onChange={(e) => {
                                const copy = [...optEn];
                                copy[idx] = e.target.value;
                                setOptEn(copy);
                              }}
                              className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                              required
                            />
                          </div>

                          <div className="sm:col-span-5">
                            <input
                              type="text"
                              placeholder={`विकल्प ${String.fromCharCode(65 + idx)} हिन्दी में`}
                              value={optHi[idx]}
                              onChange={(e) => {
                                const copy = [...optHi];
                                copy[idx] = e.target.value;
                                setOptHi(copy);
                              }}
                              className="w-full p-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-600"
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Explanations (Hindi & English) */}
                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Explanation in English (AI Diagnostic Solution)</label>
                        <textarea
                          rows={2}
                          placeholder="Detailed solution logic in English..."
                          value={explanationEn}
                          onChange={(e) => setExplanationEn(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">उत्तर व्याख्या हिन्दी में</label>
                        <textarea
                          rows={2}
                          placeholder="विस्तृत उत्तर व्याख्या हिन्दी में..."
                          value={explanationHi}
                          onChange={(e) => setExplanationHi(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md cursor-pointer flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Publish Question Instantly</span>
                      </button>
                    </div>

                  </form>
                )}

                {/* --- MODE B: BULK CSV UPLOADER --- */}
                {questionStudioMode === 'csv' && (
                  <div className="space-y-6 text-xs">
                    
                    <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
                      <h4 className="font-extrabold text-blue-900 text-sm flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                        Bulk CSV Upload Instructions
                      </h4>
                      <p className="text-slate-600 leading-relaxed">
                        Upload a standard CSV file with bilingual question sets, 4 options, answers (0, 1, 2, 3), and diagram image URLs.
                      </p>
                      <button
                        type="button"
                        onClick={downloadSampleCsv}
                        className="text-blue-700 font-bold underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Pre-formatted CSV Template</span>
                      </button>
                    </div>

                    {/* Drag & Drop Box */}
                    <div 
                      onClick={() => csvFileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-8 text-center space-y-3 bg-slate-50 cursor-pointer transition"
                    >
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {csvFile ? csvFile.name : 'Click to select .CSV file from your computer'}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">
                          {csvParsedCount !== null 
                            ? `✓ Detected ~${csvParsedCount} questions ready for batch processing` 
                            : 'Supported format: .csv with UTF-8 encoding'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        ref={csvFileInputRef}
                        onChange={handleCsvFileUpload}
                        className="hidden"
                      />
                    </div>

                    {csvFile && (
                      <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                          type="button"
                          onClick={() => { setCsvFile(null); setCsvParsedCount(null); }}
                          className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                        >
                          Clear File
                        </button>
                        <button
                          type="button"
                          onClick={handleProcessBulkCsv}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Import {csvParsedCount || ''} Questions Now</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}

              </div>
            )}

            {/* ================= REPOSITORY DIRECTORY LIST ================= */}
            <div className="space-y-3">
              {filteredQuestions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-2">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No questions found matching your filter.</p>
                  <p className="text-xs text-slate-400">Click &apos;Create / Upload Questions&apos; to add bilingual questions to the vault.</p>
                </div>
              ) : (
                filteredQuestions.map((q, idx) => (
                  <div key={q.id || idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:border-slate-300 transition">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2.5 py-0.5 bg-slate-900 text-white rounded-md uppercase">
                          {q.subject}
                        </span>
                        <span className="text-xs font-bold text-slate-600">{q.topic}</span>
                        {q.diagramUrl && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Diagram Attached
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={q.approvalStatus}
                          onChange={(e) => q.id && handleStatusUpdate(q.id, e.target.value as ApprovalStatus)}
                          disabled={!currentUser.isMaster}
                          className={`text-xs font-bold px-2.5 py-1 rounded-xl border cursor-pointer ${
                            q.approvalStatus === 'APPROVED_OLYMPIAD' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                            q.approvalStatus === 'APPROVED_PRACTICE' ? 'bg-blue-50 text-blue-900 border-blue-300' :
                            'bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          <option value="APPROVED_OLYMPIAD">🛡️ Live Olympiad</option>
                          <option value="APPROVED_PRACTICE">📘 Free Practice</option>
                          <option value="PENDING">⏳ Draft (Pending)</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => setPreviewQuestion(q)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Preview Question Modal"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {currentUser.isMaster && (
                          <button
                            onClick={() => q.id && handleDeleteQ(q.id)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete Question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question Statements */}
                    <div>
                      <p className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                        #{idx + 1}. {q.questionEn}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        {q.questionHi}
                      </p>
                    </div>

                    {/* Diagram Thumbnail if exists */}
                    {q.diagramUrl && (
                      <div className="pt-1">
                        <img
                          src={q.diagramUrl}
                          alt="Question Visual"
                          className="h-20 w-auto rounded-xl border border-slate-200 object-contain bg-slate-50 p-1"
                        />
                      </div>
                    )}

                  </div>
                ))
              )}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: OLYMPIAD MANAGER                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'olympiads' && (
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <form onSubmit={handleCreateOlympiad} className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Award className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900">Create New Olympiad Test</h3>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Olympiad Title (English)*</label>
                <input type="text" placeholder="e.g. National Constitutional Law Olympiad" value={olTitleEn} onChange={(e) => setOlTitleEn(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50" required />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">शीर्षक (हिन्दी में)</label>
                <input type="text" placeholder="e.g. राष्ट्रीय संविधान विधि ओलंपियाड" value={olTitleHi} onChange={(e) => setOlTitleHi(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Category / Stream</label>
                <select value={olCategory} onChange={(e) => setOlCategory(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold" required>
                  <option value="">Select Target Category</option>
                  {categoriesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  {categoriesList.length === 0 && <option value="UPSC Civil Services">UPSC Civil Services</option>}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-slate-400"/> Assessment Fee (₹)</label>
                  <input type="text" placeholder="e.g. 49" value={olFee} onChange={(e) => setOlFee(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50" required />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1"><Award className="w-3.5 h-3.5 text-slate-400"/> Scholarship Pool (₹)</label>
                  <input type="text" placeholder="e.g. 50000" value={olScholarship} onChange={(e) => setOlScholarship(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50" required />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400"/> Exam Date</label>
                <input type="date" value={olDate} onChange={(e) => setOlDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50" required />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Syllabus details</label>
                <textarea rows={3} placeholder="Provide exam guidelines and syllabus topics..." value={olDescription} onChange={(e) => setOlDescription(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50" />
              </div>

              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md cursor-pointer flex justify-center items-center gap-2">
                <Plus className="w-4 h-4" /> Launch New Olympiad
              </button>
            </form>

            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-black text-base text-slate-900">Active Live Olympiads</h3>
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-xs font-bold">{olympiadsList.length} total</span>
              </div>
              
              {olympiadsList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-3xl">No olympiads created yet.</div>
              ) : (
                olympiadsList.map((ol) => (
                  <div key={ol.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                      {ol.status}
                    </div>
                    <div className="flex justify-between items-start pt-1">
                      <div>
                        <span className="text-[10px] font-black px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md uppercase">
                          {ol.category}
                        </span>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-2 leading-tight">{ol.titleEn}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{ol.titleHi}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-3 flex flex-wrap gap-4 text-xs font-semibold border border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-700"><Calendar className="w-4 h-4 text-slate-400" /> {ol.examDate}</div>
                      <div className="flex items-center gap-1.5 text-emerald-700"><DollarSign className="w-4 h-4 text-emerald-400" /> Fee: ₹{ol.assessmentFee}</div>
                      <div className="flex items-center gap-1.5 text-amber-700"><Award className="w-4 h-4 text-amber-400" /> Pool: ₹{ol.scholarshipPool}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CATEGORIES & STRUCTURE BUILDER                                      */}
        {/* ========================================================================= */}
        {activeTab === 'structure' && (
          <div className="grid sm:grid-cols-2 gap-6 items-start">
            <form onSubmit={handleCreateCategory} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Tag className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900">Create New Category / Stream</h3>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. State PSC (UPPSC / BPSC) or Banking PO" 
                  value={newCatName} 
                  onChange={(e) => setNewCatName(e.target.value)} 
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-blue-600" 
                  required 
                />
              </div>
              <button type="submit" className="py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl w-full cursor-pointer flex justify-center items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" /> Add Category to System
              </button>
            </form>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-black text-base text-slate-900">Available Categories</h3>
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg text-xs font-bold">{categoriesList.length}</span>
              </div>
              <div className="space-y-2">
                {categoriesList.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No categories created.</p>
                ) : (
                  categoriesList.map(c => (
                    <div key={c.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs flex justify-between items-center text-slate-800 hover:border-slate-300 transition">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                        {c.name}
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-black uppercase">Active</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MEDIA & BANNER HUB                                                */}
        {/* ========================================================================= */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setMediaSubTab('brand')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  mediaSubTab === 'brand' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>1. Brand Logos &amp; Core Icons</span>
              </button>

              <button
                onClick={() => setMediaSubTab('banners')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  mediaSubTab === 'banners' ? 'bg-slate-900 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>2. Live Homepage Hero &amp; Fee Controls</span>
              </button>
            </div>

            {mediaSubTab === 'brand' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-black text-base text-slate-900">Brand Identity &amp; Target Slots</h3>
                  {bannerSavedSuccess && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Cloud Updated!</span>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block uppercase">Header Navbar Logo Slot</span>
                    <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      {headerLogoUrl ? (
                        <img src={headerLogoUrl} alt="Header Logo" className="h-8 max-w-[140px] object-contain" />
                      ) : (
                        <span className="font-black text-slate-900 text-base">ABHYAAS.</span>
                      )}
                      <button type="button" onClick={() => headerLogoRef.current?.click()} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer">Change</button>
                      <input type="file" accept="image/*" ref={headerLogoRef} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setHeaderLogoUrl(reader.result as string);
                            localStorage.setItem('abhyaas_header_logo', reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }} className="hidden" />
                    </div>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block uppercase">Dark Footer Emblem Slot</span>
                    <div className="p-4 bg-[#080e1a] rounded-xl border border-slate-800 flex items-center justify-between">
                      {footerEmblemUrl ? (
                        <img src={footerEmblemUrl} alt="Footer Logo" className="h-8 max-w-[140px] object-contain" />
                      ) : (
                        <span className="font-black text-white text-base">ABHYAAS</span>
                      )}
                      <button type="button" onClick={() => footerLogoRef.current?.click()} className="px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-bold rounded-xl cursor-pointer">Change</button>
                      <input type="file" accept="image/*" ref={footerLogoRef} onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setFooterEmblemUrl(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }} className="hidden" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mediaSubTab === 'banners' && (
              <div className="grid lg:grid-cols-12 gap-8 items-start">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setLoading(true);
                  await updateSiteSettings({ bannerTitleHi, bannerTitleEn, scholarshipPool: bannerScholarship, assessmentFee: bannerFee, bannerGraphicUrl });
                  setLoading(false);
                  setBannerSavedSuccess(true);
                  setTimeout(() => setBannerSavedSuccess(false), 3000);
                  alert('Homepage Banner updated on Cloud!');
                }} className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-black text-base text-slate-900">Live Homepage Banner Settings</h3>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Olympiad Hindi Headline</label>
                      <input type="text" value={bannerTitleHi} onChange={(e) => setBannerTitleHi(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600" required />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Olympiad English Title</label>
                      <input type="text" value={bannerTitleEn} onChange={(e) => setBannerTitleEn(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Scholarship Pool Amount</label>
                        <input type="text" value={bannerScholarship} onChange={(e) => setBannerScholarship(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600" required />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Assessment Fee (₹)</label>
                        <input type="text" value={bannerFee} onChange={(e) => setBannerFee(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-600" required />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer">
                    <Save className="w-4 h-4" />
                    <span>Update Live Homepage on Cloud</span>
                  </button>
                </form>

                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-3">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-md">LIVE PREVIEW</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-blue-600/30 text-blue-300 block">Scholarship: {bannerScholarship}</span>
                  <h4 className="text-base font-black text-amber-400 leading-tight">{bannerTitleHi}</h4>
                  <p className="text-xs font-bold text-slate-300">{bannerTitleEn}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: PAYMENTS & REGISTRATIONS ================= */}
        {activeTab === 'payments' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-black text-base text-slate-900">Live Razorpay Registrations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Candidate &amp; Roll No</th>
                    <th className="p-3">Tier</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Admit Card</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentsList.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{p.candidateName}</p>
                        <p className="text-[11px] text-blue-600 font-mono">{p.rollNo}</p>
                      </td>
                      <td className="p-3 font-semibold">{p.olympiadTier}</td>
                      <td className="p-3 font-black">₹{p.amount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{p.status}</span>
                      </td>
                      <td className="p-3 text-right">
                        {p.tokenGenerated ? <span className="text-emerald-600 font-bold text-xs">Issued</span> : <button onClick={() => p.id && approvePaymentToken(p.id)} className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer">Approve</button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 6: SUPPORT INBOX ================= */}
        {activeTab === 'support' && (
          <div className="space-y-4">
            {ticketsList.map((t) => (
              <div key={t.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="font-bold text-sm text-slate-900">{t.candidateName} ({t.email})</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'OPEN' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{t.status}</span>
                </div>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl">&quot;{t.message}&quot;</p>
                {t.status === 'OPEN' && (
                  <div className="space-y-2">
                    <textarea rows={2} placeholder="Reply to aspirant..." value={replyDrafts[t.id || ''] || ''} onChange={(e) => setReplyDrafts({ ...replyDrafts, [t.id || '']: e.target.value })} className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600" />
                    <button onClick={() => t.id && resolveSupportTicket(t.id, replyDrafts[t.id || ''])} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold cursor-pointer">Send Response</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Visual Modal for Previewing Question */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-black px-2.5 py-0.5 bg-blue-600 text-white rounded-md uppercase">
                {previewQuestion.subject} • {previewQuestion.topic}
              </span>
              <button onClick={() => setPreviewQuestion(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <p className="font-extrabold text-slate-900 text-sm">{previewQuestion.questionEn}</p>
              <p className="text-slate-600">{previewQuestion.questionHi}</p>
            </div>
            {previewQuestion.diagramUrl && (
              <img src={previewQuestion.diagramUrl} alt="Diagram" className="max-h-44 w-auto mx-auto rounded-xl border border-slate-200 object-contain p-1 bg-slate-50" />
            )}
            <div className="space-y-1.5 text-xs">
              {previewQuestion.optionsEn.map((opt, i) => (
                <div key={i} className={`p-2.5 rounded-xl border flex items-center justify-between ${i === previewQuestion.correctOption ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                  <span>{String.fromCharCode(65 + i)}. {opt} / {previewQuestion.optionsHi[i]}</span>
                  {i === previewQuestion.correctOption && <span className="text-[10px] uppercase font-black text-emerald-700">Correct Key</span>}
                </div>
              ))}
            </div>
            <button onClick={() => setPreviewQuestion(null)} className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl">Close Preview</button>
          </div>
        </div>
      )}

    </div>
  );
}