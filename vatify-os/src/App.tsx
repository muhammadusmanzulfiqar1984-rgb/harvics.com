import React, { useState, useEffect } from 'react';
// Version: 1.0.2 - Naked Floating Tabs
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  Settings, 
  TrendingUp,
  LogOut,
  ChevronLeft,
  Lock,
  CheckCircle,
  Calendar,
  User,
  Bell,
  CreditCard,
  Plus, 
  Search, 
  Filter, 
  Download, 
  MessageSquare,
  Calculator,
  Globe,
  Zap,
  Send,
  UserCheck,
  ShieldCheck, 
  AlertCircle,
  ChevronRight,
  Camera,
  Trash2,
  BookOpen,
  PieChart,
  Languages,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Expense, VAT_RATES, REGIONS, Language, TRANSLATIONS } from './types';
import Chatbot from './components/Chatbot';
import ErrorBoundary from './components/ErrorBoundary';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Card } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { StatCard } from './components/ui/StatCard';
import { ListCard } from './components/ui/ListCard';
import { Modal } from './components/ui/Modal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BLUEPRINT_MARKDOWN = `
# Harvics Vatify OS: MVP Blueprint

## 1. MVP Feature Set (10 Core Features)

| # | Feature Name | User Benefit | Compliance Relevance | Priority |
|---|--------------|--------------|----------------------|----------|
| 1 | **Intelligent Receipt Capture** | Instant digitization via camera/upload | Digital evidence storage (HMRC/GoBD) | Core |
| 2 | **Multi-Country VAT Engine** | Automatic rate detection (UK/DE/Nordics) | Accurate tax liability calculation | Core |
| 3 | **AI Merchant Extraction** | Zero manual entry for vendor names | Audit-proof transaction mapping | Core |
| 4 | **Immutable Audit Trail** | Proof of every change for tax inspectors | Anti-fraud & compliance integrity | Core |
| 5 | **Accountant-Ready Exports** | One-click PDF/CSV for tax filing | Standardized reporting formats | Core |
| 6 | **VAT Reclaim Dashboard** | Real-time visibility of money owed back | Cash flow management | Supporting |
| 7 | **Read-Only Accountant Access** | Secure collaboration with professionals | Professional verification | Supporting |
| 8 | **Compliance Deadline Alerts** | Never miss a VAT return date | Penalty avoidance | Supporting |
| 9 | **Category Mapping** | Auto-link expenses to tax categories | Simplified bookkeeping | Supporting |
| 10| **Secure Cloud Vault** | 10-year storage for EU regulations | Legal data retention compliance | Core |

---

## 2. VAT Logic Specification

