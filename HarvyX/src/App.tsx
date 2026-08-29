/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { 
  Mic, MicOff, Volume2, Volume1, VolumeX, Languages, Sparkles, 
  MessageSquare, Info, ChevronDown, Search, Check, 
  Lightbulb, Globe, Zap, History, MapPin, Calendar, 
  Star, Shield, X, ArrowRight, Compass, Plane, Utensils,
  Hotel, Car, FileUp, Music, Send, Paperclip, Download,
  Navigation, CreditCard, Ticket, Activity, FileMinus,
  Coins, ArrowLeftRight, Bell, CheckCircle2, Sliders, Keyboard, CloudSun
} from 'lucide-react';

export interface ToastNotification {
  id: string;
  type: 'flight' | 'booking' | 'info' | 'alert';
  title: string;
  message: string;
  timestamp: string;
  details?: {
    flightNumber?: string;
    route?: string;
    status?: string;
    gate?: string;
    reference?: string;
    amount?: string;
  };
}

export interface AviationstackFlight {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone?: string;
    iata: string;
    icao?: string;
    terminal?: string;
    gate?: string;
    delay?: number;
    scheduled?: string;
    estimated?: string;
    actual?: string;
  };
  arrival: {
    airport: string;
    timezone?: string;
    iata: string;
    icao?: string;
    terminal?: string;
    gate?: string;
    baggage?: string;
    delay?: number;
    scheduled?: string;
    estimated?: string;
    actual?: string;
  };
  airline: {
    name: string;
    iata?: string;
    icao?: string;
  };
  flight: {
    number: string;
    iata: string;
    icao?: string;
  };
  aircraft?: {
    registration?: string;
    iata?: string;
    icao?: string;
  };
  live?: {
    updated?: string;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    speed_horizontal?: number;
  };
}

export interface DuffelOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  cabin_class?: string;
  expires_at?: string;
  airline: { name: string; iata?: string };
  flight: { iata: string; number?: string };
  departure: {
    airport?: string;
    iata: string;
    terminal?: string;
    scheduled?: string;
  };
  arrival: {
    airport?: string;
    iata: string;
    terminal?: string;
    scheduled?: string;
  };
  duration?: string;
  duration_minutes?: number;
  stops?: number;
  segments?: Array<{
    flight?: string;
    from?: string;
    to?: string;
    departing_at?: string;
    arriving_at?: string;
  }>;
  booking_url?: string;
  price_formatted?: string;
}

function formatIsoDuration(iso?: string): string {
  if (!iso) return '';
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return iso;
  return [m[1] && `${m[1]}h`, m[2] && `${m[2]}m`].filter(Boolean).join(' ');
}

function formatMoney(amount?: string, currency?: string): string {
  if (!amount) return '—';
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency || ''} ${amount}`.trim();
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency || ''} ${n.toFixed(0)}`.trim();
  }
}

function formatClock(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(11, 16) || iso;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export interface BookingHotel {
  hotel_id: string;
  name: string;
  review_score?: number;
  review_word?: string;
  review_count?: number;
  stars?: number;
  price_amount?: number | null;
  price_currency?: string;
  checkin?: string;
  checkout?: string;
  photo?: string;
  wishlist_name?: string;
  url?: string;
}

export interface BookingAttraction {
  id: string;
  name: string;
  slug?: string;
  short_description?: string;
  price_amount?: number | null;
  price_currency?: string;
  review_score?: number;
  review_count?: number;
  photo?: string;
  city?: string;
  cancellation?: string;
  url?: string;
}

export interface TripadvisorRestaurant {
  id: string;
  name: string;
  rating?: number | null;
  review_count?: number | null;
  price_tag?: string;
  cuisines?: string[];
  open_status?: string;
  photo?: string;
  location?: string;
  url?: string;
}

export interface CarOffer {
  id: string;
  name: string;
  category?: string;
  vendor?: string;
  price_per_day?: string;
  price_total?: string;
  image?: string;
  attributes?: string[];
  location?: string;
  url?: string;
  free_cancellation?: boolean;
}

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { motion, AnimatePresence } from 'motion/react';
import { AudioRecorder, AudioPlayer } from './utils/audio';
import EngagementPanel from './components/EngagementPanel';
import {
  ChatMessage,
  TravelerProfile,
  CultureMemory,
  ItineraryItem,
  DEFAULT_PROFILE,
  DEFAULT_CULTURE,
  loadChat,
  saveChat,
  loadProfile,
  saveProfile,
  loadCulture,
  saveCulture,
  loadItinerary,
  saveItinerary,
  loadDraft,
  saveDraft,
  loadDarkMode,
  saveDarkMode,
  trackEvent,
  uid,
  profileSystemHint,
} from './lib/engagement';

function Visualizer({ data, isThinking }: { data: Uint8Array, isThinking: boolean }) {
  return (
    <div className="flex items-end justify-center gap-1 h-12">
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            height: data[i * 8] ? Math.max(4, (data[i * 8] / 255) * 48) : 4,
            opacity: isThinking ? [0.5, 1, 0.5] : 1
          }}
          transition={isThinking ? { duration: 1, repeat: Infinity, delay: i * 0.05 } : {}}
          className="w-1.5 bg-maroon rounded-full"
        />
      ))}
    </div>
  );
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'it', name: 'Italian' },
  { code: 'hi', name: 'Hindi' },
];

const SUPPORTED_CURRENCIES: Record<string, { code: string; name: string; symbol: string; rateToUSD: number }> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rateToUSD: 1.0 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rateToUSD: 0.922 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rateToUSD: 0.785 },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'AED ', rateToUSD: 3.6725 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateToUSD: 154.5 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF ', rateToUSD: 0.908 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rateToUSD: 1.348 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rateToUSD: 1.522 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rateToUSD: 1.365 },
  SAR: { code: 'SAR', name: 'Saudi Riyal', symbol: 'SAR ', rateToUSD: 3.750 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rateToUSD: 83.5 },
  HKD: { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', rateToUSD: 7.82 },
};

const DESTINATION_CURRENCY_MAP: Record<string, string> = {
  DXB: 'AED', DUBAI: 'AED', UAE: 'AED', 'ABU DHABI': 'AED', AUH: 'AED', SHARJAH: 'AED',
  LHR: 'GBP', LGW: 'GBP', STN: 'GBP', MAN: 'GBP', LONDON: 'GBP', UK: 'GBP', ENGLAND: 'GBP', 'UNITED KINGDOM': 'GBP', SCOTLAND: 'GBP',
  CDG: 'EUR', ORY: 'EUR', PARIS: 'EUR', FRANCE: 'EUR', FCO: 'EUR', MXP: 'EUR', ROME: 'EUR', MILAN: 'EUR', ITALY: 'EUR', MAD: 'EUR', BCN: 'EUR', MADRID: 'EUR', BARCELONA: 'EUR', SPAIN: 'EUR', BER: 'EUR', FRA: 'EUR', MUC: 'EUR', BERLIN: 'EUR', FRANKFURT: 'EUR', GERMANY: 'EUR', AMS: 'EUR', AMSTERDAM: 'EUR', NETHERLANDS: 'EUR', ATH: 'EUR', ATHENS: 'EUR', GREECE: 'EUR',
  HND: 'JPY', NRT: 'JPY', KIX: 'JPY', TOKYO: 'JPY', OSAKA: 'JPY', KYOTO: 'JPY', JAPAN: 'JPY',
  SIN: 'SGD', SINGAPORE: 'SGD',
  SYD: 'AUD', MEL: 'AUD', BNE: 'AUD', SYDNEY: 'AUD', MELBOURNE: 'AUD', AUSTRALIA: 'AUD',
  ZRH: 'CHF', GVA: 'CHF', ZURICH: 'CHF', GENEVA: 'CHF', SWITZERLAND: 'CHF',
  JFK: 'USD', LAX: 'USD', ORD: 'USD', MIA: 'USD', SFO: 'USD', NYC: 'USD', 'NEW YORK': 'USD', 'LOS ANGELES': 'USD', MIAMI: 'USD', USA: 'USD', 'UNITED STATES': 'USD',
  YYZ: 'CAD', YVR: 'CAD', TORONTO: 'CAD', VANCOUVER: 'CAD', CANADA: 'CAD',
  RUH: 'SAR', JED: 'SAR', RIYADH: 'SAR', JEDDAH: 'SAR', SAUDI: 'SAR', 'SAUDI ARABIA': 'SAR',
  DEL: 'INR', BOM: 'INR', DELHI: 'INR', MUMBAI: 'INR', INDIA: 'INR',
  HKG: 'HKD', 'HONG KONG': 'HKD',
};

const SERVICES = [
  { 
    id: 'travel', 
    title: 'Luxury Travel', 
    icon: Plane, 
    desc: 'Private jet bookings, Yacht charters, and Exclusive destination guides.' 
  },
  { id: 'hotels', title: 'Grand Hotels', icon: Hotel, desc: 'Suite reservations at the world\'s most prestigious addresses.' },
  { id: 'flights', title: 'First Class', icon: Plane, desc: 'Seamless global flight management and search.' },
  { id: 'taxi', title: 'Elite Transport', icon: Car, desc: 'Chauffeur-driven luxury vehicles and private transfers.' },
  { id: 'cars', title: 'Luxury Rentals', icon: Car, desc: 'Self-drive exotic cars and premium SUVs.' },
  { id: 'events', title: 'Elite Events', icon: Calendar, desc: 'Unforgettable celebrations in exclusive locations.' },
  { id: 'dining', title: 'Fine Dining', icon: Utensils, desc: 'Priority access to Michelin-starred restaurants.' },
];

const DEALS = [
  "Exclusive 20% off at The Ritz-Carlton Paris",
  "Complimentary Yacht Upgrade in Monaco",
  "Private Jet Empty Leg: London to Dubai - $5,000",
  "VIP Access: Milan Fashion Week After-Party",
];

const getSystemInstruction = (source: string, target: string, profileHint = '') => `You are HARVYX CONCIERGE, the high-velocity elite logistics engine. 
Tone: Ultra-professional, data-driven, concise. ZERO conversational filler.
Execution: When the user speaks or types, provide immediate data-dense options. 
Search: Use Google Search/Maps for live availability, pricing, and coordinates.
${profileHint ? `Traveler context: ${profileHint}` : ''}

Mandatory Tags in every turn:
[MOOD: precision|urgent|calm]
[INTENT: flights|hotels|lifestyle|events|cars|dining]
[CULTURE: single critical protocol fact or elite etiquette tip]

Example: "Search G650 LHR to DXB" -> [MOOD: precision] [INTENT: flights] [CULTURE: LHR Signature terminal requires 15m pre-arrival.] "Found 3 empty legs. G650 ($14k), Global 7500 ($18k). Ready to link payment."
`;

interface LanguageSelectorProps {
  label: string;
  selected: string;
  onSelect: (code: string) => void;
}

