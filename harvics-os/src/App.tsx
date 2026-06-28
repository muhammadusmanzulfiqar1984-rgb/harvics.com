import { LogisticsMap } from './components/LogisticsMap';
import React, { useState, useEffect, useMemo, useRef, Component, ReactNode, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { 
  ShieldCheck, 
  Globe, 
  Zap, 
  BarChart3, 
  Truck, 
  FileText, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  Mic2,
  Activity,
  ArrowUpRight,
  RefreshCw,
  Target,
  Search,
  Terminal,
  ChevronRight,
  Plus,
  Camera,
  Bell,
  Info,
  LogOut,
  LogIn,
  Languages,
  X,
  Download,
  Loader2,
  Keyboard,
  Mic,
  TrendingUp,
  Cpu,
  DollarSign,
  CheckCircle,
  Shield,
  AlertTriangle,
  Lock,
  Key,
  Fingerprint,
  ScanFace,
  Database,
  Users,
  BrainCircuit,
  Music,
  Scan,
  LayoutGrid,
  Wallet,
  Compass,
  Bot,
  PieChart,
  Settings,
  Home,
  Ship,
  Diamond
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Brush,
  Legend,
  Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import './i18n';
import Fuse from 'fuse.js';
import ChatBot from './components/ChatBot';
import { AddShipmentModal } from './components/AddShipmentModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInAnonymously,
  signOut,
  onAuthStateChanged, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc,
  addDoc,
  updateDoc,
  query, 
  orderBy, 
  limit,
  where,
  Timestamp,
  serverTimestamp,
  handleFirestoreError,
  OperationType,
  User
} from './firebase';

// --- Data ---
const initialHsData = [
  { code: '0901.21.0000', product: 'Coffee, roasted', duty: '0% GAFTA', status: 'Green', category: 'Food & Beverage' },
  { code: '1901.20.0000', product: 'Baking mixes', duty: '5% UAE', status: 'Green', category: 'Food & Beverage' },
  { code: '2106.90.9900', product: 'Food preparations', duty: '15% KSA', status: 'Review', category: 'Food & Beverage' },
  { code: '1806.20.0000', product: 'Chocolate FMCG', duty: '0% GAFTA', status: 'Green', category: 'Confectionery' },
  { code: '8471.30.0000', product: 'Portable Computers', duty: '0% ITA', status: 'Green', category: 'Electronics' },
  { code: '8517.13.0000', product: 'Smartphones', duty: '0% ITA', status: 'Review', category: 'Electronics' },
];

const initialSettlements = [
  { type: 'LC', name: 'Pret A Manger Supply Chain', amount: '184,000', status: 'Ready', color: 'text-emerald-600' },
  { type: 'TT', name: 'Al Raha Distribution UAE', amount: '340,000', status: 'Settled', color: 'text-emerald-600' },
  { type: 'USDT Rail', name: 'Agritalia Italy', amount: '92,000', status: 'Active', color: 'text-blue-600' },
  { type: '3-Way Match', name: "Sainsbury's Supplier", amount: '67,200', status: 'Matching', color: 'text-amber-600' },
];

const initialShipments = [
  { name: 'MSC AMALFI', route: 'Genoa, IT → Jebel Ali, AE', status: 'Green', details: 'Coffee, roasted [HS 0901.21.00.1234]', isGoverned: true, eta: new Date('2026-03-28T14:00:00') },
  { name: 'MAERSK ALPHA', route: 'London, UK → Dammam, SA', status: 'Green', details: 'Smartphones [HS 8517.13.00.5678]', isGoverned: true, eta: new Date('2026-03-29T10:30:00') },
  { name: 'CMA CGM MARCO POLO', route: 'Marseille, FR → Salalah, OM', status: 'Correcting', details: 'Food preparations [HS 2106.90.00.9012]', isGoverned: false, eta: new Date('2026-03-30T08:15:00') },
  { name: 'EVER GIVEN', route: 'Rotterdam, NL → Abu Dhabi, AE', status: 'Green', details: 'Baking mixes [HS 1901.20.00.3456]', isGoverned: true, eta: new Date('2026-03-27T22:00:00') },
];

// --- Components ---

const LoginPage = memo(({ onSignIn, onAnonymousSignIn, languages, onLanguageChange, isLoading }: { 
  onSignIn: () => void, 
  onAnonymousSignIn: () => void,
  languages: { code: string, label: string }[],
  onLanguageChange: (lng: string) => void,
  isLoading: boolean
}) => {
  const { t, i18n } = useTranslation();
  
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#F5F5F0] dot-grid overflow-hidden selection:bg-harvics-maroon selection:text-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md bg-white rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-black/5 overflow-hidden p-12 flex flex-col items-center"
      >
        {/* Data Seed Overlay */}
        <div className="absolute top-6 right-6 font-mono text-[9px] tracking-widest text-harvics-maroon/30 uppercase pointer-events-none">
          Session ID: HV-AUTH-992-LHR
        </div>

        {/* Top-Left Anchor (Logo) */}
        <div className="absolute top-8 left-8">
          <Shield className="w-6 h-6 text-harvics-maroon fill-harvics-maroon/5" />
        </div>

        {/* Centerpiece (Neural Core) */}
        <div className="relative mb-12 mt-4">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-32 h-32 rounded-full neural-core flex items-center justify-center relative z-10"
          >
            <div className="w-16 h-16 rounded-full bg-harvics-maroon/5 border border-harvics-maroon/20 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-harvics-maroon/10 border border-harvics-maroon/40" />
            </div>
            
            {/* Orbiting bits */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ rotate: 360 }}
                transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-harvics-gold shadow-[0_0_8px_rgba(198,165,90,0.6)]"
                  style={{ transform: `translateY(${10 + i * 10}px)` }}
                />
              </motion.div>
            ))}
          </motion.div>
          
          {/* Outer glow rings */}
          <div className="absolute inset-0 -m-4 border border-harvics-gold/10 rounded-full animate-pulse" />
          <div className="absolute inset-0 -m-8 border border-harvics-gold/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content Stack */}
        <div className="text-center space-y-6 w-full">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-harvics-maroon/60">
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">HARVICS</span>
              <span className="text-sm leading-none">🇬🇧</span>
              <span className="text-[11px] font-bold tracking-[0.2em] uppercase">INTERFREIGHT</span>
            </div>
            <h1 className="text-4xl font-serif text-harvics-text leading-tight">
              Initialize Session
            </h1>
            <p className="text-sm text-harvics-text/40 font-medium tracking-wide">
              Secure Access Gateway | Node: LHR-01
            </p>
          </div>

          {/* Interface Elements */}
          <div className="space-y-8 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSignIn}
              disabled={isLoading}
              className="w-full bg-harvics-maroon text-white py-4 px-6 rounded-2xl font-medium flex items-center justify-center gap-3 shadow-lg shadow-harvics-maroon/20 hover:bg-harvics-maroon/90 transition-colors group disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Key className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                  <span className="font-bold uppercase tracking-widest text-[10px]">Authenticate via Enterprise SSO</span>
                </>
              )}
            </motion.button>

            <div className="flex items-center justify-center gap-3">
              {[
                { icon: Mic, label: 'Harvoice' },
                { icon: Scan, label: 'Face ID' },
                { icon: Fingerprint, label: 'Touch ID' }
              ].map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  onClick={onAnonymousSignIn}
                  className="flex flex-col items-center gap-2 group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#F5F5F0] border border-black/5 flex items-center justify-center text-harvics-maroon/40 group-hover:text-harvics-maroon group-hover:border-harvics-maroon/20 group-hover:bg-white transition-all shadow-sm">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-harvics-text/30 group-hover:text-harvics-maroon/60 transition-colors">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-[9px] font-medium tracking-widest text-harvics-text/20 uppercase text-center">
          A product of Harvics Global Ventures. All Rights Reserved.
        </div>
      </motion.div>

      {/* Language Selection */}
      <div className="mt-8 flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-black/5">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onLanguageChange(lang.code)}
            className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              i18n.language === lang.code 
                ? 'bg-harvics-maroon text-white shadow-md' 
                : 'text-harvics-maroon/40 hover:text-harvics-maroon hover:bg-white'
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
});