### UK (United Kingdom)
- **Standard Rate**: 20% (Default for most goods/services)
- **Reduced Rate**: 5% (Energy, child seats, etc.)
- **Zero Rate**: 0% (Books, most food, children's clothes)
- **Logic**: Detect "VAT Number" (9 digits, often prefixed with GB).

### Germany (Deutschland)
- **Standard Rate**: 19% (Regelsatz)
- **Reduced Rate**: 7% (Ermäßigter Satz - food, books, hotel stays)
- **Logic**: Detect "Steuernummer" or "USt-IdNr". Compliance with GoBD required.

### Nordics (SE, DK, FI, NO)
- **Sweden**: 25% / 12% / 6%
- **Denmark**: 25% (Flat rate for most)
- **Norway**: 25% / 15% / 12%
- **Logic**: High-level detection based on currency (SEK, DKK, NOK, EUR) and merchant address.

---

## 3. Data Model (Minimal Entities)

1. **User**: Account details, subscription status, home tax jurisdiction.
2. **Receipt**: Image blob, raw OCR text, upload timestamp.
3. **VAT Record**: Amount, Rate, Country, Currency, Reclaimable status.
4. **Report**: Aggregated records for a specific period (Quarterly/Annual).
5. **Audit Log**: Immutable record of {Timestamp, UserID, Action, OldValue, NewValue}.

---

## 4. System Architecture

- **Frontend**: React (Web) + Capacitor/React Native (Mobile).
- **Backend**: Node.js (Express) on Cloud Run.
- **OCR Pipeline**: Gemini 2.5 Flash for multimodal extraction.
- **VAT Engine**: Rule-based logic layer for country-specific tax laws.
- **Storage**: Cloud Storage (Receipts) + PostgreSQL (Structured Data).
- **Reporting**: PDF generation via specialized worker.

---

## 5. Security & Privacy (VATURA Trust Protocol)

- **Encryption**: AES-256 at rest, TLS 1.3 in transit.
- **Privacy**: GDPR compliant. Data stored in EU-West regions.
- **Retention**: 10-year automated retention (matching German/Nordic laws).
- **Access**: Role-Based Access Control (RBAC) for Users vs. Accountants.

---

## 6. Go-To-Market Execution

### Phase 1: United Kingdom (Month 1-3)
- **Target**: Sole traders & freelancers.
- **Channel**: LinkedIn + UK Accountant Partnerships.
- **Message**: "HMRC-ready expenses in 3 seconds."

### Phase 2: Germany (Month 4-6)
- **Target**: "Selbstständige" (Freelancers).
- **Channel**: DATEV integration ecosystem.
- **Message**: "GoBD-konforme Belege ohne Stress."

### Phase 3: Nordics (Month 7-9)
- **Target**: Tech-savvy consultants.
- **Channel**: Digital nomad communities.
- **Message**: "The simplest cross-border VAT tracker."
`;

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'concierge' | 'reports' | 'settings' | 'chatbot'>('dashboard');
  const [user, setUser] = useState<{ id: string, email: string, country: string } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [activeSettingsTab, setActiveSettingsTab] = useState<'main' | 'security' | 'subscription' | 'jurisdiction'>('main');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newExpenseData, setNewExpenseData] = useState({ merchant: '', amount: '', country: 'UK', currency: 'GBP', date: new Date().toISOString().split('T')[0] });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [extractedReview, setExtractedReview] = useState<{ original?: string, translated?: string } | null>(null);
  
  // New States for OS Features
  const [language, setLanguage] = useState<Language>('EN');
  const [activeRegion, setActiveRegion] = useState(REGIONS[0].id);
  const [activeCountry, setActiveCountry] = useState('UK');
  const [conciergeMessages, setConciergeMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Hello! I'm your Vatify Concierge. How can I help you with your cross-border tax compliance today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalData, setEvalData] = useState({ amount: '', country: 'UK' });
  const [evalResult, setEvalResult] = useState<{ vat: number, total: number } | null>(null);

  // AI feature states
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [insightsText, setInsightsText] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsProcessing(true);
    try {
      const { email, password } = authData;
      if (!email || !password) { setAuthError('Email and password required.'); setIsProcessing(false); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setAuthError('Enter a valid email address.'); setIsProcessing(false); return; }
      if (password.length < 4) { setAuthError('Password must be at least 4 characters.'); setIsProcessing(false); return; }

      const usersKey = 'vatify_users';
      const users: Record<string, { id: string; email: string; passwordHash: string; country: string }> = JSON.parse(localStorage.getItem(usersKey) || '{}');

      if (authMode === 'signup') {
        if (users[email]) { setAuthError('Account already exists. Please sign in.'); setIsProcessing(false); return; }
        const newUser = { id: btoa(email).replace(/=/g, ''), email, passwordHash: btoa(password), country: 'UK' };
        users[email] = newUser;
        localStorage.setItem(usersKey, JSON.stringify(users));
        setUser({ id: newUser.id, email: newUser.email, country: newUser.country });
      } else {
        const found = users[email];
        if (!found || found.passwordHash !== btoa(password)) { setAuthError('Invalid email or password.'); setIsProcessing(false); return; }
        setUser({ id: found.id, email: found.email, country: found.country });
      }
    } catch (err) {
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'settings') {
      setActiveSettingsTab('main');
    }
  }, [activeTab]);

  // Proactive Concierge on Country Change
  useEffect(() => {
    const countryName = VAT_RATES[activeCountry].country;
    const welcomeMsg = `Welcome to **${countryName}**! I've updated your active jurisdiction. The standard VAT rate here is ${VAT_RATES[activeCountry].rates[0].value}%. Would you like to know about local reclaim rules?`;
    
    setConciergeMessages(prev => [
      ...prev, 
      { role: 'ai', text: welcomeMsg }
    ]);
    
    // Auto-switch currency
    setNewExpenseData(prev => ({
      ...prev,
      country: activeCountry,
      currency: VAT_RATES[activeCountry].currency
    }));
    
    // Update language if it matches country
    const countryLang = VAT_RATES[activeCountry].language;
    if (countryLang) setLanguage(countryLang);

  }, [activeCountry]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (!supportedTypes.includes(file.type) && !file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic|heif)$/)) {
      alert('Unsupported file format. Please upload a JPEG, PNG, WebP, or HEIC image.');
      return;
    }

    setSelectedFile(file);
    
    // Start AI Extraction (Groq vision via /api/ai/extract-receipt)
    setIsProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      let mimeType = file.type;
      if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
      if (!mimeType || mimeType === 'application/octet-stream') {
        if (file.name.toLowerCase().endsWith('.heic')) mimeType = 'image/heic';
        else mimeType = 'image/jpeg';
      }

      const r = await fetch('/api/ai/extract-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || `Request failed (${r.status})`);
      }
      const result = await r.json();

      setNewExpenseData({
        merchant: result.merchant_name || result.merchant || '',
        amount: result.total_amount?.toString() || result.amount?.toString() || '',
        currency: result.currency || VAT_RATES[activeCountry].currency,
        date: result.date || new Date().toISOString().split('T')[0],
        country: activeCountry
      });
      setExtractedReview({
        original: result.original_description,
        translated: result.translated_description
      });
      setIsReviewing(true);
    } catch (err: any) {
      console.error('AI Extraction failed', err);
      alert(`AI Extraction failed: ${err.message || 'Unknown error'}.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const fetchExpenses = async () => {
    if (!user) return;
    try {
      const stored = localStorage.getItem(`vatify_expenses_${user.id}`);
      setExpenses(stored ? JSON.parse(stored) : []);
    } catch (err) {
      console.error('Failed to load expenses', err);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const amount = parseFloat(newExpenseData.amount);
    const vatRateData = VAT_RATES[newExpenseData.country]?.rates[0] || { value: 0 };
    const vatAmount = amount * (vatRateData.value / 100);

    // Duplicate check
    try {
      const dupRes = await fetch('/api/ai/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate: { merchant: newExpenseData.merchant, amount, date: newExpenseData.date, currency: newExpenseData.currency },
          existing: expenses,
        }),
      });
      if (dupRes.ok) {
        const dup = await dupRes.json();
        if (dup.duplicate) {
          const proceed = confirm(`Possible duplicate detected: ${dup.matches?.[0]?.reason || 'Similar expense exists.'}\n\nSave anyway?`);
          if (!proceed) { setIsProcessing(false); return; }
        }
      }
    } catch {}

    // Auto-categorize
    let category = 'Uncategorized';
    try {
      const catRes = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchant: newExpenseData.merchant, description: extractedReview?.translated || extractedReview?.original }),
      });
      if (catRes.ok) {
        const c = await catRes.json();
        if (c.category) category = c.category;
      }
    } catch {}

    const newExpense: Omit<Expense, 'id' | 'userId' | 'status' | 'auditTrail' | 'date' | 'category' | 'vatRate'> & { vatRate: number, date: string } = {
      merchant: newExpenseData.merchant,
      amount: amount,
      country: newExpenseData.country,
      currency: newExpenseData.currency,
      vatAmount: vatAmount,
      vatRate: vatRateData.value,
      date: newExpenseData.date
    };

    try {
      const expenseToSave = {
        ...newExpense,
        id: Math.random().toString(36).substr(2, 9),
        userId: user?.id,
        category,
        status: 'verified',
        auditTrail: [{
          timestamp: new Date().toISOString(),
          action: 'CREATED',
          user: user?.id,
          details: selectedFile ? 'AI-extracted from receipt' : 'Manually created expense'
        }]
      };
      const stored = localStorage.getItem(`vatify_expenses_${user?.id}`);
      const current = stored ? JSON.parse(stored) : [];
      current.push(expenseToSave);
      localStorage.setItem(`vatify_expenses_${user?.id}`, JSON.stringify(current));
      fetchExpenses();
      setIsModalOpen(false);
      setIsReviewing(false);
      setNewExpenseData({ merchant: '', amount: '', country: 'UK', currency: 'GBP', date: new Date().toISOString().split('T')[0] });
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to save expense', err);
      alert('Failed to save expense.');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const stored = localStorage.getItem(`vatify_expenses_${user?.id}`);
      const current = stored ? JSON.parse(stored) : [];
      const updated = current.filter((e: any) => e.id !== id);
      localStorage.setItem(`vatify_expenses_${user?.id}`, JSON.stringify(updated));
      fetchExpenses();
    } catch (err) {
      console.error('Failed to delete expense', err);
      alert('Connection error. Failed to delete expense.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Currency', 'VAT Amount', 'VAT Rate', 'Country', 'Status'];
    const rows = expenses.map(e => [
      e.date,
      e.merchant,
      e.category,
      e.amount,
      e.currency,
      e.vatAmount,
      e.vatRate,
      e.country,
      e.status
    ]);
    
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vatify_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDeadlines = () => {
    const today = new Date();
    const country = expenses[0]?.country || 'UK';
    
    if (country === 'UK') {
      return [
        { label: 'Q1 VAT Return', date: '2026-05-07', urgency: 'high' },
        { label: 'Corporation Tax', date: '2026-12-31', urgency: 'low' }
      ];
    }
    return [
      { label: 'Umsatzsteuer-Voranmeldung', date: '2026-04-10', urgency: 'high' },
      { label: 'Gewerbesteuer', date: '2026-05-15', urgency: 'low' }
    ];
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const countryName = VAT_RATES[activeCountry].country;
    const currency = VAT_RATES[activeCountry].currency;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(107, 31, 43); // Maroon
    doc.text('VATIFY OS - TAX REPORT', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(195, 163, 94); // Gold
    doc.text(`Issuer: Harvics Global Ventures`, 14, 30);
    doc.text(`Jurisdiction: ${countryName}`, 14, 35);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 40);

    // Summary Stats
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Financial Summary', 14, 55);
    
    const summaryData = [
      ['Total Expenses', `${currency} ${totalExpenses.toFixed(2)}`],
      ['Total VAT Reclaimable', `${currency} ${totalVat.toFixed(2)}`],
      ['Transaction Count', expenses.length.toString()]
    ];

    (doc as any).autoTable({
      startY: 60,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [107, 31, 43] }
    });

    // Transaction Details
    doc.text('Transaction Details', 14, (doc as any).lastAutoTable.finalY + 15);

    const tableData = expenses.map(e => [
      e.date,
      e.merchant,
      e.category,
      `${e.currency} ${e.amount.toFixed(2)}`,
      `${e.currency} ${e.vatAmount.toFixed(2)}`,
      `${e.vatRate}%`
    ]);

    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Date', 'Merchant', 'Category', 'Amount', 'VAT', 'Rate']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [107, 31, 43] },
      styles: { fontSize: 8 }
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${pageCount} - Vatify OS Beta`, 14, doc.internal.pageSize.height - 10);
    }

    doc.save(`vatify_report_${activeCountry}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalVat = expenses.reduce((acc, curr) => acc + curr.vatAmount, 0);

  const handleConciergeChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setConciergeMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setIsProcessing(true);
    try {
      const system = `You are the Vatify Concierge, a tax expert for freelancers in Europe. The user is currently in ${activeCountry} (Region: ${activeRegion}). Answer their question about VAT, compliance, or expenses. If they ask for professional help, mention our "Expert Opinion" paid service.`;
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, system }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error || `Request failed (${r.status})`);
      }
      const { text } = await r.json();
      setConciergeMessages(prev => [...prev, { role: 'ai', text: text || "I'm sorry, I couldn't process that." }]);
    } catch (err: any) {
      console.error('Concierge failed', err);
      setConciergeMessages(prev => [...prev, { role: 'ai', text: `Error: ${err.message || 'Failed to connect to AI'}.` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEvaluate = () => {
    const amount = parseFloat(evalData.amount);
    if (isNaN(amount)) return;
    const rate = VAT_RATES[evalData.country]?.rates[0]?.value || 0;
    const vat = amount * (rate / 100);
    setEvalResult({ vat, total: amount + vat });
  };

  const handleGenerateInsights = async () => {
    setInsightsOpen(true);
    setInsightsLoading(true);
    setInsightsText('');
    try {
      const r = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenses,
          country: activeCountry,
          period: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        }),
      });
      const d = await r.json();
      setInsightsText(d.text || d.error || 'No insights available.');
    } catch (err: any) {
      setInsightsText(`Error: ${err.message}`);
    } finally {
      setInsightsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          try {
            const r = await fetch('/api/ai/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audioBase64: reader.result, mimeType: 'audio/webm' }),
            });
            const d = await r.json();
            if (d.text) setChatInput(prev => (prev ? prev + ' ' : '') + d.text);
          } catch (err) { console.error('Transcribe failed', err); }
        };
        reader.readAsDataURL(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch (err: any) {
      alert('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-brand-paper text-brand-maroon font-sans selection:bg-brand-gold selection:text-white pb-24">
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div 
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6"
          >
            <div className="w-full max-w-sm space-y-8">
              <div className="text-center space-y-4">
                <motion.div 
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="w-16 h-16 bg-brand-maroon rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-brand-maroon/20"
                >
                  <span className="text-brand-gold font-serif font-medium text-3xl">H</span>
                </motion.div>
                <div>
                  <h2 className="text-2xl font-serif font-medium tracking-tight uppercase">Vatify OS</h2>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mt-1">Harvics Global Ventures</p>
                </div>
              </div>

              <Card variant="glass" className="space-y-6">
                <form onSubmit={handleAuth} className="space-y-4">
                  <Input 
                    label="Email Address"
                    type="email" 
                    required
                    value={authData.email}
                    onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="name@example.com"
                  />
                  <Input 
                    label="Password"
                    type="password" 
                    required
                    value={authData.password}
                    onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                  />

                  {authError && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-start gap-3"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] font-medium text-red-600 leading-tight uppercase tracking-wider">{authError}</p>
                    </motion.div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full"
                    isLoading={isProcessing}
                  >
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </Button>
                </form>

                <div className="text-center">
                  <button 
                    onClick={() => {
                      setAuthMode(authMode === 'login' ? 'signup' : 'login');
                      setAuthError('');
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-maroon transition-colors"
                  >
                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </div>
              </Card>

              <div className="text-center">
                <p className="text-[9px] font-medium uppercase tracking-widest text-brand-maroon/40">
                  Securely encrypted by Vatify Trust Protocol
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen"
          >
            {/* Main Content */}
            <main className="min-h-screen">
        <header className="h-20 bg-brand-paper flex items-center justify-between px-8 sticky top-0 z-50 border-b border-brand-gold/5">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: -5 }}
              className="w-10 h-10 bg-brand-maroon rounded-xl flex items-center justify-center shadow-lg shadow-brand-maroon/5"
            >
              <span className="text-brand-gold font-serif font-medium text-xl">H</span>
            </motion.div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-serif font-medium tracking-tight uppercase leading-none">Vatify OS</h1>
                  <Badge variant="primary" className="text-[7px] px-1.5 py-0.5">Beta</Badge>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-brand-gold mt-1">Harvics Global Ventures</p>
              </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-brand-paper px-3 py-2 rounded-full border border-brand-gold/20 shadow-inner">
              <Languages size={14} className="text-brand-gold" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-[10px] font-bold outline-none cursor-pointer text-brand-maroon"
              >
                <option value="EN">EN</option>
                <option value="DE">DE</option>
                <option value="PL">PL</option>
                <option value="SE">SE</option>
                <option value="FR">FR</option>
              </select>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="w-12 h-12 rounded-full p-0"
            >
              <Plus size={24} />
            </Button>
          </div>
        </header>

        <div className="p-6 max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                {/* Stats Grid - Hero Style */}
                <div className="grid grid-cols-1 gap-4">
                  <StatCard 
                    label={t.vatReclaimable} 
                    value={`${VAT_RATES[activeCountry].currency} ${totalVat.toFixed(2)}`} 
                    subtext="+12% VS LAST MONTH" 
                    highlight
                    icon={<TrendingUp />}
                  />
                  <StatCard 
                    label={t.expenses} 
                    value={`${VAT_RATES[activeCountry].currency} ${totalExpenses.toFixed(2)}`} 
                    subtext="24 TRANSACTIONS" 
                    icon={<Receipt />}
                  />
                </div>

                {/* Quick Actions - List Card Style */}
                <div className="px-2 space-y-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-6 flex items-center gap-3">
                    <LayoutDashboard size={18} />
                    Quick Actions
                  </h3>
                  <ListCard 
                    icon={<Camera />} 
                    label={t.scanReceipt} 
                    sublabel="Instant AI extraction"
                    onClick={() => setIsModalOpen(true)}
                  />
                  <ListCard 
                    icon={<Calculator />} 
                    label={t.evaluateTax} 
                    sublabel="Manual VAT calculation"
                    onClick={() => setIsEvaluating(true)}
                  />
                  <ListCard 
                    icon={<Globe />} 
                    label={t.taxJurisdiction} 
                    sublabel={VAT_RATES[activeCountry].country}
                    onClick={() => setActiveTab('settings')}
                  />
                  <ListCard
                    icon={<PieChart />}
                    label="AI Insights"
                    sublabel="Monthly summary & recommendations"
                    onClick={handleGenerateInsights}
                  />
                </div>

                {/* Compliance Timeline - Naked Style */}
                <div className="px-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-10 flex items-center gap-3">
                    <Zap size={18} />
                    {t.upcomingDeadlines}
                  </h3>
                  <div className="space-y-4">
                    {getDeadlines().map((deadline, i) => (
                      <ListCard
                        key={i}
                        icon={<Zap />}
                        label={deadline.label}
                        sublabel={deadline.date}
                        rightElement={
                          <Badge 
                            variant={deadline.urgency === 'high' ? 'primary' : 'secondary'}
                            className="mr-2"
                          >
                            {deadline.urgency}
                          </Badge>
                        }
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'expenses' && (
              <motion.div 
                key="expenses"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-grow flex items-center gap-3 bg-white/30 p-4 rounded-2xl border border-brand-gold/20">
                    <Search size={20} className="text-brand-gold ml-2" />
                    <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
                  </div>
                  <Button 
                    variant="outline"
                    onClick={exportToCSV}
                    className="p-4 h-auto rounded-2xl"
                    title="Export to CSV"
                  >
                    <Download size={24} />
                  </Button>
                </div>
                <div className="space-y-4">
                  {expenses.map((expense) => (
                    <ListCard
                      key={expense.id}
                      icon={<Receipt />}
                      label={expense.merchant}
                      sublabel={expense.date}
                      rightElement={
                        <div className="text-right mr-2">
                          <p className="font-serif font-medium text-lg tracking-tight text-brand-maroon">{expense.currency} {expense.amount.toFixed(2)}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">+{expense.currency} {expense.vatAmount.toFixed(2)} VAT</p>
                        </div>
                      }
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'concierge' && (
              <motion.div 
                key="concierge"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col h-[calc(100vh-220px)]"
              >
                <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                  {conciergeMessages.length === 0 && (
                    <div className="space-y-4 py-4 px-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-6 flex items-center gap-3">
                        <MessageSquare size={18} />
                        Concierge Services
                      </h3>
                      <ListCard 
                        icon={<UserCheck />} 
                        label="Request Expert Opinion" 
                        sublabel="Connect with a tax professional"
                        onClick={() => setChatInput("I need an expert opinion on my VAT reclaim.")}
                      />
                      <ListCard 
                        icon={<BookOpen />} 
                        label="VAT Knowledge Base" 
                        sublabel="Browse tax regulations"
                        onClick={() => setChatInput("Tell me about VAT regulations in " + VAT_RATES[activeCountry].country)}
                      />
                      <ListCard 
                        icon={<ShieldCheck />} 
                        label="Compliance Check" 
                        sublabel="Verify your scan history"
                        onClick={() => setChatInput("Run a compliance check on my recent expenses.")}
                      />
                    </div>
                  )}
                  {conciergeMessages.map((msg, i) => (
                    <div key={i} className={cn(
                      "max-w-[85%] p-6 rounded-[2rem] text-sm font-medium leading-relaxed",
                      msg.role === 'ai' 
                        ? "bg-white/50 border border-brand-gold/10 self-start rounded-tl-none" 
                        : "bg-brand-maroon text-white self-end ml-auto rounded-tr-none shadow-xl shadow-brand-maroon/10"
                    )}>
                      <div className="prose-maroon text-inherit text-xs leading-relaxed">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                      {msg.role === 'ai' && msg.text.includes('Expert Opinion') && (
                        <Button 
                          variant="secondary"
                          className="mt-4 w-full"
                        >
                          <UserCheck size={14} className="mr-2" />
                          Request Expert Opinion (€49)
                        </Button>
                      )}
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="bg-white/50 border border-brand-gold/10 p-6 rounded-[2rem] self-start rounded-tl-none flex gap-2">
                      <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleConciergeChat()}
                    placeholder="Ask about VAT, travel, or experts..."
                    className="w-full bg-white/50 border border-brand-gold/20 rounded-2xl px-6 py-5 pr-28 text-sm font-medium outline-none focus:border-brand-maroon shadow-inner"
                  />
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    title={isRecording ? 'Stop recording' : 'Voice input'}
                    className={cn(
                      "absolute right-16 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-lg",
                      isRecording
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-white/70 text-brand-maroon hover:bg-white border border-brand-gold/20"
                    )}
                  >
                    <Bot size={18} />
                  </button>
                  <button 
                    onClick={handleConciergeChat}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-brand-maroon text-white rounded-xl flex items-center justify-center hover:bg-brand-maroon/90 transition-colors shadow-lg shadow-brand-maroon/10"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'chatbot' && (
              <motion.div 
                key="chatbot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-6 flex items-center gap-3">
                  <Bot size={18} />
                  AI Chatbot
                </h3>
                <Chatbot />
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div 
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="px-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-6 flex items-center gap-3">
                    <PieChart size={18} />
                    {t.reports}
                  </h3>
                  <div className="space-y-4">
                    <ListCard 
                      icon={<Download />} 
                      label="Export CSV History" 
                      sublabel="Full transaction log"
                      onClick={exportToCSV}
                    />
                    <ListCard 
                      icon={<FileText />} 
                      label="Generate PDF Report" 
                      sublabel="Official tax document"
                      onClick={generatePDFReport}
                    />
                    <ListCard 
                      icon={<TrendingUp />} 
                      label="VAT Analytics" 
                      sublabel="Monthly growth insights"
                    />
                  </div>
                </div>

                <div className="px-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-6">{t.upcomingDeadlines}</h4>
                  <div className="space-y-4">
                    {getDeadlines().map((deadline, i) => (
                      <ListCard
                        key={i}
                        icon={<Zap />}
                        label={deadline.label}
                        sublabel={deadline.date}
                        rightElement={
                          <Badge 
                            variant={deadline.urgency === 'high' ? 'primary' : 'secondary'}
                            className="mr-2"
                          >
                            {deadline.urgency}
                          </Badge>
                        }
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="px-2">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mb-6 flex items-center gap-3">
                    <Settings size={18} />
                    {t.settings}
                  </h3>
                  
                  <div className="space-y-4">
                    {activeSettingsTab === 'main' && (
                      <>
                        <ListCard 
                          icon={<Globe />} 
                          label={t.taxJurisdiction} 
                          sublabel="Update region & rates"
                          onClick={() => setActiveSettingsTab('jurisdiction')}
                        />
                        <ListCard 
                          icon={<ShieldCheck />} 
                          label={t.securityPrivacy} 
                          sublabel="Encryption & data"
                          onClick={() => setActiveSettingsTab('security')}
                        />
                        <ListCard 
                          icon={<Zap />} 
                          label={t.subscriptionDetails} 
                          sublabel="Plan & billing"
                          onClick={() => setActiveSettingsTab('subscription')}
                        />
                        <ListCard 
                          icon={<BookOpen />} 
                          label="Compliance Library" 
                          sublabel="Legal documentation"
                        />
                        <div className="pt-4">
                          <ListCard 
                            icon={<LogOut />} 
                            label="Sign Out" 
                            sublabel="End current session"
                            onClick={() => setUser(null)}
                            className="text-brand-maroon"
                          />
                        </div>
                      </>
                    )}

                    {activeSettingsTab !== 'main' && (
                      <button 
                        onClick={() => setActiveSettingsTab('main')}
                        className="flex items-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-widest text-brand-gold hover:text-brand-maroon transition-colors"
                      >
                        <ChevronLeft size={14} />
                        Back to Settings
                      </button>
                    )}

                    {activeSettingsTab === 'security' && (
                      <div className="space-y-4">
                        <ListCard icon={<ShieldCheck />} label="Data Retention" sublabel="Stored for 10 years" />
                        <ListCard icon={<Lock />} label="Encryption" sublabel="AES-256 at rest" />
                        <ListCard icon={<CheckCircle />} label="GDPR Status" sublabel="Compliant (EU-West-1)" />
                      </div>
                    )}

                    {activeSettingsTab === 'subscription' && (
                      <div className="space-y-4">
                        <Card className="bg-brand-maroon text-white border-none shadow-xl shadow-brand-maroon/20 mb-6">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Current Plan</p>
                          <div className="flex justify-between items-end mt-2">
                            <p className="text-xl font-serif font-medium tracking-tight">Pro Monthly</p>
                            <p className="text-2xl font-serif font-medium tracking-tight">€12.00</p>
                          </div>
                        </Card>
                        <ListCard icon={<Calendar />} label="Next Billing" sublabel="April 15, 2026" />
                        <ListCard icon={<TrendingUp />} label="Usage Limits" sublabel="42 / 500 AI Scans" />
                      </div>
                    )}

                    {activeSettingsTab === 'jurisdiction' && (
                      <div className="space-y-6">
                        <div className="space-y-3 px-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold ml-1">{t.changeRegion}</label>
                          <select 
                            value={activeRegion}
                            onChange={(e) => {
                              setActiveRegion(e.target.value);
                              const firstCountry = REGIONS.find(r => r.id === e.target.value)?.countries[0] || 'UK';
                              setActiveCountry(firstCountry);
                            }}
                            className="w-full bg-white/50 border border-brand-gold/15 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-brand-maroon appearance-none transition-all"
                          >
                            {REGIONS.map(r => (
                              <option key={r.id} value={r.id}>{r.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-3 px-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold ml-1">{t.changeCountry}</label>
                          <select 
                            value={activeCountry}
                            onChange={(e) => setActiveCountry(e.target.value)}
                            className="w-full bg-white/50 border border-brand-gold/15 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-brand-maroon appearance-none transition-all"
                          >
                            {REGIONS.find(r => r.id === activeRegion)?.countries.map(c => (
                              <option key={c} value={c}>{VAT_RATES[c].country}</option>
                            ))}
                          </select>
                        </div>
                        <ListCard icon={<Globe />} label="Active VAT Rate" sublabel={VAT_RATES[activeCountry].rates[0].label} />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </motion.div>
    )}
    </AnimatePresence>

    {/* Bottom Nav - Sleek Floating Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-lg z-30">
        <nav className="bg-brand-paper/80 backdrop-blur-lg border border-brand-gold/10 rounded-3xl px-5 py-3 flex items-center justify-between shadow-2xl shadow-brand-maroon/10">
          {[
            { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard size={20} /> },
            { id: 'expenses', label: t.expenses, icon: <Receipt size={20} /> },
            { id: 'concierge', label: t.concierge, icon: <MessageSquare size={20} /> },
            { id: 'chatbot', label: 'Chatbot', icon: <Bot size={20} /> },
            { id: 'reports', label: t.reports, icon: <PieChart size={20} /> },
            { id: 'settings', label: t.settings, icon: <Settings size={20} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "relative flex flex-col items-center justify-center transition-all duration-300",
                activeTab === tab.id ? "text-brand-maroon" : "text-brand-maroon/30 hover:text-brand-maroon/60"
              )}
            >
              <motion.div 
                animate={activeTab === tab.id ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                className={cn(
                  "relative z-10 flex items-center justify-center w-10 h-10 rounded-2xl transition-all",
                  activeTab === tab.id 
                    ? "bg-brand-maroon text-brand-gold shadow-lg shadow-brand-maroon/20" 
                    : "bg-transparent"
                )}
              >
                {tab.icon}
              </motion.div>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-1 h-1 bg-brand-gold rounded-full"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Manual Evaluation Modal */}
      <Modal
        isOpen={isEvaluating}
        onClose={() => setIsEvaluating(false)}
        title="Pre-Arrival Evaluation"
        description="Calculate tax impact before spending."
      >
        <div className="space-y-6">
          <Input 
            label="Amount (Net)"
            type="number" 
            value={evalData.amount}
            onChange={(e) => setEvalData({...evalData, amount: e.target.value})}
            placeholder="0.00"
          />
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold ml-1">Target Country</label>
            <select 
              value={evalData.country}
              onChange={(e) => setEvalData({...evalData, country: e.target.value})}
              className="w-full bg-white/50 border border-brand-gold/20 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-brand-maroon transition-all"
            >
              {Object.keys(VAT_RATES).map(code => (
                <option key={code} value={code}>{VAT_RATES[code].country}</option>
              ))}
            </select>
          </div>
          
          <Button 
            onClick={handleEvaluate}
            className="w-full"
          >
            <Calculator size={20} className="mr-2" />
            Calculate Impact
          </Button>

          {evalResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-brand-paper/50 rounded-2xl border border-brand-gold/10 space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">Reclaimable VAT</span>
                <span className="text-lg font-serif font-medium text-emerald-600">€{evalResult.vat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t border-brand-gold/10 pt-3">
                <span className="text-[10px] font-bold text-brand-gold uppercase tracking-widest">Total Gross</span>
                <span className="text-lg font-serif font-medium">€{evalResult.total.toFixed(2)}</span>
              </div>
            </motion.div>
          )}
        </div>
      </Modal>

      {/* AI Insights Modal */}
      <Modal
        isOpen={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        title="AI Insights"
        description="Monthly summary powered by Groq."
      >
        <div className="min-h-[200px]">
          {insightsLoading ? (
            <div className="flex items-center justify-center py-8 gap-2">
              <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-brand-gold rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          ) : (
            <div className="prose-maroon text-sm leading-relaxed text-brand-maroon">
              <ReactMarkdown>{insightsText}</ReactMarkdown>
            </div>
          )}
        </div>
      </Modal>

      {/* New Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIsReviewing(false);
        }}
        title={isReviewing ? 'Review AI Extraction' : 'Add New Expense'}
        description={isReviewing ? 'Verify the details extracted by AI.' : 'Upload a receipt for automatic VAT extraction.'}
      >
        {!isReviewing && (
          <div className="mb-8">
            <label className="block w-full cursor-pointer group">
              <motion.div 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="border-2 border-dashed border-brand-gold/30 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 group-hover:border-brand-maroon transition-colors bg-brand-paper/30"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Camera className="text-brand-maroon" size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Tap to Scan Receipt</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gold mt-1">Supports JPEG, PNG, WebP, HEIC</p>
                </div>
                <input 
                  type="file" 
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif" 
                  capture="environment"
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </motion.div>
            </label>
          </div>
        )}

        <form onSubmit={handleAddExpense} className="space-y-6">
          {isReviewing && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="text-emerald-600" size={20} />
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">{t.aiExtractionSuccess}</p>
              </div>
              
              {extractedReview && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-brand-paper/50 rounded-2xl border border-brand-gold/10">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gold mb-1">{t.originalText}</p>
                    <p className="text-[10px] italic font-serif">"{extractedReview.original || '...'}"</p>
                  </div>
                  <div className="p-4 bg-brand-paper/50 rounded-2xl border border-brand-gold/10">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-brand-gold mb-1">{t.translatedText}</p>
                    <p className="text-[10px] font-semibold">"{extractedReview.translated || '...'}"</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <Input 
            label={t.merchant}
            type="text" 
            required
            value={newExpenseData.merchant}
            onChange={(e) => setNewExpenseData({...newExpenseData, merchant: e.target.value})}
            placeholder="e.g. Amazon, Starbucks"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label={t.amount}
              type="number" 
              step="0.01"
              required
              value={newExpenseData.amount}
              onChange={(e) => setNewExpenseData({...newExpenseData, amount: e.target.value})}
              placeholder="0.00"
            />
            <Input 
              label={t.date}
              type="date" 
              required
              value={newExpenseData.date}
              onChange={(e) => setNewExpenseData({...newExpenseData, date: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold ml-1">{t.country}</label>
              <select 
                value={newExpenseData.country}
                onChange={(e) => setNewExpenseData({...newExpenseData, country: e.target.value})}
                className="w-full bg-white/50 border border-brand-gold/20 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-brand-maroon transition-all"
              >
                {Object.keys(VAT_RATES).map(code => (
                  <option key={code} value={code}>{VAT_RATES[code].country}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-gold ml-1">{t.currency}</label>
              <select 
                value={newExpenseData.currency}
                onChange={(e) => setNewExpenseData({...newExpenseData, currency: e.target.value})}
                className="w-full bg-white/50 border border-brand-gold/20 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-brand-maroon transition-all"
              >
                <option>GBP</option>
                <option>EUR</option>
                <option>SEK</option>
                <option>PLN</option>
              </select>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            isLoading={isProcessing}
          >
            {isReviewing ? t.confirmSave : t.saveExpense}
          </Button>
          {isReviewing && (
            <button 
              type="button"
              onClick={() => setIsReviewing(false)}
              className="w-full text-brand-maroon text-[10px] font-bold uppercase tracking-widest py-2"
            >
              Cancel Review
            </button>
          )}
        </form>
      </Modal>

      <style>{`
        .prose-maroon h1, .prose-maroon h2, .prose-maroon h3 { color: #6B1F2B; font-family: 'Cormorant Garamond', serif; }
        .prose-maroon strong { color: #6B1F2B; }
        .prose-maroon table { border-color: #C3A35E33; }
        .prose-maroon th { background-color: #F5F1E8; color: #6B1F2B; }
        .prose-maroon a { color: #C3A35E; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
    </ErrorBoundary>
  );
}