function LanguageSelector({ label, selected, onSelect }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLang = SUPPORTED_LANGUAGES.find(l => l.code === selected);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <p className="text-[10px] uppercase tracking-widest text-white/60 mb-1 font-medium">{label}</p>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-44 px-4 py-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all text-xs group text-white"
      >
        <span className="font-medium">{selectedLang?.name}</span>
        <ChevronDown className={`w-3 h-3 text-gold transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-3 border-b border-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-50 border-none py-2 pl-8 pr-3 text-[11px] rounded-lg focus:ring-0 outline-none text-ink"
                />
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto py-1 custom-scrollbar">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onSelect(lang.code);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-4 py-2.5 text-[11px] transition-colors text-left ${
                    selected === lang.code ? 'bg-maroon/5 text-maroon font-semibold' : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span>{lang.name}</span>
                  {selected === lang.code && <Check className="w-3 h-3 text-gold" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState('Ready to welcome you');
  const [aiResponse, setAiResponse] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isThinking, setIsThinking] = useState(false);
  
  // Advanced State
  const [mood, setMood] = useState<'calm' | 'excited' | 'curious' | 'concerned'>('calm');
  const [cultureTip, setCultureTip] = useState<string | null>(null);
  const [activeService, setActiveService] = useState<string | null>(null);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journal, setJournal] = useState<{ type: 'text' | 'tip' | 'audio' | 'file', content: string, timestamp: Date, url?: string }[]>([]);
  const [voiceData, setVoiceData] = useState<Uint8Array>(new Uint8Array(128));
  const [isRecordingNote, setIsRecordingNote] = useState(false);
  const [activeTab, setActiveTab] = useState<'concierge' | 'comm'>('concierge');
  const [commInput, setCommInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [travelerProfile, setTravelerProfile] = useState<TravelerProfile>(DEFAULT_PROFILE);
  const [cultureMemory, setCultureMemory] = useState<CultureMemory>(DEFAULT_CULTURE);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [draftPending, setDraftPending] = useState(false);
  const commInputRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const engagementHydrated = useRef(false);
  const [mapCenter, setMapCenter] = useState({ lat: 48.8566, lng: 2.3522 }); // Paris
  const [groundingLinks, setGroundingLinks] = useState<{ uri: string, title: string }[]>([]);
  const [bookingData, setBookingData] = useState<{
    from: string;
    to: string;
    date: string;
    carType: string;
    pickup: string;
  }>({ 
    from: '', 
    to: '', 
    date: '', 
    carType: 'Supercar (Ferrari, Lamborghini)',
    pickup: 'London' 
  });
  
  // Toast Notification System State (framer-motion animated alerts)
  const [toasts, setToasts] = useState<ToastNotification[]>([
    {
      id: 'init-flight-toast',
      type: 'flight',
      title: 'Flight Status Alert',
      message: 'Flight EK008 (LHR → DXB): Boarding at Gate A14. VIP corridor cleared.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      details: {
        flightNumber: 'EK008',
        route: 'LHR → DXB',
        status: 'Boarding Now',
        gate: 'Gate A14'
      }
    }
  ]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id' | 'timestamp'> & { duration?: number }) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newToast: ToastNotification = { id, timestamp, ...toast };

    setToasts(prev => [newToast, ...prev].slice(0, 5));

    const duration = toast.duration ?? 6500;
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const triggerDemoFlightAlert = useCallback(() => {
    const flightNums = ['EK008', 'G650-VIP', 'BA011', 'AF022', 'QR004', 'LX160'];
    const routes = ['LHR → DXB', 'JFK → CDG', 'HND → SIN', 'ZRH → LAX', 'BOM → LHR'];
    const gates = ['Gate A14', 'Terminal 5 VIP', 'Gate B22', 'Hangar 3 Executive', 'Gate C09'];
    const statusOpts = ['Gate Change: B22', 'On Schedule', 'Boarding Now', 'Corridor Cleared', 'Pre-flight Dispatch'];

    const idx = Math.floor(Math.random() * flightNums.length);
    const randomFlight = flightNums[idx];
    const randomRoute = routes[Math.floor(Math.random() * routes.length)];
    const randomGate = gates[Math.floor(Math.random() * gates.length)];
    const randomStatus = statusOpts[Math.floor(Math.random() * statusOpts.length)];

    addToast({
      type: 'flight',
      title: 'Live Flight Status Change',
      message: `Flight ${randomFlight} (${randomRoute}): ${randomStatus}. Proceed to ${randomGate}.`,
      details: {
        flightNumber: randomFlight,
        route: randomRoute,
        status: randomStatus,
        gate: randomGate
      }
    });
  }, [addToast]);

  const triggerDemoBookingConfirmation = useCallback(() => {
    const bookings = [
      { title: 'Gulfstream G650 Charter', msg: 'London (LHR) to Dubai (DXB) flight confirmed.', ref: '#AUR-9942', amt: 'USD $14,500' },
      { title: 'Ferrari 296 GTB Chauffeur', msg: 'Supercar reserved for Paris Charles de Gaulle.', ref: '#AUR-8812', amt: 'EUR €2,800' },
      { title: 'Presidential Penthouse', msg: 'Suite confirmed at Hotel de Crillon, Paris.', ref: '#AUR-7734', amt: 'EUR €6,200' },
      { title: 'Milan Fashion Week VIP Gala', msg: 'After-Party Pass & Executive Transfer confirmed.', ref: '#AUR-6610', amt: 'Invite Only' }
    ];

    const item = bookings[Math.floor(Math.random() * bookings.length)];
    addToast({
      type: 'booking',
      title: 'Booking Confirmation Received',
      message: `${item.title}: ${item.msg}`,
      details: {
        reference: item.ref,
        amount: item.amt,
        status: 'Confirmed'
      }
    });
  }, [addToast]);

  // Currency Conversion Tool State
  const [convAmount, setConvAmount] = useState<number>(1000);
  const [baseCurrency, setBaseCurrency] = useState<string>('USD');
  const [targetCurrency, setTargetCurrency] = useState<string>('AED');
  const [detectedDestination, setDetectedDestination] = useState<string | null>(null);
  const [liveFxRates, setLiveFxRates] = useState<Record<string, number> | null>(null);
  const [fxSource, setFxSource] = useState<string>('static');
  const [fxUpdatedAt, setFxUpdatedAt] = useState<string>('');
  const [isFxLoading, setIsFxLoading] = useState<boolean>(false);

  // Duffel offers (primary) + optional Aviationstack radar
  const [aviationQuery, setAviationQuery] = useState<string>('EK008');
  const [aviationDepIata, setAviationDepIata] = useState<string>('LHR');
  const [aviationArrIata, setAviationArrIata] = useState<string>('DXB');
  const [aviationFlights, setAviationFlights] = useState<AviationstackFlight[]>([]);
  const [isAviationLoading, setIsAviationLoading] = useState<boolean>(false);
  const [aviationSource, setAviationSource] = useState<string>('duffel');
  const [showAviationModal, setShowAviationModal] = useState<boolean>(false);
  const [duffelOffers, setDuffelOffers] = useState<DuffelOffer[]>([]);
  const [isDuffelLoading, setIsDuffelLoading] = useState<boolean>(false);
  const [duffelCabin, setDuffelCabin] = useState<string>('business');
  const [flightProvider, setFlightProvider] = useState<'duffel' | 'skyscanner'>('duffel');
  const [duffelDate, setDuffelDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [hotelQuery, setHotelQuery] = useState<string>('Dubai');
  const [hotelCheckIn, setHotelCheckIn] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [hotelCheckOut, setHotelCheckOut] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 16);
    return d.toISOString().slice(0, 10);
  });
  const [bookingHotels, setBookingHotels] = useState<BookingHotel[]>([]);
  const [bookingAttractions, setBookingAttractions] = useState<BookingAttraction[]>([]);
  const [isBookingLoading, setIsBookingLoading] = useState<boolean>(false);
  const [bookingTab, setBookingTab] = useState<'stays' | 'attractions'>('stays');
  const [diningQuery, setDiningQuery] = useState<string>('Dubai');
  const [diningRestaurants, setDiningRestaurants] = useState<TripadvisorRestaurant[]>([]);
  const [isDiningLoading, setIsDiningLoading] = useState<boolean>(false);
  const [diningSource, setDiningSource] = useState<string>('tripadvisor');
  const [carOffers, setCarOffers] = useState<CarOffer[]>([]);
  const [isCarsLoading, setIsCarsLoading] = useState<boolean>(false);
  const [carsSource, setCarsSource] = useState<string>('expedia');
  const [carPickUpDate, setCarPickUpDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [carDropOffDate, setCarDropOffDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 17);
    return d.toISOString().slice(0, 10);
  });
  const [weatherQuery, setWeatherQuery] = useState<string>('London');
  const [weatherCity, setWeatherCity] = useState<string>('');
  const [weatherForecast, setWeatherForecast] = useState<Array<{
    at?: string;
    summary?: string;
    temp?: number | null;
    feels_like?: number | null;
    unit?: string;
    humidity?: number | null;
    condition?: string;
    description?: string;
    icon?: string;
    wind_speed?: number | null;
    wind_dir?: string;
    pop?: number | null;
  }>>([]);
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);

  // AI Concierge Voice Playback Volume State
  const [playbackVolume, setPlaybackVolume] = useState<number>(0.85);
  const [showVolumeOverlay, setShowVolumeOverlay] = useState<boolean>(false);

  const handleVolumeChange = useCallback((newVol: number) => {
    setPlaybackVolume(newVol);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.setVolume(newVol);
    }
  }, []);

  const fetchDuffelOffers = useCallback(async (depIata?: string, arrIata?: string, date?: string, cabin?: string) => {
    setIsDuffelLoading(true);
    setFlightProvider('duffel');
    try {
      const origin = (depIata !== undefined ? depIata : aviationDepIata).trim().toUpperCase() || 'LHR';
      const destination = (arrIata !== undefined ? arrIata : aviationArrIata).trim().toUpperCase() || 'DXB';
      const departure_date = (date !== undefined ? date : duffelDate) || undefined;
      const cabin_class = cabin !== undefined ? cabin : duffelCabin;

      const res = await fetch('/api/duffel/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, departure_date, cabin_class, passengers: 1 }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        addToast({
          type: 'alert',
          title: 'Duffel search failed',
          message: data.error || `HTTP ${res.status}`,
        });
        setDuffelOffers([]);
        return;
      }

      const offers: DuffelOffer[] = Array.isArray(data.offers) ? data.offers : [];
      setDuffelOffers(offers);
      setAviationSource('duffel');
      setBookingData((p) => ({
        ...p,
        from: origin,
        to: destination,
        date: data.departure_date || departure_date || p.date,
      }));

      if (offers.length > 0) {
        const first = offers[0];
        addToast({
          type: 'flight',
          title: `Duffel: ${offers.length} offers`,
          message: `${first.airline?.name || 'Airline'} ${first.flight?.iata || ''} · ${origin} → ${destination} from ${formatMoney(first.total_amount, first.total_currency)}.`,
          details: {
            flightNumber: first.flight?.iata,
            route: `${origin} → ${destination}`,
            status: (first.cabin_class || cabin_class || 'business').toUpperCase(),
            amount: formatMoney(first.total_amount, first.total_currency),
          },
        });
      } else {
        addToast({
          type: 'info',
          title: 'No Duffel offers',
          message: `No ${cabin_class} fares for ${origin} → ${destination} on ${data.departure_date || departure_date}.`,
        });
      }
    } catch (err) {
      console.error('Duffel search error:', err);
      addToast({
        type: 'alert',
        title: 'Duffel unreachable',
        message: 'Could not reach /api/duffel/flights. Is HarvyX server running?',
      });
    } finally {
      setIsDuffelLoading(false);
    }
  }, [aviationDepIata, aviationArrIata, duffelDate, duffelCabin, addToast]);

  const fetchSkyscannerFlights = useCallback(async (depIata?: string, arrIata?: string, date?: string, cabin?: string) => {
    setIsDuffelLoading(true);
    setFlightProvider('skyscanner');
    try {
      const origin = (depIata !== undefined ? depIata : aviationDepIata).trim() || 'London';
      const destination = (arrIata !== undefined ? arrIata : aviationArrIata).trim() || 'Dubai';
      const departure_date = (date !== undefined ? date : duffelDate) || undefined;
      const cabin_class = cabin !== undefined ? cabin : duffelCabin;
      const params = new URLSearchParams({
        origin,
        destination,
        date: departure_date || '',
        cabinClass: cabin_class,
        adults: '1',
        currency: 'USD',
      });
      const res = await fetch(`/api/skyscanner/flights?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({ type: 'alert', title: 'Skyscanner search failed', message: data.error || `HTTP ${res.status}` });
        setDuffelOffers([]);
        return;
      }
      const offers: DuffelOffer[] = (Array.isArray(data.offers) ? data.offers : []).map((o: any) => ({
        id: o.id,
        total_amount: o.total_amount,
        total_currency: o.total_currency || 'USD',
        airline: o.airline || { name: 'Airline' },
        flight: o.flight || { iata: '—' },
        departure: o.departure || { iata: origin },
        arrival: o.arrival || { iata: destination },
        duration_minutes: o.duration_minutes,
        stops: o.stops,
        booking_url: o.booking_url,
        price_formatted: o.price_formatted,
        cabin_class: cabin_class,
      }));
      setDuffelOffers(offers);
      setAviationSource('skyscanner');
      setBookingData((p) => ({
        ...p,
        from: data.origin?.iataCode || origin,
        to: data.destination?.iataCode || destination,
        date: data.date || departure_date || p.date,
      }));
      if (offers.length > 0) {
        const first = offers[0];
        addToast({
          type: 'flight',
          title: `Skyscanner: ${data.total || offers.length} fares`,
          message: `${first.airline?.name} · ${origin} → ${destination} from ${first.price_formatted || formatMoney(first.total_amount, first.total_currency)}.`,
          details: {
            flightNumber: first.flight?.iata,
            route: `${first.departure?.iata} → ${first.arrival?.iata}`,
            status: 'Skyscanner',
            amount: first.price_formatted || formatMoney(first.total_amount, first.total_currency),
          },
        });
      }
    } catch (err) {
      console.error('Skyscanner search error:', err);
      addToast({ type: 'alert', title: 'Skyscanner unreachable', message: 'Could not reach /api/skyscanner/flights.' });
    } finally {
      setIsDuffelLoading(false);
    }
  }, [aviationDepIata, aviationArrIata, duffelDate, duffelCabin, addToast]);

  const fetchAviationstackFlights = useCallback(async (flightIata?: string, depIata?: string, arrIata?: string) => {
    setIsAviationLoading(true);
    try {
      const params = new URLSearchParams();
      const flightSearch = flightIata !== undefined ? flightIata : aviationQuery;
      const depSearch = depIata !== undefined ? depIata : aviationDepIata;
      const arrSearch = arrIata !== undefined ? arrIata : aviationArrIata;

      if (flightSearch.trim()) params.append('flight_iata', flightSearch.trim());
      if (depSearch.trim()) params.append('dep_iata', depSearch.trim());
      if (arrSearch.trim()) params.append('arr_iata', arrSearch.trim());
      params.append('limit', '8');

      const res = await fetch(`/api/flights?${params.toString()}`);
      const data = await res.json();

      if (data && data.flights) {
        setAviationFlights(data.flights);
        setAviationSource(data.source || 'aviationstack');

        if (data.flights.length > 0) {
          const first = data.flights[0];
          const isLive = data.source === 'aviationstack';
          addToast({
            type: 'flight',
            title: isLive
              ? `Live flight: ${first.flight?.iata || 'EK008'}`
              : `Demo flight data: ${first.flight?.iata || 'EK008'}`,
            message: isLive
              ? `${first.airline?.name || 'Airline'} ${first.flight?.iata || ''} (${first.departure?.iata || 'DEP'} → ${first.arrival?.iata || 'ARR'}) — ${first.flight_status?.toUpperCase() || 'ACTIVE'}.`
              : `Aviationstack quota reached — showing cached demo route ${first.departure?.iata || 'DEP'} → ${first.arrival?.iata || 'ARR'}.`,
            details: {
              flightNumber: first.flight?.iata,
              route: `${first.departure?.iata || 'DEP'} → ${first.arrival?.iata || 'ARR'}`,
              status: first.flight_status,
              gate: first.departure?.gate ? `Gate ${first.departure.gate}` : undefined
            }
          });
        }
      }
    } catch (err) {
      console.error("Aviationstack search error:", err);
    } finally {
      setIsAviationLoading(false);
    }
  }, [aviationQuery, aviationDepIata, aviationArrIata, addToast]);

  useEffect(() => {
    fetchDuffelOffers('LHR', 'DXB');
  }, []);

  const fetchBookingHotels = useCallback(async (city?: string, checkin?: string, checkout?: string) => {
    setIsBookingLoading(true);
    setBookingTab('stays');
    try {
      const q = (city !== undefined ? city : hotelQuery).trim() || 'Dubai';
      const arrival_date = checkin || hotelCheckIn;
      const departure_date = checkout || hotelCheckOut;
      const params = new URLSearchParams({
        q,
        arrival_date,
        departure_date,
        adults: '2',
        currency_code: 'USD',
      });
      const res = await fetch(`/api/booking/hotels?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({ type: 'alert', title: 'Booking.com hotels failed', message: data.error || `HTTP ${res.status}` });
        setBookingHotels([]);
        return;
      }
      const hotels: BookingHotel[] = Array.isArray(data.hotels) ? data.hotels : [];
      setBookingHotels(hotels);
      if (hotels.length > 0) {
        const first = hotels[0];
        addToast({
          type: 'booking',
          title: `Booking.com: ${hotels.length} stays`,
          message: `${first.name} in ${q} from ${formatMoney(String(first.price_amount ?? ''), first.price_currency)}.`,
          details: {
            route: q,
            amount: formatMoney(String(first.price_amount ?? ''), first.price_currency),
            status: first.review_word || 'Available',
            reference: first.hotel_id,
          },
        });
      }
    } catch (err) {
      console.error('Booking hotels error:', err);
      addToast({ type: 'alert', title: 'Booking.com unreachable', message: 'Could not reach /api/booking/hotels.' });
    } finally {
      setIsBookingLoading(false);
    }
  }, [hotelQuery, hotelCheckIn, hotelCheckOut, addToast]);

  const fetchBookingAttractions = useCallback(async (city?: string) => {
    setIsBookingLoading(true);
    setBookingTab('attractions');
    try {
      const q = (city !== undefined ? city : hotelQuery).trim() || 'Dubai';
      const params = new URLSearchParams({ q, currency_code: 'USD', sortBy: 'trending' });
      const res = await fetch(`/api/booking/attractions?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({ type: 'alert', title: 'Booking.com attractions failed', message: data.error || `HTTP ${res.status}` });
        setBookingAttractions([]);
        return;
      }
      const attractions: BookingAttraction[] = Array.isArray(data.attractions) ? data.attractions : [];
      setBookingAttractions(attractions);
      if (attractions.length > 0) {
        const first = attractions[0];
        addToast({
          type: 'booking',
          title: `Experiences: ${attractions.length}`,
          message: `${first.name} from ${formatMoney(String(first.price_amount ?? ''), first.price_currency)}.`,
          details: {
            route: q,
            amount: formatMoney(String(first.price_amount ?? ''), first.price_currency),
            status: 'Trending',
            reference: first.slug || first.id,
          },
        });
      }
    } catch (err) {
      console.error('Booking attractions error:', err);
      addToast({ type: 'alert', title: 'Booking.com unreachable', message: 'Could not reach /api/booking/attractions.' });
    } finally {
      setIsBookingLoading(false);
    }
  }, [hotelQuery, addToast]);

  const fetchTripadvisorRestaurants = useCallback(async (city?: string) => {
    setIsDiningLoading(true);
    try {
      const q = (city !== undefined ? city : diningQuery).trim() || 'Dubai';
      const res = await fetch(`/api/tripadvisor/restaurants?${new URLSearchParams({ q }).toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({ type: 'alert', title: 'TripAdvisor failed', message: data.error || `HTTP ${res.status}` });
        setDiningRestaurants([]);
        return;
      }
      const restaurants: TripadvisorRestaurant[] = Array.isArray(data.restaurants) ? data.restaurants : [];
      setDiningRestaurants(restaurants);
      setDiningSource(data.source || 'tripadvisor');
      const isLive = data.source === 'tripadvisor';
      if (restaurants.length > 0) {
        const first = restaurants[0];
        addToast({
          type: 'booking',
          title: isLive ? `TripAdvisor: ${restaurants.length} tables` : `Dining shortlist: ${restaurants.length}`,
          message: isLive
            ? `${first.name} · ${first.rating ?? '—'}★ · ${first.price_tag || 'Fine dining'} in ${data.location || q}.`
            : `TripAdvisor restaurant API is erroring on RapidAPI right now — showing curated ${data.location || q} tables.`,
          details: {
            route: data.location || q,
            status: first.open_status || (isLive ? 'Live' : 'Curated'),
            reference: first.id,
            amount: first.price_tag,
          },
        });
      }
    } catch (err) {
      console.error('TripAdvisor dining error:', err);
      addToast({ type: 'alert', title: 'TripAdvisor unreachable', message: 'Could not reach /api/tripadvisor/restaurants.' });
    } finally {
      setIsDiningLoading(false);
    }
  }, [diningQuery, addToast]);

  const fetchCars = useCallback(async (pickupOverride?: string, carTypeOverride?: string) => {
    const pickup = (pickupOverride !== undefined ? pickupOverride : bookingData.pickup).trim() || 'London';
    const carType = (carTypeOverride !== undefined ? carTypeOverride : bookingData.carType).trim() || 'Sedan';
    setIsCarsLoading(true);
    try {
      const params = new URLSearchParams({
        q: pickup,
        carType,
        pickUpDate: carPickUpDate,
        dropOffDate: carDropOffDate,
      });
      const res = await fetch(`/api/cars/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({ type: 'alert', title: 'Car search failed', message: data.error || `HTTP ${res.status}` });
        setCarOffers([]);
        return;
      }
      const cars: CarOffer[] = Array.isArray(data.cars) ? data.cars : [];
      setCarOffers(cars);
      setCarsSource(data.source || 'expedia');
      const isLive = data.source === 'expedia';
      const first = cars[0];
      addToast({
        type: isLive ? 'booking' : 'alert',
        title: isLive ? `Fleet · ${data.location || pickup}` : `Curated fleet · ${data.location || pickup}`,
        message: first
          ? `${first.name} · ${first.vendor || 'Partner'} · ${first.price_per_day || first.price_total || '—'}${cars.length > 1 ? ` · +${cars.length - 1} more` : ''}`
          : 'No vehicles found for these dates.',
      });
      if (data.location) {
        setBookingData((p) => ({ ...p, pickup: String(data.location) }));
      }
    } catch (err) {
      console.error('Cars search error:', err);
      addToast({ type: 'alert', title: 'Cars unreachable', message: 'Could not reach /api/cars/search.' });
      setCarOffers([]);
    } finally {
      setIsCarsLoading(false);
    }
  }, [bookingData.pickup, bookingData.carType, carPickUpDate, carDropOffDate, addToast]);

  const fetchWeatherForecast = useCallback(async (place?: string) => {
    setIsWeatherLoading(true);
    try {
      const q = (place !== undefined ? place : weatherQuery).trim() || 'London';
      const params = new URLSearchParams({ place: q, cnt: '5', units: 'metric' });
      const res = await fetch(`/api/weather/forecast?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast({ type: 'alert', title: 'Weather failed', message: data.error || `HTTP ${res.status}` });
        setWeatherForecast([]);
        return;
      }
      const rows = Array.isArray(data.forecast) ? data.forecast : [];
      setWeatherForecast(rows);
      setWeatherCity([data.city?.name, data.city?.country].filter(Boolean).join(', ') || q);
      if (rows.length > 0) {
        const first = rows[0];
        addToast({
          type: 'info',
          title: `Weather: ${data.city?.name || q}`,
          message: `${first.description || first.condition || 'Forecast'} · ${first.temp ?? '—'}${first.unit || '°C'}`,
          details: {
            route: data.city?.name || q,
            status: first.condition || 'Live',
            amount: first.temp != null ? `${first.temp}${first.unit || '°C'}` : undefined,
          },
        });
      }
    } catch (err) {
      console.error('Weather error:', err);
      addToast({ type: 'alert', title: 'Weather unreachable', message: 'Could not reach /api/weather/forecast.' });
    } finally {
      setIsWeatherLoading(false);
    }
  }, [weatherQuery, addToast]);

  const getFxRateToUsd = useCallback((code: string) => {
    const c = code.toUpperCase();
    if (liveFxRates && typeof liveFxRates[c] === 'number') return liveFxRates[c];
    return SUPPORTED_CURRENCIES[c]?.rateToUSD || 1;
  }, [liveFxRates]);

  const fetchLiveFxRates = useCallback(async () => {
    setIsFxLoading(true);
    try {
      const res = await fetch('/api/fx/latest?base=USD');
      const data = await res.json();
      if (!res.ok || !data.success || !data.rates) {
        addToast({ type: 'alert', title: 'FX feed failed', message: data.error || `HTTP ${res.status}` });
        return;
      }
      setLiveFxRates(data.rates);
      setFxSource(data.cached ? 'live_cache' : 'live');
      setFxUpdatedAt(data.time_update || new Date().toISOString());
      addToast({
        type: 'info',
        title: data.cached ? 'FX rates (cached)' : 'FX rates live',
        message: `USD base · ${Object.keys(data.rates).length} currencies${data.time_update ? ` · ${data.time_update}` : ''}.`,
      });
    } catch (err) {
      console.error('FX fetch error:', err);
      addToast({ type: 'alert', title: 'FX unreachable', message: 'Using static fallback rates.' });
    } finally {
      setIsFxLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    void fetchLiveFxRates();
  }, []);

  // Hydrate engagement persistence
  useEffect(() => {
    const chat = loadChat();
    const profile = loadProfile();
    const culture = loadCulture();
    const trip = loadItinerary();
    const draft = loadDraft();
    const dark = loadDarkMode();
    setChatMessages(chat);
    setTravelerProfile(profile);
    setCultureMemory(culture);
    setItinerary(trip);
    if (draft) {
      setCommInput(draft);
      setDraftPending(true);
    }
    setDarkMode(dark);
    saveDarkMode(dark);
    engagementHydrated.current = true;
    trackEvent('app_open');
  }, []);

  useEffect(() => {
    if (!engagementHydrated.current) return;
    saveChat(chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    if (!engagementHydrated.current) return;
    saveDraft(commInput);
    setDraftPending(Boolean(commInput.trim()) && !isConnected);
  }, [commInput, isConnected]);

  useEffect(() => {
    if (!engagementHydrated.current) return;
    saveItinerary(itinerary);
  }, [itinerary]);

  // Auto-detect target currency whenever travel booking destination updates
  useEffect(() => {
    const destInput = (bookingData.to || bookingData.pickup || '').trim().toUpperCase();
    if (!destInput) return;

    let matchedCurrency: string | null = null;
    let matchedKey: string | null = null;

    for (const [key, code] of Object.entries(DESTINATION_CURRENCY_MAP)) {
      if (destInput === key || destInput.includes(key) || key.includes(destInput)) {
        matchedCurrency = code;
        matchedKey = key;
        break;
      }
    }

    if (matchedCurrency && SUPPORTED_CURRENCIES[matchedCurrency]) {
      setTargetCurrency(matchedCurrency);
      setDetectedDestination(matchedKey);
    }
  }, [bookingData.to, bookingData.pickup]);
  
  const sendToAura = (text: string, opts?: { source?: ChatMessage['source']; role?: ChatMessage['role'] }) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const msg: ChatMessage = {
      id: uid('msg'),
      role: opts?.role || 'user',
      text: trimmed,
      ts: Date.now(),
      source: opts?.source || 'text',
    };
    setChatMessages(prev => [...prev, msg]);
    setJournal(prev => [{ type: 'text', content: trimmed, timestamp: new Date() }, ...prev]);
    trackEvent('message_send', { source: msg.source || 'text', connected: isConnected });

    if (sessionRef.current && isConnected) {
      const hint = profileSystemHint(travelerProfile, cultureMemory);
      // Live API: send text via realtime input (not clientContent) during conversation
      sessionRef.current.sendRealtimeInput({
        text: hint ? `${hint}\n\nUser: ${trimmed}` : trimmed,
      });
      setIsThinking(true);
      setAiResponse('');
      saveDraft('');
      setDraftPending(false);
    } else {
      setAiResponse('Offline draft saved. Connect the mic session to send live to HarvyX Concierge.');
      setDraftPending(true);
    }
  };

  const handleCommSend = () => {
    if (!commInput.trim()) return;
    sendToAura(commInput, { source: 'text' });
    setCommInput('');
    saveDraft('');
    setDraftPending(false);
    commInputRef.current?.focus();
  };

  const handleCommKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommSend();
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isThinking, aiResponse]);

  const handleFlightSearch = () => {
    const { from, to, date } = bookingData;
    if (!from || !to) {
      setAiResponse("Please provide both departure and destination for your elite travel.");
      return;
    }
    const origin = from.trim().toUpperCase();
    const destination = to.trim().toUpperCase();
    const depDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : duffelDate;

    setAviationDepIata(origin);
    setAviationArrIata(destination);
    if (depDate) setDuffelDate(depDate);

    const request = `Search for elite ${duffelCabin} flights from ${origin} to ${destination} on ${depDate}. Provide top luxury options with fares.`;
    setJournal(prev => [{ type: 'text', content: `Requested flight search: ${origin} to ${destination}`, timestamp: new Date() }, ...prev]);

    addToast({
      type: 'booking',
      title: 'Duffel Search Dispatched',
      message: `Live offer request ${origin} → ${destination} (${duffelCabin}).`,
      details: {
        route: `${origin} → ${destination}`,
        reference: `#HX-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'Searching'
      }
    });

    void fetchDuffelOffers(origin, destination, depDate, duffelCabin);
    sendToAura(request);
  };

  const handleCarSearch = () => {
    const { carType, pickup } = bookingData;
    const place = (pickup || 'London').trim();
    if (!pickup) {
      setBookingData((p) => ({ ...p, pickup: place }));
    }
    const request = `Find luxury car rentals for ${carType} class, pickup at ${place} from ${carPickUpDate} to ${carDropOffDate}. Prefer premium vendors.`;
    setJournal(prev => [{ type: 'text', content: `Requested ${carType} at ${place}`, timestamp: new Date() }, ...prev]);
    void fetchCars(place, carType);
    sendToAura(request);
  };  
  const sessionRef = useRef<any>(null);
  const audioRecorderRef = useRef<AudioRecorder | null>(null);
  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const responseBufferRef = useRef<string>('');
  const animationFrameRef = useRef<number | null>(null);

  const updateVoiceData = useCallback(() => {
    if (audioPlayerRef.current) {
      const data = new Uint8Array(128);
      audioPlayerRef.current.getByteFrequencyData(data);
      setVoiceData(data);
    }
    animationFrameRef.current = requestAnimationFrame(updateVoiceData);
  }, []);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const startSession = useCallback(async () => {
    try {
      const apiKey = (process.env.GEMINI_API_KEY || (import.meta as any).env?.VITE_GEMINI_API_KEY || '').trim();
      if (!apiKey) {
        setStatus('Missing GEMINI_API_KEY');
        setAiResponse('Add GEMINI_API_KEY to HarvyX/.env.local and restart the server.');
        return;
      }

      setStatus('Connecting voice…');
      setIsThinking(true);

      // Unlock audio on the same user gesture that starts the session
      const player = new AudioPlayer(playbackVolume);
      await player.resume();
      audioPlayerRef.current = player;
      updateVoiceData();

      const ai = new GoogleGenAI({ apiKey });

      // Current Live API model (native audio). Old preview IDs fail silently / reject.
      const sessionPromise = ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: getSystemInstruction(
            SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || 'English',
            SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || 'Spanish',
            profileSystemHint(travelerProfile, cultureMemory)
          ),
          tools: [{ googleSearch: {} }],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: async () => {
            setIsConnected(true);
            setStatus('HarvyX voice live');
            setIsThinking(false);
            try {
              await startRecording();
              setAiResponse('Voice linked. Speak naturally — I am listening.');
              trackEvent('voice_connected');
            } catch (micErr: any) {
              console.error('Microphone error:', micErr);
              setStatus('Mic blocked');
              setAiResponse(micErr?.message || 'Allow microphone access, then reconnect.');
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            // Prefer data parts from modelTurn OR realtime audio responses
            const parts =
              message.serverContent?.modelTurn?.parts ||
              (message as any).serverContent?.modelTurn?.parts ||
              [];

            if (parts.length) {
              const textPart = parts.find((p: any) => p.text);
              if (textPart?.text) {
                setIsThinking(false);
                const text = textPart.text;
                responseBufferRef.current += text;

                const moodMatch = responseBufferRef.current.match(/\[MOOD: (.*?)\]/);
                const cultureMatch = responseBufferRef.current.match(/\[CULTURE: (.*?)\]/);
                const intentMatch = responseBufferRef.current.match(/\[INTENT: (.*?)\]/);

                if (moodMatch) setMood(moodMatch[1] as any);
                if (cultureMatch) {
                  const tip = cultureMatch[1];
                  if (tip !== cultureTip) {
                    setCultureTip(tip);
                    setJournal(prev => [{ type: 'tip', content: tip, timestamp: new Date() }, ...prev]);
                    setCultureMemory(prev => {
                      const next = { ...prev, tips: [...prev.tips, tip].slice(-40) };
                      saveCulture(next);
                      return next;
                    });
                    trackEvent('culture_tip_captured');
                  }
                }
                if (intentMatch) setActiveService(intentMatch[1]);

                const cleanText = responseBufferRef.current.replace(/\[.*?\]/g, '').replace(/\[.*$/, '').trim();
                setAiResponse(cleanText);
              }

              for (const part of parts) {
                const data = part?.inlineData?.data;
                if (data) {
                  setIsThinking(false);
                  audioPlayerRef.current?.playChunk(data);
                }
              }
            }

            // Some SDK versions emit audio on dedicated fields
            const inlineAudio =
              (message as any).data ||
              (message as any).serverContent?.audio?.data;
            if (typeof inlineAudio === 'string' && inlineAudio.length > 0) {
              setIsThinking(false);
              audioPlayerRef.current?.playChunk(inlineAudio);
            }

            const modelTurn = message.serverContent?.modelTurn as any;
            if (modelTurn?.groundingMetadata) {
              const chunks = modelTurn.groundingMetadata.groundingChunks;
              if (chunks) {
                const links = chunks
                  .filter((c: any) => c.web || c.maps)
                  .map((c: any) =>
                    c.web
                      ? { uri: c.web.uri, title: c.web.title }
                      : { uri: c.maps!.uri, title: c.maps!.title }
                  );
                setGroundingLinks(links);
              }
            }

            if (message.serverContent?.turnComplete) {
              const finalText = responseBufferRef.current.replace(/\[.*?\]/g, '').replace(/\[.*$/, '').trim();
              if (finalText) {
                setChatMessages(prev => [
                  ...prev,
                  {
                    id: uid('msg'),
                    role: 'assistant',
                    text: finalText,
                    ts: Date.now(),
                    source: 'voice',
                  },
                ]);
                setJournal(prev => [{ type: 'text', content: finalText, timestamp: new Date() }, ...prev]);
                trackEvent('assistant_reply');
              }
              responseBufferRef.current = '';
              setIsThinking(false);
            }

            const inputTx =
              (message as any).serverContent?.inputTranscription?.text ||
              (message as any).serverContent?.inputAudioTranscription?.text;
            if (inputTx && typeof inputTx === 'string' && inputTx.trim().length > 2) {
              const voiceText = inputTx.trim();
              setChatMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'voice' && Date.now() - last.ts < 4000) {
                  const updated = [...prev];
                  updated[updated.length - 1] = { ...last, text: voiceText, ts: Date.now() };
                  return updated;
                }
                return [
                  ...prev,
                  { id: uid('msg'), role: 'voice', text: voiceText, ts: Date.now(), source: 'voice' },
                ];
              });
            }
          },
          onclose: () => {
            setIsConnected(false);
            setStatus('Disconnected');
            stopRecording();
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          },
          onerror: (error) => {
            console.error('Live API Error:', error);
            setStatus('Voice error');
            setIsConnected(false);
            setIsThinking(false);
            setAiResponse('Voice session error — check Gemini API key / model access, then reconnect.');
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
          },
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (error: any) {
      console.error('Failed to start session:', error);
      setIsConnected(false);
      setIsThinking(false);
      setStatus('Failed');
      setAiResponse(error?.message || 'Could not start voice session.');
      trackEvent('voice_connect_failed', { message: String(error?.message || error) });
    }
  }, [sourceLang, targetLang, cultureTip, updateVoiceData, travelerProfile, cultureMemory, playbackVolume]);

  useEffect(() => {
    if (isConnected && sessionRef.current) {
      const sourceName = SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name;
      const targetName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name;

      // Live API: use text realtime input (not clientContent) during conversation
      sessionRef.current.sendRealtimeInput({
        text: `SYSTEM UPDATE: Translation mode changed to ${sourceName} -> ${targetName}.`,
      });
      setStatus(`Translating to ${targetName}`);
    }
  }, [sourceLang, targetLang, isConnected]);

  const startRecording = async () => {
    if (!audioRecorderRef.current) {
      audioRecorderRef.current = new AudioRecorder((base64Data) => {
        if (!sessionRef.current || isMuted) return;
        try {
          // Live API expects `audio`, not `media`
          sessionRef.current.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' },
          });
        } catch (err) {
          console.warn('sendRealtimeInput audio failed', err);
        }
      });
    }
    audioRecorderRef.current.setMuted(isMuted);
    await audioRecorderRef.current.start();
    setIsListening(true);
  };

  const stopRecording = () => {
    audioRecorderRef.current?.stop();
    audioRecorderRef.current = null;
    setIsListening(false);
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      audioRecorderRef.current?.setMuted(next);
      return next;
    });
  };

  const handleConnect = () => {
    if (isConnected) {
      try {
        sessionRef.current?.close();
      } catch {
        /* ignore */
      }
      sessionRef.current = null;
      stopRecording();
      setIsConnected(false);
      setStatus('Disconnected');
    } else {
      void startSession();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJournal(prev => [{ 
        type: 'file', 
        content: `File sent: ${file.name}`, 
        timestamp: new Date(),
        url: URL.createObjectURL(file)
      }, ...prev]);
      setAiResponse(`I've received your file: ${file.name}. I'll process it immediately.`);
    }
  };

  const handleAudioNote = () => {
    if (isRecordingNote) {
      setIsRecordingNote(false);
      setJournal(prev => [{ 
        type: 'audio', 
        content: 'Audio note recorded', 
        timestamp: new Date(),
        url: '#' 
      }, ...prev]);
      setAiResponse("Audio note saved to your journal.");
    } else {
      setIsRecordingNote(true);
    }
  };

  const getMoodColors = () => {
    switch (mood) {
      case 'excited': return 'from-gold/40 to-maroon/20';
      case 'concerned': return 'from-cream to-maroon/10';
      case 'curious': return 'from-gold/10 to-maroon/10';
      default: return 'from-gold/20 to-maroon/5';
    }
  };

  return (
    <div className="h-screen bg-cream text-ink font-sans selection:bg-gold/30 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-maroon text-white shadow-lg relative z-20 shrink-0 border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-inner">
              <Sparkles className="w-5 h-5 text-maroon" />
            </div>
            <div>
              <h1 className="text-2xl font-display tracking-tight leading-none">Harvy<span className="text-gold">X</span></h1>
              <p className="text-[9px] text-gold uppercase tracking-widest font-semibold mt-0.5">Elite Concierge</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <LanguageSelector label="Source" selected={sourceLang} onSelect={setSourceLang} />
              <ArrowRight className="w-3 h-3 text-gold/50 mt-4" />
              <LanguageSelector label="Target" selected={targetLang} onSelect={setTargetLang} />
            </div>
            
            <button 
              onClick={() => setIsJournalOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all relative group"
              title="View History"
            >
              <History className="w-4 h-4 text-gold" />
              {journal.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center text-[8px] font-bold text-maroon">{journal.length}</span>}
            </button>

            <button 
              onClick={() => setShowAviationModal(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gold/15 hover:bg-gold/25 border border-gold/30 transition-all relative group"
              title="Aviationstack Live Radar"
            >
              <Plane className="w-4 h-4 text-gold" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-gold rounded-full" />
            </button>

            <button 
              onClick={triggerDemoFlightAlert}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all relative group"
              title="Test Flight Status Alert"
            >
              <Bell className="w-4 h-4 text-gold" />
              {toasts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center text-[8px] font-bold text-maroon animate-pulse">
                  {toasts.length}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Deals Floater */}
        <div className="bg-gold/90 backdrop-blur-sm py-1.5 overflow-hidden border-t border-white/10">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 whitespace-nowrap px-6"
          >
            {[...DEALS, ...DEALS].map((deal, i) => (
              <div key={i} className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-maroon" />
                <span className="text-[10px] font-bold text-maroon uppercase tracking-widest">{deal}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden flex flex-col min-h-0">
        {/* Dynamic Background Glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              opacity: [0.1, 0.15, 0.1],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[100px] transition-colors duration-1000 ${
              mood === 'excited' ? 'bg-gold/15' : mood === 'concerned' ? 'bg-cream' : 'bg-maroon/5'
            }`} 
          />
        </div>

        <div className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-4 flex flex-col gap-4 overflow-hidden">
          
          {/* Services Capsule Bar - Compact & Scrollable if needed */}
          <div className="flex justify-center gap-2 overflow-x-auto pb-2 no-scrollbar shrink-0">
            {SERVICES.map((service) => (
              <motion.button
                key={service.id}
                onClick={() => setActiveService(service.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`px-5 py-2 rounded-full border transition-all flex items-center gap-2 shrink-0 ${
                  activeService === service.id 
                    ? 'bg-maroon text-white border-maroon shadow-md shadow-maroon/20' 
                    : 'bg-white text-maroon border-gray-100 hover:border-gold shadow-sm'
                }`}
              >
                <service.icon className={`w-3.5 h-3.5 ${activeService === service.id ? 'text-gold' : 'text-maroon'}`} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{service.title}</span>
              </motion.button>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-0">
            {/* Left Column: Command & Intelligence */}
            <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
              {/* System Diagnostics */}
              <div className="p-4 bg-maroon/90 text-white rounded-[1.5rem] border border-white/10 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3 h-3 text-gold animate-pulse" />
                    <span className="text-[8px] font-bold uppercase tracking-widest">System Live</span>
                  </div>
                  <span className="text-[8px] font-mono text-gold/60">{new Date().toLocaleTimeString()}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[8px] text-white/40 uppercase">Gemini WS Link</span>
                      {isConnected && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-8 h-3 text-gold" viewBox="0 0 32 12" fill="none">
                        <motion.path
                          d="M 0,6 L 8,6 L 11,1 L 14,11 L 17,4 L 20,8 L 22,6 L 32,6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          animate={isConnected ? {
                            opacity: [0.4, 1, 0.4],
                            scaleY: [0.8, 1.2, 0.8]
                          } : { opacity: 0.2 }}
                          transition={isConnected ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : {}}
                        />
                      </svg>
                      <span className={`text-[9px] font-mono font-bold ${isConnected ? 'text-gold' : 'text-amber-400/80'}`}>
                        {isConnected ? 'LIVE' : 'STANDBY'}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[8px] text-white/40 uppercase">Mood Engine</span>
                    <span className="text-[10px] font-bold text-gold capitalize">{mood}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[8px] text-white/40 uppercase">Global Auth</span>
                    <span className="text-[10px] font-bold text-green-400">Verified</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] text-white/40 uppercase">Latency</span>
                    <span className="text-[10px] font-mono text-gold">14ms</span>
                  </div>
                </div>
              </div>

              {/* Live Intelligence Feed */}
              <div className="flex-1 p-4 bg-white/50 backdrop-blur-md rounded-[1.5rem] border border-gray-100 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 mb-4 text-maroon">
                  <Zap className="w-3 h-3" />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Intelligence Feed</span>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                  {[
                    { id: 1, label: "Empty Leg: G650 LHR > DXB", time: "2m ago", price: "$12.4k" },
                    { id: 2, label: "LVMH Private Reserve Open", time: "12m ago", price: "Invite Only" },
                    { id: 3, label: "Penthouse Suit NYC Avail", time: "18m ago", price: "$25k/nt" },
                    { id: 4, label: "Chauffeur Link: Paris Central", time: "25m ago", price: "Online" },
                    { id: 5, label: "Harvics Global Index: +2.4%", time: "1h ago", price: "Bullish" },
                  ].map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-white rounded-xl border border-gray-50 flex flex-col gap-1 shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-maroon truncate w-2/3">{item.label}</span>
                        <span className="text-[8px] text-gray-400 font-mono italic">{item.time}</span>
                      </div>
                      <div className="text-[9px] font-mono text-gold font-bold">{item.price}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Center Column: Global Map & Visualizer */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              {/* Main Interactive Stage */}
              <div className="flex-1 bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 relative group">
                <AnimatePresence mode="wait">
                  {groundingLinks.length > 0 ? (
                    <motion.div 
                      key="map-mode"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full"
                    >
                      {isLoaded ? (
                        <GoogleMap
                          mapContainerStyle={{ width: '100%', height: '100%' }}
                          center={mapCenter}
                          zoom={13}
                          options={{
                            disableDefaultUI: true,
                            styles: [
                              { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
                              { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }] }
                            ]
                          }}
                        >
                          <Marker
                            position={mapCenter}
                            icon={{
                              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                              fillColor: '#C3A35E',
                              fillOpacity: 1,
                              strokeWeight: 1.5,
                              strokeColor: '#3D1212',
                              scale: 1.6,
                              anchor: typeof google !== 'undefined' ? new google.maps.Point(12, 22) : undefined,
                            }}
                          />
                        </GoogleMap>
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                          <p className="text-[10px] text-gray-400">Initializing Satellite Link...</p>
                        </div>
                      )}
                      <div className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-gold/20">
                        <Navigation className="w-4 h-4 text-maroon" />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="aura-mode"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="relative w-48 h-48 rounded-full bg-white shadow-[0_0_80px_rgba(61,18,18,0.08)] border border-gold/20 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(61,18,18,0.05),transparent_70%)] animate-pulse" />
                        {isConnected ? (
                          <Visualizer data={voiceData} isThinking={isThinking} />
                        ) : (
                          <div className="text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                              <Sparkles className="w-8 h-8 text-gold" />
                            </div>
                            <button 
                              onClick={handleConnect}
                              className="px-6 py-2.5 bg-maroon text-gold rounded-full text-[9px] font-bold uppercase tracking-widest hover:bg-maroon/90 transition-all shadow-lg inline-flex items-center gap-2"
                            >
                              <Mic className="w-3.5 h-3.5" /> Start Voice
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mt-8 flex flex-col items-center gap-2">
                        <h2 className="text-xl font-display text-maroon tracking-tighter">HarvyX Concierge</h2>
                        <div className="flex gap-1">
                          {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-gold rounded-full opacity-40" />)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Floating Grounding Context */}
                {groundingLinks.length > 0 && (
                  <div className="absolute bottom-6 left-6 right-6 flex gap-2 overflow-x-auto no-scrollbar">
                    {groundingLinks.map((link, i) => (
                      <a key={i} href={link.uri} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 bg-white/95 backdrop-blur-md rounded-xl text-[9px] font-bold text-maroon shadow-lg border border-gold/10 whitespace-nowrap hover:scale-105 transition-transform">
                        <Globe className="w-3 h-3 text-gold" />
                        {link.title}
                      </a>
                    ))}
                    <button onClick={() => setGroundingLinks([])} className="p-2 bg-maroon text-white rounded-xl shadow-lg">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Integrated Response Unit */}
              <div className="h-24 bg-maroon/5 border border-maroon/10 rounded-[1.5rem] p-4 flex items-center justify-center">
                 <AnimatePresence mode="wait">
                    {aiResponse ? (
                      <motion.p 
                        key={aiResponse}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[13px] text-maroon/80 font-light italic text-center max-w-lg leading-relaxed"
                      >
                        "{aiResponse}"
                      </motion.p>
                    ) : (
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest animate-pulse">Type below or use voice</p>
                    )}
                 </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Execution Units */}
            <div className="lg:col-span-3 flex flex-col gap-4 overflow-hidden">
               {/* Context Tabs */}
               <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-2xl shrink-0">
                  <button onClick={() => setActiveTab('concierge')} className={`py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === 'concierge' ? 'bg-white text-maroon shadow-sm' : 'text-gray-400'}`}>Cockpit</button>
                  <button onClick={() => setActiveTab('comm')} className={`py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === 'comm' ? 'bg-white text-maroon shadow-sm' : 'text-gray-400'}`}>Secure Chat</button>
               </div>

               <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === 'concierge' ? (
                    <motion.div 
                      key="unit-booking" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="h-full flex flex-col gap-4"
                    >
                      {activeService === 'flights' ? (
                        <div className="p-4 bg-white border border-gold/20 rounded-[1.5rem] flex flex-col gap-3 shadow-sm shrink-0">
                          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                            <div className="flex items-center gap-2">
                              <Plane className="w-4 h-4 text-gold" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-maroon">
                                {flightProvider === 'skyscanner' ? 'Skyscanner Fares' : 'Duffel Live Offers'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setFlightProvider('duffel')}
                                className={`text-[7px] px-2 py-0.5 rounded-full font-bold uppercase ${flightProvider === 'duffel' ? 'bg-maroon text-gold' : 'bg-gold/10 text-maroon'}`}
                              >
                                Duffel
                              </button>
                              <button
                                onClick={() => setFlightProvider('skyscanner')}
                                className={`text-[7px] px-2 py-0.5 rounded-full font-bold uppercase ${flightProvider === 'skyscanner' ? 'bg-maroon text-gold' : 'bg-gold/10 text-maroon'}`}
                              >
                                Skyscanner
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-1.5">
                              <input 
                                placeholder={flightProvider === 'skyscanner' ? 'From (London/LHR)' : 'Dep (LHR)'} 
                                value={aviationDepIata} 
                                onChange={e => setAviationDepIata(flightProvider === 'duffel' ? e.target.value.toUpperCase() : e.target.value)} 
                                className="bg-gray-50 p-2 rounded-lg text-[10px] font-mono font-bold text-maroon outline-none" 
                              />
                              <input 
                                placeholder={flightProvider === 'skyscanner' ? 'To (Dubai/DXB)' : 'Arr (DXB)'} 
                                value={aviationArrIata} 
                                onChange={e => setAviationArrIata(flightProvider === 'duffel' ? e.target.value.toUpperCase() : e.target.value)} 
                                className="bg-gray-50 p-2 rounded-lg text-[10px] font-mono font-bold text-maroon outline-none" 
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <input
                                type="date"
                                value={duffelDate}
                                onChange={(e) => setDuffelDate(e.target.value)}
                                className="bg-gray-50 p-2 rounded-lg text-[10px] font-mono font-bold text-maroon outline-none"
                              />
                              <select
                                value={duffelCabin}
                                onChange={(e) => setDuffelCabin(e.target.value)}
                                className="bg-gray-50 p-2 rounded-lg text-[10px] font-bold text-maroon outline-none"
                              >
                                <option value="first">First</option>
                                <option value="business">Business</option>
                                <option value="premium_economy">Premium Eco</option>
                                <option value="economy">Economy</option>
                              </select>
                            </div>

                            <button 
                              onClick={() => (flightProvider === 'skyscanner' ? fetchSkyscannerFlights() : fetchDuffelOffers())} 
                              disabled={isDuffelLoading}
                              className="w-full py-2 bg-maroon text-gold rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-maroon/90 transition-all"
                            >
                              {isDuffelLoading ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                  <span>Querying {flightProvider === 'skyscanner' ? 'Skyscanner' : 'Duffel'}...</span>
                                </>
                              ) : (
                                <>
                                  <Search className="w-3 h-3 text-gold" />
                                  <span>Search {flightProvider === 'skyscanner' ? 'Skyscanner' : 'Duffel'} Fares</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="mt-1 flex flex-col gap-2 max-h-44 overflow-y-auto custom-scrollbar">
                            {duffelOffers.length === 0 && !isDuffelLoading && (
                              <p className="text-[9px] text-gray-400 text-center py-3 font-mono uppercase tracking-wider">No offers yet</p>
                            )}
                            {duffelOffers.map((fl) => (
                              <div 
                                key={fl.id} 
                                onClick={() => {
                                  setBookingData(p => ({
                                    ...p,
                                    from: fl.departure?.iata || aviationDepIata,
                                    to: fl.arrival?.iata || aviationArrIata,
                                    date: duffelDate,
                                  }));
                                  addToast({
                                    type: 'flight',
                                    title: `Offer Linked: ${fl.flight?.iata || 'Flight'}`,
                                    message: `${fl.airline?.name} · ${fl.price_formatted || formatMoney(fl.total_amount, fl.total_currency)} (${fl.departure?.iata} → ${fl.arrival?.iata}).`,
                                    details: {
                                      flightNumber: fl.flight?.iata,
                                      route: `${fl.departure?.iata} → ${fl.arrival?.iata}`,
                                      status: (fl.cabin_class || duffelCabin).toUpperCase(),
                                      amount: fl.price_formatted || formatMoney(fl.total_amount, fl.total_currency),
                                    }
                                  });
                                  if (fl.booking_url) {
                                    window.open(fl.booking_url, '_blank', 'noopener,noreferrer');
                                  }
                                }}
                                className="p-2.5 text-white rounded-xl border border-gold/20 flex flex-col gap-1 cursor-pointer hover:border-gold transition-all"
                                style={{ background: '#2A0C0C' }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-bold text-gold font-mono">{fl.airline?.name || fl.flight?.iata || '—'}</span>
                                  <span className="text-[8px] font-bold text-cream font-mono">
                                    {fl.price_formatted || formatMoney(fl.total_amount, fl.total_currency)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[9px] text-white/90">
                                  <span className="font-semibold truncate pr-2">{fl.flight?.iata || 'Flight'}</span>
                                  <span className="font-mono shrink-0">{fl.departure?.iata} → {fl.arrival?.iata}</span>
                                </div>
                                <div className="text-[8px] text-gray-400 font-mono flex items-center gap-2">
                                  <span>{formatClock(fl.departure?.scheduled)}–{formatClock(fl.arrival?.scheduled)}</span>
                                  {fl.duration_minutes != null
                                    ? <span>{Math.floor(fl.duration_minutes / 60)}h {fl.duration_minutes % 60}m</span>
                                    : fl.duration ? <span>{formatIsoDuration(fl.duration)}</span> : null}
                                  <span>{(fl.stops ?? 0) === 0 ? 'Nonstop' : `${fl.stops} stop`}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : activeService === 'hotels' ? (
                        <div className="p-4 bg-white border border-gold/20 rounded-[1.5rem] flex flex-col gap-3 shadow-sm shrink-0">
                          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                            <div className="flex items-center gap-2">
                              <Hotel className="w-4 h-4 text-gold" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-maroon">Booking.com Live</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setBookingTab('stays')}
                                className={`text-[7px] px-2 py-0.5 rounded-full font-bold uppercase ${bookingTab === 'stays' ? 'bg-maroon text-gold' : 'bg-gold/10 text-maroon'}`}
                              >
                                Stays
                              </button>
                              <button
                                onClick={() => setBookingTab('attractions')}
                                className={`text-[7px] px-2 py-0.5 rounded-full font-bold uppercase ${bookingTab === 'attractions' ? 'bg-maroon text-gold' : 'bg-gold/10 text-maroon'}`}
                              >
                                Experiences
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <input
                              placeholder="City (Dubai, Paris…)"
                              value={hotelQuery}
                              onChange={(e) => setHotelQuery(e.target.value)}
                              className="w-full bg-gray-50 p-2 rounded-lg text-[10px] font-bold text-maroon outline-none"
                            />
                            {bookingTab === 'stays' && (
                              <div className="grid grid-cols-2 gap-1.5">
                                <input
                                  type="date"
                                  value={hotelCheckIn}
                                  onChange={(e) => setHotelCheckIn(e.target.value)}
                                  className="bg-gray-50 p-2 rounded-lg text-[10px] font-mono font-bold text-maroon outline-none"
                                />
                                <input
                                  type="date"
                                  value={hotelCheckOut}
                                  onChange={(e) => setHotelCheckOut(e.target.value)}
                                  className="bg-gray-50 p-2 rounded-lg text-[10px] font-mono font-bold text-maroon outline-none"
                                />
                              </div>
                            )}
                            <button
                              onClick={() => (bookingTab === 'stays' ? fetchBookingHotels() : fetchBookingAttractions())}
                              disabled={isBookingLoading}
                              className="w-full py-2 bg-maroon text-gold rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-maroon/90 transition-all"
                            >
                              {isBookingLoading ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                  <span>Querying Booking.com...</span>
                                </>
                              ) : (
                                <>
                                  <Search className="w-3 h-3 text-gold" />
                                  <span>{bookingTab === 'stays' ? 'Search Stays' : 'Search Experiences'}</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="mt-1 flex flex-col gap-2 max-h-44 overflow-y-auto custom-scrollbar">
                            {bookingTab === 'stays' ? (
                              <>
                                {bookingHotels.length === 0 && !isBookingLoading && (
                                  <p className="text-[9px] text-gray-400 text-center py-3 font-mono uppercase tracking-wider">No stays yet</p>
                                )}
                                {bookingHotels.map((h) => (
                                  <div
                                    key={h.hotel_id}
                                    onClick={() => {
                                      addToast({
                                        type: 'booking',
                                        title: `Suite Linked: ${h.name}`,
                                        message: `${hotelQuery} · ${formatMoney(String(h.price_amount ?? ''), h.price_currency)} · ${h.review_word || 'Rated'} ${h.review_score ?? ''}`.trim(),
                                        details: {
                                          reference: h.hotel_id,
                                          amount: formatMoney(String(h.price_amount ?? ''), h.price_currency),
                                          status: h.review_word || 'Hold',
                                          route: hotelQuery,
                                        },
                                      });
                                    }}
                                    className="p-2.5 text-white rounded-xl border border-gold/20 flex gap-2 cursor-pointer hover:border-gold transition-all"
                                    style={{ background: '#2A0C0C' }}
                                  >
                                    {h.photo && (
                                      <img src={h.photo} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gold/20" />
                                    )}
                                    <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="text-[10px] font-bold text-gold truncate">{h.name}</span>
                                        <span className="text-[8px] font-mono shrink-0">{formatMoney(String(h.price_amount ?? ''), h.price_currency)}</span>
                                      </div>
                                      <div className="text-[8px] text-white/70 font-mono">
                                        {h.review_score != null ? `${h.review_score} ${h.review_word || ''}` : 'Unrated'}
                                        {h.stars ? ` · ${h.stars}★` : ''}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <>
                                {bookingAttractions.length === 0 && !isBookingLoading && (
                                  <p className="text-[9px] text-gray-400 text-center py-3 font-mono uppercase tracking-wider">No experiences yet</p>
                                )}
                                {bookingAttractions.map((a) => (
                                  <div
                                    key={a.id}
                                    onClick={() => {
                                      addToast({
                                        type: 'booking',
                                        title: `Experience: ${a.name}`,
                                        message: a.short_description || `${a.city || hotelQuery} · ${formatMoney(String(a.price_amount ?? ''), a.price_currency)}`,
                                        details: {
                                          reference: a.slug || a.id,
                                          amount: formatMoney(String(a.price_amount ?? ''), a.price_currency),
                                          status: a.cancellation || 'Available',
                                          route: a.city || hotelQuery,
                                        },
                                      });
                                    }}
                                    className="p-2.5 text-white rounded-xl border border-gold/20 flex flex-col gap-1 cursor-pointer hover:border-gold transition-all"
                                    style={{ background: '#2A0C0C' }}
                                  >
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[10px] font-bold text-gold truncate">{a.name}</span>
                                      <span className="text-[8px] font-mono shrink-0">{formatMoney(String(a.price_amount ?? ''), a.price_currency)}</span>
                                    </div>
                                    <div className="text-[8px] text-white/70 line-clamp-2">{a.short_description || a.city}</div>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      ) : activeService === 'cars' ? (
                        <div className="p-4 bg-white border border-gold/20 rounded-[1.5rem] flex flex-col gap-3 shadow-sm shrink-0">
                          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-gold" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-maroon">Expedia Fleet</span>
                            </div>
                            <span className={`text-[7px] px-2 py-0.5 rounded-full font-bold uppercase ${carsSource === 'expedia' ? 'bg-gold/15 text-maroon' : 'bg-amber-100 text-amber-800'}`}>
                              {carsSource === 'expedia' ? 'Live' : 'Curated'}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <select
                              value={bookingData.carType}
                              onChange={(e) => setBookingData((p) => ({ ...p, carType: e.target.value }))}
                              className="w-full bg-gray-50 p-2 rounded-lg text-[10px] font-bold text-maroon outline-none"
                            >
                              <option>Supercar</option>
                              <option>Sedan</option>
                              <option>SUV</option>
                            </select>
                            <input
                              placeholder="Pickup city (London, Dubai, Paris…)"
                              value={bookingData.pickup}
                              onChange={(e) => setBookingData((p) => ({ ...p, pickup: e.target.value }))}
                              className="w-full bg-gray-50 p-2 rounded-lg text-[10px] font-bold text-maroon outline-none"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="date"
                                value={carPickUpDate}
                                onChange={(e) => setCarPickUpDate(e.target.value)}
                                className="w-full bg-gray-50 p-2 rounded-lg text-[10px] font-mono text-maroon outline-none"
                              />
                              <input
                                type="date"
                                value={carDropOffDate}
                                onChange={(e) => setCarDropOffDate(e.target.value)}
                                className="w-full bg-gray-50 p-2 rounded-lg text-[10px] font-mono text-maroon outline-none"
                              />
                            </div>
                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                              {['London', 'Dubai', 'Paris', 'New York', 'Milan'].map((city) => (
                                <button
                                  key={city}
                                  onClick={() => {
                                    setBookingData((p) => ({ ...p, pickup: city }));
                                    void fetchCars(city);
                                  }}
                                  className="px-1.5 py-0.5 bg-gold/10 hover:bg-gold/20 border border-gold/20 rounded text-[7px] font-mono font-bold text-maroon shrink-0"
                                >
                                  {city}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={handleCarSearch}
                              disabled={isCarsLoading}
                              className="w-full py-2 bg-maroon text-gold rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-maroon/90 transition-all"
                            >
                              {isCarsLoading ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                  <span>Querying Expedia...</span>
                                </>
                              ) : (
                                <>
                                  <Search className="w-3 h-3 text-gold" />
                                  <span>Find Vehicles</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="mt-1 flex flex-col gap-2 max-h-52 overflow-y-auto custom-scrollbar">
                            {carOffers.length === 0 && !isCarsLoading && (
                              <p className="text-[9px] text-gray-400 text-center py-3 font-mono uppercase tracking-wider">No fleet yet</p>
                            )}
                            {carOffers.map((c) => (
                              <div
                                key={c.id}
                                onClick={() => {
                                  addToast({
                                    type: 'booking',
                                    title: `Vehicle Linked: ${c.name}`,
                                    message: `${c.location || bookingData.pickup} · ${c.vendor || 'Partner'} · ${c.price_per_day || c.price_total || '—'}`,
                                    details: {
                                      reference: c.id.slice(0, 18),
                                      route: c.location || bookingData.pickup,
                                      status: c.free_cancellation ? 'Free cancel' : c.category || 'Reserved',
                                      amount: c.price_total || c.price_per_day,
                                    },
                                  });
                                  if (c.url) window.open(c.url, '_blank', 'noopener,noreferrer');
                                }}
                                className="p-2.5 text-white rounded-xl border border-gold/20 flex gap-2 cursor-pointer hover:border-gold transition-all"
                                style={{ background: '#2A0C0C' }}
                              >
                                {c.image ? (
                                  <img src={c.image} alt="" className="w-12 h-10 rounded-lg object-contain shrink-0 bg-white/5 border border-gold/20" />
                                ) : (
                                  <div className="w-12 h-10 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                                    <Car className="w-4 h-4 text-gold" />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <div className="text-[9px] font-bold text-gold truncate">{c.name}</div>
                                  <div className="text-[7px] text-white/60 truncate uppercase tracking-wider">
                                    {c.vendor} · {c.category}
                                  </div>
                                  <div className="text-[8px] text-white/80 mt-0.5">
                                    {c.price_per_day || c.price_total || 'Rate on request'}
                                    {c.price_total && c.price_per_day ? ` · total ${c.price_total}` : ''}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : activeService === 'dining' ? (
                        <div className="p-4 bg-white border border-gold/20 rounded-[1.5rem] flex flex-col gap-3 shadow-sm shrink-0">
                          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                            <div className="flex items-center gap-2">
                              <Utensils className="w-4 h-4 text-gold" />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-maroon">TripAdvisor Dining</span>
                            </div>
                            <span className={`text-[7px] px-2 py-0.5 rounded-full font-bold uppercase ${diningSource === 'tripadvisor' ? 'bg-gold/15 text-maroon' : 'bg-amber-100 text-amber-800'}`}>
                              {diningSource === 'tripadvisor' ? 'Live' : 'Curated'}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <input
                              placeholder="City (Dubai, Paris…)"
                              value={diningQuery}
                              onChange={(e) => setDiningQuery(e.target.value)}
                              className="w-full bg-gray-50 p-2 rounded-lg text-[10px] font-bold text-maroon outline-none"
                            />
                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                              {['Dubai', 'Paris', 'London', 'Milan', 'Tokyo'].map((city) => (
                                <button
                                  key={city}
                                  onClick={() => {
                                    setDiningQuery(city);
                                    void fetchTripadvisorRestaurants(city);
                                  }}
                                  className="px-1.5 py-0.5 bg-gold/10 hover:bg-gold/20 border border-gold/20 rounded text-[7px] font-mono font-bold text-maroon shrink-0"
                                >
                                  {city}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => fetchTripadvisorRestaurants()}
                              disabled={isDiningLoading}
                              className="w-full py-2 bg-maroon text-gold rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-maroon/90 transition-all"
                            >
                              {isDiningLoading ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                                  <span>Querying TripAdvisor...</span>
                                </>
                              ) : (
                                <>
                                  <Search className="w-3 h-3 text-gold" />
                                  <span>Find Tables</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="mt-1 flex flex-col gap-2 max-h-44 overflow-y-auto custom-scrollbar">
                            {diningRestaurants.length === 0 && !isDiningLoading && (
                              <p className="text-[9px] text-gray-400 text-center py-3 font-mono uppercase tracking-wider">No tables yet</p>
                            )}
                            {diningRestaurants.map((r) => (
                              <div
                                key={r.id}
                                onClick={() => {
                                  addToast({
                                    type: 'booking',
                                    title: `Table Linked: ${r.name}`,
                                    message: `${r.location || diningQuery} · ${r.rating ?? '—'}★ · ${r.price_tag || 'Fine dining'}${r.cuisines?.length ? ` · ${r.cuisines.slice(0, 2).join(', ')}` : ''}`,
                                    details: {
                                      reference: r.id,
                                      route: r.location || diningQuery,
                                      status: r.open_status || 'Preferred',
                                      amount: r.price_tag,
                                    },
                                  });
                                }}
                                className="p-2.5 text-white rounded-xl border border-gold/20 flex gap-2 cursor-pointer hover:border-gold transition-all"
                                style={{ background: '#2A0C0C' }}
                              >
                                {r.photo && (
                                  <img src={r.photo} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gold/20" />
                                )}
                                <div className="min-w-0 flex-1 flex flex-col gap-0.5">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-bold text-gold truncate">{r.name}</span>
                                    <span className="text-[8px] font-mono shrink-0">{r.price_tag || '$$$$'}</span>
                                  </div>
                                  <div className="text-[8px] text-white/70 font-mono">
                                    {r.rating != null ? `${r.rating}★` : '—'}
                                    {r.review_count != null ? ` · ${r.review_count} reviews` : ''}
                                    {r.cuisines?.length ? ` · ${r.cuisines.slice(0, 2).join(', ')}` : ''}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1 bg-gray-50/50 rounded-[1.5rem] border border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center">
                          <Compass className="w-8 h-8 text-gray-200 mb-4" />
                          <p className="text-[9px] uppercase tracking-widest text-gray-400 font-bold leading-relaxed">Select Service Capsule<br/>to Initialize Module</p>
                        </div>
                      )}
                      
                      {/* Quick Actions Bento */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setActiveService('hotels');
                            void fetchBookingHotels();
                          }}
                          className="p-3 bg-gold/10 border border-gold/20 rounded-2xl flex flex-col items-center gap-1.5 group hover:bg-gold/20 transition-all"
                        >
                          <Hotel className="w-4 h-4 text-maroon" />
                          <span className="text-[8px] font-bold uppercase text-maroon">Hotels</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveService('hotels');
                            setBookingTab('attractions');
                            void fetchBookingAttractions();
                          }}
                          className="p-3 bg-maroon/5 border border-maroon/10 rounded-2xl flex flex-col items-center gap-1.5 group hover:bg-maroon/10 transition-all"
                        >
                          <Ticket className="w-4 h-4 text-maroon" />
                          <span className="text-[8px] font-bold uppercase text-maroon">Experiences</span>
                        </button>
                      </div>

                      {/* Toast Simulator Quick Triggers */}
                      <div className="text-white p-3 rounded-2xl border border-gold/20 flex flex-col gap-2 shrink-0" style={{ background: '#2A0C0C' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold uppercase tracking-widest text-gold flex items-center gap-1">
                            <Bell className="w-3 h-3 text-gold animate-bounce" /> Live Alerts Engine
                          </span>
                          <span className="text-[7px] text-white/50 font-mono">Framer Motion</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button 
                            onClick={triggerDemoFlightAlert}
                            className="py-1.5 px-2 bg-gold/15 hover:bg-gold/25 border border-gold/30 rounded-xl text-[8px] font-bold text-gold transition-all flex items-center justify-center gap-1 truncate"
                          >
                            <Plane className="w-2.5 h-2.5 shrink-0" /> Flight Status
                          </button>
                          <button 
                            onClick={triggerDemoBookingConfirmation}
                            className="py-1.5 px-2 bg-gold/20 hover:bg-gold/30 border border-gold/30 rounded-xl text-[8px] font-bold text-gold transition-all flex items-center justify-center gap-1 truncate"
                          >
                            <Ticket className="w-2.5 h-2.5 shrink-0" /> Booking Pass
                          </button>
                        </div>
                      </div>

                      {/* Weather Forecast */}
                      <div className="p-4 bg-white border border-gold/20 rounded-[1.5rem] flex flex-col gap-3 shadow-sm shrink-0">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                          <div className="flex items-center gap-2">
                            <CloudSun className="w-4 h-4 text-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-maroon">Destination Weather</span>
                          </div>
                          {weatherCity ? (
                            <span className="text-[8px] bg-gold/15 text-maroon px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              {weatherCity}
                            </span>
                          ) : (
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Live</span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex gap-1.5">
                            <input
                              placeholder="City (London, Dubai…)"
                              value={weatherQuery}
                              onChange={(e) => setWeatherQuery(e.target.value)}
                              className="flex-1 bg-gray-50 p-2 rounded-lg text-[10px] font-bold text-maroon outline-none"
                            />
                            <button
                              onClick={() => fetchWeatherForecast()}
                              disabled={isWeatherLoading}
                              className="px-3 py-2 bg-maroon text-gold rounded-lg text-[8px] font-bold uppercase tracking-widest"
                            >
                              {isWeatherLoading ? '…' : 'Go'}
                            </button>
                          </div>
                          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                            {['London', 'Dubai', 'Paris', 'Milan', 'Tokyo'].map((city) => (
                              <button
                                key={city}
                                onClick={() => {
                                  setWeatherQuery(city);
                                  void fetchWeatherForecast(city);
                                }}
                                className="px-1.5 py-0.5 bg-gold/10 hover:bg-gold/20 border border-gold/20 rounded text-[7px] font-mono font-bold text-maroon shrink-0"
                              >
                                {city}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                          {weatherForecast.length === 0 && !isWeatherLoading && (
                            <p className="text-[9px] text-gray-400 text-center py-2 font-mono uppercase tracking-wider">No forecast yet</p>
                          )}
                          {weatherForecast.map((w, idx) => (
                            <div
                              key={`${w.at || idx}`}
                              className="p-2 rounded-xl border border-gold/15 flex items-center gap-2"
                              style={{ background: '#2A0C0C' }}
                            >
                              {w.icon && <img src={w.icon} alt="" className="w-8 h-8 shrink-0" />}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[9px] font-bold text-gold truncate">{w.description || w.condition || '—'}</span>
                                  <span className="text-[10px] font-mono text-cream shrink-0">{w.temp ?? '—'}{w.unit || '°C'}</span>
                                </div>
                                <div className="text-[7px] text-white/60 font-mono truncate">
                                  {w.at ? w.at.replace('T', ' ').slice(0, 16) : 'Upcoming'}
                                  {w.humidity != null ? ` · ${w.humidity}% hum` : ''}
                                  {w.wind_speed != null ? ` · ${w.wind_speed} m/s` : ''}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Currency Converter Tool */}
                      <div className="p-4 bg-white border border-gold/20 rounded-[1.5rem] flex flex-col gap-3 shadow-sm shrink-0">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4 text-gold" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-maroon">FX Converter</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`text-[7px] px-2 py-0.5 rounded-full font-bold uppercase ${fxSource.startsWith('live') ? 'bg-gold/15 text-maroon' : 'bg-amber-100 text-amber-800'}`}>
                              {isFxLoading ? 'Updating…' : fxSource === 'live' ? 'Live' : fxSource === 'live_cache' ? 'Cached' : 'Static'}
                            </span>
                            <button
                              onClick={() => fetchLiveFxRates()}
                              disabled={isFxLoading}
                              className="text-[7px] px-2 py-0.5 rounded-full font-bold uppercase bg-maroon text-gold"
                            >
                              Refresh
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 items-center">
                          {/* From Amount & Currency */}
                          <div className="bg-gray-50 p-2.5 rounded-xl flex flex-col gap-1">
                            <span className="text-[8px] text-gray-400 uppercase font-semibold">From</span>
                            <div className="flex items-center gap-1">
                              <input 
                                type="number"
                                value={convAmount || ''}
                                onChange={(e) => setConvAmount(Number(e.target.value))}
                                className="w-full bg-transparent text-xs font-bold text-maroon outline-none font-mono"
                                placeholder="Amount"
                              />
                              <select 
                                value={baseCurrency}
                                onChange={(e) => setBaseCurrency(e.target.value)}
                                className="bg-white border border-gray-200 text-[9px] font-bold text-maroon rounded-md px-1 py-0.5 outline-none cursor-pointer"
                              >
                                {Object.keys(SUPPORTED_CURRENCIES).map(code => (
                                  <option key={code} value={code}>{code}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Converted To Result */}
                          <div className="bg-maroon/5 border border-maroon/10 p-2.5 rounded-xl flex flex-col gap-1">
                            <span className="text-[8px] text-maroon/60 uppercase font-semibold">Converted</span>
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-maroon font-mono truncate">
                                {SUPPORTED_CURRENCIES[targetCurrency]?.symbol}
                                {((convAmount / (getFxRateToUsd(baseCurrency) || 1)) * (getFxRateToUsd(targetCurrency) || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <select 
                                value={targetCurrency}
                                onChange={(e) => {
                                  setTargetCurrency(e.target.value);
                                  setDetectedDestination(null);
                                }}
                                className="bg-white border border-gray-200 text-[9px] font-bold text-maroon rounded-md px-1 py-0.5 outline-none cursor-pointer"
                              >
                                {Object.keys(SUPPORTED_CURRENCIES).map(code => (
                                  <option key={code} value={code}>{code}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[8px] text-gray-400 font-mono px-1">
                          <span>1 {baseCurrency} = {((getFxRateToUsd(targetCurrency) || 1) / (getFxRateToUsd(baseCurrency) || 1)).toFixed(4)} {targetCurrency}</span>
                          <button 
                            onClick={() => {
                              const temp = baseCurrency;
                              setBaseCurrency(targetCurrency);
                              setTargetCurrency(temp);
                            }}
                            className="flex items-center gap-1 text-gold hover:text-maroon font-sans font-bold uppercase transition-colors"
                          >
                            <ArrowLeftRight className="w-2.5 h-2.5" /> Swap
                          </button>
                        </div>
                        {detectedDestination && (
                          <div className="text-[8px] text-maroon/70 font-bold uppercase tracking-wider px-1 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-gold" /> Auto: {detectedDestination} → {targetCurrency}
                            {fxUpdatedAt ? ` · ${fxUpdatedAt}` : ''}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="unit-journal" 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="h-full bg-white rounded-[1.5rem] border border-gray-100 flex flex-col overflow-hidden"
                    >
                      <div className="p-3 border-b border-gray-50 flex items-center justify-between shrink-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-maroon">Secure Chat</span>
                        <Keyboard className="w-3 h-3 text-gold" />
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar min-h-0">
                        {chatMessages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-8">
                            <MessageSquare className="w-8 h-8 mb-3" />
                            <span className="text-[9px] font-bold uppercase">Type a message below</span>
                          </div>
                        ) : (
                          chatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`max-w-[92%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${
                                msg.role === 'user' || msg.role === 'voice'
                                  ? 'ml-auto bg-maroon text-white rounded-br-sm'
                                  : msg.role === 'system'
                                  ? 'mx-auto bg-gold/15 border border-gold/30 text-maroon text-center'
                                  : 'mr-auto bg-cream border border-gold/20 text-maroon rounded-bl-sm'
                              }`}
                            >
                              {msg.source === 'voice' && (
                                <span className="text-[7px] uppercase tracking-wider text-gold/80 block mb-0.5">
                                  {msg.role === 'assistant' ? 'Voice reply' : 'Spoken'}
                                </span>
                              )}
                              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                              <span className={`text-[7px] mt-1 block ${msg.role === 'user' || msg.role === 'voice' ? 'text-gold/70' : 'text-muted'}`}>
                                {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        )}
                        {isThinking && (
                          <div className="mr-auto bg-cream border border-gold/20 rounded-xl px-3 py-2 text-[10px] text-maroon/70 italic">
                            HarvyX is typing…
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="p-2 border-t border-gold/15 bg-cream/50 shrink-0">
                        <div className="flex items-end gap-1.5">
                          <textarea
                            ref={commInputRef}
                            value={commInput}
                            onChange={(e) => setCommInput(e.target.value)}
                            onKeyDown={handleCommKeyDown}
                            rows={2}
                            placeholder="Write to HarvyX…"
                            className="flex-1 resize-none bg-white border border-gold/25 rounded-xl px-3 py-2 text-[11px] text-maroon placeholder:text-gray-400 outline-none focus:border-gold min-h-[2.5rem] max-h-24"
                          />
                          <button
                            onClick={handleCommSend}
                            disabled={!commInput.trim()}
                            className="shrink-0 w-9 h-9 rounded-xl bg-maroon text-gold flex items-center justify-center hover:bg-maroon/90 transition-all disabled:opacity-40"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[8px] text-muted mt-1 px-1">Enter to send · Shift+Enter for new line</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
               </div>
            </div>
          </div>

        </div>
      </main>

      {/* Engagement layer: intents, quick replies, profile, docs, handoff, HPay, trip, dark, analytics */}
      <div className="shrink-0 border-t border-gold/15 bg-cream/90 px-4 py-2 space-y-1.5 relative z-30">
        <div className="max-w-6xl mx-auto space-y-1.5">
          <EngagementPanel
            darkMode={darkMode}
            onToggleDark={() => {
              const next = !darkMode;
              setDarkMode(next);
              saveDarkMode(next);
              trackEvent('dark_mode_toggle', { on: next });
            }}
            profile={travelerProfile}
            onSaveProfile={(p) => {
              setTravelerProfile(p);
              saveProfile(p);
            }}
            culture={cultureMemory}
            onSaveCulture={(c) => {
              setCultureMemory(c);
              saveCulture(c);
            }}
            itinerary={itinerary}
            onAddItinerary={(item) => {
              setItinerary((prev) => [...prev, { ...item, id: uid('trip') }]);
              trackEvent('itinerary_add', { type: item.type });
            }}
            onClearItinerary={() => {
              setItinerary([]);
              trackEvent('itinerary_clear');
            }}
            draftPending={draftPending}
            isConnected={isConnected}
            onIntent={(prompt, intentId) => {
              setActiveTab('comm');
              if (intentId === 'flight') setActiveService('flights');
              if (intentId === 'hotel') {
                setActiveService('hotels');
                void fetchBookingHotels();
              }
              if (intentId === 'chauffeur') setActiveService('taxi');
              if (intentId === 'dining') {
                setActiveService('dining');
                void fetchTripadvisorRestaurants();
              }
              if (intentId === 'cars') {
                setActiveService('cars');
                void fetchCars(bookingData.pickup || 'London', bookingData.carType);
              }
              sendToAura(prompt, { source: 'intent' });
            }}
            onQuickReply={(text) => {
              setActiveTab('comm');
              sendToAura(text, { source: 'quick' });
            }}
            onDocumentText={(name, text) => {
              setActiveTab('comm');
              sendToAura(`Document: ${name}\n\n${text}`, { source: 'upload' });
              addToast({
                type: 'info',
                title: 'Document received',
                message: `${name} added to the concierge thread.`,
              });
            }}
            onHandoff={(reason) => {
              const packet = [
                'HUMAN HANDOFF REQUEST',
                `Guest: ${travelerProfile.displayName}`,
                `Email: ${travelerProfile.email || 'n/a'}`,
                `Reason: ${reason}`,
                `Connected: ${isConnected ? 'yes' : 'no'}`,
                `Recent chat:`,
                ...chatMessages.slice(-6).map((m) => `- ${m.role}: ${m.text.slice(0, 120)}`),
              ].join('\n');
              setChatMessages((prev) => [
                ...prev,
                {
                  id: uid('msg'),
                  role: 'system',
                  text: 'Live concierge handoff requested. A human desk package was prepared from your profile + recent chat.',
                  ts: Date.now(),
                },
              ]);
              sendToAura(`Please acknowledge human handoff and summarize next steps for the desk.\n\n${packet}`, { source: 'quick' });
              addToast({
                type: 'alert',
                title: 'Human handoff queued',
                message: 'Your request was packaged for live Harvics concierge follow-up.',
              });
            }}
            onHPayHold={() => {
              trackEvent('hpay_hold_click');
              setChatMessages((prev) => [
                ...prev,
                {
                  id: uid('msg'),
                  role: 'system',
                  text: 'Opening HPay hold flow — escrow / payment hold for the current booking.',
                  ts: Date.now(),
                },
              ]);
              addToast({
                type: 'booking',
                title: 'HPay hold',
                message: 'Redirecting to Harvics HPay for payment hold.',
                details: { reference: 'HPAY-HOLD', amount: 'Pending' },
              });
              window.open('http://localhost:3333/en/apps/hpay', '_blank', 'noopener,noreferrer');
            }}
          />
        </div>
      </div>

      {/* Global keyboard compose bar */}
      <div className="shrink-0 border-t border-gold/20 bg-white/95 backdrop-blur-sm relative z-30">
        <div className="max-w-6xl mx-auto px-4 py-2.5">
          <div className="flex items-end gap-2">
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 shrink-0 mb-0.5">
              <Keyboard className="w-4 h-4 text-gold" />
            </div>
            <textarea
              value={commInput}
              onChange={(e) => setCommInput(e.target.value)}
              onKeyDown={handleCommKeyDown}
              rows={1}
              placeholder={isConnected ? 'Message HarvyX Concierge…' : 'Type here — connect mic to send live'}
              className="flex-1 resize-none bg-cream border border-gold/25 rounded-xl px-3 py-2.5 text-sm text-maroon placeholder:text-gray-400 outline-none focus:border-gold min-h-[2.75rem] max-h-28"
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
              }}
            />
            <button
              onClick={handleCommSend}
              disabled={!commInput.trim()}
              className="shrink-0 h-11 px-4 rounded-xl bg-maroon text-gold font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:bg-maroon/90 transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
            {!isConnected && (
              <button
                onClick={handleConnect}
                className="shrink-0 h-11 w-11 rounded-xl bg-gold text-maroon flex items-center justify-center hover:bg-gold/90 transition-all"
                title="Connect voice session"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[9px] text-muted mt-1.5 px-1 hidden sm:block">
            Enter to send · Shift+Enter for new line · {isConnected ? 'Live session active' : 'Tap mic to connect, then type or speak'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-maroon text-white/60 py-4 border-t border-white/10 relative z-20 shrink-0">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white">HarvyX Concierge</span>
          </div>
          
          {isConnected && (
            <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-full border border-white/10">
              <button 
                onClick={toggleMute}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-gold text-maroon hover:bg-white'}`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <div className="px-3 hidden sm:block">
                <p className="text-[8px] uppercase tracking-widest text-white/40 leading-none mb-1">Session</p>
                <p className="text-[10px] font-semibold text-white leading-none">Active Link</p>
              </div>
              <button 
                onClick={handleConnect}
                className="px-5 py-2.5 bg-white/10 hover:bg-red-500 hover:text-white rounded-full text-[9px] font-bold uppercase tracking-widest transition-all"
              >
                End
              </button>
            </div>
          )}

          <div className="text-[9px] uppercase tracking-widest hidden sm:block">
            © 2026 Harvics Global
          </div>
        </div>
      </footer>

      {/* Concierge Journal Panel */}
      <AnimatePresence>
        {isJournalOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col border-l border-gray-100"
          >
            <div className="p-8 bg-maroon text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-display">Concierge Journal</h2>
                <p className="text-[10px] uppercase tracking-widest mt-1 text-gold">History</p>
              </div>
              <button onClick={() => setIsJournalOpen(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {journal.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-10">
                  <History className="w-12 h-12 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">No entries yet</p>
                </div>
              ) : (
                journal.map((entry, i) => (
                  <div key={i} className="relative pl-8 border-l border-gray-100">
                    <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-gold" />
                    <div className="flex items-center gap-2 text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-3">
                      {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <span className="w-1 h-1 bg-gray-200 rounded-full" />
                      {entry.type}
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <p className={`text-sm leading-relaxed flex-1 ${entry.type === 'tip' ? 'text-maroon font-medium italic' : 'text-gray-600'}`}>
                        {entry.content}
                      </p>
                      {(entry.type === 'file' || entry.type === 'audio') && (
                        <button className="p-2 rounded-full bg-gray-50 text-maroon hover:bg-gold/20 transition-all">
                          <Download className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duffel Live Offers Modal */}
      <AnimatePresence>
        {showAviationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-12 px-2 pb-3 overflow-y-auto backdrop-blur-sm"
            style={{ background: 'rgba(61, 18, 18, 0.65)' }}
            onClick={() => setShowAviationModal(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ type: 'tween', duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="border border-gold/20 rounded-lg max-w-xs w-full text-white overflow-hidden shadow-sm flex flex-col max-h-[42vh]"
              style={{ background: '#2A0C0C' }}
            >
              <div className="px-3 py-2 border-b border-gold/15 flex items-center justify-between shrink-0" style={{ background: '#3D1212' }}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg border border-gold/25 flex items-center justify-center shrink-0" style={{ background: 'rgba(195, 163, 94, 0.12)' }}>
                    <Plane className="w-3 h-3 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <h2 className="text-[11px] font-display tracking-tight text-white">Duffel Offers</h2>
                      <span className="text-[7px] border border-gold/25 text-gold px-1 py-px rounded-full font-mono font-bold uppercase" style={{ background: 'rgba(195, 163, 94, 0.1)' }}>
                        Live
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowAviationModal(false)}
                  className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              <div className="px-3 py-2 border-b border-gold/10 flex flex-col gap-1.5 shrink-0" style={{ background: 'rgba(61, 18, 18, 0.5)' }}>
                <div className="grid grid-cols-4 gap-1">
                  <input
                    placeholder="From"
                    value={aviationDepIata}
                    onChange={(e) => setAviationDepIata(e.target.value.toUpperCase())}
                    className="border border-gold/20 px-1.5 py-1 rounded-md text-[9px] font-mono font-bold text-gold outline-none uppercase placeholder:text-gray-500 focus:border-gold"
                    style={{ background: '#3D1212' }}
                  />
                  <input
                    placeholder="To"
                    value={aviationArrIata}
                    onChange={(e) => setAviationArrIata(e.target.value.toUpperCase())}
                    className="border border-gold/20 px-1.5 py-1 rounded-md text-[9px] font-mono font-bold text-gold outline-none uppercase placeholder:text-gray-500 focus:border-gold"
                    style={{ background: '#3D1212' }}
                  />
                  <input
                    type="date"
                    value={duffelDate}
                    onChange={(e) => setDuffelDate(e.target.value)}
                    className="border border-gold/20 px-1 py-1 rounded-md text-[8px] font-mono font-bold text-gold outline-none focus:border-gold"
                    style={{ background: '#3D1212' }}
                  />
                  <button
                    onClick={() => fetchDuffelOffers()}
                    disabled={isDuffelLoading}
                    className="text-gold font-bold rounded-md text-[8px] uppercase py-1 flex items-center justify-center transition-all border border-gold/20 hover:opacity-90"
                    style={{ background: '#3D1212' }}
                  >
                    {isDuffelLoading ? (
                      <div className="w-2.5 h-2.5 border border-gold border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-2.5 h-2.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {[
                    { dep: 'LHR', arr: 'DXB', cabin: 'business' },
                    { dep: 'JFK', arr: 'CDG', cabin: 'business' },
                    { dep: 'LHR', arr: 'SIN', cabin: 'first' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAviationDepIata(item.dep);
                        setAviationArrIata(item.arr);
                        setDuffelCabin(item.cabin);
                        fetchDuffelOffers(item.dep, item.arr, duffelDate, item.cabin);
                      }}
                      className="px-1.5 py-px bg-gold/10 hover:bg-gold/15 border border-gold/20 rounded text-[7px] font-mono font-bold text-gold shrink-0"
                    >
                      {item.dep}→{item.arr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-3 py-2 overflow-y-auto custom-scrollbar flex-1 space-y-1.5">
                {duffelOffers.length === 0 ? (
                  <div className="py-5 flex flex-col items-center justify-center text-center text-gray-500">
                    <Plane className="w-5 h-5 mb-1 opacity-30" />
                    <p className="text-[9px] font-mono uppercase tracking-wider">No offers</p>
                  </div>
                ) : (
                  duffelOffers.map((fl) => (
                    <div
                      key={fl.id}
                      className="border border-gold/15 rounded-lg p-2 flex flex-col gap-1.5 hover:border-gold/30 transition-all"
                      style={{ background: 'rgba(61, 18, 18, 0.45)' }}
                    >
                      <div className="flex items-center justify-between gap-1 border-b border-gold/10 pb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[10px] font-bold font-display text-white">{fl.flight?.iata || '—'}</span>
                          <span className="text-[8px] text-gray-400 truncate">{fl.airline?.name || 'Airline'}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="px-1.5 py-px rounded-full text-[7px] font-mono font-bold uppercase border bg-gold/10 text-gold border-gold/25">
                            {formatMoney(fl.total_amount, fl.total_currency)}
                          </span>
                          <button
                            onClick={() => {
                              setBookingData(p => ({
                                ...p,
                                from: fl.departure?.iata || 'LHR',
                                to: fl.arrival?.iata || 'DXB',
                                date: duffelDate,
                              }));
                              setShowAviationModal(false);
                              addToast({
                                type: 'booking',
                                title: `Hold ${fl.flight?.iata || 'offer'}`,
                                message: `${fl.departure?.iata} → ${fl.arrival?.iata} · ${formatMoney(fl.total_amount, fl.total_currency)}`,
                                details: {
                                  flightNumber: fl.flight?.iata,
                                  route: `${fl.departure?.iata} → ${fl.arrival?.iata}`,
                                  status: (fl.cabin_class || duffelCabin).toUpperCase(),
                                  amount: formatMoney(fl.total_amount, fl.total_currency),
                                  reference: fl.id.slice(0, 12),
                                }
                              });
                            }}
                            className="px-1.5 py-px bg-gold text-maroon text-[7px] font-bold uppercase rounded transition-all"
                          >
                            Hold
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[8px] font-mono text-gray-300">
                        <div className="p-1.5 rounded border border-gold/10" style={{ background: 'rgba(42, 12, 12, 0.4)' }}>
                          <span className="text-gold font-bold">{fl.departure?.iata || '—'}</span>
                          <span className="text-gray-500 ml-1">{formatClock(fl.departure?.scheduled)}</span>
                        </div>
                        <div className="p-1.5 rounded border border-gold/10" style={{ background: 'rgba(42, 12, 12, 0.4)' }}>
                          <span className="text-gold font-bold">{fl.arrival?.iata || '—'}</span>
                          <span className="text-gray-500 ml-1">{formatClock(fl.arrival?.scheduled)}</span>
                        </div>
                      </div>
                      {(fl.duration || fl.stops != null) && (
                        <div className="text-[7px] text-gray-500 font-mono">
                          {formatIsoDuration(fl.duration)}
                          {(fl.stops ?? 0) === 0 ? ' · Nonstop' : ` · ${fl.stops} stop`}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification System Container (Framer-Motion Stack) */}
      <div className="fixed top-14 right-3 z-50 flex flex-col gap-1.5 max-w-[11rem] w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ type: 'tween', duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={`pointer-events-auto p-2 rounded-lg shadow-sm border backdrop-blur-sm flex flex-col gap-1 relative overflow-hidden ${
                toast.type === 'flight'
                  ? 'text-white border-gold/30'
                  : toast.type === 'booking'
                  ? 'text-white border-gold/30'
                  : 'bg-white/95 text-ink border-gold/25 shadow-gray-900/5'
              }`}
              style={
                toast.type === 'flight' || toast.type === 'booking'
                  ? { background: 'rgba(42, 12, 12, 0.96)' }
                  : undefined
              }
            >
              {/* Top Accent Bar */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 ${
                toast.type === 'flight' ? 'bg-gradient-to-r from-gold via-[#E8C97A] to-maroon' :
                toast.type === 'booking' ? 'bg-gradient-to-r from-gold via-[#E8C97A] to-maroon' :
                'bg-gold'
              }`} />

              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-start gap-1.5 min-w-0">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                    toast.type === 'flight' || toast.type === 'booking' ? 'bg-gold/12 text-gold' :
                    'bg-gold/10 text-maroon'
                  }`}>
                    {toast.type === 'flight' ? <Plane className="w-2.5 h-2.5" /> :
                     toast.type === 'booking' ? <Ticket className="w-2.5 h-2.5" /> :
                     <Sparkles className="w-2.5 h-2.5" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[9px] font-bold font-display tracking-tight leading-none text-white truncate">
                      {toast.title}
                    </h4>
                    <p className={`text-[8px] mt-0.5 leading-snug truncate ${toast.type === 'info' ? 'text-gray-600' : 'text-white/80'}`}>
                      {toast.message}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-white/30 hover:text-white transition-colors shrink-0"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>

              {toast.details && (
                <div className={`p-1.5 rounded-md text-[7px] font-mono grid grid-cols-2 gap-1 ${
                  toast.type === 'flight' ? 'bg-white/10 border border-white/10 text-gold' :
                  toast.type === 'booking' ? 'bg-black/30 border border-gold/20 text-gold' :
                  'bg-gray-50 text-gray-700'
                }`}>
                  {toast.details.flightNumber && <div><span className="opacity-60">Flight:</span> <span className="font-bold">{toast.details.flightNumber}</span></div>}
                  {toast.details.route && <div><span className="opacity-60">Route:</span> <span className="font-bold">{toast.details.route}</span></div>}
                  {toast.details.status && <div><span className="opacity-60">Status:</span> <span className="font-bold text-gold">{toast.details.status}</span></div>}
                  {toast.details.gate && <div><span className="opacity-60">Gate:</span> <span className="font-bold">{toast.details.gate}</span></div>}
                  {toast.details.reference && <div><span className="opacity-60">Ref:</span> <span className="font-bold">{toast.details.reference}</span></div>}
                  {toast.details.amount && <div><span className="opacity-60">Val:</span> <span className="font-bold">{toast.details.amount}</span></div>}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(195, 163, 94, 0.45); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