const WelcomeModal = memo(({ onClose, user, languages, onLanguageChange, onSeed, isSeeding, onCommand }: { 
  onClose: () => void, 
  user: User | null,
  languages: { code: string, label: string }[],
  onLanguageChange: (lng: string) => void,
  onSeed: () => void,
  isSeeding: boolean,
  onCommand?: (cmd: string) => void
}) => {
  const { t, i18n } = useTranslation();
  const [activeOverlay, setActiveOverlay] = useState<'keyboard' | 'mic' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscription('');
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    if (!process.env.GEMINI_API_KEY) {
      setTranscription("Voice command received (AI transcription unavailable without API key)");
      setIsTranscribing(false);
      return;
    }
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string).split(',')[1];
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
              {
                parts: [
                  { text: "Transcribe this audio exactly as spoken. Return only the transcription text." },
                  { inlineData: { mimeType: "audio/webm", data: base64Audio } }
                ]
              }
            ]
          });
          const text = response.text || "Could not transcribe.";
          setTranscription(text);
          setIsTranscribing(false);
          if (onCommand) {
            onCommand(text.toLowerCase());
          }
          handleTTS(`You said: ${text}`);
        } catch (err) {
          console.error("Transcription failed", err);
          setIsTranscribing(false);
        }
      };
    } catch (err) {
      console.error("FileReader failed", err);
      setIsTranscribing(false);
    }
  };

  const handleTTS = async (text: string) => {
    if (!process.env.GEMINI_API_KEY) return;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.play();
      }
    } catch (err) {
      console.error("TTS failed", err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-harvics-maroon/40 backdrop-blur-md p-4 flex flex-col items-center py-12"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white max-w-md w-full p-8 rounded-[32px] border border-harvics-maroon/5 shadow-2xl flex flex-col items-center text-center gap-6 relative"
      >
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-[110]">
          <div className="w-20 h-20 rounded-[2rem] bg-harvics-maroon flex items-center justify-center shadow-2xl shadow-harvics-maroon/20">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase maroon-text bg-harvics-maroon/5 px-3 py-1 rounded-3xl">Harvics OS</span>
          </div>
        </div>

        {/* Language Selector in Modal */}
        <div className="flex flex-col gap-2 w-full">
          <p className="text-[9px] uppercase tracking-[0.2em] opacity-40 font-bold maroon-text">
            {t('select_language')}
          </p>
          <div className="flex flex-wrap justify-center gap-2 p-2 bg-harvics-maroon/5 rounded-3xl border border-harvics-maroon/5">
            {languages.map((lng) => (
              <button
                key={lng.code}
                onClick={() => onLanguageChange(lng.code)}
                className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-3xl transition-all ${
                  i18n.language === lng.code 
                    ? 'bg-harvics-maroon text-white shadow-md' 
                    : 'text-harvics-maroon/60 hover:bg-harvics-maroon/5'
                }`}
              >
                {lng.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl maroon-text">{t('welcome')}</h2>
          <p className="text-xs gold-text font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            {user ? (user.displayName || 'Anonymous User') : (
              t('validation').split('🇬🇧').map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="text-xl leading-none">🇬🇧</span>}
                </React.Fragment>
              ))
            )}
          </p>
        </div>
        <div className="bg-harvics-maroon/5 p-4 rounded-3xl w-full font-mono text-[11px] maroon-text text-left border border-harvics-maroon/5">
          <p className="mb-1 text-emerald-600 font-bold">{t('soul_active')}</p>
          <p className="mb-1 opacity-60">LocalisationContext: {auth.currentUser ? 'AuthValidated' : 'Guest'}.</p>
          <p className="font-bold">{t('ready')}</p>
        </div>
        <div className="w-full flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4 w-full">
            <button 
              onClick={onClose}
              className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-harvics-maroon/5 rounded-3xl hover:bg-harvics-maroon/5 transition-all group"
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-harvics-maroon/5 rounded-3xl group-hover:scale-110 transition-transform" />
                <ScanFace className="w-5 h-5 maroon-text opacity-40 group-hover:opacity-100" />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest maroon-text opacity-40 group-hover:opacity-100">Face ID</span>
            </button>
            
            <button 
              onClick={onClose}
              className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-harvics-maroon/5 rounded-3xl hover:bg-harvics-maroon/5 transition-all group"
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-harvics-maroon/5 rounded-3xl group-hover:scale-110 transition-transform" />
                <Fingerprint className="w-5 h-5 maroon-text opacity-40 group-hover:opacity-100" />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest maroon-text opacity-40 group-hover:opacity-100">Touch ID</span>
            </button>

            <button 
              onClick={() => setActiveOverlay('mic')}
              className="flex flex-col items-center justify-center gap-3 p-4 bg-white border border-harvics-maroon/5 rounded-3xl hover:bg-harvics-maroon/5 transition-all group"
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-harvics-maroon/5 rounded-3xl group-hover:scale-110 transition-transform" />
                <Mic2 className="w-5 h-5 maroon-text opacity-40 group-hover:opacity-100" />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-widest maroon-text opacity-40 group-hover:opacity-100">Harvoice</span>
            </button>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-5 bg-harvics-maroon text-white rounded-[2rem] text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-harvics-maroon/90 transition-all shadow-xl shadow-harvics-maroon/20"
          >
            {t('enter_sovereign_core')}
          </button>
        </div>

          {/* Access Utilities */}
          <div className="flex flex-col w-full gap-4 pt-4 border-t border-harvics-maroon/5 mt-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveOverlay(activeOverlay === 'keyboard' ? null : 'keyboard')}
                  className={`p-2 rounded-3xl transition-colors ${activeOverlay === 'keyboard' ? 'bg-harvics-gold text-harvics-maroon' : 'bg-harvics-maroon/5 text-harvics-maroon/60 hover:bg-harvics-maroon/10'}`}
                >
                  <Keyboard className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setActiveOverlay(activeOverlay === 'mic' ? null : 'mic')}
                  className={`p-2 rounded-3xl transition-colors ${activeOverlay === 'mic' ? 'bg-harvics-gold text-harvics-maroon' : 'bg-harvics-maroon/5 text-harvics-maroon/60 hover:bg-harvics-maroon/10'}`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={onSeed}
                disabled={isSeeding}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-600 rounded-3xl text-[8px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-50"
              >
                <Database className="w-3 h-3" />
                {isSeeding ? 'Synchronizing...' : 'Seed Neural Data'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {activeOverlay === 'keyboard' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full bg-harvics-maroon/5 rounded-3xl p-3 flex flex-col gap-2 overflow-hidden"
              >
                <p className="text-[8px] uppercase font-bold opacity-40">Virtual Secure Input</p>
                <div className="grid grid-cols-10 gap-1">
                  {'QWERTYUIOP'.split('').map(key => (
                    <div key={key} className="aspect-square bg-white rounded-3xl border border-harvics-maroon/5 flex items-center justify-center text-[8px] font-bold">{key}</div>
                  ))}
                </div>
                <p className="text-[8px] italic opacity-60">Encrypted keyboard active.</p>
              </motion.div>
            )}
            {activeOverlay === 'mic' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full bg-harvics-maroon/5 rounded-3xl p-4 flex flex-col items-center gap-3 overflow-hidden"
              >
                <div className="flex items-center gap-1">
                  {isRecording ? (
                    [1, 2, 3, 4, 5].map(i => (
                      <motion.div 
                        key={i}
                        animate={{ height: [4, 12, 4] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                        className="w-1 bg-harvics-maroon rounded-3xl"
                      />
                    ))
                  ) : (
                    <div className="w-12 h-1 bg-harvics-maroon/20 rounded-3xl" />
                  )}
                </div>
                
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-6 py-2 rounded-3xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-harvics-maroon text-white'
                  }`}
                >
                  {isRecording ? 'Stop Recording' : 'Start Voice Command'}
                </button>

                {isTranscribing && (
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 animate-spin maroon-text" />
                    <span className="text-[8px] uppercase font-bold maroon-text">Neural Processing...</span>
                  </div>
                )}

                {transcription && (
                  <div className="w-full p-2 bg-white/50 rounded-3xl border border-harvics-maroon/5">
                    <p className="text-[9px] maroon-text font-medium text-center italic">"{transcription}"</p>
                  </div>
                )}

                <p className="text-[8px] uppercase font-bold maroon-text opacity-40">
                  {isRecording ? 'Listening for voice command...' : 'Tap to speak'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

        <div className="mt-8 pt-4 border-t border-harvics-maroon/5 w-full flex flex-col items-center gap-1 opacity-60">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] gold-text">A Product By Harvics Global Ventures</p>
          <p className="text-[8px] font-medium uppercase tracking-widest gold-text">All rights reserved 2026</p>
        </div>
      </motion.div>
    </motion.div>
  );
});

const InvoiceScanner = memo(({ onAddHsCode }: { onAddHsCode: (newCode: any) => void }) => {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startScan = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied", err);
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const captureAndProcess = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
    
    if (!process.env.GEMINI_API_KEY) {
      setExtractedData({ code: '0000.00.0000', product: 'Sample Product (AI unavailable)', category: 'General', duty: 'Pending', status: 'Review' });
      stopScan();
      setIsProcessing(false);
      return;
    }
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          {
            parts: [
              { text: "Extract HS code, product name, and suggested category from this invoice image. Return as JSON with keys: code, product, category." },
              { inlineData: { mimeType: "image/jpeg", data: base64Image } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING, description: "The 12-digit HS code" },
              product: { type: Type.STRING, description: "Product name" },
              category: { type: Type.STRING, description: "Suggested category" }
            },
            required: ["code", "product", "category"]
          }
        }
      });
      
      const result = JSON.parse(response.text || '{}');
      setExtractedData({ ...result, duty: 'Pending', status: 'Review' });
      stopScan();
    } catch (err) {
      console.error("AI processing failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmAdd = () => {
    if (extractedData) {
      onAddHsCode(extractedData);
      setExtractedData(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-3xl border border-harvics-maroon/10 relative overflow-hidden shadow-sm">
      {isProcessing && <div className="xray-scanner" />}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 maroon-text" />
          <h3 className="text-[10px] uppercase tracking-widest font-bold maroon-text">{t('invoice_ai_scanner')}</h3>
        </div>
        {isScanning && (
          <button onClick={stopScan} className="text-[8px] uppercase tracking-widest font-bold text-rose-600">{t('stop')}</button>
        )}
      </div>

      {!extractedData ? (
        <>
          <div className="relative aspect-video bg-harvics-maroon/5 rounded-3xl overflow-hidden flex items-center justify-center">
            {isScanning ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : (
              <button 
                onClick={startScan}
                className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity"
              >
                <Camera className="w-8 h-8 maroon-text" />
                <span className="text-[9px] uppercase tracking-widest font-bold">{t('initialize_camera')}</span>
              </button>
            )}
            {isScanning && (
              <div className="absolute inset-0 border-2 border-harvics-gold/30 animate-pulse pointer-events-none" />
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-harvics-maroon/40 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-harvics-gold border-t-transparent rounded-3xl animate-spin" />
                  <span className="text-[9px] uppercase tracking-widest font-bold text-white">{t('analyzing_doc')}</span>
                </div>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          {isScanning && !isProcessing && (
            <button 
              onClick={captureAndProcess}
              className="w-full py-2 maroon-header text-white rounded-3xl text-[9px] font-bold uppercase tracking-widest hover:shadow-lg transition-all"
            >
              {t('capture_extract')}
            </button>
          )}
          <p className="text-[8px] opacity-40 italic">{t('ai_extract_hint')}</p>
        </>
      ) : (
        <div className="flex flex-col gap-4 p-2">
          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-widest font-bold maroon-text opacity-40">{t('extracted_data')}</span>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="flex flex-col">
                <span className="opacity-40">{t('hs_code_header')}</span>
                <input 
                  value={extractedData.code} 
                  onChange={(e) => setExtractedData({...extractedData, code: e.target.value})}
                  className="bg-harvics-maroon/5 border-b border-harvics-maroon/20 maroon-text focus:outline-none"
                />
              </div>
              <div className="flex flex-col">
                <span className="opacity-40">{t('category_header')}</span>
                <input 
                  value={extractedData.category} 
                  onChange={(e) => setExtractedData({...extractedData, category: e.target.value})}
                  className="bg-harvics-maroon/5 border-b border-harvics-maroon/20 maroon-text focus:outline-none"
                />
              </div>
              <div className="flex flex-col col-span-2">
                <span className="opacity-40">{t('product_header')}</span>
                <input 
                  value={extractedData.product} 
                  onChange={(e) => setExtractedData({...extractedData, product: e.target.value})}
                  className="bg-harvics-maroon/5 border-b border-harvics-maroon/20 maroon-text focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={confirmAdd}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-3xl text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors"
            >
              {t('confirm_add')}
            </button>
            <button 
              onClick={() => setExtractedData(null)}
              className="flex-1 py-2 border border-harvics-maroon/20 maroon-text rounded-3xl text-[9px] font-bold uppercase tracking-widest hover:bg-harvics-maroon/5 transition-colors"
            >
              {t('discard')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

const SearchBar = memo(({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const { t } = useTranslation();
  return (
    <div className="relative group block sm:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 group-focus-within:text-harvics-gold transition-colors" />
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('search_placeholder')}
        className="bg-white/10 border border-white/20 rounded-3xl pl-10 pr-8 py-1.5 text-[10px] text-white placeholder:text-white/50 focus:outline-none focus:border-harvics-gold/50 focus:bg-white/20 transition-all w-64 lg:w-80 font-medium tracking-wider"
      />
      {value && (
        <button 
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-white/10 rounded-3xl transition-colors"
        >
          <X className="w-3 h-3 text-white/60 hover:text-white" />
        </button>
      )}
    </div>
  );
});

const AIDataEntry = memo(({ onUpdate }: { onUpdate: (data: any) => void }) => {
  const { t } = useTranslation();
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    setIsProcessing(true);
    setLogs(prev => [...prev, `> ${command}`]);
    
    try {
      const lowerCmd = command.toLowerCase();
      let response = "Command processed successfully.";
      
      if (lowerCmd.includes('shipment') || lowerCmd.includes('add')) {
        const name = lowerCmd.split('shipment')[1]?.trim().toUpperCase() || "NEW SHIPMENT";
        await addDoc(collection(db, 'shipments'), {
          name,
          route: "UK → GCC",
          status: "Green",
          details: "AI Generated via Command Center",
          authorUid: auth.currentUser?.uid,
          createdAt: Timestamp.now()
        });
        response = `New shipment '${name}' added to UK-GCC corridor.`;
      } else if (lowerCmd.includes('seed')) {
        // Seed HS Codes
        for (const item of initialHsData) {
          await addDoc(collection(db, 'hs_codes'), {
            ...item,
            authorUid: auth.currentUser?.uid,
            createdAt: Timestamp.now()
          });
        }
        // Seed Settlements
        for (const item of initialSettlements) {
          await addDoc(collection(db, 'settlements'), {
            ...item,
            authorUid: auth.currentUser?.uid,
            createdAt: Timestamp.now()
          });
        }
        // Seed Stats
        await setDoc(doc(db, 'stats', 'global'), {
          accuracy: 99.1,
          shipmentsCount: 847,
          settledAmount: 2.4
        });
        response = "Database seeded with initial enterprise data.";
      } else if (lowerCmd.includes('accuracy') || lowerCmd.includes('update')) {
        await updateDoc(doc(db, 'stats', 'global'), {
          accuracy: 99.4
        });
        response = "Classification accuracy recalibrated to 99.4%.";
      }

      setLogs(prev => [...prev, response]);
      setCommand('');
    } catch (error) {
      setLogs(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-3xl border border-harvics-maroon/10 relative overflow-hidden shadow-sm">
      {isProcessing && <div className="xray-scanner" />}
      <div className="flex items-center gap-2 mb-1">
        <Terminal className="w-4 h-4 maroon-text" />
        <h3 className="text-[10px] uppercase tracking-widest font-bold maroon-text">{t('ai_command_center')}</h3>
      </div>
      
      <div className="bg-harvics-maroon/5 rounded-3xl p-3 h-32 overflow-y-auto font-mono text-[10px] flex flex-col gap-1">
        {logs.map((log, i) => (
          <div key={i} className={log.startsWith('>') ? 'opacity-60' : 'text-emerald-600 font-bold'}>
            {log}
          </div>
        ))}
        {isProcessing && <div className="animate-pulse opacity-40">{t('processing')}...</div>}
      </div>

      <form onSubmit={handleCommand} className="relative">
        <input 
          type="text" 
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder={t('ai_command_placeholder')}
          className="w-full bg-white border border-harvics-maroon/10 rounded-3xl px-3 py-2 text-[11px] focus:outline-none focus:border-harvics-maroon/30"
        />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
          <ChevronRight className="w-4 h-4 maroon-text opacity-40" />
        </button>
      </form>
    </div>
  );
});

interface NeuralGovernanceProps {
  contextData?: {
    shipments: any[];
    hsData: any[];
    settlements: any[];
    searchQuery: string;
  };
  onProcessingChange?: (p: boolean) => void;
  onAlert?: (alert: { type: string, message: string }) => void;
}

const NeuralGovernance: React.FC<NeuralGovernanceProps> = memo(({ contextData, onProcessingChange, onAlert }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'processing' | 'approved' | 'alerts'>('idle');
  const [governanceStep, setGovernanceStep] = useState(0);
  const [alerts, setAlerts] = useState<{ type: string, message: string }[]>([]);

  const runChecks = async () => {
    setStatus('processing');
    onProcessingChange?.(true);
    setAlerts([]);
    setGovernanceStep(0);

    // Sequential Animation Sequence
    for (let i = 1; i <= 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setGovernanceStep(i);
    }

    try {
      let result: any[] = [];
      
      if (!process.env.GEMINI_API_KEY) {
        result = [
          { type: 'compliance', message: 'AI governance checks unavailable — no API key configured.' }
        ];
      } else {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        const prompt = `Analyze the following logistics data for potential compliance risks, missing documentation, or optimization opportunities before shipment finalization.
        
        Shipments: ${JSON.stringify(contextData?.shipments?.slice(0, 3) || [])}
        HS Codes: ${JSON.stringify(contextData?.hsData?.slice(0, 3) || [])}
        
        Return a JSON array of objects with 'type' (either 'risk', 'optimization', or 'compliance') and 'message' (a short 1-sentence description). If no issues, return an empty array.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            tools: [{ googleSearch: {} }],
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  message: { type: Type.STRING }
                },
                required: ["type", "message"]
              }
            }
          }
        });

        result = JSON.parse(response.text || "[]");
      }
      
      // Save audit log to Firestore
      try {
        await addDoc(collection(db, 'audit_logs'), {
          timestamp: serverTimestamp(),
          status: result.length > 0 ? 'ALERTS_FOUND' : 'APPROVED',
          alerts: result,
          checkedShipments: contextData?.shipments?.length || 0,
          checkedHsCodes: contextData?.hsData?.length || 0,
          userId: auth.currentUser?.uid
        });
      } catch (err) {
        console.error("Failed to save audit log", err);
      }

      if (result.length > 0) {
        setAlerts(result);
        setStatus('alerts');
        const highRisk = result.find((a: any) => a.type === 'risk' || a.type === 'compliance');
        if (highRisk) {
          onAlert?.(highRisk);
        }
      } else {
        setStatus('approved');
      }
    } catch (error) {
      console.error("Governance check failed:", error);
      setStatus('approved');
    } finally {
      onProcessingChange?.(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 flex flex-col gap-6 border border-harvics-maroon/10 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 maroon-text" />
          <h2 className="text-[10px] font-bold uppercase tracking-widest maroon-text">{t('neural_governance')}</h2>
        </div>
        {status === 'processing' && <div className="w-2 h-2 rounded-3xl bg-harvics-gold animate-ping" />}
      </div>
      
      <div className="flex flex-col gap-4">
        {[
          { id: 1, label: 'Legal Architecture', icon: <FileText className="w-4 h-4" /> },
          { id: 2, label: 'Budgetary Alignment', icon: <DollarSign className="w-4 h-4" /> },
          { id: 3, label: 'Contractual Integrity', icon: <ShieldCheck className="w-4 h-4" /> },
          { id: 4, label: 'Security Handshake', icon: <Lock className="w-4 h-4" /> },
          { id: 5, label: 'Compliance Audit', icon: <CheckCircle className="w-4 h-4" /> },
        ].map((node) => (
          <div key={node.id} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-3xl flex items-center justify-center transition-all duration-500 ${
              governanceStep >= node.id ? 'bg-harvics-maroon text-white shadow-lg' : 'bg-harvics-maroon/5 text-harvics-maroon/20'
            }`}>
              {node.icon}
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${governanceStep >= node.id ? 'maroon-text' : 'text-harvics-maroon/20'}`}>
                {t(node.label.toLowerCase().replace(/ /g, '_'))}
              </span>
              {governanceStep === node.id && status === 'processing' && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[8px] font-mono text-harvics-gold font-bold"
                >
                  PROCESSING...
                </motion.span>
              )}
            </div>
            {governanceStep >= node.id && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ms-auto">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="flex flex-col gap-2 p-3 bg-rose-50 rounded-3xl border border-rose-100">
          <span className="text-[8px] font-bold text-rose-600 uppercase tracking-widest">AI Risk Identification</span>
          {alerts.map((alert, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertTriangle className="w-3 h-3 text-rose-500 mt-0.5" />
              <p className="text-[9px] text-rose-700 font-medium">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={runChecks}
        disabled={status === 'processing'}
        className="mt-auto w-full py-4 bg-harvics-maroon text-white font-bold rounded-3xl uppercase tracking-widest hover:bg-harvics-gold hover:text-harvics-maroon transition-all disabled:opacity-50"
      >
        {status === 'processing' ? t('validating') : t('validate_intent')}
      </button>
    </div>
  );
});

const TradeFinanceChart = memo(({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#800000" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#800000" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000010" />
        <XAxis dataKey="name" hide />
        <YAxis hide />
        <Tooltip 
          contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
        />
        <Area type="monotone" dataKey="value" stroke="#800000" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
});

const HSClassification = memo(({ shipments, onClassify }: { shipments: any[], onClassify: (data: any) => void }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-harvics-maroon/10 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-harvics-maroon/5 flex items-center justify-center">
            <FileText className="w-4 h-4 maroon-text" />
          </div>
          <h2 className="font-serif text-xl maroon-text">HS Classification Engine</h2>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {shipments.map((s, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-harvics-maroon/[0.02] border border-harvics-maroon/5">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold maroon-text">{s.name}</span>
              <span className="text-[10px] opacity-60 uppercase tracking-widest">{s.route}</span>
            </div>
            <button 
              onClick={() => onClassify({ code: '0901.21.0000', description: 'Roasted Coffee', status: 'Green' })}
              className="px-4 py-2 bg-harvics-maroon text-white text-[10px] font-bold rounded-xl uppercase tracking-widest"
            >
              Classify
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

const CustomsCompliance = memo(({ shipments }: { shipments: any[] }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-harvics-maroon/10 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-harvics-maroon/5 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 maroon-text" />
          </div>
          <h2 className="font-serif text-xl maroon-text">Customs Compliance</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shipments.map((s, i) => (
          <div key={i} className="p-4 rounded-2xl border border-harvics-maroon/5 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold maroon-text">{s.name}</span>
              <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold ${s.isGoverned ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {s.isGoverned ? 'COMPLIANT' : 'REVIEW'}
              </span>
            </div>
            <div className="w-full h-1 bg-harvics-maroon/5 rounded-full overflow-hidden">
              <div className="h-full bg-harvics-gold" style={{ width: '85%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const HPayFinancialHub = memo(({ shipments }: { shipments: any[] }) => {
  return (
    <div className="relative w-full min-h-[800px] bg-[#F5F5F0] rounded-[32px] p-12 overflow-hidden flex flex-col gap-12 border border-harvics-maroon/5 shadow-2xl">
      {/* I. POSITIONING & BRANDING */}
      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-harvics-maroon flex items-center justify-center border border-harvics-gold/30 shadow-lg">
          <ShieldCheck className="w-5 h-5 text-harvics-gold" />
        </div>
        <span className="font-serif font-bold maroon-text uppercase tracking-widest text-xs">Harvics</span>
      </div>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-harvics-maroon/5 border border-harvics-maroon/10 flex items-center justify-center relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-harvics-maroon/20 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full bg-harvics-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]"
          />
        </div>
      </div>

      {/* II. THE SOVEREIGN CAPITAL HERO */}
      <motion.div 
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="mt-16 bg-white/60 backdrop-blur-2xl border border-harvics-maroon/5 rounded-[32px] p-10 shadow-[0_32px_64px_-16px_rgba(90,15,26,0.1)] relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-harvics-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          <span className="text-[10px] font-bold maroon-text opacity-40 uppercase tracking-[0.3em]">Total Sovereign Capital</span>
          <h2 className="font-serif text-5xl lg:text-7xl maroon-text font-bold tracking-tight">
            $8,940,500,000.00
          </h2>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest font-serif">+12.4% Regional Volume (GCC)</span>
          </div>
        </div>
        <div className="absolute inset-0 border-2 border-harvics-gold/10 rounded-[32px] animate-pulse" />
      </motion.div>

      {/* III. THE SETTLEMENT LEDGER */}
      <div className="flex flex-col gap-4">
        <h3 className="font-serif text-xl maroon-text font-bold mb-2">Sovereign Settlement Ledger</h3>
        <div className="space-y-3">
          {[
            { corridor: 'UK-GCC Corridor | LHR-DXB', status: 'SETTLED', amount: '$1,240,500.00', statusColor: 'maroon' },
            { corridor: 'Neural Node Licensing | SIN-04', status: 'CLEARING', amount: '$450,000.00', statusColor: 'gold' },
            { corridor: 'GCC-Asia Corridor | DXB-SHA', status: 'SETTLED', amount: '$2,840,000.00', statusColor: 'maroon' },
            { corridor: 'Awaiting Hash Validation', status: 'PENDING', amount: '$0.00', statusColor: 'gray' }
          ].map((row, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.01, boxShadow: '0 20px 40px rgba(90,15,26,0.08)' }}
              className="flex items-center justify-between p-6 bg-white/40 backdrop-blur-md border border-harvics-maroon/5 rounded-[24px] transition-all group hover:bg-white/60"
            >
              <div className="flex flex-col gap-1">
                <span className={`font-serif text-sm maroon-text font-bold ${row.corridor === 'Awaiting Hash Validation' ? 'italic' : ''}`}>
                  {row.corridor}
                </span>
                <span className="text-[8px] maroon-text opacity-40 uppercase tracking-widest">Transaction ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
              </div>
              
              <div className="flex items-center gap-8">
                <div className={`px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${
                  row.statusColor === 'maroon' ? 'bg-harvics-maroon text-white border-harvics-maroon' :
                  row.statusColor === 'gold' ? 'bg-harvics-gold text-harvics-maroon border-harvics-gold' :
                  'bg-harvics-maroon/5 text-harvics-maroon/40 border-harvics-maroon/10'
                }`}>
                  {row.status}
                </div>
                <span className="font-serif text-lg maroon-text font-bold min-w-[140px] text-right">
                  {row.amount}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex justify-center">
        <span className="text-[9px] maroon-text opacity-40 uppercase tracking-[0.2em] font-serif">
          A product of Harvics Global Ventures. All Rights Reserved.
        </span>
      </div>
    </div>
  );
});

const TradeFinance = memo(({ shipments }: { shipments: any[] }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-harvics-maroon/10 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-harvics-maroon/5 flex items-center justify-center">
            <BarChart3 className="w-4 h-4 maroon-text" />
          </div>
          <h2 className="font-serif text-xl maroon-text">Trade Finance</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-2xl bg-harvics-maroon text-white">
            <span className="text-[10px] uppercase tracking-widest opacity-60">Credit Utilization</span>
            <p className="text-2xl font-serif mt-1">64%</p>
          </div>
          <div className="p-4 rounded-2xl border border-harvics-maroon/5">
            <span className="text-[10px] uppercase tracking-widest opacity-40">Available Credit</span>
            <p className="text-xl font-serif maroon-text mt-1">$1.2M</p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold maroon-text uppercase tracking-widest mb-2">Risk Profile</span>
          {['Market Risk', 'Counterparty', 'Liquidity'].map((risk) => (
            <div key={risk} className="flex items-center justify-between p-2 rounded-xl bg-harvics-maroon/[0.02]">
              <span className="text-[10px] opacity-60">{risk}</span>
              <span className="text-[10px] font-bold text-emerald-600">LOW</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const AuditLedger = memo(() => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-harvics-maroon/10 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-harvics-maroon/5 flex items-center justify-center">
            <Shield className="w-4 h-4 maroon-text" />
          </div>
          <h2 className="font-serif text-xl maroon-text">Audit & Governance Ledger</h2>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-harvics-maroon/5 hover:bg-harvics-maroon/[0.02] transition-colors">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold maroon-text">Compliance Check #{1000 + i}</span>
              <span className="text-[10px] opacity-40 font-mono">HASH: 0x74...f2e{i}</span>
            </div>
            <span className="ms-auto text-[10px] opacity-40">2m ago</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const AICommandCenter = () => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-harvics-maroon/10 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-harvics-maroon/5 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 maroon-text" />
          </div>
          <h2 className="font-serif text-xl maroon-text">AI Command Center</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold maroon-text uppercase tracking-widest">Neural Load</span>
              <span className="text-[10px] font-bold text-harvics-gold">24%</span>
            </div>
            <div className="w-full h-2 bg-harvics-maroon/5 rounded-full overflow-hidden">
              <div className="h-full bg-harvics-maroon" style={{ width: '24%' }} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold maroon-text uppercase tracking-widest">Model Accuracy</span>
              <span className="text-[10px] font-bold text-emerald-600">99.9%</span>
            </div>
            <div className="w-full h-2 bg-harvics-maroon/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: '99.9%' }} />
            </div>
          </div>
        </div>
        <div className="bg-harvics-maroon/5 rounded-3xl p-6 flex flex-col gap-4">
          <h4 className="text-[10px] font-bold maroon-text uppercase tracking-widest">Active Models</h4>
          {['Vision-OCR', 'Risk-Neural', 'NLP-Compliance'].map((model) => (
            <div key={model} className="flex items-center justify-between">
              <span className="text-[10px] opacity-60">{model}</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold maroon-text">LIVE</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HarvoiceSimulation = memo(({ dark = false, onCommand }: { dark?: boolean, onCommand?: (cmd: string) => void }) => {
  const { t, i18n } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('Listening...');
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      if (onCommand) {
        onCommand(text.toLowerCase());
      }
      setTimeout(() => setTranscript(''), 3000);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      setTranscript('Error');
      setTimeout(() => setTranscript(''), 2000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div 
      onClick={toggleListening}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded-3xl backdrop-blur-sm cursor-pointer transition-all shadow-lg border ${
        dark 
          ? 'bg-harvics-maroon text-white border-harvics-gold/30 hover:bg-harvics-maroon/90' 
          : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
      } ${isListening ? 'ring-2 ring-harvics-gold' : ''}`}
    >
      <div className="relative flex items-center justify-center">
        {isListening ? (
          <motion.div 
            animate={{ scale: [1, 1.6, 1], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-8 h-8 bg-harvics-gold rounded-3xl" 
          />
        ) : (
          <motion.div 
            animate={{ scale: [1, 1.6, 1], opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-8 h-8 bg-harvics-gold rounded-3xl" 
          />
        )}
        <div className={`relative z-10 w-6 h-6 flex items-center justify-center rounded-3xl shadow-[0_0_15px_rgba(212,175,55,0.6)] ${isListening ? 'bg-rose-500' : 'bg-harvics-gold'}`}>
          <Mic2 className={`w-3.5 h-3.5 ${isListening ? 'text-white' : 'text-harvics-maroon'}`} />
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-3xl animate-pulse ${isListening ? 'bg-rose-500' : 'bg-emerald-400'}`} />
          <span className={`text-[9px] font-bold uppercase tracking-widest ${dark ? 'text-white' : 'text-harvics-gold'}`}>
            {isListening ? 'Listening...' : t('ai_active')}
          </span>
        </div>
      </div>
      <AnimatePresence>
        {(isHovered || transcript) && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="ml-2 pl-2 border-l border-white/20"
          >
            <p className="text-[8px] italic text-white/90 whitespace-nowrap">
              {transcript || t('ai_suggestion')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const MetricCard = memo(({ title, value, subValue, trend, icon: Icon, isCurrency = false, currencySymbol = '£' }: any) => {
  const { t } = useTranslation();
  const [lastVerified, setLastVerified] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const interval = setInterval(() => {
      setLastVerified(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 bg-white rounded-3xl flex flex-col gap-2 relative overflow-hidden group border border-harvics-maroon/5 shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon className="w-12 h-12 maroon-text" />
      </div>
      <div className="flex justify-between items-start">
        <h3 className="text-[10px] uppercase tracking-[0.2em] opacity-50 font-semibold maroon-text">{t(title)}</h3>
        <span className="text-[8px] opacity-30 font-mono">{t('verified')} {lastVerified}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="flex items-baseline gap-0.5">
          {isCurrency && <span className="text-sm font-bold gold-text opacity-60">{currencySymbol}</span>}
          <span className={`text-3xl font-serif ${isCurrency ? 'gold-text' : 'maroon-text'}`}>
            {typeof value === 'string' ? value.replace(/[£€$]/g, '') : value}
          </span>
        </div>
        {trend && (
          <span className={`text-[10px] ${trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-[10px] opacity-40 font-medium">{subValue}</p>
    </div>
  );
});

const ShipmentRow = memo(({ name, route, status, details, eta, isGoverned = false }: any) => {
  const { t } = useTranslation();
  const [hasChanged, setHasChanged] = useState(false);
  const isProblem = status !== 'Green' || !isGoverned;
  const statusColor = status === 'Green' ? 'text-emerald-600' : 'text-rose-600';
  const statusBg = status === 'Green' ? 'bg-emerald-500/10' : 'bg-rose-500/10';
  
  useEffect(() => {
    if (eta) {
      setHasChanged(true);
      const timer = setTimeout(() => setHasChanged(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [eta]);

  const formatEta = (date: any) => {
    if (!date) return 'TBD';
    const d = new Date(date);
    return d.toLocaleDateString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`grid grid-cols-4 items-center py-4 border-b border-harvics-maroon/5 hover:bg-harvics-maroon/[0.02] transition-colors px-4 -mx-4 relative ${isProblem ? 'slow-blink-red' : ''}`}>
      {isProblem && (
        <div className="absolute inset-0 bg-rose-500/5 pointer-events-none" />
      )}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold maroon-text">{name}</span>
          {!isGoverned && (
            <div className="group relative">
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-harvics-maroon text-white text-[8px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl uppercase tracking-widest">
                Legacy Friction: Manual verification pending. Estimated Dwell Loss: +2.4 days.
              </div>
            </div>
          )}
          {isGoverned && status === 'Green' && (
            <div className="relative flex items-center justify-center w-3 h-3">
              <div className="sonar-ring-emerald w-full h-full" />
              <div className="w-1.5 h-1.5 rounded-3xl bg-emerald-500" />
            </div>
          )}
          {isGoverned && status !== 'Green' && (
            <div className="relative flex items-center justify-center w-3 h-3">
              <div className="sonar-ring-rose w-full h-full" />
              <div className="w-1.5 h-1.5 rounded-3xl bg-rose-500" />
            </div>
          )}
        </div>
        <span className="text-[10px] opacity-40">{details}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-wider opacity-60 maroon-text">{route}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] transition-all duration-500 ${hasChanged ? 'text-amber-600 font-bold scale-110' : 'opacity-40'}`}>
            {t('eta')} {formatEta(eta)}
          </span>
          {hasChanged && (
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-1.5 h-1.5 rounded-3xl bg-amber-500"
            />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-3xl ${status === 'Green' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        <div className="flex flex-col">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>{status}</span>
          {isProblem && (
            <span className="text-[8px] font-black text-rose-600 uppercase tracking-tighter animate-pulse">NO EDIT ALLOWED</span>
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <button className="text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity maroon-text">{t('details')}</button>
      </div>
    </div>
  );
});

const exportToCSV = (filename: string, data: any[]) => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// --- Main App ---

// Error Boundary Component
const ErrorBoundaryInner = ({ children, t }: { children: ReactNode, t: any }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      setHasError(true);
      setError(e.error);
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      setHasError(true);
      setError(e.reason instanceof Error ? e.reason : new Error(String(e.reason)));
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-harvics-bg flex items-center justify-center p-8 text-center">
        <div className="bg-white p-8 rounded-3xl border border-rose-500/20 max-w-md w-full flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-serif text-2xl maroon-text">{t('system_interrupted')}</h1>
            <p className="text-xs opacity-60 maroon-text">{t('kernel_error')}</p>
          </div>
          <div className="w-full p-4 bg-harvics-maroon/5 rounded-3xl text-left overflow-auto max-h-32">
            <code className="text-[10px] font-mono text-rose-600 break-all">
              {error?.message || t('unknown_panic')}
            </code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 maroon-header text-white rounded-3xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all"
          >
            {t('reboot_interface')}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const ErrorBoundary = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  return <ErrorBoundaryInner t={t}>{children}</ErrorBoundaryInner>;
};

const UserManagement = memo(({ users, onUpdateRole }: { users: any[], onUpdateRole: (uid: string, newRole: string) => void }) => {
  const { t } = useTranslation();
  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col gap-6 border border-harvics-maroon/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 maroon-text" />
          <h3 className="text-[10px] uppercase tracking-widest font-bold maroon-text">{t('user_management')}</h3>
        </div>
        <span className="text-[8px] uppercase tracking-widest font-bold maroon-text opacity-40">{users.length} {t('active_users')}</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[9px] uppercase tracking-widest opacity-40 border-b border-harvics-maroon/5">
              <th className="pb-4 font-bold maroon-text">{t('user_header')}</th>
              <th className="pb-4 font-bold maroon-text">{t('email_header')}</th>
              <th className="pb-4 font-bold maroon-text">{t('role_header')}</th>
              <th className="pb-4 font-bold text-right maroon-text">{t('actions_header')}</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {users.map((u) => (
              <tr key={u.id} className="border-b border-harvics-maroon/5 last:border-0 hover:bg-harvics-maroon/5 transition-colors">
                <td className="py-4 font-medium maroon-text">{u.displayName || 'Anonymous'}</td>
                <td className="py-4 opacity-60 maroon-text">{u.email || 'N/A'}</td>
                <td className="py-4">
                  <span className={`px-2 py-0.5 rounded-3xl text-[9px] font-bold uppercase tracking-tighter ${
                    u.role === 'admin' ? 'bg-harvics-maroon/10 text-harvics-maroon' : 
                    u.role === 'editor' ? 'bg-emerald-500/10 text-emerald-600' : 
                    'bg-harvics-maroon/10 text-harvics-maroon/60'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <select 
                    value={u.role}
                    onChange={(e) => onUpdateRole(u.id, e.target.value)}
                    className="bg-white/5 border border-harvics-maroon/10 rounded-3xl px-2 py-1 text-[9px] maroon-text focus:outline-none focus:border-harvics-maroon/30 transition-colors"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

const NotificationCenter = memo(({ notifications, onClose, onMarkRead }: { notifications: any[], onClose: () => void, onMarkRead: (id: string) => void }) => {
  const { t } = useTranslation();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-16 right-4 w-80 glass-card rounded-3xl shadow-2xl border border-harvics-maroon/10 z-[100] overflow-hidden"
    >
      <div className="p-4 border-b border-harvics-maroon/5 flex items-center justify-between bg-harvics-maroon/5">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 maroon-text" />
          <h3 className="text-[10px] font-bold uppercase tracking-widest maroon-text">{t('notifications')}</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-harvics-maroon/5 rounded-3xl transition-colors">
          <X className="w-3.5 h-3.5 maroon-text opacity-40" />
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center gap-2 opacity-40">
            <Shield className="w-8 h-8 maroon-text" />
            <p className="text-[9px] font-bold uppercase tracking-widest maroon-text">{t('no_new_alerts')}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => onMarkRead(n.id)}
                className={`p-4 border-b border-harvics-maroon/5 last:border-0 hover:bg-harvics-maroon/5 transition-colors cursor-pointer relative ${!n.read ? 'bg-harvics-gold/5' : ''}`}
              >
                {!n.read && <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-harvics-gold rounded-3xl animate-pulse" />}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {n.type === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-500" />}
                    {n.type === 'error' && <AlertCircle className="w-3 h-3 text-rose-500" />}
                    {n.type === 'success' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    {n.type === 'info' && <Info className="w-3 h-3 text-blue-500" />}
                    <span className="text-[9px] font-bold uppercase tracking-widest maroon-text">{n.title}</span>
                  </div>
                  <p className="text-[10px] maroon-text opacity-70 leading-relaxed">{n.message}</p>
                  <span className="text-[8px] maroon-text opacity-30 font-mono mt-1">
                    {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 bg-harvics-maroon/5 text-center">
        <button className="text-[8px] font-bold uppercase tracking-widest maroon-text opacity-40 hover:opacity-100 transition-opacity">
          {t('clear_all_notifications')}
        </button>
      </div>
    </motion.div>
  );
});

const DocumentScanner = memo(({ onScan, isScanning }: { onScan: (file: File) => void, isScanning: boolean }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onScan(e.target.files[0]);
    }
  };

  return (
    <div className="glass-card rounded-3xl p-8 flex flex-col items-center gap-6 border-dashed border-harvics-maroon/20">
      <div className="w-16 h-16 bg-harvics-maroon/5 rounded-3xl flex items-center justify-center relative">
        {isScanning ? (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-harvics-gold border-t-transparent rounded-3xl"
          />
        ) : null}
        <Camera className={`w-8 h-8 ${isScanning ? 'text-harvics-gold' : 'maroon-text opacity-40'}`} />
      </div>
      <div className="text-center flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-widest maroon-text">{t('neural_document_scanner')}</h3>
        <p className="text-[9px] maroon-text opacity-60 max-w-[200px] mx-auto leading-relaxed">
          {t('scanner_hint')}
        </p>
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,application/pdf"
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className="px-8 py-3 maroon-header text-white rounded-3xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
      >
        {isScanning ? t('analyzing_neural_data') : t('upload_document')}
      </button>
    </div>
  );
});

export default function App() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const [users, setUsers] = useState<any[]>([]);
  const [accuracy, setAccuracy] = useState(99.1);
  const [showWelcome, setShowWelcome] = useState(false);
  const [shipments, setShipments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [shipmentSortConfig, setShipmentSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  const handleSortShipments = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (shipmentSortConfig && shipmentSortConfig.key === key && shipmentSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setShipmentSortConfig({ key, direction });
  };
  const [hsStatusFilter, setHsStatusFilter] = useState('All');
  const [hsCategoryFilter, setHsCategoryFilter] = useState('All');
  const [hsData, setHsData] = useState<any[]>(initialHsData);
  const [settlementsData, setSettlementsData] = useState<any[]>(initialSettlements);

  const shipmentsCount = shipments.length;
  const settledAmount = useMemo(() => {
    const total = settlementsData.reduce((acc, curr) => {
      const amount = parseFloat(curr.amount.replace(/,/g, ''));
      return acc + (isNaN(amount) ? 0 : amount);
    }, 0);
    return (total / 1000000).toFixed(2);
  }, [settlementsData]);

  const [isListening, setIsListening] = useState(false);
  const scannerFileInputRef = useRef<HTMLInputElement>(null);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      // Fallback to simulation if not supported
      setIsListening(true);
      setTimeout(() => {
        setVoiceCommand("Show all shipments in the UK-GCC corridor with high velocity.");
        setIsListening(false);
      }, 3000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setVoiceCommand(text);
      // If we are in voice module, it will show the command
      // If we are in AI Command Terminal, we might want to fill the input
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const [activeModule, setActiveModule] = useState('intelligence');
  const modules = [
    { id: 'intelligence', label: 'Global Intelligence', icon: Globe },
    { id: 'hs_data', label: 'HS Repository', icon: Database },
    { id: 'compliance', label: 'Customs Compliance', icon: ShieldCheck },
    { id: 'regional', label: 'Regional Performance', icon: Activity },
    { id: 'tracking', label: 'Live Tracking', icon: Truck },
    { id: 'settlement', label: 'HPay Settlement', icon: Zap },
    { id: 'finance', label: 'Trade Finance', icon: CreditCard },
    { id: 'audit', label: 'Audit & Compliance', icon: FileText },
    { id: 'ai_center', label: 'AI Commerce Centre', icon: BrainCircuit },
    { id: 'scanner', label: 'Invoice Scanner', icon: Camera },
  ];
  const [isGovernanceProcessing, setIsGovernanceProcessing] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isAddShipmentOpen, setIsAddShipmentOpen] = useState(false);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [sessionTime, setSessionTime] = useState(30); // 30 seconds
  const [isReauthOpen, setIsReauthOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isDocumentScannerOpen, setIsDocumentScannerOpen] = useState(false);
  const [governanceStep, setGovernanceStep] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '> INITIALIZING NEURAL LINK... OK',
    '> SCANNING UK-GCC CORRIDOR... 2 VESSELS DETECTED',
    '> HPAY CLEARANCE PENDING: $850,000.00',
    '> NODE LHR-01 SYNC: 100%',
    '> WAITING FOR SOVEREIGN DIRECTIVE...'
  ]);
  const [terminalInput, setTerminalInput] = useState('');

  const handleTerminalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    setTerminalLogs(prev => [...prev, `> ${cmd.toUpperCase()}`]);
    setTerminalInput('');

    // Simulate AI response
    setTimeout(() => {
      setTerminalLogs(prev => [...prev, `> PROCESSING DIRECTIVE: ${cmd.toUpperCase()}...`, `> NEURAL CORE: ACTION AUTHORIZED. SYNCING WITH HPAY HUB.`]);
    }, 1000);
  };

  const scanDocument = async (file: File) => {
    if (!user) return;
    setIsScanning(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("GEMINI_API_KEY not set — document scanning uses AI and is unavailable.");
        setIsScanning(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            {
              parts: [
                { text: "Analyze this logistics document (invoice, packing list, or bill of lading). Extract: 1. HS Codes (as an array of objects with 'code', 'product', 'category'), 2. Consignee Name, 3. Total Value (as a number), 4. Origin/Destination. Return as JSON." },
                { inlineData: { mimeType: file.type, data: base64Data } }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                hsCodes: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      code: { type: Type.STRING },
                      product: { type: Type.STRING },
                      category: { type: Type.STRING }
                    },
                    required: ["code", "product", "category"]
                  }
                },
                consigneeName: { type: Type.STRING },
                totalValue: { type: Type.NUMBER },
                origin: { type: Type.STRING },
                destination: { type: Type.STRING }
              },
              required: ["hsCodes", "consigneeName", "totalValue", "origin", "destination"]
            }
          }
        });

        const ocrResult = JSON.parse(response.text || "{}");
        
        // Save to Firestore
        const docRef = await addDoc(collection(db, 'documents'), {
          name: file.name,
          type: file.type,
          status: 'processed',
          ocrData: ocrResult,
          userId: user.uid,
          createdAt: serverTimestamp()
        });

        // Save extracted HS Codes
        if (ocrResult.hsCodes && Array.isArray(ocrResult.hsCodes)) {
          for (const hs of ocrResult.hsCodes) {
            await addDoc(collection(db, 'hs_codes'), {
              ...hs,
              status: 'Review',
              duty: 'Pending',
              documentId: docRef.id,
              authorUid: user.uid,
              createdAt: serverTimestamp()
            });
          }
        }

        // Add notification
        await addDoc(collection(db, 'notifications'), {
          title: "Document Processed",
          message: `Successfully extracted data from ${file.name}`,
          type: 'success',
          read: false,
          userId: user.uid,
          createdAt: serverTimestamp()
        });

        setIsScanning(false);
        setIsDocumentScannerOpen(false);
      };
    } catch (err) {
      console.error("OCR failed", err);
      setIsScanning(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'notifications');
    }
  };
  const [aiAlert, setAiAlert] = useState<any>(null);
  const [voiceCommand, setVoiceCommand] = useState<string | null>(null);

  useEffect(() => {
    if (voiceCommand) {
      setTerminalInput(voiceCommand);
    }
  }, [voiceCommand]);
  const [capitalUnlocked, setCapitalUnlocked] = useState(124800);
  const [isNeuralFlashActive, setIsNeuralFlashActive] = useState(false);
  const [isPulseActive, setIsPulseActive] = useState(false);
  const [isBattlefieldView, setIsBattlefieldView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<string[]>([
    "Governance Check: MSC AMALFI [CLEARED - 12ms]",
    "H-Pay: AED 450k Settlement Initiated",
    "Scanner: OCR Extraction Complete [HS 1901.20]",
    "System: Neural Layer Synchronized",
    "Security: Biometric Handshake Verified"
  ]);

  const [isSeeding, setIsSeeding] = useState(false);

  const handleVoiceCommand = (cmd: string) => {
    const command = cmd.toLowerCase();
    setVoiceCommand(command);
    let matched = false;
    let feedback = "";

    // Role-based command restriction
    const isWriteCommand = command.includes('add') || command.includes('seed') || command.includes('update') || command.includes('delete');
    if (userRole === 'viewer' && isWriteCommand) {
      setAiAlert({
        title: "Access Denied",
        message: "Your current role (Viewer) does not permit write operations via voice.",
        type: "error",
        timestamp: new Date().toLocaleTimeString()
      });
      setTimeout(() => setAiAlert(null), 4000);
      return;
    }

    if (command.includes('overview') || command.includes('dashboard') || command.includes('نظرة عامة')) {
      setActiveModule('intelligence');
      matched = true;
      feedback = i18n.language === 'ar' ? "الانتقال إلى نظرة عامة" : "Navigating to Overview";
    } else if (command.includes('intelligence') || command.includes('map') || command.includes('corridor') || command.includes('الاستخبارات')) {
      setActiveModule('intelligence');
      matched = true;
      feedback = i18n.language === 'ar' ? "فتح ممرات الاستخبارات" : "Opening Intelligence Corridors";
    } else if (command.includes('trade') || command.includes('finance') || command.includes('payment') || command.includes('تمويل التجارة')) {
      setActiveModule('finance');
      matched = true;
      feedback = i18n.language === 'ar' ? "الوصول إلى تمويل التجارة" : "Accessing Trade Finance";
    } else if (command.includes('audit') || command.includes('ledger') || command.includes('log') || command.includes('تدقيق')) {
      setActiveModule('audit');
      matched = true;
      feedback = i18n.language === 'ar' ? "فتح سجل التدقيق" : "Opening Audit Ledger";
    } else if (command.includes('search for') || command.includes('find') || command.includes('ابحث عن')) {
      const query = command.includes('search for') 
        ? command.split('search for')[1].trim() 
        : command.includes('find')
          ? command.split('find')[1].trim()
          : command.split('ابحث عن')[1].trim();
      setSearchQuery(query);
      matched = true;
      feedback = i18n.language === 'ar' ? `البحث عن: ${query}` : `Searching for: ${query}`;
    } else if (command.includes('sign out') || command.includes('log out') || command.includes('exit') || command.includes('تسجيل الخروج')) {
      signOut(auth);
      matched = true;
      feedback = i18n.language === 'ar' ? "تسجيل الخروج..." : "Signing out...";
    } else if (command.includes('language') || command.includes('translate') || command.includes('arabic') || command.includes('english') || command.includes('لغة') || command.includes('ترجمة')) {
      const nextLang = i18n.language === 'en' ? 'ar' : 'en';
      toggleLanguage(nextLang);
      matched = true;
      feedback = `Switching language to ${nextLang.toUpperCase()}`;
    }

    if (matched) {
      setAiAlert({
        title: "Voice Command Recognized",
        message: feedback,
        type: "info",
        timestamp: new Date().toLocaleTimeString()
      });
      setTimeout(() => setAiAlert(null), 3000);
    } else if (command.length > 2) {
      setAiAlert({
        title: "Command Not Recognized",
        message: `Heard: "${command}". Try "Overview", "Intelligence", or "Search for..."`,
        type: "warning",
        timestamp: new Date().toLocaleTimeString()
      });
      setTimeout(() => setAiAlert(null), 4000);
    }
  };

  const seedDatabase = async () => {
    if (isSeeding || !auth.currentUser) {
      if (!auth.currentUser) {
        setActivityLogs(prev => ["Error: Authentication required to initialize neural core.", ...prev.slice(0, 14)]);
      }
      return;
    }
    setIsSeeding(true);
    try {
      // Seed stats
      // Note: This will fail if the user is not an admin, but that's expected per rules.
      try {
        await setDoc(doc(db, 'stats', 'global'), {
          accuracy: 99.4,
          shipmentsCount: 1240,
          settledAmount: 3.8
        });
      } catch (statErr) {
        console.warn("Stats seeding skipped (Admin access required)", statErr);
      }

      // Seed shipments
      for (const shipment of initialShipments) {
        try {
          await addDoc(collection(db, 'shipments'), {
            ...shipment,
            authorUid: auth.currentUser.uid,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'shipments');
        }
      }

      // Seed HS codes
      for (const hs of initialHsData) {
        try {
          await addDoc(collection(db, 'hs_codes'), {
            ...hs,
            authorUid: auth.currentUser.uid,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'hs_codes');
        }
      }

      // Seed settlements
      for (const settlement of initialSettlements) {
        try {
          await addDoc(collection(db, 'settlements'), {
            ...settlement,
            authorUid: auth.currentUser.uid,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'settlements');
        }
      }

      // Seed activity logs
      try {
        await addDoc(collection(db, 'activity_logs'), {
          message: "Neural Layer Synchronized: Database Seeded Successfully.",
          timestamp: serverTimestamp(),
          userId: auth.currentUser.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'activity_logs');
      }

      setIsNeuralFlashActive(true);
      setTimeout(() => setIsNeuralFlashActive(false), 2000);
      setActivityLogs(prev => ["Neural Layer Synchronized: Database Seeded Successfully.", ...prev.slice(0, 14)]);
    } catch (err) {
      console.error("Seeding failed", err);
      setActivityLogs(prev => ["Error: Seeding failed. Ensure Firestore rules allow writes.", ...prev.slice(0, 14)]);
    } finally {
      setIsSeeding(false);
    }
  };

  // Session & Inactivity Logic (Optimized)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetSessionTimer = () => {
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    lastActivityRef.current = Date.now();
    
    if (user && !isReauthOpen) {
      sessionTimerRef.current = setTimeout(() => {
        setIsReauthOpen(true);
      }, 30000); // 30 seconds
    }
  };

  useEffect(() => {
    if (user && !isReauthOpen) {
      resetSessionTimer();
    }
    return () => {
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current);
    };
  }, [user, isReauthOpen]);

  useEffect(() => {
    if (!user || isReauthOpen) return;

    let lastMove = 0;
    const throttledReset = () => {
      const now = Date.now();
      if (now - lastMove > 2000) { // Throttle to every 2 seconds
        resetSessionTimer();
        lastMove = now;
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, throttledReset, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledReset);
      });
    };
  }, [user, isReauthOpen]);

  // Dynamic Stats Fluctuation (Reduced frequency)
  useEffect(() => {
    const interval = setInterval(() => {
      const newLogs = [
        `Governance: Node ${Math.floor(Math.random() * 5) + 1} Verified`,
        `H-Pay: Transaction ${Math.random().toString(36).substring(7).toUpperCase()} Processed`,
        `Scanner: HS Code ${Math.floor(Math.random() * 9000) + 1000} Identified`,
        `System: Latency ${Math.floor(Math.random() * 20) + 5}ms`
      ];
      setActivityLogs(prev => [newLogs[Math.floor(Math.random() * newLogs.length)], ...prev.slice(0, 14)]);
    }, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Real-time ETA Simulation
  useEffect(() => {
    if (shipments.length === 0) return;
    const interval = setInterval(() => {
      setShipments(prev => prev.map(s => {
        if (s.status === 'Green') {
          const currentEta = s.eta instanceof Date ? s.eta : (s.eta?.toDate ? s.eta.toDate() : new Date(s.eta || '2026-03-28T14:00:00'));
          const adjustment = (Math.random() > 0.5 ? 1 : -1) * 3600000;
          const newEta = new Date(currentEta.getTime() + adjustment);
          return { ...s, eta: newEta };
        }
        return s;
      }));
    }, 60000); // Every 60 seconds
    return () => clearInterval(interval);
  }, [shipments.length]);

  const handleValidateIntent = () => {
    setIsScanning(true);
    setGovernanceStep(0);
    setIsNeuralFlashActive(true);
    setIsPulseActive(true);
    
    // Reset flash after animation
    setTimeout(() => setIsNeuralFlashActive(false), 1500);
    setTimeout(() => setIsPulseActive(false), 3000);

    // Sequential Governance Animation
    const steps = [1, 2, 3, 4, 5];
    steps.forEach((step, index) => {
      setTimeout(() => {
        setGovernanceStep(step);
        if (step === 5) {
          setIsScanning(false);
          // Trigger AI Alert randomly
          if (Math.random() > 0.7) setIsAlertOpen(true);
        }
      }, (index + 1) * 800);
    });
  };

  const handleAuthorizeSettlement = () => {
    // Cryptographic Signature Animation would be triggered here
    setActivityLogs(prev => ["Cryptographic Signature Verified. Settlement Authorized.", ...prev.slice(0, 14)]);
  };
  const [liveEvents, setLiveEvents] = useState<any[]>([
    { id: 1, text: "MSC FRANCESCA: Neural Governance Cleared", time: t('just_now') },
    { id: 2, text: "New Invoice Scanned: HS 0901.21", time: t('just_now') },
    { id: 3, text: "H-Pay Settlement: AED 340k Authorized", time: t('just_now') }
  ]);

  // Live Events Simulation
  useEffect(() => {
    const eventInterval = setInterval(() => {
      const eventPool = [
        t('event_compliance'),
        t('event_duty'),
        t('event_settlement'),
        t('event_port'),
        t('event_security'),
        t('event_audit')
      ];
      const randomEvent = eventPool[Math.floor(Math.random() * eventPool.length)];
      setLiveEvents(prev => [
        { id: Date.now(), text: randomEvent, time: t('just_now') },
        ...prev.slice(0, 4)
      ]);
    }, 30000); // Every 30 seconds
    return () => clearInterval(eventInterval);
  }, [t]);

  // Currency Helper based on Language
  const getCurrencySymbol = () => {
    switch (i18n.language) {
      case 'ar': return 'ر.س'; // Saudi Riyal for GCC context
      case 'fr': return '€';
      case 'de': return '€';
      case 'it': return '€';
      case 'es': return '€';
      default: return '£';
    }
  };

  const currencySymbol = getCurrencySymbol();

  // Capital Unlocked Logic
  useEffect(() => {
    const interval = setInterval(() => {
      // Logic: Every shipment marked 'AI-Governed' (status 'Green') increments the counter
      const governedShipments = shipments.filter(s => s.status === 'Green').length;
      if (governedShipments > 0) {
        setCapitalUnlocked(prev => prev + (governedShipments * 0.4)); // Simulated growth
      }
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [shipments]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        if (u) {
          setUser(u);
          try {
            const userDocRef = doc(db, 'users', u.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (!userDocSnap.exists()) {
              const defaultRole = u.email?.toLowerCase() === "muhammadusmanzulfiqar1984@gmail.com" ? 'admin' : 'viewer';
              const userData = {
                uid: u.uid,
                email: u.email,
                displayName: u.displayName,
                role: defaultRole,
                createdAt: serverTimestamp()
              };
              await setDoc(userDocRef, userData);
              setUserRole(defaultRole);
            } else {
              setUserRole(userDocSnap.data().role || 'viewer');
            }
          } catch (err) {
            console.error("Error fetching user role:", err);
          }

          setShowWelcome(false);
          resetSessionTimer();
        } else {
          setUser(null);
          setUserRole('viewer');
        }
      } finally {
        setIsLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen for global stats
    const statsUnsubscribe = onSnapshot(doc(db, 'stats', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAccuracy(data.accuracy || 99.1);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, 'stats/global'));

    // Listen for shipments
    const shipmentsQuery = query(collection(db, 'shipments'), orderBy('createdAt', 'desc'), limit(100));
    const shipmentsUnsubscribe = onSnapshot(shipmentsQuery, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setShipments(docs);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'shipments');
    });

    // Listen for HS codes
    const hsQuery = query(collection(db, 'hs_codes'), orderBy('createdAt', 'desc'), limit(100));
    const hsUnsubscribe = onSnapshot(hsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setHsData(docs);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'hs_codes'));

    // Listen for settlements
    const settlementsQuery = query(collection(db, 'settlements'), orderBy('createdAt', 'desc'), limit(100));
    const settlementsUnsubscribe = onSnapshot(settlementsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setSettlementsData(docs);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'settlements'));

    // Listen for activity logs
    const logsQuery = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(15));
    const logsUnsubscribe = onSnapshot(logsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => d.data().message);
        setActivityLogs(docs);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'activity_logs'));

    // Listen for audit logs
    const auditLogsQuery = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(15));
    const auditLogsUnsubscribe = onSnapshot(auditLogsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setAuditLogs(docs);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'audit_logs'));

    // Listen for users (Admin only)
    let usersUnsubscribe = () => {};
    if (userRole === 'admin') {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(100));
      usersUnsubscribe = onSnapshot(usersQuery, (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setUsers(docs);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));
    }

    // Listen for notifications
    let notificationsUnsubscribe = () => {};
    if (user) {
      const notificationsQuery = query(
        collection(db, 'notifications'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'), 
        limit(20)
      );
      notificationsUnsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setNotifications(docs);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'notifications'));
    }

    // Listen for documents
    let documentsUnsubscribe = () => {};
    if (user) {
      const documentsQuery = query(
        collection(db, 'documents'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'), 
        limit(10)
      );
      documentsUnsubscribe = onSnapshot(documentsQuery, (snapshot) => {
        const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setDocuments(docs);
      }, (err) => handleFirestoreError(err, OperationType.LIST, 'documents'));
    }

    return () => {
      statsUnsubscribe();
      shipmentsUnsubscribe();
      hsUnsubscribe();
      settlementsUnsubscribe();
      logsUnsubscribe();
      auditLogsUnsubscribe();
      usersUnsubscribe();
      notificationsUnsubscribe();
      documentsUnsubscribe();
    };
  }, [user, userRole]);

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      setShowWelcome(false);
    } catch (err) {
      console.error("Sign in failed", err);
      setActivityLogs(prev => ["Error: Sign in failed. Please try again.", ...prev.slice(0, 14)]);
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    setIsLoading(true);
    try {
      await signInAnonymously(auth);
      setShowWelcome(false);
    } catch (err) {
      console.error("Anonymous sign in failed", err);
      setActivityLogs(prev => ["Error: Face ID / Touch ID simulation failed.", ...prev.slice(0, 14)]);
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out failed", err);
    }
  };

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'ar', label: 'AR' },
    { code: 'fr', label: 'FR' },
    { code: 'de', label: 'DE' },
    { code: 'es', label: 'ES' },
    { code: 'it', label: 'IT' }
  ];

  const toggleLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    if (userRole === 'admin') {
      const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users');
      });
      return () => unsubscribe();
    }
  }, [userRole]);

  const handleUpdateRole = async (uid: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  };

  const handleAIUpdate = (action: any) => {
    // Handled via Firestore listeners now
  };

  const filteredShipments = useMemo(() => {
    let result = shipments;
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name?.toLowerCase().includes(lowerQuery) || 
        s.route?.toLowerCase().includes(lowerQuery) ||
        s.details?.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (shipmentSortConfig) {
      result = [...result].sort((a, b) => {
        let aVal = a[shipmentSortConfig.key];
        let bVal = b[shipmentSortConfig.key];
        
        if (shipmentSortConfig.key === 'eta') {
          aVal = aVal instanceof Date ? aVal.getTime() : (aVal?.toDate ? aVal.toDate().getTime() : new Date(aVal || 0).getTime());
          bVal = bVal instanceof Date ? bVal.getTime() : (bVal?.toDate ? bVal.toDate().getTime() : new Date(bVal || 0).getTime());
        } else {
          aVal = aVal?.toString().toLowerCase() || '';
          bVal = bVal?.toString().toLowerCase() || '';
        }
        
        if (aVal < bVal) return shipmentSortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return shipmentSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [shipments, searchQuery, shipmentSortConfig]);

  const hsCategories = useMemo(() => {
    return ['All', ...new Set(initialHsData.map(item => item.category))];
  }, []);

  const filteredHsData = useMemo(() => {
    let data = hsData;
    
    // Apply Status Filter
    if (hsStatusFilter !== 'All') {
      data = data.filter(item => item.status === hsStatusFilter);
    }
    
    // Apply Category Filter
    if (hsCategoryFilter !== 'All') {
      data = data.filter(item => item.category === hsCategoryFilter);
    }

    if (!searchQuery.trim()) return data;
    
    const fuse = new Fuse(data, {
      keys: ['code', 'product', 'duty', 'status', 'category'],
      threshold: 0.3,
    });
    
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, hsStatusFilter, hsCategoryFilter]);

  const filteredSettlements = useMemo(() => {
    if (!searchQuery.trim()) return settlementsData;
    const lowerQuery = searchQuery.toLowerCase();
    return settlementsData.filter(s => 
      s.name.toLowerCase().includes(lowerQuery) || 
      s.type.toLowerCase().includes(lowerQuery) ||
      s.amount.toLowerCase().includes(lowerQuery) ||
      s.status.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, settlementsData]);

  const chartData = [
    { name: 'Jan', value: 400, benchmark: 420 },
    { name: 'Feb', value: 300, benchmark: 350 },
    { name: 'Mar', value: 600, benchmark: 580 },
    { name: 'Apr', value: 800, benchmark: 750 },
    { name: 'May', value: 500, benchmark: 520 },
    { name: 'Jun', value: shipmentsCount, benchmark: 600 },
  ];

  const complianceData = [
    { label: 'UAE Customs (FCSA)', value: 98.4 },
    { label: 'Saudi FASAH', value: 97.1 },
    { label: 'Oman Bayan (12-digit)', value: 99.6 },
    { label: 'Qatar & Bahrain', value: 96.8 },
    { label: 'UK HMRC Export', value: 100 },
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[300] bg-[#F5F5F0] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-2xl border-2 border-harvics-maroon/20 flex items-center justify-center hex-shield animate-pulse">
          <Shield className="w-8 h-8 text-harvics-maroon/40" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[10px] font-bold maroon-text uppercase tracking-[0.3em] opacity-40 animate-pulse">Initializing Sovereign Core</p>
          <div className="w-32 h-0.5 bg-harvics-maroon/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-full h-full bg-harvics-maroon/20"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginPage 
        onSignIn={handleSignIn}
        onAnonymousSignIn={handleAnonymousSignIn}
        languages={languages}
        onLanguageChange={toggleLanguage}
        isLoading={isLoading}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen flex flex-col bg-[#F5F5F0] selection:bg-harvics-gold/30 transition-all duration-1000 ${i18n.language.startsWith('ar') ? 'font-arabic text-right' : 'font-sans'}`} dir={i18n.language.startsWith('ar') ? 'rtl' : 'ltr'}>
        {/* Neural Flash Overlay */}
        {isNeuralFlashActive && <div className="neural-flash-bar animate-[neural-flash_1.5s_ease-in-out_forwards]" />}
        
        {/* Sovereign Session Overlay */}
        <AnimatePresence>
          {isReauthOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-start py-12 overflow-y-auto bg-harvics-maroon/90 backdrop-blur-2xl px-4"
            >
              <div className="bg-white p-10 rounded-3xl max-w-md text-center flex flex-col items-center gap-6 border border-harvics-gold/30 shadow-2xl">
                <div className="w-20 h-20 rounded-3xl border-2 border-harvics-gold flex items-center justify-center hex-shield">
                  <Shield className="w-10 h-10 text-harvics-gold" />
                </div>
                <div className="flex flex-col gap-2">
                  <h2 className="font-serif text-2xl maroon-text">{t('session_expired')}</h2>
                  <p className="maroon-text opacity-60 text-sm">{t('reauth_required')}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full mt-2">
                  <button 
                    onClick={() => {
                      setSessionTime(30);
                      setIsReauthOpen(false);
                    }}
                    className="flex flex-col items-center justify-center gap-3 p-6 glass-card rounded-3xl border border-harvics-gold/20 hover:bg-harvics-gold/10 transition-all group"
                  >
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-harvics-gold/30 rounded-3xl group-hover:scale-110 transition-transform" />
                      <ScanFace className="w-6 h-6 text-harvics-gold" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-harvics-gold">Face ID</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setSessionTime(30);
                      setIsReauthOpen(false);
                    }}
                    className="flex flex-col items-center justify-center gap-3 p-6 glass-card rounded-3xl border border-harvics-gold/20 hover:bg-harvics-gold/10 transition-all group"
                  >
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-harvics-gold/30 rounded-3xl group-hover:scale-110 transition-transform" />
                      <Fingerprint className="w-6 h-6 text-harvics-gold" />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-harvics-gold">Touch ID</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Critical Alert Modal */}
        <AnimatePresence>
          {isAlertOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex flex-col items-center justify-start py-12 overflow-y-auto p-4 bg-harvics-maroon/60 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-rose-500/30"
              >
                <div className="bg-rose-600 p-6 flex items-center gap-4 text-white">
                  <div className="p-3 bg-white/20 rounded-3xl">
                    <AlertTriangle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-serif text-2xl text-rose-600">{t('critical_risk_detected')}</h3>
                    <p className="text-white/80 text-sm">AI Governance Engine: High Variance Identified</p>
                  </div>
                </div>
                <div className="p-8 flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold maroon-text uppercase tracking-widest opacity-40">Risk Factor</span>
                      <p className="text-sm font-medium maroon-text">Discrepancy in HS Code 1901.20 vs Manifest Weight.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold maroon-text uppercase tracking-widest opacity-40">Mitigation Step</span>
                      <p className="text-sm font-medium text-rose-600">Hold shipment for manual neural inspection.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setIsAlertOpen(false)} className="flex-1 py-4 bg-harvics-maroon text-white font-bold rounded-3xl uppercase tracking-widest">
                      {t('acknowledge')}
                    </button>
                    <button onClick={() => setIsAlertOpen(false)} className="flex-1 py-4 border-2 border-harvics-maroon maroon-text font-bold rounded-3xl uppercase tracking-widest">
                      {t('override')}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showWelcome && (
            <WelcomeModal 
              onClose={() => setShowWelcome(false)} 
              user={user}
              languages={languages} 
              onLanguageChange={toggleLanguage}
              onSeed={seedDatabase}
              isSeeding={isSeeding}
              onCommand={handleVoiceCommand}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isNotificationOpen && (
            <NotificationCenter 
              notifications={notifications} 
              onClose={() => setIsNotificationOpen(false)} 
              onMarkRead={markNotificationRead}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAddShipmentOpen && (
            <AddShipmentModal 
              onClose={() => setIsAddShipmentOpen(false)} 
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isAddTransactionOpen && (
            <AddTransactionModal 
              onClose={() => setIsAddTransactionOpen(false)} 
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isDocumentScannerOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] flex flex-col items-center justify-center p-4 bg-harvics-maroon/60 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative"
              >
                <button 
                  onClick={() => setIsDocumentScannerOpen(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-harvics-maroon/5 rounded-3xl transition-colors z-10"
                >
                  <X className="w-4 h-4 maroon-text opacity-40" />
                </button>
                <DocumentScanner onScan={scanDocument} isScanning={isScanning} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Shell - Floating Frosted Glass Pill */}
        <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center justify-between w-full max-w-[1200px] bg-white/40 backdrop-blur-2xl border border-white/20 px-6 py-3 rounded-full shadow-[0_8px_32px_rgba(90,15,26,0.12)]">
            {/* Left: Harvics Shield */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-harvics-maroon flex items-center justify-center shadow-[0_0_15px_rgba(90,15,26,0.3)] flex-shrink-0 border border-harvics-gold/30">
                <ShieldCheck className="w-5 h-5 text-harvics-gold" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-serif font-bold maroon-text tracking-widest uppercase">Harvics</span>
                <span className="text-[8px] maroon-text opacity-40 uppercase tracking-[0.2em]">Interfreight</span>
              </div>
            </div>

            {/* Center: Title & Neural Core */}
            <div className="flex items-center gap-6 hidden lg:flex">
              <div className="flex flex-col items-center">
                <h1 className="font-serif text-xl maroon-text tracking-[0.15em] uppercase">Neural Logistics Network</h1>
              </div>
              <div className="w-10 h-10 rounded-full bg-harvics-maroon/5 border border-harvics-maroon/10 flex items-center justify-center relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-harvics-maroon/20 rounded-full"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-2 h-2 rounded-full bg-harvics-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]"
                />
              </div>
            </div>

            {/* Right: Profile */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold maroon-text uppercase tracking-widest">Admin: Level 5</span>
                <span className="text-[8px] maroon-text opacity-40 uppercase tracking-widest">{user?.displayName || 'Authorized User'}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-harvics-maroon flex items-center justify-center text-xs font-bold text-harvics-gold border border-harvics-gold/30">
                {user?.displayName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col pt-24 pb-12">
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-8">
            {isLoading && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <div className="w-12 h-12 border-4 border-harvics-maroon border-t-harvics-gold rounded-3xl animate-spin" />
              </div>
            )}
            {!isLoading && user && shipments.length === 0 && !isSeeding && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 backdrop-blur-sm p-4">
                <div className="bg-white p-10 rounded-3xl max-w-md text-center flex flex-col items-center gap-6 border border-harvics-maroon/5 shadow-2xl">
                  <div className="w-20 h-20 rounded-3xl bg-harvics-gold flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.4)]">
                    <Globe className="w-10 h-10 text-harvics-maroon" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h2 className="font-serif text-2xl maroon-text">System Offline</h2>
                    <p className="text-sm maroon-text opacity-60">Neural layers require initialization to synchronize with global logistics data.</p>
                  </div>
                  <button 
                    onClick={seedDatabase}
                    className="w-full py-4 bg-harvics-maroon text-white font-bold rounded-3xl uppercase tracking-widest hover:bg-harvics-gold hover:text-harvics-maroon transition-all shadow-lg"
                  >
                    Initialize Neural Core
                  </button>
                </div>
              </div>
            )}
            {/* Hero Section: 100% Clean Neural Map */}
            <section className="mb-8 rounded-[40px] overflow-hidden border border-harvics-maroon/10 shadow-[0_32px_128px_rgba(90,15,26,0.2)] bg-[#1A1A1A] h-[400px] relative group">
              <LogisticsMap 
                shipments={shipments} 
                voiceCommand={voiceCommand} 
                isNaked={true}
                onAddShipment={async (shipmentData) => {
                  try {
                    await addDoc(collection(db, 'shipments'), {
                      ...shipmentData,
                      createdAt: serverTimestamp(),
                      authorUid: user?.uid,
                    });
                  } catch (err) {
                    handleFirestoreError(err, OperationType.CREATE, 'shipments');
                  }
                }}
              />
            </section>

            {/* Floating Data Banners: Horizontal Marquee Slider */}
            <section className="mb-12 overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#F5F5F0] to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#F5F5F0] to-transparent z-10" />
              
              <motion.div 
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="flex gap-8 whitespace-nowrap w-max px-4"
              >
                {[1, 2].map((set) => (
                  <div key={set} className="flex gap-8">
                    {/* Banner 1: Vessel Intel */}
                    <motion.div 
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="bg-white/60 backdrop-blur-xl border border-harvics-maroon/5 px-8 py-4 rounded-[32px] shadow-[0_8px_32px_rgba(90,15,26,0.04)] flex items-center gap-4 min-w-[400px]"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-harvics-maroon flex items-center justify-center shadow-lg shrink-0">
                        <Ship className="w-5 h-5 text-harvics-gold" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-harvics-gold uppercase tracking-widest font-mono">Vessel Intel</span>
                        <span className="text-harvics-maroon font-serif text-sm tracking-wide">🚢 LIVE: EVER GIVEN | POS: RED SEA | ETA: 08:00 DXB</span>
                      </div>
                    </motion.div>

                    {/* Banner 2: Node Health */}
                    <motion.div 
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="bg-white/60 backdrop-blur-xl border border-harvics-maroon/5 px-8 py-4 rounded-[32px] shadow-[0_8px_32px_rgba(90,15,26,0.04)] flex items-center gap-4 min-w-[400px]"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-harvics-maroon flex items-center justify-center shadow-lg shrink-0">
                        <ShieldCheck className="w-5 h-5 text-harvics-gold" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-harvics-gold uppercase tracking-widest font-mono">Node Health</span>
                        <span className="text-harvics-maroon font-serif text-sm tracking-wide">🛡️ NODE LHR-01: OPTIMAL | LATENCY: 12ms | SYNC: 100%</span>
                      </div>
                    </motion.div>

                    {/* Banner 3: Financial */}
                    <motion.div 
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="bg-white/60 backdrop-blur-xl border border-harvics-maroon/5 px-8 py-4 rounded-[32px] shadow-[0_8px_32px_rgba(90,15,26,0.04)] flex items-center gap-4 min-w-[400px]"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-harvics-maroon flex items-center justify-center shadow-lg shrink-0">
                        <Diamond className="w-5 h-5 text-harvics-gold" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-harvics-gold uppercase tracking-widest font-mono">Financial</span>
                        <span className="text-harvics-maroon font-serif text-sm tracking-wide">💎 HPAY SETTLED: $1,240,500.00 | UK-GCC CORRIDOR</span>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </motion.div>
            </section>

            {/* AI Command Module: Terminal & Scanner */}
            <section className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-0">
              {/* AI Command Terminal (Left Side - 2/3 width) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-2 bg-white/60 backdrop-blur-2xl border border-harvics-maroon/5 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(90,15,26,0.15)] flex flex-col overflow-hidden"
              >
                <div className="px-8 py-6 border-b border-harvics-maroon/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-harvics-maroon flex items-center justify-center">
                      <Terminal className="w-4 h-4 text-harvics-gold" />
                    </div>
                    <h2 className="font-serif text-xl maroon-text font-bold tracking-tight">Neural Command Center</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest font-mono">Link Active</span>
                  </div>
                </div>
                
                <div className="flex-1 p-8 font-mono text-xs maroon-text/80 space-y-3 overflow-y-auto max-h-[250px] custom-scrollbar">
                  {terminalLogs.map((log, i) => (
                    <p key={i} className={log.includes('PENDING') ? 'font-bold text-harvics-maroon' : 'opacity-60'}>{log}</p>
                  ))}
                </div>

                <div className="p-6 bg-harvics-maroon/5 border-t border-harvics-maroon/5">
                  <form onSubmit={handleTerminalSubmit} className="relative">
                    <input 
                      type="text" 
                      value={terminalInput}
                      onChange={(e) => setTerminalInput(e.target.value)}
                      placeholder="Enter Sovereign Directive..."
                      className="w-full bg-white/80 border border-harvics-maroon/10 rounded-2xl px-6 py-4 text-sm maroon-text placeholder:maroon-text/30 focus:outline-none focus:ring-2 focus:ring-harvics-gold/50 transition-all"
                    />
                    <button 
                      type="button"
                      onClick={toggleListening}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${isListening ? 'bg-harvics-gold text-harvics-maroon' : 'hover:bg-harvics-maroon/5 text-harvics-maroon'}`}
                    >
                      <Mic2 className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                    </button>
                  </form>
                </div>
              </motion.div>

              {/* Invoice AI Scanner (Right Side - 1/3 width) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                onClick={() => scannerFileInputRef.current?.click()}
                className="bg-white/60 backdrop-blur-2xl border border-harvics-maroon/5 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(90,15,26,0.15)] flex flex-col items-center justify-center p-8 relative overflow-hidden aspect-square lg:aspect-auto cursor-pointer group hover:border-harvics-gold/30 transition-all"
              >
                <input 
                  type="file" 
                  ref={scannerFileInputRef}
                  className="hidden"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    if (e.target.files?.[0]) scanDocument(e.target.files[0]);
                  }}
                />
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-harvics-gold to-transparent animate-[scanline_3s_ease-in-out_infinite] z-20" />
                
                <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
                  <div className="w-48 h-64 bg-white/40 border border-harvics-maroon/10 rounded-xl shadow-inner flex flex-col p-4 gap-3 relative overflow-hidden group-hover:scale-105 transition-transform">
                    <div className="w-full h-2 bg-harvics-maroon/10 rounded-full" />
                    <div className="w-3/4 h-2 bg-harvics-maroon/10 rounded-full" />
                    <div className="w-1/2 h-2 bg-harvics-maroon/10 rounded-full" />
                    <div className="mt-auto w-full h-12 border-2 border-dashed border-harvics-maroon/10 rounded-lg flex items-center justify-center">
                      <Camera className="w-6 h-6 maroon-text opacity-20" />
                    </div>
                    
                    {/* Floating Data Tags */}
                    <motion.div 
                      animate={{ y: [0, -4, 0], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-10 right-2 bg-harvics-maroon text-harvics-gold text-[8px] font-bold px-2 py-1 rounded-full shadow-lg z-30"
                    >
                      HS CODE: 8471.30
                    </motion.div>
                    <motion.div 
                      animate={{ y: [0, 4, 0], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                      className="absolute top-24 left-2 bg-harvics-gold text-harvics-maroon text-[8px] font-bold px-2 py-1 rounded-full shadow-lg z-30"
                    >
                      ORIGIN: UK
                    </motion.div>
                    <motion.div 
                      animate={{ y: [0, -3, 0], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                      className="absolute bottom-20 right-4 bg-white border border-harvics-maroon/20 text-harvics-maroon text-[8px] font-bold px-2 py-1 rounded-full shadow-lg z-30"
                    >
                      DEST: UAE (GCC)
                    </motion.div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-harvics-gold animate-ping" />
                      <span className="text-[10px] font-bold maroon-text uppercase tracking-widest">Scanning: 88% Complete</span>
                    </div>
                    <div className="w-48 h-1 bg-harvics-maroon/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '88%' }}
                        className="h-full bg-harvics-gold"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Control Row: Action Capsules */}
            <section className="mb-10 flex gap-4 overflow-x-auto scrollbar-hide px-4 py-2">
              {[
                { id: 'voice', icon: Mic2, label: 'Voice' },
                { id: 'intelligence', icon: Zap, label: 'Intelligence' },
                { id: 'settlement', icon: CreditCard, label: 'U Pay' },
                { id: 'ai_center', icon: BrainCircuit, label: 'AI Commerce Centre' },
                { id: 'audit', icon: ShieldCheck, label: 'Audit' }
              ].map((item) => {
                const isActive = activeModule === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveModule(item.id);
                      if (item.id !== 'voice') {
                        document.getElementById('module-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-[0_8px_24px_rgba(90,15,26,0.06)] border transition-all duration-500 flex-shrink-0 ${
                      isActive 
                        ? 'bg-harvics-maroon border-harvics-gold/30 shadow-xl scale-105' 
                        : 'bg-white border-harvics-maroon/5 hover:border-harvics-gold/20 hover:shadow-lg'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive ? 'bg-harvics-gold rotate-[360deg]' : 'bg-harvics-maroon/5'
                    }`}>
                      <Icon className={`w-3 h-3 ${isActive ? 'text-harvics-maroon' : 'text-harvics-maroon/60'}`} />
                    </div>
                    <span className={`text-[10px] font-serif font-bold uppercase tracking-[0.2em] ${isActive ? 'text-white' : 'text-harvics-maroon/60'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </section>

            {/* Integrated Board: Data Board with Dot-Grid */}
            <section className="mb-32 relative">
              <div className="bg-[#F5F5F0] rounded-[48px] p-8 shadow-[inset_0_4px_24px_rgba(0,0,0,0.05)] border border-harvics-maroon/5 relative overflow-hidden group min-h-[600px]">
                {/* Dot-Grid Paper Texture */}
                <div className="absolute inset-0 opacity-[0.08] pointer-events-none dot-grid" />
                
                {/* Top Shell: Frosted Glass Header for Data Board */}
                <div className="relative z-10 flex items-center justify-between mb-10 bg-white/40 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-harvics-maroon flex items-center justify-center border border-harvics-gold/30">
                      <Activity className="w-5 h-5 text-harvics-gold" />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="font-serif text-xl maroon-text font-bold tracking-tight">Live Tracking Intelligence</h2>
                      <p className="text-[9px] maroon-text opacity-40 uppercase tracking-widest">Real-time Neural Asset Synchronization</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest font-serif">System Optimal</span>
                    </div>
                  </div>
                </div>

                {/* Data Board Content */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {shipments.slice(0, 6).map((shipment) => (
                    <motion.div
                      key={shipment.id}
                      whileHover={{ y: -5 }}
                      className="bg-white/80 backdrop-blur-md border border-white p-6 rounded-[32px] shadow-sm hover:shadow-xl transition-all group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-harvics-maroon/5 flex items-center justify-center group-hover:bg-harvics-maroon transition-colors">
                          <Truck className="w-6 h-6 text-harvics-maroon group-hover:text-harvics-gold transition-colors" />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-serif font-bold maroon-text uppercase tracking-widest">{shipment.name}</span>
                          <span className="text-[8px] maroon-text opacity-40 font-mono">ID: {shipment.id.slice(0, 8)}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] maroon-text opacity-40 uppercase tracking-widest font-bold">Route</span>
                          <span className="text-[11px] maroon-text font-bold font-serif">{shipment.route}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] maroon-text opacity-40 uppercase tracking-widest font-bold">Status</span>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${shipment.status === 'Green' ? 'bg-emerald-500' : shipment.status === 'Amber' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                            <span className={`text-[9px] font-bold uppercase tracking-widest font-serif ${shipment.status === 'Green' ? 'text-emerald-600' : shipment.status === 'Amber' ? 'text-amber-600' : 'text-rose-600'}`}>
                              {shipment.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-harvics-maroon/5 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[8px] maroon-text opacity-30 uppercase tracking-tighter">Velocity</span>
                          <span className="text-sm font-serif font-bold maroon-text">18.4 kts</span>
                        </div>
                        <button className="p-2 bg-harvics-maroon/5 rounded-xl hover:bg-harvics-maroon hover:text-white transition-all">
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Bottom Shell: Permanent Floating Command Pill */}
              <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-1 bg-harvics-maroon/90 backdrop-blur-2xl border border-harvics-gold/30 p-2 rounded-full shadow-[0_16px_48px_rgba(90,15,26,0.4)]">
                  {[
                    { icon: Home, label: 'Home' },
                    { icon: Wallet, label: 'Wallet' },
                    { icon: Compass, label: 'Discovery' },
                    { icon: Bot, label: 'AI' },
                    { icon: FileText, label: 'Reports' },
                    { icon: Settings, label: 'Settings' }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        className="group relative flex items-center justify-center w-12 h-12 rounded-full hover:bg-white/10 transition-all"
                        title={item.label}
                      >
                        <Icon className="w-5 h-5 text-white/60 group-hover:text-harvics-gold transition-colors" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-harvics-maroon border border-harvics-gold/20 rounded-lg text-[8px] text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-serif">
                          {item.label}
                        </span>
                        {item.label === 'AI' && (
                          <div className="absolute top-2 right-2 w-2 h-2 bg-harvics-gold rounded-full animate-pulse shadow-[0_0_8px_rgba(198,165,90,0.8)]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Active Module Content */}
            <div id="module-content" className="scroll-mt-32 bg-[#F5F5F0] dot-grid rounded-3xl p-6 shadow-[0_20px_40px_rgba(90,15,26,0.08)] border border-harvics-maroon/5 min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full"
                >
                  {activeModule === 'voice' && (
                    <div className="flex flex-col items-center justify-center py-12 gap-8">
                      <div className="relative">
                        <motion.div
                          animate={{
                            scale: isListening ? [1, 1.2, 1] : 1,
                            opacity: isListening ? [0.3, 0.6, 0.3] : 0.3
                          }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute inset-0 bg-harvics-maroon rounded-full blur-3xl"
                        />
                        <button
                          onClick={toggleListening}
                          className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                            isListening ? 'bg-harvics-maroon scale-110' : 'bg-white hover:bg-harvics-maroon/5'
                          }`}
                        >
                          <Mic2 className={`w-10 h-10 ${isListening ? 'text-harvics-gold animate-pulse' : 'text-harvics-maroon'}`} />
                        </button>
                      </div>
                      <div className="text-center flex flex-col gap-2">
                        <h3 className="font-serif text-2xl maroon-text font-bold">
                          {isListening ? 'Neural Core Listening...' : 'Neural Voice Command'}
                        </h3>
                        <p className="text-xs maroon-text opacity-40 uppercase tracking-widest max-w-md">
                          {isListening ? 'Speak your logistics query or command' : 'Tap the microphone to initiate neural voice processing'}
                        </p>
                      </div>
                      {voiceCommand && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white/80 backdrop-blur-xl border border-harvics-maroon/10 p-6 rounded-3xl shadow-xl max-w-lg w-full"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-harvics-maroon flex items-center justify-center">
                              <Terminal className="w-4 h-4 text-harvics-gold" />
                            </div>
                            <span className="text-[10px] font-bold maroon-text uppercase tracking-widest">Neural Response</span>
                          </div>
                          <p className="text-sm maroon-text leading-relaxed font-serif italic">
                            "{voiceCommand}"
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {activeModule === 'intelligence' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-white rounded-3xl p-6 border border-harvics-maroon/10 shadow-sm">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-harvics-maroon/5 flex items-center justify-center">
                                <Activity className="w-4 h-4 maroon-text" />
                              </div>
                              <h2 className="font-serif text-xl maroon-text">{t('network_telemetry')}</h2>
                            </div>
                          </div>
                          <div className="h-[400px]">
                            <TradeFinanceChart data={shipments} />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-6">
                        <NeuralGovernance 
                          contextData={{ shipments, hsData, settlements: settlementsData, searchQuery }} 
                          onProcessingChange={setIsLoading}
                          onAlert={(alert) => setNotifications(prev => [{ id: Math.random().toString(), type: 'alert', message: alert.message, time: 'Just now', read: false }, ...prev])}
                        />
                      </div>
                    </div>
                  )}

                  {activeModule === 'hs_data' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <HSClassification shipments={shipments} onClassify={(data) => setHsData(prev => [data, ...prev])} />
                      </div>
                      <div className="bg-white rounded-3xl p-6 border border-harvics-maroon/10 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 maroon-text">Recent Classifications</h3>
                        <div className="flex flex-col gap-4">
                          {hsData.slice(0, 5).map((item, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-harvics-maroon/[0.02] border border-harvics-maroon/5">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold maroon-text">{item.code}</span>
                                <span className="text-[8px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">98% Match</span>
                              </div>
                              <p className="text-[10px] opacity-60 leading-tight">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModule === 'compliance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <CustomsCompliance shipments={shipments} />
                      </div>
                      <div className="bg-white rounded-3xl p-6 border border-harvics-maroon/10 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <Shield className="w-5 h-5 maroon-text" />
                          <h3 className="text-xs font-bold uppercase tracking-widest maroon-text">Compliance Score</h3>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                          <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-harvics-maroon/5" />
                              <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 * (1 - 0.94)} className="text-harvics-gold" />
                            </svg>
                            <span className="absolute text-2xl font-serif maroon-text">94%</span>
                          </div>
                          <p className="text-[10px] text-center opacity-60">Your organization is currently operating within optimal compliance parameters.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModule === 'regional' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl p-6 border border-harvics-maroon/10 shadow-sm">
                          <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-harvics-maroon/5 flex items-center justify-center">
                                <Activity className="w-4 h-4 maroon-text" />
                              </div>
                              <h2 className="font-serif text-xl maroon-text">{t('operations_feed')}</h2>
                            </div>
                          </div>
                          <div className="flex flex-col gap-4">
                            {notifications.map((n) => (
                              <div key={n.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-harvics-maroon/[0.02] transition-colors border border-transparent hover:border-harvics-maroon/5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  n.type === 'alert' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                  {n.type === 'alert' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <p className="text-xs font-bold maroon-text">{n.message}</p>
                                  <span className="text-[10px] opacity-40 uppercase tracking-widest">{n.time}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="bg-harvics-maroon rounded-3xl p-6 text-white shadow-xl">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-harvics-gold">System Status</h3>
                        <div className="flex flex-col gap-6">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest opacity-60">Neural Core</span>
                            <span className="text-[10px] font-bold text-emerald-400">OPTIMAL</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest opacity-60">Latency</span>
                            <span className="text-[10px] font-bold">14ms</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase tracking-widest opacity-60">Sync Rate</span>
                            <span className="text-[10px] font-bold">99.9%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModule === 'tracking' && (
                    <div className="flex flex-col gap-4">
                      <h2 className="font-serif text-xl maroon-text mb-2">Live Tracking</h2>
                      {shipments.map((shipment) => (
                        <div key={shipment.id} className="bg-white rounded-xl p-3 shadow-[0_4px_12px_rgba(90,15,26,0.04)] border border-harvics-maroon/5 flex items-center justify-between">
                          <div>
                            <h3 className="font-serif text-base maroon-text flex items-center gap-2">
                              {shipment.name === 'MAERSK HANOI' ? 'MAERSK ALPHA' : shipment.name} 
                              <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-harvics-gold">{shipment.status}</span>
                            </h3>
                            <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-harvics-maroon/40 mt-0.5 block">
                              {typeof shipment.details === 'string' ? (shipment.details.includes('.00.') ? shipment.details : shipment.details.replace(']', '.00.1234]')) : 'Details Unavailable'} • {shipment.route}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] font-sans font-bold uppercase tracking-widest text-harvics-maroon/40 block mb-0.5">ETA</span>
                            <span className="font-serif text-sm maroon-text">
                              {shipment.eta ? (shipment.eta?.toDate ? shipment.eta.toDate() : new Date(shipment.eta)).toLocaleDateString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeModule === 'settlement' && (
                    <HPayFinancialHub shipments={shipments} />
                  )}

                  {activeModule === 'finance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <TradeFinance shipments={shipments} />
                      </div>
                      <div className="bg-white rounded-3xl p-6 border border-harvics-maroon/10 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 maroon-text">Market Indicators</h3>
                        <div className="flex flex-col gap-4">
                          {[
                            { label: 'USD/AED', value: '3.67', trend: '+0.01%' },
                            { label: 'Freight Index', value: '2,450', trend: '-2.4%' },
                            { label: 'Oil (Brent)', value: '$82.40', trend: '+1.2%' }
                          ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-harvics-maroon/[0.02]">
                              <span className="text-[10px] font-bold maroon-text">{item.label}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono">{item.value}</span>
                                <span className={`text-[8px] font-bold ${item.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>{item.trend}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModule === 'audit' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <AuditLedger />
                      </div>
                      <div className="flex flex-col gap-6">
                        <div className="bg-white rounded-3xl p-6 border border-harvics-maroon/10 shadow-sm">
                          <div className="flex items-center gap-3 mb-6">
                            <Shield className="w-5 h-5 maroon-text" />
                            <h3 className="text-xs font-bold uppercase tracking-widest maroon-text">Neural Status</h3>
                          </div>
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] opacity-60 uppercase tracking-widest">Sync Health</span>
                              <span className="text-[10px] font-bold text-emerald-600">99.9%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] opacity-60 uppercase tracking-widest">AI Confidence</span>
                              <span className="text-[10px] font-bold text-harvics-gold">HIGH</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModule === 'ai_center' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <AICommandCenter />
                      </div>
                      <div className="bg-harvics-maroon rounded-3xl p-6 text-white shadow-xl">
                        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-harvics-gold">Neural Topology</h3>
                        <div className="flex flex-col gap-4">
                          <div className="h-32 flex items-center justify-center border border-white/10 rounded-2xl bg-white/5">
                            <BrainCircuit className="w-12 h-12 text-harvics-gold opacity-20 animate-pulse" />
                          </div>
                          <p className="text-[9px] opacity-60 text-center">Neural network is currently optimizing for regional trade patterns in the GCC area.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeModule === 'scanner' && (
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-3xl maroon-header flex items-center justify-center">
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="font-serif text-xl maroon-text">Invoice Scanner</h2>
                      </div>
                      <InvoiceScanner onAddHsCode={async (newCode) => {
                        try {
                          await addDoc(collection(db, 'hs_codes'), {
                            ...newCode,
                            authorUid: auth.currentUser?.uid,
                            createdAt: Timestamp.now()
                          });
                        } catch (err) {
                          handleFirestoreError(err, OperationType.CREATE, 'hs_codes');
                        }
                      }} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
        </main>

        {/* Sovereign Activity Feed Sidebar */}
        <aside className="hidden xl:flex w-80 frosted-glass border-s border-harvics-maroon/5 flex-col sticky top-[53px] h-[calc(100vh-53px)]">
          <div className="p-6 border-b border-harvics-maroon/5 flex items-center justify-between">
            <h2 className="text-[10px] font-bold maroon-text uppercase tracking-[0.2em]">{t('sovereign_activity')}</h2>
            <Activity className="w-4 h-4 maroon-text opacity-40" />
          </div>
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {activityLogs.map((log, i) => (
                <motion.div
                  key={log + i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-1 p-3 bg-white/40 rounded-3xl border border-white/20 pulse-event"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] font-mono maroon-text opacity-40">{new Date().toLocaleTimeString()}</span>
                    <div className="w-1 h-1 rounded-3xl bg-harvics-gold" />
                  </div>
                  <p className="text-[9px] font-bold maroon-text leading-tight">{log}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="p-6 border-t border-harvics-maroon/5 bg-harvics-maroon/5">
            <div className="flex flex-col gap-2">
              <span className="text-[8px] font-bold maroon-text uppercase tracking-widest opacity-40">Neural Sync Status</span>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold maroon-text">ACTIVE</span>
                <span className="text-[10px] font-mono font-bold text-emerald-600">99.99%</span>
              </div>
            </div>
          </div>
        </aside>
      </div>

        <ChatBot contextData={{
          shipments: filteredShipments,
          hsData: filteredHsData,
          settlements: filteredSettlements,
          searchQuery: searchQuery
        }} />

        {/* AI Alert Toast */}
        <AnimatePresence>
          {aiAlert && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-24 right-8 z-[100] w-80"
            >
              <div className={`p-4 rounded-3xl shadow-2xl border backdrop-blur-xl ${
                aiAlert.type === 'warning' 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-700' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-3xl animate-pulse ${
                    aiAlert.type === 'warning' ? 'bg-rose-500' : 'bg-emerald-500'
                  }`} />
                  <div className="flex flex-col gap-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                      {aiAlert.title}
                    </h4>
                    <p className="text-xs font-semibold leading-tight">
                      {aiAlert.message}
                    </p>
                    <span className="text-[8px] font-mono opacity-40 mt-1">
                      {aiAlert.timestamp}
                    </span>
                  </div>
                  <button 
                    onClick={() => setAiAlert(null)}
                    className="ml-auto opacity-40 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Command Pill (Footer) */}
        <div className="fixed bottom-6 left-0 right-0 z-50 flex flex-col items-center gap-4 pointer-events-none">
          <div className="pointer-events-auto bg-white/90 backdrop-blur-2xl border border-white/20 px-4 py-2 rounded-full shadow-[0_12px_32px_rgba(90,15,26,0.1)] flex items-center gap-4">
            {/* Active Home */}
            <button onClick={() => setActiveModule('intelligence')} className="flex flex-col items-center gap-1 group relative">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105 ${activeModule === 'intelligence' ? 'bg-harvics-maroon' : 'hover:bg-harvics-maroon/5'}`}>
                <Home className={`w-3.5 h-3.5 ${activeModule === 'intelligence' ? 'text-white' : 'text-harvics-maroon/60 group-hover:text-harvics-maroon'}`} />
              </div>
              {activeModule === 'intelligence' && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-harvics-gold animate-pulse shadow-[0_0_8px_rgba(198,165,90,0.8)]" />
              )}
            </button>

            {/* Other Icons */}
            <button onClick={() => setActiveModule('settlement')} className="flex flex-col items-center gap-1 group relative">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${activeModule === 'settlement' ? 'bg-harvics-maroon/10' : 'hover:bg-harvics-maroon/5'}`}>
                <Wallet className={`w-3.5 h-3.5 ${activeModule === 'settlement' ? 'text-harvics-maroon' : 'text-harvics-maroon/60 group-hover:text-harvics-maroon'}`} />
              </div>
              {activeModule === 'settlement' && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-harvics-gold animate-pulse shadow-[0_0_8px_rgba(198,165,90,0.8)]" />
              )}
            </button>
            <button onClick={() => setActiveModule('regional')} className="flex flex-col items-center gap-1 group relative">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${activeModule === 'regional' ? 'bg-harvics-maroon/10' : 'hover:bg-harvics-maroon/5'}`}>
                <Compass className={`w-3.5 h-3.5 ${activeModule === 'regional' ? 'text-harvics-maroon' : 'text-harvics-maroon/60 group-hover:text-harvics-maroon'}`} />
              </div>
              {activeModule === 'regional' && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-harvics-gold animate-pulse shadow-[0_0_8px_rgba(198,165,90,0.8)]" />
              )}
            </button>
            <button onClick={() => setActiveModule('ai_center')} className="flex flex-col items-center gap-1 group relative">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${activeModule === 'ai_center' ? 'bg-harvics-maroon/10' : 'hover:bg-harvics-maroon/5'}`}>
                <BrainCircuit className={`w-3.5 h-3.5 ${activeModule === 'ai_center' ? 'text-harvics-maroon' : 'text-harvics-maroon/60 group-hover:text-harvics-maroon'}`} />
              </div>
              {activeModule === 'ai_center' && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-harvics-gold animate-pulse shadow-[0_0_8px_rgba(198,165,90,0.8)]" />
              )}
            </button>
            <button onClick={() => setActiveModule('finance')} className="flex flex-col items-center gap-1 group relative">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${activeModule === 'finance' ? 'bg-harvics-maroon/10' : 'hover:bg-harvics-maroon/5'}`}>
                <BarChart3 className={`w-3.5 h-3.5 ${activeModule === 'finance' ? 'text-harvics-maroon' : 'text-harvics-maroon/60 group-hover:text-harvics-maroon'}`} />
              </div>
              {activeModule === 'finance' && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-harvics-gold animate-pulse shadow-[0_0_8px_rgba(198,165,90,0.8)]" />
              )}
            </button>
            <button onClick={handleSignOut} className="flex flex-col items-center gap-1 group">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 hover:bg-rose-500/10">
                <LogOut className="w-3.5 h-3.5 text-rose-500/60 group-hover:text-rose-500" />
              </div>
            </button>
            <button className="flex flex-col items-center gap-1 group">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 hover:bg-harvics-maroon/5">
                <Settings className="w-3.5 h-3.5 text-harvics-maroon/60 group-hover:text-harvics-maroon" />
              </div>
            </button>
          </div>
          <span className="text-[8px] maroon-text opacity-40 uppercase tracking-[0.2em] font-sans">
            A product of Harvics Global Ventures. All Rights Reserved.
          </span>
        </div>
      </div>
    </ErrorBoundary>
  );
}
