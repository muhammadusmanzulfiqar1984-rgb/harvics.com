import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Layers,
  Compass,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  Activity,
  Award,
  Shield,
  Briefcase,
  Home,
  ShoppingBag,
  Film,
  MapPin,
  Map,
  Users,
  Compass as RoadIcon,
  ChevronsUpDown,
  CornerDownRight,
  Info
} from "lucide-react";
import FloorPlanWalkthroughModal from "./FloorPlanWalkthroughModal";

interface MonolithViewer3DProps {
  theme: "graphite" | "ivory";
  lang: "en" | "ur" | "ar" | "zh" | "es" | "sk";
}

// Block/Tower Definition for the Site Layout
interface MasterBlock {
  id: string;
  nameEn: string;
  nameUr: string;
  position: { x: number; z: number };
  color: string;
  floors: number;
  width: number;
  depth: number;
  heightFactor: number;
  coveredArea: string;
  scaleEn: string;
  scaleUr: string;
  useEn: string;
  useUr: string;
}

// Structural Level Definition for Tower Blueprint
interface FloorLevel {
  id: string;
  nameEn: string;
  nameUr: string;
  elevation: string;
  coveredArea: string;
  scaleFactor: number; // Y position offset scale
  color: string;
  icon: React.ReactNode;
  specsEn: {
    use: string;
    atrium: string;
    lift: string;
    materials: string;
    highlights: string;
  };
  specsUr: {
    use: string;
    atrium: string;
    lift: string;
    materials: string;
    highlights: string;
  };
}

