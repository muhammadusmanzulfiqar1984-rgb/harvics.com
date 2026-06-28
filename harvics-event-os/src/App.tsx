/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Database,
  Search, 
  Calendar, 
  Map, 
  User, 
  Bookmark, 
  Send, 
  ChevronRight, 
  Filter,
  ArrowRight,
  Sparkles,
  Info,
  ExternalLink,
  QrCode,
  Maximize,
  X,
  CheckCircle2,
  Clock,
  Mic,
  Volume2,
  VolumeX,
  Music,
  MapPin,
  Share2,
  Globe,
  Bell,
  ChevronLeft,
  ArrowLeft,
  LogOut,
  MessageSquare
} from 'lucide-react';
import Markdown from 'react-markdown';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { chatWithConcierge, generateSpeech } from './services/geminiService';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  collection, 
  getDocs 
} from 'firebase/firestore';
import { 
  seedInitialData, 
  listenToExhibitors, 
  listenToAgenda, 
  listenToConfig, 
  listenToBookmarks,
  getUserProfile,
  createUserProfile,
  toggleExhibitorBookmark,
  toggleAgendaBookmark,
  listenToAgendaBookmarks,
  listenToUpcomingEvents
} from './services/firebaseService';

type Tab = 'home' | 'exhibitors' | 'agenda' | 'concierge' | 'profile' | 'more' | 'language' | 'notifications' | 'messages' | 'upcoming';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [language, setLanguage] = useState('English');
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [agendaView, setAgendaView] = useState<'my' | 'all'>('all');
  const [exhibitorView, setExhibitorView] = useState<'all' | 'bookmarks' | 'recommended'>('all');
  const [profileView, setProfileView] = useState<'main' | 'scans' | 'scannedBy'>('main');
  const [showFaqs, setShowFaqs] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [exhibitors, setExhibitors] = useState<any[]>([]);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExhibitor, setSelectedExhibitor] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [agendaBookmarks, setAgendaBookmarks] = useState<string[]>([]);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [upcomingRegistrations, setUpcomingRegistrations] = useState<string[]>([]);
  const [selectedUpcomingEvent, setSelectedUpcomingEvent] = useState<any>(null);
  const [upcomingParticipants, setUpcomingParticipants] = useState<any[]>([]);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        let profile = await getUserProfile(currentUser.uid);
        if (!profile) {
          profile = {
            uid: currentUser.uid,
            name: currentUser.displayName || 'Anonymous',
            email: currentUser.email || '',
            role: 'Attendee',
            company: 'Independent',
            interests: ['Global Discovery'],
            photoUrl: currentUser.photoURL || ''
          };
          await createUserProfile(profile);
        }
        setUser(currentUser);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    seedInitialData();

    const unsubConfig = listenToConfig((data) => {
      setConfig(data);
      if (messages.length === 0 && data) {
        setMessages([
          { role: 'model', text: `Welcome to ${data.name}. I am your Event Intelligence Layer. How can I optimize your discovery today?` }
        ]);
      }
    });

    const unsubExhibitors = listenToExhibitors((data) => {
      setExhibitors(data.sort((a, b) => a.name.localeCompare(b.name)));
    });

    const unsubAgenda = listenToAgenda((data) => {
      setAgenda(data.sort((a, b) => a.title.localeCompare(b.title)));
    });

    const unsubBookmarks = listenToBookmarks(user.uid, (data) => {
      setBookmarks(data);
    });

    const unsubAgendaBookmarks = listenToAgendaBookmarks(user.uid, (data) => {
      setAgendaBookmarks(data);
    });

    const unsubUpcoming = listenToUpcomingEvents((data) => {
      setUpcomingEvents(data);
    });

    return () => {
      unsubConfig();
      unsubExhibitors();
      unsubAgenda();
      unsubBookmarks();
      unsubAgendaBookmarks();
      unsubUpcoming();
    };
  }, [isAuthReady, user]);

  const handleLogin = async () => {
    try {
      const { signInAnonymously } = await import('firebase/auth');
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Login failed, using offline mode:", error);
      const mockUser = { uid: 'local-user', displayName: 'Guest', email: '', photoURL: '' };
      setUser(mockUser as any);
      setUserProfile({ uid: 'local-user', name: 'Guest', email: '', role: 'Attendee', company: 'Independent', interests: ['Global Discovery'], photoUrl: '' });
      setIsAuthReady(true);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleUpcomingRegistration = async (eventId: string) => {
    if (!user) return;
    try {
      const ref = doc(db, 'upcoming_events', eventId, 'participants', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await deleteDoc(ref);
        setUpcomingRegistrations(prev => prev.filter(id => id !== eventId));
      } else {
        await setDoc(ref, {
          uid: user.uid,
          name: user.displayName || 'Anonymous',
          photoURL: user.photoURL || '',
          timestamp: serverTimestamp()
        });
        setUpcomingRegistrations(prev => [...prev, eventId]);
      }
      fetchUpcomingParticipants(eventId);
    } catch (error) {
      console.error("Failed to toggle registration:", error);
    }
  };

  const fetchUpcomingParticipants = async (eventId: string) => {
    try {
      const q = collection(db, 'upcoming_events', eventId, 'participants');
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => doc.data());
      setUpcomingParticipants(data);
    } catch (error) {
      console.error("Failed to fetch participants:", error);
    }
  };

  useEffect(() => {
    if (selectedUpcomingEvent) {
      fetchUpcomingParticipants(selectedUpcomingEvent.id);
    }
  }, [selectedUpcomingEvent]);

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchConversations();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  const fetchConversations = async () => {
    // Messaging via Firestore — placeholder until full integration
    setConversations([]);
  };

  const fetchMessages = async (conversationId: number) => {
    setChatMessages([]);
  };

  const sendDirectMessage = async (receiverId: string, text: string) => {
    setChatInput('');
    console.info('[Event OS] Direct messaging will use Firestore in production');
  };

  const startChatWithUser = (user: any) => {
    const existing = conversations.find(c => c.user1_id === user.id || c.user2_id === user.id);
    if (existing) {
      setActiveConversation(existing);
    } else {
      setActiveConversation({
        id: null,
        other_user_name: user.name,
        other_user_role: user.role,
        other_user_id: user.id
      });
    }
    setActiveTab('messages');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'concierge') scrollToBottom();
  }, [messages, activeTab]);

  const handleSend = async (overrideText?: string) => {
    const userMessage = overrideText || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await chatWithConcierge(userMessage, history, config, exhibitors, agenda, language);
      setMessages(prev => [...prev, { role: 'model', text: response || "I apologize, the intelligence layer is currently recalibrating." }]);
      
      // Generate and play speech
      if (response) {
        const audioUrl = await generateSpeech(response);
        if (audioUrl) {
          const audio = new Audio(audioUrl);
          audio.play();
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "An error occurred. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };

    recognition.start();
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const filteredExhibitors = exhibitors
    .filter(ex => {
      const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (exhibitorView === 'bookmarks') return matchesSearch && bookmarks.includes(ex.id);
      if (exhibitorView === 'recommended') return matchesSearch && ex.tags.some((t: string) => userProfile?.interests?.includes(t));
      return matchesSearch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const toggleBookmark = async (id: string) => {
    if (!user) return;
    try {
      await toggleExhibitorBookmark(user.uid, id, bookmarks.includes(id));
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const bookmarkedExhibitors = exhibitors.filter(ex => bookmarks.includes(ex.id));
  
  const toggleAgendaBookmarkHandler = async (id: string) => {
    if (!user) return;
    try {
      await toggleAgendaBookmark(user.uid, id, agendaBookmarks.includes(id));
    } catch (error) {
      console.error("Failed to toggle agenda bookmark:", error);
    }
  };

  const handleScan = async (decodedText: string) => {
    const [type, id] = decodedText.split(':');
    
    try {
      setScanHistory(prev => [...prev, { type, targetId: id, timestamp: new Date().toISOString() }]);

      if (type === 'exhibitor') {
        const exhibitor = exhibitors.find(ex => ex.id === id);
        if (exhibitor) {
          if (!bookmarks.includes(id)) toggleBookmark(id);
          setSelectedExhibitor(exhibitor);
          setActiveTab('exhibitors');
        }
      } else if (type === 'session') {
        const session = agenda.find(s => s.id === id);
        if (session) {
          setActiveTab('agenda');
        }
      } else if (type === 'attendee') {
        setActiveTab('profile');
      }
    } catch (error) {
      console.error("Failed to process scan:", error);
    }

    setIsScannerActive(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
  };


  const startScanner = () => {
    setIsScannerActive(true);
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      scanner.render(handleScan, (error) => {
        // console.warn(error);
      });
      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    setIsScannerActive(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
  };

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <motion.div 
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed inset-0 bg-brand-bg z-[100] flex flex-col items-center justify-center"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="text-center"
        >
          <div className="px-8 py-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center justify-center text-brand-maroon font-bold text-2xl shadow-sm mb-8 mx-auto">
            <span className="text-brand-maroon uppercase tracking-tighter">Harvics Event OS</span>
          </div>
          <h1 className="text-3xl font-bold text-brand-maroon tracking-tight mb-2 uppercase">Harvics Event OS</h1>
          <p className="text-[10px] text-brand-gold uppercase tracking-[0.5em] font-bold">Intelligence for Global Discovery</p>
        </motion.div>
        
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 0.3, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="h-0.5 bg-brand-gold-light/20 mt-12 overflow-hidden"
        >
          <motion.div 
            animate={{ x: [-200, 200] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-full h-full bg-brand-maroon"
          />
        </motion.div>
      </motion.div>
    );
  }

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-maroon border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-8"
        >
          <div className="px-8 py-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center justify-center text-brand-maroon font-bold text-2xl shadow-sm mx-auto w-fit">
            <span className="text-brand-maroon uppercase tracking-tighter">Harvics Event OS</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-brand-maroon tracking-tight mb-2 uppercase">Welcome to Global Discovery</h1>
            <p className="text-[10px] text-brand-gold uppercase tracking-[0.5em] font-bold">Intelligence for Global Discovery</p>
          </div>
          <button 
            onClick={handleLogin}
            className="w-full py-6 bg-brand-maroon text-white rounded-[24px] text-[10px] font-bold uppercase tracking-[0.3em] shadow-lg hover:bg-brand-maroon-deep transition-all flex items-center justify-center gap-3"
          >
            <Globe className="w-5 h-5" />
            Sign in with Google
          </button>
          <p className="text-[10px] text-text-secondary uppercase tracking-widest leading-relaxed">
            By signing in, you agree to our professional discovery ecosystem terms and privacy intelligence protocols.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-text-primary font-sans selection:bg-brand-gold/20">
      <audio ref={audioRef} loop src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" />
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-brand-surface/90 backdrop-blur-md border-b border-brand-gold-light/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-brand-bg border border-brand-gold-light/20 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-brand-maroon text-sm font-bold uppercase tracking-tighter">Harvics Event OS</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-[8px] text-text-secondary uppercase tracking-widest font-medium">Bringing Event Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`p-2 rounded-full transition-all ${activeTab === 'profile' ? 'bg-brand-maroon/10 text-brand-maroon' : 'text-text-secondary hover:bg-brand-surface'}`}
          >
            <User className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleMusic}
            className={`p-2 rounded-full transition-all ${isMusicPlaying ? 'bg-brand-gold/10 text-brand-gold' : 'text-text-secondary'}`}
          >
            {isMusicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button 
            onClick={startScanner}
            className="p-2 hover:bg-brand-surface rounded-full transition-colors"
          >
            <QrCode className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 pb-24 px-6 max-w-2xl mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-10"
            >
              {exhibitors.length === 0 && agenda.length === 0 && (
                <div className="p-8 bg-brand-surface border border-brand-gold-light/20 rounded-[32px] text-center space-y-4 shadow-md">
                  <div className="w-16 h-16 bg-brand-maroon/10 rounded-full flex items-center justify-center mx-auto">
                    <Database className="w-8 h-8 text-brand-maroon" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-maroon uppercase tracking-tight">No Event Data Found</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    It looks like the event intelligence layer hasn't been initialized yet. 
                    Would you like to seed the ecosystem with sample discovery data?
                  </p>
                  <button 
                    onClick={async () => {
                      await seedInitialData();
                      alert('Sample data seeded successfully!');
                    }}
                    className="px-8 py-4 bg-brand-maroon text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full hover:bg-brand-maroon-deep transition-all shadow-lg"
                  >
                    Seed Discovery Data
                  </button>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-text-secondary group-focus-within:text-brand-maroon transition-colors" />
                </div>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && setActiveTab('exhibitors')}
                  placeholder="Harvics EventOS"
                  className="w-full bg-brand-surface border border-brand-gold-light/20 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon/20 transition-all shadow-sm"
                />
              </div>

              {/* Industry Slider (Sludge) - Movie-style */}
              <div className="overflow-hidden -mx-6 relative">
                <motion.div 
                  animate={{ x: [0, -1200] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 40, 
                    ease: "linear" 
                  }}
                  className="flex gap-3 whitespace-nowrap px-6"
                >
                  {[
                    'Intelligence', 'Strategy', 'Innovation', 'Discovery', 'Ecosystems', 'Growth', 'Leadership',
                    'Intelligence', 'Strategy', 'Innovation', 'Discovery', 'Ecosystems', 'Growth', 'Leadership',
                    'Intelligence', 'Strategy', 'Innovation', 'Discovery', 'Ecosystems', 'Growth', 'Leadership'
                  ].map((industry, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setSearchQuery(industry);
                        setActiveTab('exhibitors');
                      }}
                      className="px-6 py-2 bg-brand-surface border border-brand-gold-light/20 rounded-xl text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:border-brand-maroon hover:text-brand-maroon transition-all shadow-sm"
                    >
                      {industry}
                    </button>
                  ))}
                </motion.div>
              </div>

              {/* Explore Section (Movie-style Slider) */}
              <section className="overflow-hidden -mx-6">
                <div className="px-6 mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-brand-maroon uppercase tracking-tight">Explore</h3>
                  <button onClick={() => setActiveTab('exhibitors')} className="text-[10px] font-bold text-brand-maroon uppercase tracking-widest hover:underline">View All</button>
                </div>
                <div className="flex relative">
                  <motion.div 
                    animate={{ x: [0, -1184] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 30, 
                      ease: "linear" 
                    }}
                    className="flex gap-4 px-6"
                  >
                    {[
                      { label: 'Global Discovery List', img: 'https://picsum.photos/seed/discovery/600/400', action: () => { setSearchQuery(''); setActiveTab('exhibitors'); } },
                      { label: 'Strategic Insights', img: 'https://picsum.photos/seed/insights/600/400', action: () => { setSearchQuery('Strategy'); setActiveTab('exhibitors'); } },
                      { label: 'Floorplan', img: 'https://picsum.photos/seed/floor/600/400', action: () => setActiveTab('more') },
                      { label: "Discover What's On", img: 'https://picsum.photos/seed/discover/600/400', action: () => setActiveTab('agenda') },
                      // Duplicate for seamless loop
                      { label: 'Global Discovery List', img: 'https://picsum.photos/seed/discovery/600/400', action: () => { setSearchQuery(''); setActiveTab('exhibitors'); } },
                      { label: 'Strategic Insights', img: 'https://picsum.photos/seed/insights/600/400', action: () => { setSearchQuery('Strategy'); setActiveTab('exhibitors'); } },
                      { label: 'Floorplan', img: 'https://picsum.photos/seed/floor/600/400', action: () => setActiveTab('more') },
                      { label: "Discover What's On", img: 'https://picsum.photos/seed/discover/600/400', action: () => setActiveTab('agenda') },
                    ].map((item, i) => (
                      <button 
                        key={i} 
                        onClick={item.action}
                        className="relative rounded-[24px] overflow-hidden w-[280px] aspect-[16/10] group shadow-md border border-brand-gold-light/10 flex-shrink-0"
                      >
                        <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-maroon-deep/80 via-brand-maroon-deep/20 to-transparent flex items-end p-6">
                          <span className="text-white text-sm font-bold uppercase tracking-widest">{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                </div>
              </section>

              {/* Discover People Section */}
              <section className="overflow-hidden -mx-6">
                <div className="px-6 mb-4 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-brand-maroon uppercase tracking-tight">Discover People</h3>
                  <button onClick={() => setActiveTab('messages')} className="text-[10px] font-bold text-brand-maroon uppercase tracking-widest hover:underline">View Messages</button>
                </div>
                <div className="flex relative">
                  <motion.div 
                    animate={{ x: [0, -800] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 25, 
                      ease: "linear" 
                    }}
                    className="flex gap-4 px-6"
                  >
                    {[...allUsers, ...allUsers].map((user, i) => (
                      <button 
                        key={i} 
                        onClick={() => setSelectedUser(user)}
                        className="flex-shrink-0 w-40 p-6 bg-brand-surface border border-brand-gold-light/20 rounded-[32px] text-center group hover:bg-brand-bg transition-all shadow-sm"
                      >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden border-2 border-brand-gold/20 p-0.5">
                          <img src={`https://picsum.photos/seed/${user.id}/200/200`} alt={user.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                        </div>
                        <h4 className="text-xs font-bold text-brand-maroon uppercase tracking-tight truncate">{user.name}</h4>
                        <p className="text-[8px] text-text-secondary uppercase tracking-widest truncate">{user.role}</p>
                      </button>
                    ))}
                  </motion.div>
                </div>
              </section>

              {/* Network Section */}
              <section>
                <h3 className="text-lg font-bold text-brand-maroon mb-4 px-2 uppercase tracking-tight">Network</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Recommended for me', icon: Sparkles, action: () => { setExhibitorView('recommended'); setActiveTab('exhibitors'); } },
                    { label: 'Interested in me', icon: User, action: () => { setProfileView('scannedBy'); setActiveTab('profile'); } },
                    { label: 'My connections', icon: Share2, action: () => { setProfileView('scans'); setActiveTab('profile'); } }
                  ].map((item, i) => (
                    <button 
                      key={i} 
                      onClick={item.action}
                      className="w-full p-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center justify-between group hover:bg-brand-bg transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-maroon rounded-xl flex items-center justify-center text-white">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-bold text-brand-maroon uppercase tracking-tight">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </section>

              {/* Learn Section */}
              <section>
                <h3 className="text-lg font-bold text-brand-maroon mb-4 px-2 uppercase tracking-tight">Learn</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Future of Discovery Stage', icon: Volume2, action: () => { setSearchQuery('Discovery'); setActiveTab('agenda'); } },
                    { label: 'Business Growth Stage', icon: Volume2, action: () => { setSearchQuery('Business Growth'); setActiveTab('agenda'); } },
                    { label: 'Trends & Innovations Platform', icon: Volume2, action: () => { setSearchQuery('Trends'); setActiveTab('agenda'); } },
                    { label: 'Vision Stage - Global', icon: Volume2, action: () => { setSearchQuery('Vision'); setActiveTab('agenda'); } },
                    { label: 'Global Strategy Hub', icon: Volume2, action: () => { setSearchQuery('Strategy'); setActiveTab('agenda'); } }
                  ].map((item, i) => (
                    <button 
                      key={i} 
                      onClick={item.action}
                      className="w-full p-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center justify-between group hover:bg-brand-bg transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-maroon rounded-xl flex items-center justify-center text-white">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-bold text-brand-maroon uppercase tracking-tight">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </section>

              {/* My Schedule Section */}
              <section className="bg-brand-surface border border-brand-gold-light/20 rounded-[32px] p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-maroon rounded-lg flex items-center justify-center text-white">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-brand-maroon uppercase tracking-tight">My schedule</h3>
                  </div>
                  <button 
                    onClick={() => setActiveTab('agenda')}
                    className="text-xs font-bold text-brand-maroon uppercase tracking-widest hover:underline"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4 divide-y divide-brand-gold-light/10">
                  {agenda.slice(0, 3).map((item, i) => (
                    <div key={i} className="pt-4 first:pt-0 flex items-center justify-between group cursor-pointer" onClick={() => setActiveTab('agenda')}>
                      <div className="border-l-2 border-brand-maroon pl-4">
                        <h4 className="text-sm font-bold text-brand-maroon uppercase tracking-tight mb-1">{item.title}</h4>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest">{item.time} ({item.date || '30 March'})</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-text-secondary group-hover:translate-x-1 transition-transform" />
                    </div>
                  ))}
                </div>
              </section>

              {/* Bottom Quick Actions */}
              <div className="space-y-4">
                {[
                  { label: 'AI Event Concierge', icon: Sparkles, tab: 'concierge' },
                  { label: 'Badge scanner', icon: Maximize, action: startScanner },
                  { label: 'Who has scanned me?', icon: Share2, action: () => { setProfileView('scannedBy'); setActiveTab('profile'); } },
                  { label: 'FAQs', icon: ExternalLink, action: () => setShowFaqs(true) }
                ].map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      if (item.action) item.action();
                      if (item.tab) setActiveTab(item.tab as Tab);
                    }}
                    className="w-full p-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center justify-between group hover:bg-brand-bg transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-maroon rounded-xl flex items-center justify-center text-white">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className="text-lg font-bold text-brand-maroon uppercase tracking-tight">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'exhibitors' && (
            <motion.div 
              key="exhibitors"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-8"
            >
              <div className="px-2">
                <h2 className="text-2xl font-bold text-brand-maroon uppercase tracking-tight mb-2">Exhibitor Intelligence</h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Explore verified participants organized by category and specialization. Sort alphabetically, filter by sector, and bookmark strategic contacts for follow-up.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sector, category..."
                    className="w-full bg-brand-surface border border-brand-gold-light/20 rounded-2xl py-4 pl-14 pr-6 text-sm focus:ring-2 focus:ring-brand-maroon/10 transition-all"
                  />
                </div>
                <button 
                  onClick={() => setExhibitorView(exhibitorView === 'all' ? 'bookmarks' : 'all')}
                  className={`px-6 rounded-2xl border transition-all flex items-center gap-2 ${exhibitorView === 'bookmarks' ? 'bg-brand-gold border-brand-gold text-text-primary' : 'bg-brand-surface border-brand-gold-light/20 text-text-secondary'}`}
                >
                  <Bookmark className={`w-4 h-4 ${exhibitorView === 'bookmarks' ? 'fill-current' : ''}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Saved</span>
                </button>
              </div>

              <div className="grid gap-6">
                {filteredExhibitors.length === 0 ? (
                  <div className="text-center py-20 bg-brand-surface border border-brand-gold-light/20 rounded-[32px]">
                    <Search className="w-12 h-12 text-brand-gold/20 mx-auto mb-6" />
                    <h4 className="text-lg font-bold text-text-primary mb-2 uppercase tracking-tight">No Results Found</h4>
                    <p className="text-xs text-text-secondary">Try adjusting your search or filters.</p>
                  </div>
                ) : filteredExhibitors.map(ex => (
                  <div 
                    key={ex.id} 
                    onClick={() => setSelectedExhibitor(ex)}
                    className="p-8 bg-brand-surface border border-brand-gold-light/20 rounded-[32px] hover:bg-brand-bg transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-maroon opacity-0 group-hover:opacity-100 transition-all" />
                    {bookmarks.includes(ex.id) && (
                      <div className="absolute top-8 right-8">
                        <Bookmark className="w-4 h-4 text-brand-gold fill-brand-gold" />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-2xl font-bold mb-2 text-brand-maroon uppercase tracking-tight">{ex.name}</h4>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-text-secondary font-bold">{ex.category}</p>
                      </div>
                      <div className="text-right pr-10">
                        <p className="text-lg font-bold text-text-primary">{ex.booth}</p>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest">{ex.hall}</p>
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary font-normal leading-relaxed mb-6 line-clamp-2">{ex.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      {ex.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-brand-bg border border-brand-gold-light/20 rounded-full text-[9px] uppercase tracking-wider text-text-secondary">{tag}</span>
                      ))}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab('concierge');
                        handleSend(`Tell me more about ${ex.name} and their ${ex.category} products.`);
                      }}
                      className="mt-6 w-full py-3 bg-brand-maroon/5 border border-brand-maroon/10 rounded-2xl text-[9px] font-bold uppercase tracking-widest text-brand-maroon flex items-center justify-center gap-2 hover:bg-brand-maroon/10 transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      Ask Concierge about this brand
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'agenda' && (
            <motion.div 
              key="agenda"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-10"
            >
              {/* Agenda Toggle - Elite */}
              <div className="px-2 mb-6">
                <h2 className="text-2xl font-bold text-brand-maroon uppercase tracking-tight mb-2">Event Schedule</h2>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Your structured event timeline. Track sessions, identify high-value discussions, and align your schedule with your business priorities.
                </p>
              </div>
              <div className="flex p-1.5 bg-brand-surface rounded-2xl border border-brand-gold-light/20">
                <button 
                  onClick={() => setAgendaView('my')}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all ${agendaView === 'my' ? 'bg-brand-maroon text-white shadow-sm hover:bg-brand-maroon-deep' : 'text-text-secondary'}`}
                >
                  My Schedule
                </button>
                <button 
                  onClick={() => setAgendaView('all')}
                  className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl transition-all ${agendaView === 'all' ? 'bg-brand-maroon text-white shadow-sm hover:bg-brand-maroon-deep' : 'text-text-secondary'}`}
                >
                  Full Agenda
                </button>
              </div>

              <div className="flex gap-8 border-b border-brand-gold-light/10 pb-4 px-2">
                <button className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-primary border-b-2 border-brand-maroon pb-4">30 March</button>
                <button className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary pb-4">31 March</button>
                <button className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary pb-4">01 April</button>
              </div>

              <div className="space-y-10">
                {agendaView === 'my' && agenda.filter(item => agendaBookmarks.includes(item.id)).length === 0 ? (
                  <div className="text-center py-20 px-8 bg-brand-surface border border-brand-gold-light/20 rounded-[32px]">
                    <Bookmark className="w-12 h-12 text-brand-gold/20 mx-auto mb-6" />
                    <h4 className="text-lg font-bold text-text-primary mb-2 uppercase tracking-tight">Your Schedule is Empty</h4>
                    <p className="text-xs text-text-secondary leading-relaxed max-w-xs mx-auto mb-8">
                      Bookmark sessions from the Full Agenda to build your personalized discovery timeline.
                    </p>
                    <button 
                      onClick={() => setAgendaView('all')}
                      className="px-8 py-3 bg-brand-maroon text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-sm hover:bg-brand-maroon-deep transition-all"
                    >
                      Explore Full Agenda
                    </button>
                  </div>
                ) : (agendaView === 'all' ? agenda : agenda.filter(item => agendaBookmarks.includes(item.id))).map(item => (
                  <div key={item.id} className="relative pl-10 border-l border-brand-gold-light/20 group cursor-pointer">
                    <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-brand-maroon" />
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">{item.time}</p>
                      <div className="flex items-center gap-2">
                        {item.id === 'opening-keynote' && (
                          <span className="px-3 py-1 bg-brand-surface border border-brand-gold-light/20 text-brand-maroon text-[8px] font-bold uppercase tracking-widest rounded-full">Sourcing Pick</span>
                        )}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAgendaBookmarkHandler(item.id);
                          }}
                          className={`p-2 rounded-full border transition-all ${agendaBookmarks.includes(item.id) ? 'bg-brand-gold border-brand-gold text-text-primary' : 'bg-brand-surface border-brand-gold-light/20 text-text-secondary hover:bg-brand-bg'}`}
                        >
                          <Bookmark className={`w-3 h-3 ${agendaBookmarks.includes(item.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-xl font-bold mb-3 text-brand-maroon transition-colors uppercase tracking-tight">{item.title}</h4>
                    <p className="text-sm text-text-secondary mb-4 font-normal leading-relaxed">
                      Featured Speaker: <span className="font-bold text-brand-maroon">{item.speaker}</span>
                    </p>
                    <div className="flex items-center gap-6 text-[9px] text-text-secondary font-bold uppercase tracking-[0.2em]">
                      <span className="flex items-center gap-2"><Map className="w-3 h-3 text-brand-gold" /> {item.location}</span>
                      <span className="flex items-center gap-2 text-brand-gold">• {item.type}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setActiveTab('concierge');
                        handleSend(`What can you tell me about the session "${item.title}" by ${item.speaker}?`);
                      }}
                      className="mt-4 px-4 py-2 bg-brand-surface border border-brand-gold-light/20 rounded-xl text-[8px] font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2 hover:bg-brand-bg transition-all"
                    >
                      <Sparkles className="w-3 h-3 text-brand-gold" />
                      Session Insights
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'concierge' && (
            <motion.div 
              key="concierge"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="h-[calc(100vh-180px)] flex flex-col"
            >
              <div className="flex-1 overflow-y-auto space-y-8 pr-2 no-scrollbar">
                {messages.length === 0 && (
                  <div className="text-center py-12 px-8">
                    <div className="w-16 h-16 bg-brand-surface border border-brand-gold-light/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Sparkles className="w-8 h-8 text-brand-gold" />
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-2 uppercase tracking-tight">Event Intelligence Concierge</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Ask about exhibitors, categories, session insights, or discovery strategy. Designed to assist professionals across industries.
                    </p>
                  </div>
                )}
                {messages.map((m, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-6 rounded-[32px] text-sm leading-relaxed relative group ${
                      m.role === 'user' 
                        ? 'bg-brand-maroon text-white rounded-tr-none shadow-sm' 
                        : 'bg-brand-surface text-text-primary rounded-tl-none border border-brand-gold-light/20'
                    }`}>
                      {m.role === 'model' && (
                        <div className="flex justify-between items-center mb-3">
                          <div className="text-[9px] uppercase tracking-[0.3em] text-brand-gold font-bold">Event Intelligence Concierge</div>
                          <button 
                            onClick={async () => {
                              const audioUrl = await generateSpeech(m.text);
                              if (audioUrl) {
                                const audio = new Audio(audioUrl);
                                audio.play();
                              }
                            }}
                            className="p-1.5 bg-brand-bg border border-brand-gold-light/20 rounded-full text-brand-gold hover:bg-brand-surface transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      <Markdown>{m.text}</Markdown>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-brand-surface p-6 rounded-[32px] rounded-tl-none border border-brand-gold-light/20">
                      <div className="flex gap-1.5">
                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="mt-8 relative">
                <div className="absolute inset-x-0 -top-12 h-12 bg-gradient-to-t from-brand-bg to-transparent pointer-events-none" />
                <div className="flex items-center gap-4 bg-brand-surface p-3 rounded-[32px] border border-brand-gold-light/20 shadow-inner">
                  <button 
                    onClick={startListening}
                    className={`p-5 rounded-full transition-all ${isListening ? 'bg-brand-maroon text-white animate-pulse' : 'bg-brand-bg text-text-primary shadow-sm hover:scale-105'}`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Inquire with the Concierge..."
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-4 placeholder:text-text-secondary"
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="p-5 bg-brand-bg border border-brand-gold-light/20 text-brand-maroon rounded-full shadow-sm hover:bg-brand-surface transition-all disabled:opacity-30"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'upcoming' && (
            <motion.div 
              key="upcoming"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-8 pb-20"
            >
              <div className="px-2">
                <h2 className="text-3xl font-bold text-brand-maroon uppercase tracking-tight mb-2">Upcoming Events</h2>
                <p className="text-xs text-text-secondary uppercase tracking-widest font-medium">Discover future global ecosystems</p>
              </div>

              <div className="space-y-6">
                {upcomingEvents.map((ev, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedUpcomingEvent(ev)}
                    className="w-full bg-brand-surface border border-brand-gold-light/20 rounded-[40px] overflow-hidden group hover:bg-brand-bg transition-all shadow-sm text-left"
                  >
                    <div className="h-48 w-full relative overflow-hidden">
                      <img src={ev.image_url} alt={ev.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-maroon/80 via-brand-maroon/20 to-transparent" />
                      <div className="absolute bottom-6 left-8">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-3 h-3 text-brand-gold" />
                          <p className="text-[10px] text-brand-gold font-bold uppercase tracking-widest">{ev.date}</p>
                        </div>
                        <h4 className="text-2xl font-bold text-white uppercase tracking-tight">{ev.name}</h4>
                      </div>
                    </div>
                    <div className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-bg rounded-full flex items-center justify-center border border-brand-gold-light/10">
                          <MapPin className="w-5 h-5 text-brand-gold" />
                        </div>
                        <div>
                          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Location</p>
                          <span className="text-sm font-bold text-brand-maroon uppercase tracking-tight">{ev.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-[10px] text-brand-maroon font-bold uppercase tracking-widest">Early Networking</p>
                          <p className="text-[8px] text-text-secondary uppercase tracking-widest">Connect Now</p>
                        </div>
                        <div className="w-10 h-10 bg-brand-maroon rounded-full flex items-center justify-center text-white shadow-sm">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div 
              key="messages"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-6 pb-20"
            >
              {activeConversation ? (
                <div className="flex flex-col h-[70vh]">
                  <div className="flex items-center gap-4 mb-6">
                    <button onClick={() => setActiveConversation(null)} className="p-2 hover:bg-brand-surface rounded-full">
                      <ChevronLeft className="w-6 h-6 text-brand-maroon" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-brand-maroon uppercase tracking-tight">{activeConversation.other_user_name}</h2>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest">{activeConversation.other_user_role}</p>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 mb-6 no-scrollbar">
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`flex ${m.sender_id === user?.uid ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${m.sender_id === user?.uid ? 'bg-brand-maroon text-white rounded-tr-none' : 'bg-brand-surface text-text-primary rounded-tl-none'}`}>
                          {m.text}
                          <p className={`text-[8px] mt-1 opacity-60 ${m.sender_id === user?.uid ? 'text-right' : 'text-left'}`}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="relative">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendDirectMessage(activeConversation.user1_id === user?.uid ? activeConversation.user2_id : activeConversation.user1_id, chatInput)}
                      placeholder="Type a message..."
                      className="w-full bg-brand-surface border border-brand-gold-light/20 rounded-2xl py-4 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-maroon/20 transition-all shadow-sm"
                    />
                    <button 
                      onClick={() => sendDirectMessage(activeConversation.user1_id === user?.uid ? activeConversation.user2_id : activeConversation.user1_id, chatInput)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-maroon text-white rounded-xl hover:bg-brand-maroon-deep transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-brand-maroon uppercase tracking-tight px-2">Messages</h2>
                  <div className="space-y-4">
                    {conversations.length > 0 ? conversations.map((conv, i) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveConversation(conv)}
                        className="w-full p-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center justify-between group hover:bg-brand-bg transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-maroon rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            {conv.other_user_name[0]}
                          </div>
                          <div className="text-left">
                            <h4 className="text-lg font-bold text-brand-maroon uppercase tracking-tight">{conv.other_user_name}</h4>
                            <p className="text-xs text-text-secondary truncate max-w-[200px]">{conv.last_message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-text-secondary uppercase tracking-widest mb-2">
                            {new Date(conv.last_timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </p>
                          <ChevronRight className="w-5 h-5 text-text-secondary group-hover:translate-x-1 transition-transform ml-auto" />
                        </div>
                      </button>
                    )) : (
                      <div className="text-center py-20 bg-brand-surface rounded-[32px] border border-brand-gold-light/20">
                        <MessageSquare className="w-12 h-12 text-brand-gold/40 mx-auto mb-4" />
                        <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">No conversations yet</p>
                        <button 
                          onClick={() => setActiveTab('exhibitors')}
                          className="mt-6 px-6 py-3 bg-brand-maroon text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-brand-maroon-deep transition-all"
                        >
                          Discover People
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div 
              key="notifications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-brand-maroon uppercase tracking-tight">Notifications</h2>
                <button className="text-[10px] font-bold text-brand-maroon uppercase tracking-widest hover:underline">Mark all as read</button>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'Meeting Request', desc: 'New meeting request from Global Strategy Group.', time: '2m ago', icon: Calendar },
                  { title: 'Welcome to Harvics EventOS', desc: 'Explore the latest trends in global discovery.', time: '1h ago', icon: Sparkles },
                  { title: 'Badge Scanned', desc: 'Your badge was scanned by a premium exhibitor.', time: '3h ago', icon: QrCode }
                ].map((n, i) => (
                  <div key={i} className="bg-brand-surface border border-brand-gold-light/20 rounded-[32px] p-6 flex items-start gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-brand-maroon/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <n.icon className="w-6 h-6 text-brand-maroon" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-brand-maroon uppercase tracking-tight">{n.title}</h4>
                        <span className="text-[10px] text-text-secondary uppercase tracking-widest">{n.time}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-10"
            >
              {profileView === 'main' ? (
                <>
                  {/* Profile Header - Elite */}
                  <div className="flex justify-between items-center px-2">
                    <h2 className="text-2xl font-bold text-brand-maroon uppercase tracking-tight">My Portfolio</h2>
                    <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold">Edit Profile</button>
                  </div>

                  {/* Profile Card - Apple Style */}
                  <section className="relative p-10 bg-brand-surface border border-brand-gold-light/20 rounded-[40px] shadow-sm text-center overflow-hidden">
                    <div className="absolute top-0 right-0 p-6">
                      <div className="w-12 h-12 bg-brand-bg rounded-full flex items-center justify-center border border-brand-gold-light/20">
                        <QrCode className="w-5 h-5 text-text-secondary" />
                      </div>
                    </div>
                    <div className="relative w-32 h-32 mx-auto mb-8">
                      <div className="w-full h-full rounded-full overflow-hidden border-4 border-brand-gold/20 p-1">
                        <img src={`https://picsum.photos/seed/${user?.uid}/300/300`} alt="Profile" className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 p-3 bg-brand-bg border border-brand-gold-light/20 text-brand-maroon rounded-full shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-brand-maroon uppercase tracking-tight">{userProfile?.name}</h2>
                    <p className="text-xs text-brand-gold uppercase tracking-[0.3em] font-bold mb-6">{userProfile?.role}</p>
                    <div className="inline-block px-4 py-2 bg-brand-bg border border-brand-gold-light/20 rounded-full text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                      {userProfile?.company}
                    </div>
                  </section>

                  {/* Profile Details - Minimal */}
                  <div className="space-y-6">
                    <section className="px-2">
                      <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-secondary mb-6">Discovery Interests</h3>
                      <div className="flex gap-3 flex-wrap">
                        {userProfile?.interests?.map((interest: string) => (
                          <span key={interest} className="px-5 py-2.5 bg-brand-surface border border-brand-gold-light/20 rounded-full text-[11px] font-bold text-text-secondary uppercase tracking-widest">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </section>

                    <section className="px-2">
                      <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-secondary mb-6">Account Settings</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Digital Business Card', icon: QrCode },
                          { label: 'Privacy & Visibility', icon: Info },
                          { label: 'Notification Preferences', icon: Clock }
                        ].map((item, i) => (
                          <button 
                            key={i} 
                            className="w-full p-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center justify-between group hover:bg-brand-bg transition-all shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-brand-maroon rounded-xl flex items-center justify-center text-white">
                                <item.icon className="w-6 h-6" />
                              </div>
                              <span className="text-lg font-bold text-brand-maroon uppercase tracking-tight">{item.label}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                </>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setProfileView('main')} className="p-2 hover:bg-brand-surface rounded-full transition-colors">
                      <ArrowLeft className="w-6 h-6 text-brand-maroon" />
                    </button>
                    <h2 className="text-2xl font-bold text-brand-maroon uppercase tracking-tight">
                      {profileView === 'scans' ? 'My Scan List' : 'Scanned By'}
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="bg-brand-surface border border-brand-gold-light/20 rounded-[32px] p-6 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-gold-light/20">
                            <img src={`https://picsum.photos/seed/user${item}/100/100`} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-brand-maroon uppercase tracking-tight">Professional {item}</h4>
                            <p className="text-[10px] text-text-secondary uppercase tracking-widest">Global Strategy Group</p>
                          </div>
                        </div>
                        <button className="p-3 bg-brand-bg border border-brand-gold-light/20 rounded-full text-brand-maroon hover:bg-brand-surface transition-all">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'more' && (
            <motion.div 
              key="more"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-6 pb-20"
            >
              {/* Events Section */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-secondary mb-4 px-2">Discovery Ecosystem</h3>
                <div className="space-y-4">
                  <div className="p-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center gap-4 shadow-sm">
                    <div className="w-12 h-12 bg-brand-maroon rounded-xl flex items-center justify-center text-white font-bold text-xl">H</div>
                    <div className="flex-1">
                      <p className="text-[9px] text-text-secondary uppercase tracking-widest font-bold">Currently discovering</p>
                      <p className="text-lg font-bold text-brand-maroon uppercase tracking-tight">Harvics EventOS</p>
                    </div>
                    <button 
                      onClick={async () => {
                        await seedInitialData();
                        alert('Sample data seeded successfully! Please wait a moment for it to appear.');
                      }}
                      className="px-4 py-2 bg-brand-maroon text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-brand-maroon/90 transition-all"
                    >
                      Seed Data
                    </button>
                  </div>
                  {[
                    { label: 'Exhibitor Intelligence List', icon: Search, action: () => { setSearchQuery(''); setActiveTab('exhibitors'); } },
                    { label: 'Sector Discovery Theatre', icon: Calendar, action: () => { setSearchQuery('Theatre'); setActiveTab('agenda'); } },
                    { label: 'Innovation & Trends Stage', icon: Sparkles, action: () => { setSearchQuery('Trends'); setActiveTab('agenda'); } },
                    { label: 'Business Growth Strategy Room', icon: ArrowRight, action: () => { setSearchQuery('Business Growth'); setActiveTab('agenda'); } }
                  ].map((item, i) => (
                    <button 
                      key={i} 
                      onClick={item.action}
                      className="w-full p-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center justify-between group hover:bg-brand-bg transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-maroon rounded-xl flex items-center justify-center text-white">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-bold text-brand-maroon uppercase tracking-tight">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </section>

              {/* My Activity Section */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-secondary mb-4 px-2">My Activity</h3>
                <div className="space-y-4">
                  {[
                    { label: 'QR / Badge Scanner', icon: QrCode, action: startScanner },
                    { label: 'My Scan List', icon: Clock, action: () => { setProfileView('scans'); setActiveTab('profile'); } },
                    { label: 'My Scanned By List', icon: User, action: () => { setProfileView('scannedBy'); setActiveTab('profile'); } },
                    { label: 'Notifications', icon: Bell, action: () => setActiveTab('notifications') },
                    { label: 'My Digital Badge', icon: QrCode, action: () => { setProfileView('main'); setActiveTab('profile'); } }
                  ].map((item, i) => (
                    <button 
                      key={i} 
                      onClick={item.action}
                      className="w-full p-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center justify-between group hover:bg-brand-bg transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-maroon rounded-xl flex items-center justify-center text-white">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-bold text-brand-maroon uppercase tracking-tight">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </section>

              {/* Recommendations Section */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-secondary mb-4 px-2">Recommendations</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Interested In You', icon: Sparkles, action: () => { setExhibitorView('recommended'); setActiveTab('exhibitors'); } },
                    { label: 'My Interested List', icon: Bookmark, action: () => { setExhibitorView('bookmarks'); setActiveTab('exhibitors'); } },
                    { label: 'My Skip List', icon: X, action: () => { setExhibitorView('all'); setActiveTab('exhibitors'); } }
                  ].map((item, i) => (
                    <button 
                      key={i} 
                      onClick={item.action}
                      className="w-full p-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center justify-between group hover:bg-brand-bg transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-maroon rounded-xl flex items-center justify-center text-white">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-bold text-brand-maroon uppercase tracking-tight">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </section>

              {/* Upcoming Events Section */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-secondary mb-4 px-2">Upcoming Discovery</h3>
                <div className="space-y-4">
                  {upcomingEvents.map((ev, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedUpcomingEvent(ev)}
                      className="w-full bg-brand-surface border border-brand-gold-light/20 rounded-[32px] overflow-hidden group hover:bg-brand-bg transition-all shadow-sm text-left"
                    >
                      <div className="h-32 w-full relative overflow-hidden">
                        <img src={ev.image_url} alt={ev.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-maroon/60 to-transparent" />
                        <div className="absolute bottom-4 left-6">
                          <p className="text-[8px] text-brand-gold font-bold uppercase tracking-widest mb-1">{ev.date}</p>
                          <h4 className="text-sm font-bold text-white uppercase tracking-tight">{ev.name}</h4>
                        </div>
                      </div>
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-brand-gold" />
                          <span className="text-[10px] text-text-secondary uppercase tracking-widest">{ev.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-brand-maroon uppercase tracking-widest">Early Networking</span>
                          <ChevronRight className="w-4 h-4 text-brand-maroon" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Support & Legal Section */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-secondary mb-4 px-2">Support & Legal</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Language Settings', icon: Globe, action: () => setActiveTab('language') },
                    { label: 'FAQs', icon: Info, action: () => setShowFaqs(true) },
                    { label: 'AI Event Concierge', icon: Sparkles, action: () => setActiveTab('concierge') },
                    { label: 'Share Live Location', icon: Share2, action: () => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition((position) => {
                          const { latitude, longitude } = position.coords;
                          const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
                          window.open(`https://wa.me/?text=My%20live%20location%20at%20the%20event:%20${encodeURIComponent(url)}`, '_blank');
                        }, () => alert('Unable to retrieve your location. Please ensure location services are enabled.'));
                      }
                    }},
                    { label: 'Privacy Policy', icon: ExternalLink, action: () => setShowPrivacy(true) },
                    { label: 'Terms of Service', icon: ExternalLink, action: () => setShowPrivacy(true) }
                  ].map((item, i) => (
                    <button 
                      key={i} 
                      onClick={item.action}
                      className="w-full p-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center justify-between group hover:bg-brand-bg transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand-maroon rounded-xl flex items-center justify-center text-white">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-bold text-brand-maroon uppercase tracking-tight">{item.label}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-text-secondary group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                  <button 
                    onClick={handleLogout}
                    className="w-full p-6 bg-brand-surface border border-brand-gold-light/20 rounded-[24px] flex items-center justify-between group hover:bg-brand-bg transition-all shadow-sm text-brand-maroon"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-maroon/10 rounded-xl flex items-center justify-center">
                        <LogOut className="w-6 h-6" />
                      </div>
                      <span className="text-lg font-bold uppercase tracking-tight">Sign Out</span>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </section>

              {/* Branding Footer */}
              <div className="pt-12 pb-8 text-center space-y-6">
                <div className="w-20 h-20 bg-brand-surface border border-brand-gold-light/20 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <div className="text-brand-maroon font-bold text-3xl">H</div>
                </div>
                <div>
                  <p className="text-[10px] text-text-secondary font-bold tracking-widest uppercase">v 10.34.7.4962</p>
                  <button className="mt-4 text-xs font-bold text-brand-maroon uppercase tracking-widest hover:underline">Delete Account</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'language' && (
            <motion.div 
              key="language"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="space-y-10"
            >
              <section className="relative py-16 px-8 rounded-[32px] overflow-hidden bg-brand-surface border border-brand-gold-light/20 text-center">
                <div className="w-16 h-16 bg-brand-bg border border-brand-gold-light/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-brand-gold" />
                </div>
                <h2 className="text-2xl font-bold text-brand-maroon mb-2 uppercase tracking-tight">Language Settings</h2>
                <p className="text-xs text-text-secondary leading-relaxed max-w-xs mx-auto">
                  Select your preferred language for the Event Intelligence Concierge and platform navigation.
                </p>
              </section>

              <section className="px-2">
                <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-secondary mb-6">Select Language</h3>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { name: 'English', native: 'English' },
                    { name: 'Spanish', native: 'Español' },
                    { name: 'French', native: 'Français' },
                    { name: 'German', native: 'Deutsch' },
                    { name: 'Chinese', native: '中文' },
                    { name: 'Arabic', native: 'العربية' },
                    { name: 'Hindi', native: 'हिन्दी' },
                    { name: 'Urdu', native: 'اردو' }
                  ].map((lang) => (
                    <button 
                      key={lang.name}
                      onClick={() => setLanguage(lang.name)}
                      className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${
                        language === lang.name 
                          ? 'bg-brand-maroon text-white border-brand-maroon shadow-md scale-[1.02]' 
                          : 'bg-brand-surface text-text-primary border-brand-gold-light/20 hover:bg-brand-bg'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold uppercase tracking-widest">{lang.name}</span>
                        <span className={`text-[10px] uppercase tracking-widest ${language === lang.name ? 'text-white/70' : 'text-text-secondary'}`}>{lang.native}</span>
                      </div>
                      {language === lang.name && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              </section>

              <div className="p-8 bg-brand-maroon/5 border border-brand-maroon/10 rounded-[32px] text-center">
                <p className="text-[10px] text-brand-maroon font-bold uppercase tracking-[0.2em] leading-relaxed">
                  The Event Intelligence Concierge will automatically adapt to your selected language.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <footer className="mt-20 pt-12 border-t border-brand-gold-light/10 text-center pb-12 bg-brand-surface/50">
          <p className="text-[9px] text-text-secondary uppercase tracking-[0.5em] font-bold mb-2">
            Harvics Event Intelligence
          </p>
          <p className="text-[8px] text-brand-gold uppercase tracking-[0.3em] font-medium">
            A Product of Harvics Global Ventures
          </p>
        </footer>
      </main>

      {/* QR Scanner Overlay */}
      <AnimatePresence>
        {isScannerActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 bg-brand-maroon-deep z-[100] flex flex-col"
          >
            <div className="p-6 flex justify-between items-center text-white">
              <h2 className="text-sm font-bold uppercase tracking-widest">Scanner</h2>
              <button onClick={stopScanner} className="p-2 bg-white/10 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="w-full max-w-xs aspect-square relative border-2 border-brand-gold rounded-3xl overflow-hidden bg-white/5">
                <div id="qr-reader" className="w-full h-full" />
                <div className="absolute inset-0 border-[40px] border-brand-maroon-deep/40 pointer-events-none" />
                <motion.div 
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-brand-gold shadow-[0_0_15px_rgba(198,165,90,0.8)] z-10"
                />
              </div>
              <p className="mt-8 text-white/60 text-sm font-normal text-center max-w-[200px]">
                Align QR code within the frame to scan.
              </p>

              {/* Mock Scan Buttons for Demo */}
              <div className="mt-12 grid grid-cols-2 gap-3 w-full max-w-xs">
                <button 
                  onClick={() => handleScan('exhibitor:global-denim')}
                  className="py-2 bg-white/10 rounded-lg text-[10px] uppercase tracking-widest text-white/40 hover:bg-white/20"
                >
                  Mock Exhibitor
                </button>
                <button 
                  onClick={() => handleScan('session:opening-keynote')}
                  className="py-2 bg-white/10 rounded-lg text-[10px] uppercase tracking-widest text-white/40 hover:bg-white/20"
                >
                  Mock Session
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* User Profile Modal - Elite */}
      <AnimatePresence>
        {selectedUpcomingEvent && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUpcomingEvent(null)}
              className="fixed inset-0 bg-brand-maroon-deep/40 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full bg-brand-bg rounded-t-[48px] z-[70] p-10 max-h-[90vh] overflow-y-auto border-t border-brand-gold-light/20"
            >
              <div className="w-16 h-1.5 bg-brand-gold-light/20 rounded-full mx-auto mb-10" />
              
              <div className="mb-10">
                <div className="h-48 w-full rounded-[32px] overflow-hidden mb-6">
                  <img src={selectedUpcomingEvent.image_url} alt={selectedUpcomingEvent.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-3xl font-bold text-brand-maroon uppercase tracking-tight mb-2">{selectedUpcomingEvent.name}</h2>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-gold" />
                        <span className="text-xs text-text-secondary font-bold uppercase tracking-widest">{selectedUpcomingEvent.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-gold" />
                        <span className="text-xs text-text-secondary font-bold uppercase tracking-widest">{selectedUpcomingEvent.location}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleUpcomingRegistration(selectedUpcomingEvent.id)}
                    className={`px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${upcomingRegistrations.includes(selectedUpcomingEvent.id) ? 'bg-brand-gold text-text-primary' : 'bg-brand-maroon text-white'}`}
                  >
                    {upcomingRegistrations.includes(selectedUpcomingEvent.id) ? 'Interested' : 'I am Interested'}
                  </button>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">{selectedUpcomingEvent.description}</p>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-secondary">Early Networking Participants</h3>
                    <span className="text-[10px] font-bold text-brand-maroon uppercase tracking-widest">{upcomingParticipants.length} Interested</span>
                  </div>
                  
                  {upcomingParticipants.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingParticipants.map((user, i) => (
                        <div key={i} className="bg-brand-surface border border-brand-gold-light/20 rounded-[32px] p-6 flex items-center justify-between shadow-sm">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-gold-light/20">
                              <img src={`https://picsum.photos/seed/${user.id}/100/100`} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-brand-maroon uppercase tracking-tight">{user.name}</h4>
                              <p className="text-[10px] text-text-secondary uppercase tracking-widest">{user.role} @ {user.company}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              startChatWithUser(user);
                              setSelectedUpcomingEvent(null);
                            }}
                            className="p-3 bg-brand-bg border border-brand-gold-light/20 rounded-full text-brand-maroon hover:bg-brand-surface transition-all"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-brand-surface rounded-[32px] border border-brand-gold-light/20">
                      <User className="w-10 h-10 text-brand-gold/40 mx-auto mb-4" />
                      <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px]">Be the first to show interest!</p>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setSelectedUpcomingEvent(null)}
                className="w-full mt-10 py-6 bg-brand-bg border border-brand-gold-light/20 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary"
              >
                Close Discovery
              </button>
            </motion.div>
          </>
        )}

        {selectedUser && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-brand-maroon-deep/20 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed bottom-0 left-0 w-full bg-brand-surface rounded-t-[48px] z-[70] p-10 max-h-[90vh] overflow-y-auto border-t border-brand-gold-light/20"
            >
              <div className="w-16 h-1.5 bg-brand-gold-light/20 rounded-full mx-auto mb-10" />
              
              <div className="text-center mb-10">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-brand-gold/20 p-1">
                    <img src={`https://picsum.photos/seed/${selectedUser.id}/300/300`} alt={selectedUser.name} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 p-3 bg-brand-maroon text-white rounded-full border-4 border-brand-surface shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-2 text-text-primary uppercase tracking-tight">{selectedUser.name}</h2>
                <p className="text-xs text-brand-gold uppercase tracking-[0.3em] font-bold mb-3">{selectedUser.role}</p>
                <p className="text-sm text-text-secondary font-bold uppercase tracking-widest">{selectedUser.company}</p>
              </div>

              <div className="space-y-8 mb-10">
                <div>
                  <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-secondary mb-4">Discovery Interests</h3>
                  <div className="flex gap-3 flex-wrap">
                    {selectedUser.interests.map((interest: string) => (
                      <span key={interest} className="px-5 py-2.5 bg-brand-bg border border-brand-gold-light/20 rounded-full text-[11px] font-bold text-text-secondary uppercase tracking-widest">{interest}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="py-5 bg-brand-bg border border-brand-gold-light/20 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => {
                    startChatWithUser(selectedUser);
                    setSelectedUser(null);
                  }}
                  className="py-5 bg-brand-surface border border-brand-maroon/20 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.3em] text-brand-maroon flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
                <button className="py-5 bg-brand-maroon text-white rounded-[24px] text-[10px] font-bold uppercase tracking-[0.3em] shadow-sm hover:bg-brand-maroon-deep transition-all">
                  Connect
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Exhibitor Details Modal - Elite */}
      <AnimatePresence>
        {selectedExhibitor && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              onClick={() => setSelectedExhibitor(null)}
              className="fixed inset-0 bg-brand-maroon-deep/20 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed bottom-0 left-0 w-full bg-brand-surface rounded-t-[48px] z-[70] p-10 max-h-[90vh] overflow-y-auto border-t border-brand-gold-light/20"
            >
              <div className="w-16 h-1.5 bg-brand-gold-light/20 rounded-full mx-auto mb-10" />
              
              <div className="mb-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-4xl font-bold mb-3 text-brand-maroon leading-tight uppercase tracking-tight">{selectedExhibitor.name}</h2>
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-brand-gold">{selectedExhibitor.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-maroon">{selectedExhibitor.booth}</p>
                    <p className="text-[10px] text-text-secondary uppercase tracking-[0.3em] font-bold">{selectedExhibitor.hall}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap mb-10">
                  {selectedExhibitor.tags.map((tag: string) => (
                    <span key={tag} className="px-4 py-2 bg-brand-bg border border-brand-gold-light/20 rounded-full text-[10px] uppercase tracking-widest text-text-secondary font-bold">{tag}</span>
                  ))}
                </div>

                <div className="prose prose-stone max-w-none">
                  <p className="text-lg font-normal leading-relaxed text-text-secondary mb-10">
                    {selectedExhibitor.description}
                  </p>
                </div>

                <div className="p-8 bg-brand-bg rounded-[32px] border border-brand-gold-light/20 mb-10">
                  <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold text-text-secondary mb-6">Sourcing Contact</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-surface border border-brand-gold-light/20 text-text-primary rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary uppercase tracking-tight">Showroom Director</p>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">In-person Inquiry Only</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => toggleBookmark(selectedExhibitor.id)}
                  className={`flex-1 py-6 rounded-[24px] text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all ${bookmarks.includes(selectedExhibitor.id) ? 'bg-brand-gold text-text-primary' : 'bg-brand-maroon text-white shadow-sm hover:bg-brand-maroon-deep'}`}
                >
                  <Bookmark className={`w-5 h-5 ${bookmarks.includes(selectedExhibitor.id) ? 'fill-current' : ''}`} /> 
                  {bookmarks.includes(selectedExhibitor.id) ? 'Portfolio Saved' : 'Save to Portfolio'}
                </button>
                <button className="p-6 bg-brand-bg border border-brand-gold-light/20 text-text-primary hover:bg-brand-surface transition-all">
                  <ExternalLink className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Navigation - Elite */}
      <nav className="fixed bottom-0 w-full bg-brand-surface/90 backdrop-blur-md border-t border-brand-gold-light/10 px-8 py-6 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' ? 'text-brand-maroon scale-110' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'fill-brand-maroon/10' : ''}`} />
          <span className="text-[8px] uppercase tracking-[0.2em] font-bold">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('concierge')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'concierge' ? 'text-brand-maroon scale-110' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <Sparkles className={`w-5 h-5 ${activeTab === 'concierge' ? 'fill-brand-maroon/10' : ''}`} />
          <span className="text-[8px] uppercase tracking-[0.2em] font-bold">Concierge</span>
        </button>
        <button 
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'agenda' ? 'text-brand-maroon scale-110' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[8px] uppercase tracking-[0.2em] font-bold">Schedule</span>
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'messages' ? 'text-brand-maroon scale-110' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <MessageSquare className={`w-5 h-5 ${activeTab === 'messages' ? 'fill-brand-maroon/10' : ''}`} />
          <span className="text-[8px] uppercase tracking-[0.2em] font-bold">Messages</span>
        </button>
        <button 
          onClick={() => setActiveTab('more')}
          className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'more' ? 'text-brand-maroon scale-110' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <Info className="w-5 h-5" />
          <span className="text-[8px] uppercase tracking-[0.2em] font-bold">More</span>
        </button>
      </nav>
      {/* FAQ & Privacy Modals */}
      <AnimatePresence>
        {showFaqs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-bg/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-lg bg-brand-surface border border-brand-gold-light/20 rounded-[40px] p-10 shadow-2xl relative overflow-hidden">
              <button onClick={() => setShowFaqs(false)} className="absolute top-6 right-6 p-2 hover:bg-brand-bg rounded-full transition-colors">
                <X className="w-6 h-6 text-brand-maroon" />
              </button>
              <h2 className="text-2xl font-bold text-brand-maroon mb-8 uppercase tracking-tight">Frequently Asked Questions</h2>
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
                {[
                  { q: 'How do I scan a badge?', a: 'Use the camera icon in the header or the "Badge Scanner" button in the Home or More tab to instantly capture professional contact details.' },
                  { q: 'Where can I find my schedule?', a: 'Navigate to the Agenda tab or check the "My Schedule" section on the Home page. You can bookmark sessions to build your personal timeline.' },
                  { q: 'How do I contact support?', a: 'Visit the "Visitor Convenience" section in the More tab or use the AI Event Concierge for immediate, intelligent assistance.' },
                  { q: 'What is Harvics EventOS?', a: 'It is a structured intelligence platform designed to transform trade events into curated discovery ecosystems for global professionals.' }
                ].map((faq, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="text-sm font-bold text-brand-maroon uppercase tracking-tight">{faq.q}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {showPrivacy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-brand-bg/95 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <div className="w-full max-w-lg bg-brand-surface border border-brand-gold-light/20 rounded-[40px] p-10 shadow-2xl relative overflow-hidden text-center">
              <button onClick={() => setShowPrivacy(false)} className="absolute top-6 right-6 p-2 hover:bg-brand-bg rounded-full transition-colors">
                <X className="w-6 h-6 text-brand-maroon" />
              </button>
              <div className="w-16 h-16 bg-brand-bg border border-brand-gold-light/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="w-8 h-8 text-brand-gold" />
              </div>
              <h2 className="text-2xl font-bold text-brand-maroon mb-4 uppercase tracking-tight">Privacy & Legal</h2>
              <p className="text-xs text-text-secondary leading-relaxed mb-8">
                Your data is protected by Harvics EventOS Intelligence. We ensure that your professional information is only shared with authorized exhibitors and connections you approve.
              </p>
              <div className="space-y-3">
                <button className="w-full py-4 bg-brand-maroon text-white rounded-2xl font-bold uppercase tracking-widest text-[10px]">View Full Policy</button>
                <button className="w-full py-4 border border-brand-gold-light/20 text-brand-maroon rounded-2xl font-bold uppercase tracking-widest text-[10px]">Terms of Service</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