export default function MonolithViewer3D({ theme, lang }: MonolithViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Core Modes
  const [viewMode, setViewMode] = useState<"site" | "tower">("site"); // "site" = full map, "tower" = detailed level exploded
  const [selectedBlockId, setSelectedBlockId] = useState<string>("G"); // Current Block G Anchor
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  // Walkthrough & Floor Plan Modal states
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState<boolean>(false);

  // Tower level states (used in "tower" mode)
  const [selectedLevelId, setSelectedLevelId] = useState<string>("rooftop");
  const [hoveredLevelId, setHoveredLevelId] = useState<string | null>(null);
  const [explodedScale, setExplodedScale] = useState<number>(0); // 0 (closed) to 1.5 (fully separated)
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [viewPreset, setViewPreset] = useState<"perspective" | "front" | "top" | "close">("perspective");
  const [showWireframe, setShowWireframe] = useState<boolean>(false);

  // References for Three.js animations and interaction
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  
  // Storage for mesh references for interaction/animation
  const floorGroupsRef = useRef<{ [key: string]: THREE.Group }>({});
  const wireframesRef = useRef<{ [key: string]: THREE.LineSegments }>({});
  const siteBlocksRef = useRef<{ [key: string]: THREE.Group }>({});
  const vehicleMeshesRef = useRef<THREE.Mesh[]>([]);
  const peopleMeshesRef = useRef<THREE.Mesh[]>([]);

  // 1. Site Master Layout blocks config — coordinates mirror the approved
  // Master Plan Blueprint exactly: Row 1 (A|B) nearest the 24m North road,
  // Row 2 (C|D), Row 3 (E|F), and Row 4 the single wide Block G fronting
  // the 30m Main Boulevard. The central north-south axis between columns
  // is reserved for the Grand Atrium / cascading water walkway.
  const blocks: MasterBlock[] = useMemo(() => [
    {
      id: "A",
      nameEn: "Block A: Sovereign Residences I",
      nameUr: "بلاک اے: رہائشی ٹاور اول",
      position: { x: -3.6, z: -9.2 },
      color: "#F5E6D3",
      floors: 5,
      width: 3.0,
      depth: 2.1,
      heightFactor: 0.9,
      coveredArea: "11,494 Sq.ft",
      scaleEn: "LG+G+2 Retail · 3rd Corporate · 4-5 Residential · Roof Dining",
      scaleUr: "گراؤنڈ+۲ ریٹیل، تیسری کارپوریٹ، ۴-۵ رہائشی، چھت ریسٹورنٹ",
      useEn: "Exclusive split-level family apartments above corporate office plates, featuring custom walnut acoustics, safety cores, and a rooftop dining terrace.",
      useUr: "انتہائی پرتعیش رہائشی ڈوپلیکس اور سنگل فیملی فلیٹس مع فول پروف بایومیٹرک سیکیورٹی۔"
    },
    {
      id: "B",
      nameEn: "Block B: Sovereign Residences II",
      nameUr: "بلاک بی: رہائشی ٹاور دوم",
      position: { x: 3.6, z: -9.2 },
      color: "#E8D3BC",
      floors: 5,
      width: 3.0,
      depth: 2.1,
      heightFactor: 0.9,
      coveredArea: "11,494 Sq.ft",
      scaleEn: "LG+G+2 Retail · 3rd Corporate · 4-5 Residential · Roof Dining",
      scaleUr: "گراؤنڈ+۲ ریٹیل، تیسری کارپوریٹ، ۴-۵ رہائشی، چھت ریسٹورنٹ",
      useEn: "Sovereign guest suites and reception lounges above secure elevator portals, mirrored across the atrium from Block A.",
      useUr: "شاہی مہمانوں کے لیے بک کردہ خصوصی سوئٹس مع علیحدہ پارکنگ اور براہ راست لفٹ رسائی۔"
    },
    {
      id: "C",
      nameEn: "Block C: Corporate HQ Towers",
      nameUr: "بلاک سی: تجارتی ہیڈ کوارٹر",
      position: { x: -3.6, z: -3.0 },
      color: "#9C8A75",
      floors: 6,
      width: 3.1,
      depth: 2.2,
      heightFactor: 1.0,
      coveredArea: "12,880 Sq.ft",
      scaleEn: "LG+G+2 Retail · 3rd Corporate · 4-5 Residential · Roof Dining",
      scaleUr: "گراؤنڈ+۲ ریٹیل، تیسری کارپوریٹ، ۴-۵ رہائشی، چھت ریسٹورنٹ",
      useEn: "Premium corporate plates housing local agricultural wealth capital, digital vault treasuries, and elite boardrooms overlooking the atrium fountains.",
      useUr: "علاقائی زرعی فنڈز اور بینکنگ ہیڈ کوارٹرز کے دفاتر مع جدید ترین ٹیلی میٹری۔"
    },
    {
      id: "D",
      nameEn: "Block D: Executive Business Suites",
      nameUr: "بلاک ڈی: ایگزیکٹو بزنس سوئٹس",
      position: { x: 3.6, z: -3.0 },
      color: "#8B7660",
      floors: 6,
      width: 3.1,
      depth: 2.2,
      heightFactor: 1.0,
      coveredArea: "12,880 Sq.ft",
      scaleEn: "LG+G+2 Retail · 3rd Corporate · 4-5 Residential · Roof Dining",
      scaleUr: "گراؤنڈ+۲ ریٹیل، تیسری کارپوریٹ، ۴-۵ رہائشی، چھت ریسٹورنٹ",
      useEn: "Flexible co-working vaults and high-speed fiber executive offices, with private secure briefing chambers mirrored from Block C.",
      useUr: "کارپوریٹ میٹنگ ہالز، سیمینار چیمبرز اور جدید ترین بزنس فلیٹس۔"
    },
    {
      id: "E",
      nameEn: "Block E: Sovereign Hospitality",
      nameUr: "بلاک ای: سوورین ہاسپیٹلیٹی",
      position: { x: -3.6, z: 3.2 },
      color: "#D4B996",
      floors: 5,
      width: 3.0,
      depth: 2.1,
      heightFactor: 0.9,
      coveredArea: "11,494 Sq.ft",
      scaleEn: "LG+G+2 Retail · 3rd Corporate · 4-5 Residential · Roof Dining",
      scaleUr: "گراؤنڈ+۲ ریٹیل، تیسری کارپوریٹ، ۴-۵ رہائشی، چھت ریسٹورنٹ",
      useEn: "International tier short-stay hospitality suites styled with Italian white travertine facades, facing the central water gardens.",
      useUr: "بین الاقوامی معیار کے مطابق ڈیزائن کردہ قلیل مدتی قیام کے لیے پرتعیش سوئٹس۔"
    },
    {
      id: "F",
      nameEn: "Block F: Royal Atrium Suites",
      nameUr: "بلاک ایف: رائل ایٹریئم سوئٹس",
      position: { x: 3.6, z: 3.2 },
      color: "#C5A880",
      floors: 5,
      width: 3.0,
      depth: 2.1,
      heightFactor: 0.9,
      coveredArea: "11,494 Sq.ft",
      scaleEn: "LG+G+2 Retail · 3rd Corporate · 4-5 Residential · Roof Dining",
      scaleUr: "گراؤنڈ+۲ ریٹیل، تیسری کارپوریٹ، ۴-۵ رہائشی، چھت ریسٹورنٹ",
      useEn: "Premium serviced rooms integrated with walking gardens and Sufi wellness hammams, mirrored from Block E across the atrium.",
      useUr: "کھلے باغات، صوفی ویلنس اسپا اور واٹر فال ایٹریئم سے جڑے ہوئے سروسڈ سوئٹس۔"
    },
    {
      id: "G",
      nameEn: "Block G: Tabraiz Anchor Monolith",
      nameUr: "بلاک جی: تبریز اینکر مینارِ بلند",
      position: { x: 0, z: 9.6 },
      color: "#E3C193", // Elite Champagne Gold Highlight
      floors: 7,
      width: 9.6,
      depth: 2.6,
      heightFactor: 1.3, // Tallest Landmark Monolith fronting the Main Boulevard
      coveredArea: "19,545 Sq.ft Base",
      scaleEn: "LG Parking · G+2 Retail (218 shops) · 3rd Corporate · Roof Cinema & Food Court",
      scaleUr: "لوئر گراؤنڈ پارکنگ، گراؤنڈ+۲ ریٹیل، تیسری کارپوریٹ، چھت سینما و فوڈ کورٹ",
      useEn: "The crowning wide-front anchor of Tabraiz Town fronting the 30m Main Boulevard — 218 retail shops, corporate plates, and a full rooftop restaurant, food court, and cinema deck.",
      useUr: "تبریز ٹاؤن کا سب سے اونچا اور شاندار مرکزی ستون، جس میں ریٹیل، دفاتر اور چھت پر کینٹیلیور سینما ہال واقع ہے۔"
    }
  ], []);

  // 2. Structural Levels configuration for detailed individual Tower Explorer
  const levels: FloorLevel[] = useMemo(() => [
    {
      id: "rooftop",
      nameEn: "Rooftop: Destination Cinema & Sky Court",
      nameUr: "چھت: فلک بوس سینما اور فوڈ کورٹ",
      elevation: "+22.5m - Roof Level",
      coveredArea: "19,545 Sq.ft (Block G Anchor)",
      scaleFactor: 4,
      color: "#E3C193",
      icon: <Film className="text-champagne" size={16} />,
      specsEn: {
        use: "Floating cantilever deck with a premium 'Sky-Desert' fine-dining bistro, dual Dolby Atmos luxury screening theatres, and open star-view gardens.",
        atrium: "Direct double-height sky bridge connection to block elevators.",
        lift: "Dual private presidential VIP elevators directly from Lower Ground.",
        materials: "Polished Italian White Travertine flooring, architectural glass, champagne-anodized high-deformation steel supports.",
        highlights: "360-degree panoramic horizons of Rahim Yar Khan and adjacent Cholistan Desert."
      },
      specsUr: {
        use: "معلق کینٹیلیور ڈیک پر مشتمل 'اسکائی ڈیزرٹ' فائن ڈائننگ ریسٹورنٹ، ڈولبی ایٹموس لگژری سنیما، اور کھلے باغ۔",
        atrium: "لفٹ بلاکس اور وی آئی پی لاؤنجز سے براہ راست ڈبل ہائٹ رابطہ۔",
        lift: "لوئر گراؤنڈ سے براہ راست جڑنے والی دو صدارتی وی آئی پی لفٹس۔",
        materials: "اطالوی سفید ٹراورٹائن ماربل، تھرمل گلاس، چمکدار شیمپین گولڈ اسٹیل۔",
        highlights: "رحیم یار خان اور چولستان کے تاریخی صحرا کا خوبصورت طائرانہ نظارہ۔"
      }
    },
    {
      id: "apartments",
      nameEn: "Levels 04 & 05: Premium Apartments",
      nameUr: "لیولز ۰۴ اور ۰۵: پرتعیش رہائشی فلیٹس",
      elevation: "+15.0m to +19.5m",
      coveredArea: "16,388 Sq.ft (Secure Block A & B)",
      scaleFactor: 2.2,
      color: "#F5E6D3",
      icon: <Home className="text-champagne" size={16} />,
      specsEn: {
        use: "High-end residential sanctuary consisting of single-family split-level duplex apartments and sovereign private suites with biometric security keys.",
        atrium: "Cascading indoor gardens with natural desert-breeze air channels.",
        lift: "Separated residential-only lift lobbies to guarantee absolute quietness.",
        materials: "Basalt aggregate foundation, matte travertine facades, and walnut acoustic internal partitioning.",
        highlights: "Smart-home climate control resisting Cholistan's solar temperature peaks."
      },
      specsUr: {
        use: "بایومیٹرک سیکیورٹی کے حامل ڈوپلیکس اور پرتعیش رہائشی فلیٹس برائے معزز مہمانان۔",
        atrium: "اندرونی سرسبز باغات اور ہوا کے دباؤ کو خودکار کنٹرول کرنے والی چمنیاں۔",
        lift: "مکمل رازداری کے لیے علیحدہ رہائشی لابی اور تیز رفتار لفٹس۔",
        materials: "مضبوط زلزلہ پروف ڈی جی خان سیمنٹ، شیمپین اسٹیل، اخروٹ کی لکڑی۔",
        highlights: "چولستان کی شدید ترین گرمی کا مقابلہ کرنے والا خودکار کولنگ سسٹم۔"
      }
    },
    {
      id: "offices",
      nameEn: "Level 03: Corporate Office Suites",
      nameUr: "لیول ۰۳: کارپوریٹ ہیڈ کوارٹرز اور دفاتر",
      elevation: "+11.0m to +14.5m",
      coveredArea: "11,287 Sq.ft (Block C, D & E Plates)",
      scaleFactor: 0.8,
      color: "#9C8A75",
      icon: <Briefcase className="text-champagne" size={16} />,
      specsEn: {
        use: "Single-plate high-density executive office zones, digital treasury suites, and secure high-speed boardroom facilities.",
        atrium: "Direct overhead sky-bridges connecting blocks C & D for streamlined mobility.",
        lift: "Dedicated biometric access secure elevators and continuous power backup.",
        materials: "Champagne Grade-60 steel structural skeleton, micro-etched clear glass curtain walls.",
        highlights: "Executive VIP drop-off protocols with fully encrypted fiber telemetry."
      },
      specsUr: {
        use: "جدید کارپوریٹ دفاتر، کانفرنس ہالز، اور محفوظ ہیڈ کوارٹرز۔",
        atrium: "بلاک سی اور ڈی کو ملانے والے خوبصورت فضائی روابط۔",
        lift: "بایومیٹرک رسائی کے حامل تیز رفتار کیبنز اور ایمرجنسی پاور یونٹس۔",
        materials: "مضبوط ترین گریڈ ۶۰ اسٹیل کا بیرونی ڈھانچہ اور موٹا گلیزڈ گلاس۔",
        highlights: "انتہائی محفوظ فائبر کنیکٹیوٹی اور فول پروف سیکیورٹی پروٹوکول۔"
      }
    },
    {
      id: "retail",
      nameEn: "Ground & Level 02: Luxury Retail",
      nameUr: "گراؤنڈ اور لیول ۰۲: عالمی برانڈز شاپنگ پلازہ",
      elevation: "+0.0m to +10.5m",
      coveredArea: "218 Shop Units / 19,545 Sq.ft Plates",
      scaleFactor: -1,
      color: "#D4B996",
      icon: <ShoppingBag className="text-champagne" size={16} />,
      specsEn: {
        use: "Multi-tier high-end designer retail atrium. Houses international luxury labels, signature jewelry outlets, and premium culinary bistros.",
        atrium: "Wide open-air multi-floor central light atrium with premium waterfall features.",
        lift: "High-capacity continuous glass escalators and sweeping panoramic lift shafts.",
        materials: "Massive solid travertine pillar arches, brass-brushed joinery, and marble flooring.",
        highlights: "Direct integration with Rahim Yar Khan's central commercial artery road."
      },
      specsUr: {
        use: "بین الاقوامی برانڈز، سونے اور قیمتی زیورات کے شورومز، اور شاندار کیفے۔",
        atrium: "مرکزی خوبصورت کھلی جگہ (ایٹریئم) مع خوبصورت مصنوعی آبشار اور فانوس۔",
        lift: "خوبصورت شیشے کی متحرک سیڑھیاں (Escalators) اور پینورامک لفٹس۔",
        materials: "مضبوط پختہ ٹراورٹائن ستون، پیتل اور نفیس ماربل کی نقش و نگار۔",
        highlights: "شہر کے سب سے بڑے اور اہم ترین شاہراہ سے براہ راست آسان راستہ۔"
      }
    },
    {
      id: "basement",
      nameEn: "Lower Ground: Anchor Retail & Parking",
      nameUr: "لوئر گراؤنڈ: اینکر ریٹیل اور کار پارکنگ زون",
      elevation: "-4.5m to -0.5m",
      coveredArea: "19,545 Sq.ft Base Foundation",
      scaleFactor: -2.8,
      color: "#2C2A29",
      icon: <Layers className="text-champagne" size={16} />,
      specsEn: {
        use: "Premium hypermarket space, anchor grocery facilities, structural building utilities, and multi-tier secure reserved vehicle parking slots.",
        atrium: "Subterranean direct air-induction and air filtration shafts.",
        lift: "Smart ramp elevator and direct service lift coordinates.",
        materials: "Sulphate-resistant monolith high-density concrete blocks, heavy rebar anchors.",
        highlights: "24/7 smart-grid vehicle scanning and security screening vault."
      },
      specsUr: {
        use: "بڑا ڈیپارٹمنٹل سٹور، مال برداری کا ریمپ، اور انتہائی محفوظ کار پارکنگ۔",
        atrium: "ہوا کی نکاسی کے لیے جدید ترین فلٹریشن اور وینٹیلیشن سسٹم۔",
        lift: "گاڑیوں کی سمارٹ پارکنگ لفٹ اور مال لانے والی سروس لفٹس۔",
        materials: "سلفیٹ ریزسٹنٹ کنکریٹ کا زبردست مضبوط بنیاد اور دفاعی پشتے۔",
        highlights: "چوبیس گھنٹے سمارٹ سکیننگ اور خودکار سیکیورٹی چیک پوسٹ۔"
      }
    }
  ], []);

  // Handle Preset Camera angles
  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    let targetX = 14, targetY = 12, targetZ = 16;
    if (viewMode === "site") {
      targetX = 26; targetY = 21; targetZ = 30;
      if (viewPreset === "front") {
        targetX = 34; targetY = 6; targetZ = 1;
      } else if (viewPreset === "top") {
        targetX = 0.1; targetY = 44; targetZ = 1.1;
      } else if (viewPreset === "close") {
        targetX = 12; targetY = 9; targetZ = 14;
      }
    } else {
      if (viewPreset === "front") {
        targetX = 22; targetY = 2; targetZ = 0;
      } else if (viewPreset === "top") {
        targetX = 0; targetY = 24; targetZ = 0.1;
      } else if (viewPreset === "close") {
        targetX = 8; targetY = 5; targetZ = 8;
      }
    }

    // Camera move animation steps
    const steps = 30;
    let step = 0;
    const dx = (targetX - camera.position.x) / steps;
    const dy = (targetY - camera.position.y) / steps;
    const dz = (targetZ - camera.position.z) / steps;

    const interval = setInterval(() => {
      camera.position.x += dx;
      camera.position.y += dy;
      camera.position.z += dz;
      controls.update();
      step++;
      if (step >= steps) clearInterval(interval);
    }, 16);

    return () => clearInterval(interval);
  }, [viewPreset, viewMode]);

  // Synchronize exploded floors state in individual "tower" mode
  useEffect(() => {
    if (viewMode !== "tower") return;
    levels.forEach((lvl) => {
      const grp = floorGroupsRef.current[lvl.id];
      const wire = wireframesRef.current[lvl.id];
      if (grp) {
        const baseY = lvl.scaleFactor * 1.5;
        const explodedY = baseY + (lvl.scaleFactor * explodedScale);
        grp.position.y = explodedY;

        // Visual highlight for hovered/selected levels
        grp.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material as THREE.MeshStandardMaterial;
            if (mat && "emissive" in mat) {
              const isSelected = selectedLevelId === lvl.id;
              const isHovered = hoveredLevelId === lvl.id;
              
              if (isSelected) {
                mat.emissive.setHex(0xc5a880);
                mat.emissiveIntensity = 0.6;
              } else if (isHovered) {
                mat.emissive.setHex(0x9d8a75);
                mat.emissiveIntensity = 0.35;
              } else {
                mat.emissive.setHex(0x000000);
                mat.emissiveIntensity = 0;
              }
            }
          }
        });
      }
      if (wire) {
        wire.visible = showWireframe;
      }
    });
  }, [selectedLevelId, hoveredLevelId, explodedScale, showWireframe, viewMode, levels]);

  // Sync hovered/selected blocks in "site" master plan mode
  useEffect(() => {
    if (viewMode !== "site") return;
    blocks.forEach((blk) => {
      const grp = siteBlocksRef.current[blk.id];
      if (grp) {
        const isSelected = selectedBlockId === blk.id;
        const isHovered = hoveredBlockId === blk.id;

        grp.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const mat = child.material as THREE.MeshStandardMaterial;
            if (mat && "emissive" in mat) {
              if (isSelected) {
                mat.emissive.setHex(0xe3c193);
                mat.emissiveIntensity = 0.7;
              } else if (isHovered) {
                mat.emissive.setHex(0xc4ab80);
                mat.emissiveIntensity = 0.45;
              } else {
                mat.emissive.setHex(0x000000);
                mat.emissiveIntensity = 0;
              }
            }
          }
        });
      }
    });
  }, [selectedBlockId, hoveredBlockId, viewMode, blocks]);

  // Set up full WebGL canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // 1. SCENE SETUP
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const isDark = theme === "graphite";
    scene.background = new THREE.Color(isDark ? 0x0f0e0d : 0xfcfbfa);
    scene.fog = new THREE.FogExp2(isDark ? 0x0f0e0d : 0xfcfbfa, 0.012);

    // 2. CAMERA SETUP
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 150);
    // Position differs by mode
    if (viewMode === "site") {
      camera.position.set(24, 19, 28);
    } else {
      camera.position.set(14, 12, 18);
    }
    cameraRef.current = camera;

    // 3. RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Filmic tone curve + warm exposure for a photoreal, "cinematic" grade
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = isDark ? 1.05 : 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // 3b. POST-PROCESSING: subtle bloom to give lights, glass & gold a real
    // camera-lens glow rather than a flat CG render
    const composer = new EffectComposer(renderer);
    composer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight),
      0.42, // strength
      0.55, // radius
      0.82  // threshold
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    composerRef.current = composer;

    // 4. CONTROLS SETUP
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Ground limit
    controls.minDistance = 5;
    controls.maxDistance = viewMode === "site" ? 65 : 45;
    controls.target.set(0, 1, viewMode === "site" ? 1 : 0);
    controlsRef.current = controls;

    // 5. IMMERSIVE CINEMATIC "GOLDEN HOUR" LIGHTING RIG
    // Soft sky/ground bounce so shadows never read as flat black
    const hemiLight = new THREE.HemisphereLight(
      isDark ? 0x8a97a8 : 0xcfe3f2, // cool desert-dusk sky tint
      isDark ? 0x141210 : 0xdccdb2, // warm sand bounce from the ground
      isDark ? 0.9 : 1.3
    );
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(isDark ? 0x1d1a17 : 0xf7f5f2, isDark ? 0.9 : 1.6);
    scene.add(ambientLight);

    // Low, warm "setting sun" key light raking across the facades for long,
    // dramatic real-world shadows instead of a flat top-down CG look
    const sunLight = new THREE.DirectionalLight(0xffd9a0, isDark ? 3.2 : 4.2);
    sunLight.position.set(28, 22, 12);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.camera.left = -34;
    sunLight.shadow.camera.right = 34;
    sunLight.shadow.camera.top = 34;
    sunLight.shadow.camera.bottom = -34;
    sunLight.shadow.camera.far = 100;
    scene.add(sunLight);

    // Cool blue rim/fill from the opposite side so building edges separate
    // from the dark sky the way they would against real dusk light
    const rimLight = new THREE.DirectionalLight(0x8aa6c9, isDark ? 0.55 : 0.35);
    rimLight.position.set(-22, 14, -18);
    scene.add(rimLight);

    // Dynamic glowing point lights for streets & courtyards
    const courtyardGlow = new THREE.PointLight(0xe3c193, 3.2, 16);
    courtyardGlow.position.set(0, 0.6, 0);
    scene.add(courtyardGlow);

    // Material definitions
    const travertineMaterial = new THREE.MeshStandardMaterial({
      color: 0xeadac5,
      roughness: 0.6,
      metalness: 0.1,
    });

    const champagneSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0xc5ac83,
      metalness: 0.82,
      roughness: 0.2,
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e2e31,
      transparent: true,
      opacity: 0.38,
      roughness: 0.1,
      metalness: 0.95
    });

    const basaltMaterial = new THREE.MeshStandardMaterial({
      color: 0x1c1b1a,
      roughness: 0.85,
      metalness: 0.2
    });

    // 6. BUILD SCENE BY MODE
    const floorGroups: { [key: string]: THREE.Group } = {};
    const wireframes: { [key: string]: THREE.LineSegments } = {};
    const siteBlocks: { [key: string]: THREE.Group } = {};
    const vehicles: THREE.Mesh[] = [];
    const pedestrians: THREE.Mesh[] = [];

    if (viewMode === "site") {
      // ----------------------------------------------------
      // MODE A: MASTER SITE PLAN — rebuilt to mirror the approved Master
      // Plan Blueprint 1:1 — the 24m North Road, twin 18m flanking roads,
      // the 30m Main Boulevard, the four building rows (A|B, C|D, E|F, G),
      // the central cascading-water atrium axis, marked parking fields
      // with tree rows, and rooftop food-court/cinema decks on every roof.
      // ----------------------------------------------------

      const LEFT_ROAD_X = -9.4;
      const RIGHT_ROAD_X = 9.4;
      const TOP_ROAD_Z = -13.5;
      const BOULEVARD_Z = 13.7;

      // Ground Landscape (30-Kanal Estate Plot) — warm sunlit desert sand
      const landscapeGeo = new THREE.PlaneGeometry(24, 32, 1, 1);
      const landscapeMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x171310 : 0xe9dcc4,
        roughness: 0.95,
      });
      const landscape = new THREE.Mesh(landscapeGeo, landscapeMat);
      landscape.rotation.x = -Math.PI / 2;
      landscape.position.set(0, -0.03, 0.6);
      landscape.receiveShadow = true;
      scene.add(landscape);

      // ---------- REUSABLE PLANTING & FURNITURE HELPERS ----------
      const roundTreeCrownMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x2c4b30 : 0x3c6b3e, roughness: 0.85
      });
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2c, roughness: 0.9 });

      const makeRoundTree = (x: number, z: number, scale = 1) => {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.03 * scale, 0.045 * scale, 0.32 * scale, 6), trunkMat);
        trunk.position.set(x, 0.16 * scale, z);
        scene.add(trunk);
        const crown = new THREE.Mesh(new THREE.SphereGeometry(0.24 * scale, 8, 8), roundTreeCrownMat);
        crown.position.set(x, 0.42 * scale, z);
        crown.castShadow = true;
        crown.receiveShadow = true;
        scene.add(crown);
      };

      const palmLeafMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x33502f : 0x3d6b3a, roughness: 0.8 });
      const makePalmTree = (x: number, z: number, scale = 1) => {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * scale, 0.09 * scale, 1.5 * scale, 8), trunkMat);
        trunk.position.set(x, 0.75 * scale, z);
        trunk.rotation.z = (Math.random() - 0.5) * 0.08;
        scene.add(trunk);
        for (let i = 0; i < 5; i++) {
          const frond = new THREE.Mesh(new THREE.ConeGeometry(0.16 * scale, 0.85 * scale, 5), palmLeafMat);
          frond.position.set(x, 1.55 * scale, z);
          frond.rotation.z = Math.PI / 2.6;
          frond.rotation.y = (i / 5) * Math.PI * 2;
          frond.castShadow = true;
          scene.add(frond);
        }
      };

      // Streetlight helper — post + arm + emissive head + real point light
      const streetlightGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8);
      const lampHeadGeo = new THREE.BoxGeometry(0.28, 0.08, 0.14);
      const lightCapMat = new THREE.MeshStandardMaterial({ color: 0xffdf8e, emissive: 0xffb84d, emissiveIntensity: 1.6 });
      const makeStreetlight = (x: number, z: number, armRotationY = 0) => {
        const post = new THREE.Mesh(streetlightGeo, champagneSteelMaterial);
        post.position.set(x, 1.1, z);
        post.castShadow = true;
        scene.add(post);

        const cap = new THREE.Mesh(lampHeadGeo, travertineMaterial);
        cap.position.set(x, 2.2, z);
        cap.rotation.y = armRotationY;
        scene.add(cap);

        const source = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.1), lightCapMat);
        source.position.set(x, 2.15, z);
        source.rotation.y = armRotationY;
        scene.add(source);

        const light = new THREE.PointLight(0xffb84d, 2.4, 6.5);
        light.position.set(x, 2.0, z);
        scene.add(light);
      };

      // Parking-field helper — flat lot + painted stall stripes, matching
      // the hatched parking zones drawn around every block on the blueprint
      const parkingMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x2a2724 : 0xb9ae98, roughness: 0.92
      });
      const stallStripeMat = new THREE.MeshBasicMaterial({ color: isDark ? 0xdcd2bd : 0xf7f2e6 });
      const makeParkingLot = (cx: number, cz: number, w: number, d: number, stallsAlongX: boolean) => {
        const lot = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), parkingMat);
        lot.position.set(cx, 0.005, cz);
        lot.receiveShadow = true;
        scene.add(lot);

        const stallPitch = 0.46;
        if (stallsAlongX) {
          const count = Math.max(1, Math.floor(w / stallPitch));
          for (let i = 0; i <= count; i++) {
            const sx = cx - w / 2 + i * stallPitch;
            const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.01, d * 0.82), stallStripeMat);
            stripe.position.set(sx, 0.018, cz);
            scene.add(stripe);
          }
        } else {
          const count = Math.max(1, Math.floor(d / stallPitch));
          for (let i = 0; i <= count; i++) {
            const sz = cz - d / 2 + i * stallPitch;
            const stripe = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, 0.01, 0.025), stallStripeMat);
            stripe.position.set(cx, 0.018, sz);
            scene.add(stripe);
          }
        }
      };

      // ---------- ROAD NETWORK (24m North / 18m flanks / 30m Boulevard) ----------
      const asphaltMat = new THREE.MeshStandardMaterial({ color: isDark ? 0x1a1918 : 0x24211f, roughness: 0.9 });
      const laneStripeMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });

      const buildRoad = (w: number, d: number, cx: number, cz: number, dashesAlongX: boolean, dashCount: number) => {
        const road = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), asphaltMat);
        road.position.set(cx, 0.012, cz);
        road.receiveShadow = true;
        scene.add(road);
        for (let i = 0; i < dashCount; i++) {
          const t = (i / (dashCount - 1) - 0.5) * (dashesAlongX ? w : d) * 0.94;
          const dash = new THREE.Mesh(
            dashesAlongX ? new THREE.BoxGeometry(0.9, 0.01, 0.08) : new THREE.BoxGeometry(0.08, 0.01, 0.9),
            laneStripeMat
          );
          if (dashesAlongX) dash.position.set(cx + t, 0.03, cz);
          else dash.position.set(cx, 0.03, cz + t);
          scene.add(dash);
        }
      };

      // Top 24m Wide Road (North boundary)
      buildRoad(RIGHT_ROAD_X - LEFT_ROAD_X + 1.8, 2.0, 0, TOP_ROAD_Z, true, 10);
      // Left & Right 18m Wide Roads (flanking the estate)
      buildRoad(1.8, BOULEVARD_Z - TOP_ROAD_Z + 1.8, LEFT_ROAD_X, (TOP_ROAD_Z + BOULEVARD_Z) / 2, false, 14);
      buildRoad(1.8, BOULEVARD_Z - TOP_ROAD_Z + 1.8, RIGHT_ROAD_X, (TOP_ROAD_Z + BOULEVARD_Z) / 2, false, 14);
      // 30m Wide Main Boulevard (South frontage, in front of Block G)
      buildRoad(RIGHT_ROAD_X - LEFT_ROAD_X + 1.8, 2.8, 0, BOULEVARD_Z, true, 12);

      // Streetlights lining every road edge
      for (let x = LEFT_ROAD_X + 1.5; x <= RIGHT_ROAD_X - 1.5; x += 4.2) {
        makeStreetlight(x, TOP_ROAD_Z + 1.4, Math.PI / 2);
        makeStreetlight(x, BOULEVARD_Z - 1.8, Math.PI / 2);
      }
      for (let z = TOP_ROAD_Z + 3; z <= BOULEVARD_Z - 3; z += 4.4) {
        makeStreetlight(LEFT_ROAD_X + 1.3, z, 0);
        makeStreetlight(RIGHT_ROAD_X - 1.3, z, 0);
      }

      // Vehicle traffic flowing along the Main Boulevard & North Road
      const carColors = [0xc5ac83, 0x1f2e31, 0x5a5652, 0x8a1f1f];
      const carSpeeds = [0.06, 0.045, 0.055, 0.05];
      const carLanesZ = [BOULEVARD_Z - 0.7, BOULEVARD_Z + 0.7, TOP_ROAD_Z - 0.5, TOP_ROAD_Z + 0.5];
      for (let i = 0; i < 4; i++) {
        const car = new THREE.Mesh(
          new THREE.BoxGeometry(1.05, 0.36, 0.52),
          new THREE.MeshStandardMaterial({ color: carColors[i], metalness: 0.75, roughness: 0.15 })
        );
        car.castShadow = true;
        car.position.set(-8 + i * 5.5, 0.2, carLanesZ[i]);
        scene.add(car);
        (car as any).speed = carSpeeds[i];
        (car as any).dir = i % 2 === 0 ? 1 : -1;
        (car as any).laneZ = carLanesZ[i];
        vehicles.push(car);
      }

      // ---------- PARKING FIELDS (mirrors the hatched bays on the blueprint) ----------
      // Spans rows A/B through E/F only — stops short of the North road's own
      // parking strip above it, and short of the wide Block G row below it.
      const parkingSpanZ = 16.0;
      const parkingCenterZ = -2.5;
      // Parking fields sit between the flanking roads and the buildings'
      // outer edges (blocks reach out to x = ±5.15), never under the blocks
      const PARKING_X = 6.9;
      makeParkingLot(-PARKING_X, parkingCenterZ, 3.2, parkingSpanZ, false);
      makeParkingLot(PARKING_X, parkingCenterZ, 3.2, parkingSpanZ, false);
      makeParkingLot(0, TOP_ROAD_Z + 2.0, RIGHT_ROAD_X - LEFT_ROAD_X - 3.6, 1.0, true);

      // Tree rows lining the inner edge of every parking field, right where
      // the landscaped buffer meets the building line
      for (let z = parkingCenterZ - parkingSpanZ / 2 + 0.6; z <= parkingCenterZ + parkingSpanZ / 2 - 0.6; z += 1.5) {
        makeRoundTree(-(PARKING_X - 1.4), z, 0.85);
        makeRoundTree(PARKING_X - 1.4, z, 0.85);
      }
      for (let x = LEFT_ROAD_X + 2; x <= RIGHT_ROAD_X - 2; x += 2.4) {
        makeRoundTree(x, TOP_ROAD_Z + 3.6, 0.7);
      }

      // ---------- CENTRAL GRAND ATRIUM (cascading water walkway) ----------
      const atriumFrontZ = -10.15; // Row A/B frontage
      const atriumBackZ = 8.35;    // Row E/F frontage, before the Block G plaza
      const walkwayMat = new THREE.MeshStandardMaterial({ color: isDark ? 0xe2d3b8 : 0xf3e9d6, roughness: 0.55 });
      const walkway = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.04, atriumBackZ - atriumFrontZ), walkwayMat);
      walkway.position.set(0, 0.02, (atriumFrontZ + atriumBackZ) / 2);
      walkway.receiveShadow = true;
      scene.add(walkway);
      // Champagne trim edging the walkway
      [-1.34, 1.34].forEach((edgeX) => {
        const trim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, atriumBackZ - atriumFrontZ), champagneSteelMaterial);
        trim.position.set(edgeX, 0.03, (atriumFrontZ + atriumBackZ) / 2);
        scene.add(trim);
      });

      // Reflective water pools + fountain jets cascading down the atrium
      const waterMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x123539 : 0xbfe4e8, roughness: 0.08, metalness: 0.6,
        emissive: 0x0e2d30, emissiveIntensity: isDark ? 0.4 : 0.1
      });
      const poolZs = [-6.1, 0.15, 6.3];
      poolZs.forEach((pz, idx) => {
        const pool = new THREE.Mesh(new THREE.CylinderGeometry(idx === 1 ? 1.7 : 1.15, idx === 1 ? 1.7 : 1.15, 0.05, 28), waterMat);
        pool.position.set(0, 0.04, pz);
        scene.add(pool);

        const jetCount = idx === 1 ? 5 : 1;
        for (let j = 0; j < jetCount; j++) {
          const angle = (j / jetCount) * Math.PI * 2;
          const r = jetCount === 1 ? 0 : 0.7;
          const jet = new THREE.Mesh(
            new THREE.CylinderGeometry(0.045, 0.045, idx === 1 ? 0.9 : 0.6, 8),
            new THREE.MeshBasicMaterial({ color: 0x9cd2d6, transparent: true, opacity: 0.72 })
          );
          jet.position.set(Math.cos(angle) * r, (idx === 1 ? 0.55 : 0.4), pz + Math.sin(angle) * r);
          scene.add(jet);
        }

        if (idx === 1) {
          const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.5, 0.32, 16), champagneSteelMaterial);
          basin.position.set(0, 0.16, pz);
          scene.add(basin);
        }
      });

      // Palm trees framing the atrium
      poolZs.forEach((pz) => {
        makePalmTree(-2.0, pz - 0.3, 0.95);
        makePalmTree(2.0, pz + 0.3, 0.95);
      });

      // Grand entrance plaza palms — south of Block G, fronting the Main Boulevard
      const plazaZ = 11.6; // between Block G's south face (10.9) and the Boulevard (12.3)
      [-3.5, -1.2, 1.2, 3.5].forEach((x) => makePalmTree(x, plazaZ, 1.1));

      // ---------- BUILDING BLOCKS A–G with rooftop food-court/cinema decks ----------
      blocks.forEach((blk) => {
        const blockGroup = new THREE.Group();
        blockGroup.position.set(blk.position.x, 0, blk.position.z);
        scene.add(blockGroup);
        siteBlocks[blk.id] = blockGroup;

        const floorHeight = 0.52;
        const totalHeight = blk.floors * floorHeight;
        const isAnchor = blk.id === "G";

        // Structural stacking per the Floor Stacking Diagram: LG parking,
        // G-2 retail, 3rd corporate, 4-5 residential — tinted per level band
        for (let f = 0; f < blk.floors; f++) {
          const bandColor =
            f === 0 ? 0xcac0ac /* retail podium */ :
            f === blk.floors - 1 && !isAnchor ? 0xc9d6c6 /* residential top */ :
            f >= blk.floors - 2 && !isAnchor ? 0xc9d6c6 :
            f === (isAnchor ? blk.floors - 1 : 2) ? 0xa9b7c9 /* corporate office band */ :
            0xeadac5;

          const slabGeo = new THREE.BoxGeometry(blk.width, 0.115, blk.depth);
          const slabMat = new THREE.MeshStandardMaterial({
            color: isAnchor ? 0xe3c193 : bandColor,
            roughness: 0.5,
            metalness: isAnchor ? 0.3 : 0.08,
          });
          const slab = new THREE.Mesh(slabGeo, slabMat);
          slab.position.y = f * floorHeight;
          slab.castShadow = true;
          slab.receiveShadow = true;
          blockGroup.add(slab);

          if (f < blk.floors - 1) {
            const innerGlassGeo = new THREE.BoxGeometry(blk.width - 0.2, floorHeight - 0.115, blk.depth - 0.2);
            const innerGlass = new THREE.Mesh(innerGlassGeo, glassMaterial);
            innerGlass.position.y = f * floorHeight + floorHeight / 2;
            blockGroup.add(innerGlass);
          }
        }

        // ROOFTOP RESTAURANT / FOOD COURT / CINEMA DECK — present on every
        // block roof per the blueprint legend, larger & busier on the G anchor
        const deckY = totalHeight + 0.02;
        const deckGeo = new THREE.BoxGeometry(blk.width * 0.96, 0.07, blk.depth * 0.96);
        const deckMat = new THREE.MeshStandardMaterial({
          color: 0xe3c193, roughness: 0.4, metalness: 0.25,
          emissive: 0x8a5f2c, emissiveIntensity: 0.22
        });
        const deck = new THREE.Mesh(deckGeo, deckMat);
        deck.position.y = deckY;
        deck.castShadow = true;
        deck.receiveShadow = true;
        blockGroup.add(deck);

        const cabanaCanopyMat = new THREE.MeshStandardMaterial({ color: isDark ? 0xf3ede0 : 0xffffff, roughness: 0.6 });
        const umbrellaColors = [0xb2453a, 0x3c6b3e, 0xc5ac83];
        const cabanaCount = isAnchor ? 5 : 2;
        for (let c = 0; c < cabanaCount; c++) {
          const spread = (blk.width * 0.7);
          const cx = -spread / 2 + (spread / Math.max(1, cabanaCount - 1)) * c;
          const cz = (c % 2 === 0 ? -1 : 1) * blk.depth * 0.18;

          const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.3, 6), champagneSteelMaterial);
          pole.position.set(cx, deckY + 0.17, cz);
          blockGroup.add(pole);

          const canopy = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.14, 8), cabanaCanopyMat.clone());
          (canopy.material as THREE.MeshStandardMaterial).color.setHex(umbrellaColors[c % umbrellaColors.length]);
          canopy.position.set(cx, deckY + 0.34, cz);
          canopy.castShadow = true;
          blockGroup.add(canopy);
        }

        // Anchor block gets standing cinema-screen panels + a champagne spire
        if (isAnchor) {
          [-blk.width * 0.32, blk.width * 0.32].forEach((sx) => {
            const screen = new THREE.Mesh(
              new THREE.BoxGeometry(1.3, 0.7, 0.05),
              new THREE.MeshStandardMaterial({ color: 0x121110, roughness: 0.3, emissive: 0x1b3a44, emissiveIntensity: 0.5 })
            );
            screen.position.set(sx, deckY + 0.38, -blk.depth * 0.3);
            blockGroup.add(screen);
          });
          const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.06, 1.5, 8), champagneSteelMaterial);
          spire.position.y = totalHeight + 0.7;
          blockGroup.add(spire);
        }
      });

      // Delegates walking the atrium walkway & Block G entrance plaza
      const walkPaths = [
        { cx: -0.8, cz: -6.1 }, { cx: 0.8, cz: 0.15 },
        { cx: -0.8, cz: 6.3 }, { cx: 0.8, cz: -2.5 },
        { cx: 0, cz: 11.6 }, { cx: -1.5, cz: 3.0 }
      ];
      const peopleColors = [0x9cd2d6, 0xc5ac83, 0xff8888, 0xeeeeee, 0xd8b463];
      walkPaths.forEach((path, idx) => {
        const person = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 0.45, 8),
          new THREE.MeshStandardMaterial({ color: peopleColors[idx % peopleColors.length], roughness: 0.8 })
        );
        person.castShadow = true;
        person.position.set(path.cx, 0.22, path.cz);
        scene.add(person);
        (person as any).cx = path.cx;
        (person as any).cz = path.cz;
        (person as any).speed = 0.8 + idx * 0.15;
        (person as any).radius = 0.45 + (idx % 3) * 0.2;
        (person as any).seed = idx * 1.5;
        pedestrians.push(person);
      });

    } else {
      // ----------------------------------------------------
      // MODE B: VERTICAL TOWER MONOLITH EXPLORER
      // ----------------------------------------------------
      
      const levelIds = ["basement", "retail", "offices", "apartments", "rooftop"];

      levelIds.forEach((id) => {
        const group = new THREE.Group();
        scene.add(group);
        floorGroups[id] = group;

        let slabHeight = 0.45;
        let width = 5.5;
        let depth = 5.5;
        let glassHeight = 2.2;
        let material = travertineMaterial;

        if (id === "basement") {
          width = 6.2;
          depth = 6.2;
          slabHeight = 1.0;
          glassHeight = 1.5;
          material = basaltMaterial;
        } else if (id === "rooftop") {
          width = 5.0;
          depth = 5.0;
          slabHeight = 0.3;
          glassHeight = 1.8;
        }

        // 1. Concrete Floor Slab
        const slabGeo = new THREE.BoxGeometry(width, slabHeight, depth);
        const slab = new THREE.Mesh(slabGeo, material);
        slab.position.y = -slabHeight / 2;
        slab.castShadow = true;
        slab.receiveShadow = true;
        group.add(slab);

        // Gold decorative rim to outline clean structural cuts
        const rimGeo = new THREE.BoxGeometry(width + 0.04, 0.08, depth + 0.04);
        const rim = new THREE.Mesh(rimGeo, champagneSteelMaterial);
        rim.position.y = -slabHeight / 2;
        group.add(rim);

        // 2. Glass Facade Chamber
        if (id !== "basement") {
          const glassGeo = new THREE.BoxGeometry(width - 0.4, glassHeight, depth - 0.4);
          const glass = new THREE.Mesh(glassGeo, glassMaterial);
          glass.position.y = glassHeight / 2;
          group.add(glass);

          // Golden core core column inside
          const coreGeo = new THREE.CylinderGeometry(0.8, 0.8, glassHeight, 8);
          const coreMat = new THREE.MeshStandardMaterial({
            color: 0xe3c193,
            roughness: 0.3,
            emissive: 0x946e45,
            emissiveIntensity: 0.1
          });
          const core = new THREE.Mesh(coreGeo, coreMat);
          core.position.y = glassHeight / 2;
          group.add(core);
        }

        // 3. Champagne Metallic Pillars
        const columnHeight = glassHeight;
        const colGeo = new THREE.CylinderGeometry(0.08, 0.08, columnHeight, 8);

        const offsetW = width / 2 - 0.25;
        const offsetD = depth / 2 - 0.25;
        const colPositions = [
          [-offsetW, -offsetD],
          [offsetW, -offsetD],
          [-offsetW, offsetD],
          [offsetW, offsetD]
        ];

        colPositions.forEach(([x, z]) => {
          const pillar = new THREE.Mesh(colGeo, champagneSteelMaterial);
          pillar.position.set(x, columnHeight / 2, z);
          pillar.castShadow = true;
          pillar.receiveShadow = true;
          group.add(pillar);
        });

        // Cantilever Deck on Rooftop (Sky Cinema bistro setup representation)
        if (id === "rooftop") {
          const deckGeo = new THREE.BoxGeometry(2.0, 0.15, 3.5);
          const deck = new THREE.Mesh(deckGeo, travertineMaterial);
          deck.position.set(width / 2 - 0.2, -0.075, 0);
          deck.castShadow = true;
          group.add(deck);

          const railGeo = new THREE.BoxGeometry(0.04, 0.6, 3.5);
          const rail = new THREE.Mesh(railGeo, champagneSteelMaterial);
          rail.position.set(width / 2 + 0.8, 0.3, 0);
          group.add(rail);

          const screenGeo = new THREE.BoxGeometry(1.2, 1.4, 0.1);
          const screenMat = new THREE.MeshBasicMaterial({ color: 0x121110 });
          const screen = new THREE.Mesh(screenGeo, screenMat);
          screen.position.set(-width / 3, 0.7, -depth / 3);
          group.add(screen);
        }

        // Blueprints Edge geometry outline
        const edgeGeo = new THREE.EdgesGeometry(slabGeo);
        const wireLine = new THREE.LineSegments(
          edgeGeo,
          new THREE.LineBasicMaterial({ color: 0xe3c193, linewidth: 1 })
        );
        wireLine.position.y = -slabHeight / 2;
        group.add(wireLine);
        wireframes[id] = wireLine;
        wireLine.visible = showWireframe;
      });

      // Reflection plane for detailed tower structure
      const floorPlaneGeo = new THREE.PlaneGeometry(30, 30);
      const floorPlaneMat = new THREE.MeshStandardMaterial({
        color: isDark ? 0x080706 : 0xfcfbfa,
        roughness: 0.9,
      });
      const floorPlane = new THREE.Mesh(floorPlaneGeo, floorPlaneMat);
      floorPlane.rotation.x = -Math.PI / 2;
      floorPlane.position.y = -5.0;
      floorPlane.receiveShadow = true;
      scene.add(floorPlane);

      // Delicate golden grid
      const gridHelper = new THREE.GridHelper(24, 24, 0xe3c193, isDark ? 0x221f1c : 0xf2ece4);
      gridHelper.position.y = -4.95;
      scene.add(gridHelper);
    }

    floorGroupsRef.current = floorGroups;
    wireframesRef.current = wireframes;
    siteBlocksRef.current = siteBlocks;
    vehicleMeshesRef.current = vehicles;
    peopleMeshesRef.current = pedestrians;

    // 7. ANIMATION LOOP ENGINE
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Auto-rotation handling
      if (autoRotate && controlsRef.current) {
        controlsRef.current.autoRotate = true;
        controlsRef.current.autoRotateSpeed = 1.0;
      } else if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }

      const elapsed = clock.getElapsedTime();

      // Mode-specific simulations
      if (viewMode === "site") {
        // Vehicle movements along road
        vehicleMeshesRef.current.forEach((car) => {
          const c = car as any;
          car.position.x += c.speed * c.dir;
          // Loop cars around the road boundaries
          if (c.dir === 1 && car.position.x > 10) car.position.x = -10;
          if (c.dir === -1 && car.position.x < -10) car.position.x = 10;
        });

        // Pedestrians walking in orbit tracks around blocks
        peopleMeshesRef.current.forEach((person) => {
          const p = person as any;
          const angle = elapsed * p.speed * 0.4 + p.seed;
          person.position.x = p.cx + Math.sin(angle) * p.radius;
          person.position.z = p.cz + Math.cos(angle) * p.radius;
          // Add small bobbing height to simulate walking steps
          person.position.y = 0.22 + Math.abs(Math.sin(elapsed * p.speed * 3)) * 0.05;
        });
      } else {
        // Exploded levitation wave (only active when slider is closed)
        if (explodedScale === 0) {
          const levelIds = ["basement", "retail", "offices", "apartments", "rooftop"];
          levelIds.forEach((id, idx) => {
            const grp = floorGroups[id];
            if (grp) {
              const baseY = (levels.find(l => l.id === id)?.scaleFactor || 0) * 1.5;
              grp.position.y = baseY + Math.sin(elapsed + idx * 1.5) * 0.04;
            }
          });
        }
      }

      controls.update();
      composer.render();
    };

    animate();

    // 8. RESIZE EVENT LISTENER
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
      composerRef.current?.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Clean up WebGL session
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      composer.dispose();
      renderer.dispose();
    };
  }, [theme, autoRotate, viewMode, levels, blocks]);

  // Click handler on Three.js Canvas utilizing simple Raycasting selection for Blocks
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (viewMode !== "site" || !canvasRef.current || !cameraRef.current || !sceneRef.current) return;
    
    // Calculate normalized device coordinates
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);

    // Get list of meshes within site blocks
    const intersectableObjects: THREE.Object3D[] = [];
    blocks.forEach((blk) => {
      const grp = siteBlocksRef.current[blk.id];
      if (grp) {
        grp.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            intersectableObjects.push(child);
            // Link back to block ID
            (child as any).blockId = blk.id;
          }
        });
      }
    });

    const intersects = raycaster.intersectObjects(intersectableObjects);
    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object as any;
      if (clickedMesh.blockId) {
        setSelectedBlockId(clickedMesh.blockId);
      }
    }
  };

  const activeLevel = levels.find((l) => l.id === selectedLevelId) || levels[0];
  const activeLevelSpecs = lang === "ur" ? activeLevel.specsUr : activeLevel.specsEn;

  const activeBlock = blocks.find((b) => b.id === selectedBlockId) || blocks[blocks.length - 1];

  return (
    <div className="w-full space-y-8">
      
      {/* Dynamic View Header Toggles */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 border-b border-current/10 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-champagne uppercase tracking-[0.25em] font-bold block">
            {lang === "ur" ? "۰۲ / ۰۷ — انٹرایکٹو تعمیری جائزہ" : "02 / 07 — INTERACTIVE GEOSPATIAL SIMULATOR"}
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-light text-current">
            {viewMode === "site" 
              ? (lang === "ur" ? "تبریز ٹاؤن تھری ڈی ماسٹر پلان" : "The Tabraiz 30-Kanal Master Plan Site")
              : (lang === "ur" ? `${activeBlock.nameUr} کی تعمیری ڈرائنگز` : `${activeBlock.nameEn} Blueprint`)}
          </h2>
        </div>

        {/* Core Mode Toggles */}
        <div className="flex gap-2 font-mono text-xs self-start md:self-auto">
          <button
            onClick={() => setViewMode("site")}
            className={`px-4 py-2.5 border uppercase tracking-wider text-[10px] rounded transition-all duration-300 flex items-center space-x-2 cursor-pointer ${
              viewMode === "site"
                ? "bg-champagne border-champagne text-black font-semibold shadow-lg"
                : "border-current/10 hover:border-current/30 text-current/80"
            }`}
          >
            <Map size={12} />
            <span>{lang === "ur" ? "تھری ڈی ماسٹر پلان" : "Site Master Plan [3D]"}</span>
          </button>
          
          <button
            onClick={() => setViewMode("tower")}
            className={`px-4 py-2.5 border uppercase tracking-wider text-[10px] rounded transition-all duration-300 flex items-center space-x-2 cursor-pointer ${
              viewMode === "tower"
                ? "bg-champagne border-champagne text-black font-semibold shadow-lg"
                : "border-current/10 hover:border-current/30 text-current/80"
            }`}
          >
            <Layers size={12} />
            <span>{lang === "ur" ? "بلڈنگ ورٹیکل بلپرنٹ" : "Tower Blueprint Explorer"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Side HUD Information Panel */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
        
        {/* WebGL Canvas Component */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded border relative overflow-hidden min-h-[500px] lg:min-h-[580px] group shadow-2xl transition-all duration-700 bg-black/5 border-white/5">
          
          {/* Floating Quick Camera Controls Top-Right */}
          <div className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded border text-xs font-mono transition-all duration-300 flex items-center justify-center cursor-pointer ${
                autoRotate 
                  ? "bg-champagne border-champagne text-black" 
                  : "bg-black/60 border-white/10 hover:border-white/30 text-white/80"
              }`}
              title="Toggle Cinematic Spin"
            >
              <RefreshCw size={14} className={autoRotate ? "animate-spin-slow" : ""} />
            </button>
            
            <button
              onClick={() => setShowWireframe(!showWireframe)}
              className={`p-2 rounded border text-xs font-mono transition-all duration-300 flex items-center justify-center cursor-pointer ${
                showWireframe 
                  ? "bg-emerald-600 border-emerald-600 text-white" 
                  : "bg-black/60 border-white/10 hover:border-white/30 text-white/80"
              }`}
              title="Toggle Blueprint Wireframe"
            >
              <Layers size={14} />
            </button>
          </div>

          {/* Interactive 3D Canvas wrapper */}
          <div ref={containerRef} className="w-full flex-1 relative bg-transparent">
            <canvas 
              ref={canvasRef} 
              onClick={handleCanvasClick}
              className="w-full h-full block cursor-grab active:cursor-grabbing" 
            />
            
            {/* Contextual Floating Helper HUD Overlay on canvas */}
            <div className="absolute bottom-6 left-6 z-20 font-mono bg-black/85 border border-white/10 p-4 rounded shadow-2xl space-y-1 select-none pointer-events-none max-w-xs text-white">
              <span className="text-[8px] text-white/50 block tracking-widest uppercase">
                {viewMode === "site" ? "RAYCASTING SECTOR ACQUIRED" : "EXPLODED VERTICAL AXIS"}
              </span>
              <span className="text-xs text-champagne font-serif block font-semibold uppercase tracking-wide">
                {viewMode === "site" ? activeBlock.nameEn : activeLevel.nameEn}
              </span>
              {viewMode === "site" && (
                <span className="text-[9px] text-white/60 block leading-tight font-sans">
                  * Click on any tower block directly in the scene to inspect its layout.
                </span>
              )}
            </div>
          </div>

          {/* Canvas Bottom Panel with Presets and Exploded sliders */}
          <div className="p-4 md:p-6 border-t border-white/5 bg-black/45 backdrop-blur-md relative z-20 flex flex-col md:flex-row gap-4 items-center justify-between">
            
            {/* Camera presets */}
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: "perspective", label: "Perspective" },
                { id: "front", label: "Elevation View" },
                { id: "top", label: "Map Overview" },
                { id: "close", label: "Close Up" }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setViewPreset(p.id as any)}
                  className={`px-2.5 py-1 text-[9px] uppercase tracking-wider font-mono rounded border cursor-pointer transition-all duration-300 whitespace-nowrap ${
                    viewPreset === p.id
                      ? "bg-champagne border-champagne text-black font-semibold"
                      : "border-white/10 bg-black/40 text-white/80 hover:border-white/30"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Exploded slider (Only available in Tower view mode) */}
            {viewMode === "tower" ? (
              <div className="flex items-center space-x-3 w-full md:w-64">
                <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest whitespace-nowrap">
                  {lang === "ur" ? "ڈیک علیحدگی:" : "EXPLODE FLOORS:"}
                </span>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={explodedScale}
                  onChange={(e) => setExplodedScale(parseFloat(e.target.value))}
                  className="flex-1 accent-champagne h-1 rounded bg-white/10 cursor-pointer focus:outline-none"
                />
                <span className="text-[10px] font-mono text-champagne font-bold w-12 text-right">
                  {(explodedScale * 100).toFixed(0)}%
                </span>
              </div>
            ) : (
              <div className="text-[9px] font-mono text-white/40 flex items-center space-x-2">
                <RoadIcon className="text-champagne animate-spin-slow" size={10} />
                <span>SIMULATION ACTIVE // STREETLIGHTS: 18+ // MOVING VEHICLES: 4</span>
              </div>
            )}
          </div>

        </div>

        {/* Side HUD Panel containing precise block metrics */}
        <div className={`lg:col-span-5 p-6 md:p-8 rounded border flex flex-col justify-between text-left transition-all duration-700 relative z-10 shadow-2xl ${
          theme === "graphite"
            ? "glass-panel-dark text-ivory border-white/5"
            : "glass-panel-light text-graphite border-graphite/5"
        }`}>
          
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-champagne uppercase tracking-[0.2em] block font-bold">
                {viewMode === "site" 
                  ? (lang === "ur" ? "۰۲ / ۳۰-کنال ماسٹر الائنس" : "TABRAIZ TOWN SITE CORES")
                  : (lang === "ur" ? "بلاک تعمیری ڈیٹا شیٹ" : "TOWER BLUEPRINT SEGMENTS")}
              </span>
              <h3 className="text-xl md:text-2xl font-serif font-light text-current leading-tight">
                {viewMode === "site" 
                  ? (lang === "ur" ? "ٹاؤن ماسٹر پلان کی تفصیلات" : "The Architectural Blueprint Matrix")
                  : (lang === "ur" ? `${activeBlock.nameUr} کی منزلیں` : `${activeBlock.nameEn} Levels`)}
              </h3>
            </div>

            {/* BLOCK SELECTION GRID (Visible in Site Plan layout) */}
            {viewMode === "site" ? (
              <div className="space-y-4">
                <p className="text-xs opacity-80 leading-relaxed font-light font-sans">
                  {lang === "ur"
                    ? "تبریز ٹاؤن رحیم یار خان کا ۳۰ کنال وسیع رقبہ ۷ شاندار سیکیورٹی بلاکس پر مشتمل ہے۔ کسی بھی ٹاور پر کلک کر کے اس کی تعمیری شیٹ دیکھیں۔"
                    : "The Tabraiz 30-Kanal Master Estate comprises 7 sovereign, high-density monolith towers. Select any block in the matrix below to review its details."}
                </p>

                {/* Grid list of blocks */}
                <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-1">
                  {blocks.map((blk) => {
                    const isSelected = selectedBlockId === blk.id;
                    return (
                      <button
                        key={blk.id}
                        onClick={() => setSelectedBlockId(blk.id)}
                        className={`w-full p-3 rounded border text-left flex justify-between items-center transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "bg-champagne border-champagne text-black font-semibold"
                            : "border-current/10 bg-transparent text-current/85 hover:border-current/25"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-black" : "bg-champagne"}`}></span>
                          <span className="text-xs font-serif font-light">
                            {lang === "ur" ? blk.nameUr : blk.nameEn}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] opacity-70">
                          {lang === "ur" ? blk.scaleUr : blk.scaleEn}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Inspect Blueprint quick link */}
                <button
                  onClick={() => setViewMode("tower")}
                  className="w-full text-center text-xs uppercase tracking-widest font-mono text-champagne hover:text-sand transition-all duration-300 border border-champagne/40 bg-champagne/10 hover:bg-champagne/20 py-3 rounded flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Layers size={12} />
                  <span>{lang === "ur" ? "ٹاور تعمیری نقشہ جات کھولیں" : "Inspect Tower Vertical Blueprint"}</span>
                </button>
              </div>
            ) : (
              /* VERTICAL TOWER FLOOR PLATES (Visible in Blueprint Explorer view) */
              <div className="space-y-4">
                {/* Active Block indicator */}
                <div className="p-3 rounded border border-current/10 bg-current/5 flex justify-between items-center text-xs font-mono">
                  <span className="opacity-75">{lang === "ur" ? "منتخب بلاک:" : "Inspecting Block:"}</span>
                  <span className="text-champagne font-bold uppercase">{lang === "ur" ? activeBlock.nameUr : activeBlock.nameEn}</span>
                </div>

                {/* Floor buttons */}
                <div className="grid grid-cols-1 gap-1.5">
                  {levels.map((lvl) => {
                    const isSelected = selectedLevelId === lvl.id;
                    const isHovered = hoveredLevelId === lvl.id;
                    const displayName = lang === "ur" ? lvl.nameUr : lvl.nameEn;
                    return (
                      <button
                        key={lvl.id}
                        onClick={() => setSelectedLevelId(lvl.id)}
                        onMouseEnter={() => setHoveredLevelId(lvl.id)}
                        onMouseLeave={() => setHoveredLevelId(null)}
                        className={`w-full p-3 text-left rounded border flex items-center justify-between transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "bg-champagne border-champagne text-black font-semibold"
                            : isHovered
                            ? "border-champagne/40 bg-white/5 text-current"
                            : "border-current/10 bg-transparent text-current/80 hover:border-current/25"
                        }`}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          <span className="p-1 rounded bg-current/5 flex-shrink-0">
                            {lvl.icon}
                          </span>
                          <span className="text-xs font-serif truncate font-light">
                            {displayName}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] opacity-70 flex-shrink-0">
                          {lvl.elevation}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* LOWER SPEC SHEET SECTION */}
          <div className="mt-8 pt-6 border-t border-current/15 space-y-6">
            
            {viewMode === "site" ? (
              /* Site-wide spec sheet details */
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-champagne font-bold">
                    {lang === "ur" ? "ٹاؤن کی خصوصیات:" : "BLOCK SPECIFICATIONS"}
                  </span>
                  <span className="text-[9px] font-mono text-champagne uppercase tracking-widest bg-champagne/10 px-2 py-0.5 rounded">
                    {activeBlock.id} CORE
                  </span>
                </div>
                <h4 className="text-lg font-serif font-light text-current">
                  {lang === "ur" ? activeBlock.nameUr : activeBlock.nameEn}
                </h4>

                <div className="grid grid-cols-1 gap-4 font-sans text-xs font-light leading-relaxed">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-champagne block uppercase tracking-wider">
                      {lang === "ur" ? "تعمیراتی خصوصیات اور گنجائش" : "CONSTRUCTION SCALE & CAPABILITY"}
                    </span>
                    <p className="opacity-85">{lang === "ur" ? activeBlock.useUr : activeBlock.useEn}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-current/5 pt-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-champagne block uppercase tracking-wider">
                        {lang === "ur" ? "کل احاطہ شدہ رقبہ" : "COVERED AREA"}
                      </span>
                      <p className="opacity-80 text-[11px] font-mono">{activeBlock.coveredArea}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-champagne block uppercase tracking-wider">
                        {lang === "ur" ? "منزلیں اور پیمانہ" : "BUILDING HEIGHT SCALE"}
                      </span>
                      <p className="opacity-80 text-[11px]">{lang === "ur" ? activeBlock.scaleUr : activeBlock.scaleEn}</p>
                    </div>
                  </div>

                  {/* Interactive Walkthrough Action */}
                  <div className="pt-2">
                    <button
                      onClick={() => setIsWalkthroughOpen(true)}
                      className="w-full bg-champagne hover:bg-[#FDFBF7] text-black text-xs font-mono uppercase tracking-[0.15em] font-semibold py-3.5 px-4 rounded transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-champagne/10 cursor-pointer hover:translate-y-[-1px]"
                    >
                      <Eye size={13} className="animate-pulse text-black" />
                      <span>{lang === "ur" ? "اندرونی نقشہ اور ۳۶۰° ورچوئل معائنہ" : "Launch Floor Plans & 360° Walkthrough"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Specific Tower level specs */
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-champagne font-bold">
                    {lang === "ur" ? "منزل کی تعمیری تفصیل:" : "ACTIVE BLUEPRINT LEVEL SPEC"}
                  </span>
                  <span className="text-[9px] font-mono text-champagne uppercase tracking-widest bg-champagne/10 px-2 py-0.5 rounded">
                    {activeLevel.elevation}
                  </span>
                </div>
                <h4 className="text-lg font-serif font-light text-current">
                  {lang === "ur" ? activeLevel.nameUr : activeLevel.nameEn}
                </h4>

                <div className="grid grid-cols-1 gap-4 font-sans text-xs font-light leading-relaxed">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-champagne block uppercase tracking-wider">
                      {lang === "ur" ? "فنکشنل استعمال" : "FUNCTIONAL PROGRAMMING"}
                    </span>
                    <p className="opacity-85">{activeLevelSpecs.use}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-current/5 pt-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-champagne block uppercase tracking-wider">
                        {lang === "ur" ? "ایٹریئم / نقشہ" : "ATRIUM DESIGN"}
                      </span>
                      <p className="opacity-80 text-[11px] leading-tight">{activeLevelSpecs.atrium}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-champagne block uppercase tracking-wider">
                        {lang === "ur" ? "لفٹ اور رسائی" : "ACCESS LOGISTICS"}
                      </span>
                      <p className="opacity-80 text-[11px] leading-tight">{activeLevelSpecs.lift}</p>
                    </div>
                  </div>

                  {/* Interactive Walkthrough Action */}
                  <div className="pt-2">
                    <button
                      onClick={() => setIsWalkthroughOpen(true)}
                      className="w-full bg-champagne hover:bg-[#FDFBF7] text-black text-xs font-mono uppercase tracking-[0.15em] font-semibold py-3.5 px-4 rounded transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-champagne/10 cursor-pointer hover:translate-y-[-1px]"
                    >
                      <Eye size={13} className="animate-pulse text-black" />
                      <span>{lang === "ur" ? "اندرونی نقشہ اور ۳۶۰° ورچوئل معائنہ" : "Launch Floor Plans & 360° Walkthrough"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Institutional Integrity Banner */}
            <div className={`p-4 rounded border flex items-center space-x-3 ${
              theme === "graphite" ? "bg-black/40 border-white/5 text-ivory/90" : "bg-white/80 border-graphite/5 text-graphite/90"
            }`}>
              <Shield className="text-champagne flex-shrink-0" size={20} />
              <p className="text-[10px] font-mono uppercase tracking-wide leading-tight opacity-80">
                {lang === "ur" 
                  ? "ہر بلاک کا رقبہ اور ریکارڈ حارث گلوبل وینچرز کے قانون کے تحت ۱۰۰٪ محفوظ ہے۔" 
                  : "All land parcels and site blocks are legally underwritten by Harvic Global Ventures' protocols."}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Interactive Floor Plan & 360 Virtual Walkthrough Portal */}
      <FloorPlanWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
        blockId={activeBlock.id}
        blockName={lang === "ur" ? activeBlock.nameUr : activeBlock.nameEn}
        theme={theme}
        lang={lang}
      />

    </div>
  );
}
