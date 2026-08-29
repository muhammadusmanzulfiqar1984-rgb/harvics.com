import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Compass,
  Move,
  Info,
  Layers,
  Sparkles,
  Eye,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
  Building,
  CheckCircle,
  Tv,
  Users,
  Briefcase,
  Home,
  ShoppingBag,
  Film,
  Wind
} from "lucide-react";

interface FloorPlanWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  blockId: string;
  blockName: string;
  theme: "graphite" | "ivory";
  lang: "en" | "ur" | "ar" | "zh" | "es" | "sk";
}

// Unit details interface
interface UnitSpec {
  name: string;
  nameUr: string;
  dimensions: string;
  beds: number | string;
  baths: number | string;
  featuresEn: string[];
  featuresUr: string[];
  status: "Available" | "Reserved" | "Underwriting";
}

// Hotspot for the 360 walkthrough
interface WalkthroughHotspot {
  id: string;
  name: string;
  nameUr: string;
  x: number; // Percent on floor plan
  y: number; // Percent on floor plan
  threeColor: number; // Dominant tone for 360 scene
  roomType: "living" | "bedroom" | "balcony" | "lobby" | "cinema" | "boardroom" | "bistro";
}

interface LevelDetails {
  id: string;
  nameEn: string;
  nameUr: string;
  elevation: string;
  units: UnitSpec[];
  hotspots: WalkthroughHotspot[];
}

export default function FloorPlanWalkthroughModal({
  isOpen,
  onClose,
  blockId,
  blockName,
  theme,
  lang
}: FloorPlanWalkthroughModalProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active level state inside the block
  const [activeLevelId, setActiveLevelId] = useState<string>("apartments");
  const [activeHotspotId, setActiveHotspotId] = useState<string>("living");
  const [isFullscreenWalkthrough, setIsFullscreenWalkthrough] = useState<boolean>(false);
  const [isWalkthroughLoading, setIsWalkthroughLoading] = useState<boolean>(false);

  // Orbit state notification
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Levels list inside the selected block
  const blockLevels = useMemo<LevelDetails[]>(() => {
    return [
      {
        id: "rooftop",
        nameEn: "Rooftop: Cinema & Sky Bistro",
        nameUr: "چھت: فلک بوس سینما اور بسٹرو",
        elevation: "+22.5m Level",
        units: [
          {
            name: "The Sky-Desert Cinema Lounge",
            nameUr: "آسمانی صحرائی لگژری سینما لاؤنج",
            dimensions: "4,200 Sq.ft",
            beds: "Dolby 7.2",
            baths: "VIP Restrooms",
            featuresEn: ["Dual laser projection", "Deep acoustic insulation", "Fully motorized leather recliners"],
            featuresUr: ["دوہرا لیزر پروجیکٹر", "مکمل موصلی صوتی دیواریں", "خودکار آرام دہ چمڑے کی نشستیں"],
            status: "Reserved"
          },
          {
            name: "Sovereign Fine Dining Bistro",
            nameUr: "رائل فائن ڈائننگ ریسٹورنٹ",
            dimensions: "5,800 Sq.ft",
            beds: "120 Seats",
            baths: "Central Kitchen",
            featuresEn: ["360° Desert horizons", "Private dining alcoves", "Travertine thermal shielding"],
            featuresUr: ["صحرا کا پینورامک نظارہ", "نجی کھانے کے کیبن", "ٹراورٹائن بیرونی موصلیت"],
            status: "Available"
          }
        ],
        hotspots: [
          { id: "cinema", name: "Dolby Screening Deck", nameUr: "ڈولبی اسکریننگ ہال", x: 30, y: 40, threeColor: 0x12141c, roomType: "cinema" },
          { id: "bistro", name: "Sky Bistro Dining Area", nameUr: "اسکائی بسٹرو فائن ڈائننگ", x: 70, y: 55, threeColor: 0x30241b, roomType: "bistro" },
          { id: "balcony", name: "Cantenilever Desert Overlook", nameUr: "معلق آؤٹ ڈور ٹیرس", x: 50, y: 85, threeColor: 0x50453a, roomType: "balcony" }
        ]
      },
      {
        id: "apartments",
        nameEn: "Levels 04 & 05: Sovereign Apartments",
        nameUr: "لیولز ۰۴ اور ۰۵: شاہی رہائشی سوئٹس",
        elevation: "+15.0m to +19.5m",
        units: [
          {
            name: "Diplomatic Suite 401 (Duplex)",
            nameUr: "ڈپلومیٹک سوئٹ ۴۰۱ (ڈوپلیکس)",
            dimensions: "2,850 Sq.ft",
            beds: 3,
            baths: 4,
            featuresEn: ["Double-height reception", "Sufi water-fountain terrace", "Private security vault"],
            featuresUr: ["ڈبل ہائٹ استقبالیہ لاؤنج", "پانی کے فوارے والا نجی ٹیرس", "نجی سیکیورٹی والٹ"],
            status: "Available"
          },
          {
            name: "Presidential Suite 402",
            nameUr: "صدارتی فیملی سوئٹ ۴۰۲",
            dimensions: "3,200 Sq.ft",
            beds: 4,
            baths: 5,
            featuresEn: ["Ventilated Travertine balcony", "Acoustically isolated bedrooms", "Italian white marble bath"],
            featuresUr: ["ہوا دار سنگِ تراورٹائن بالکونی", "آواز سے محفوظ بیڈ رومز", "اطالوی ماربل کا باتھ روم"],
            status: "Underwriting"
          }
        ],
        hotspots: [
          { id: "living", name: "Grand Living Vault", nameUr: "شاندار فیملی لاؤنج", x: 25, y: 35, threeColor: 0x221c16, roomType: "living" },
          { id: "bedroom", name: "VIP Master Sanctuary", nameUr: "ماسٹر بیڈ روم سینکچوری", x: 75, y: 40, threeColor: 0x1e2422, roomType: "bedroom" },
          { id: "balcony", name: "Travertine Garden Balcony", nameUr: "ٹراورٹائن گارڈن بالکونی", x: 50, y: 80, threeColor: 0x48423a, roomType: "balcony" }
        ]
      },
      {
        id: "offices",
        nameEn: "Level 03: Executive Corporate Plates",
        nameUr: "لیول ۰۳: کارپوریٹ ایگزیکٹو دفاتر",
        elevation: "+11.0m Level",
        units: [
          {
            name: "Agricultural Sovereign Trust Vault",
            nameUr: "زرعی فنڈز کارپوریٹ ہیڈ کوارٹر",
            dimensions: "4,500 Sq.ft",
            beds: "24 Exec Seats",
            baths: "3 Executive Baths",
            featuresEn: ["Encrypted fiber server vault", "Private boardroom", "Direct biometric lift portal"],
            featuresUr: ["محفوظ ترین انکرپٹڈ سرور روم", "وی آئی پی بورڈ روم", "بایومیٹرک رسائی والی لفٹ"],
            status: "Reserved"
          },
          {
            name: "Family Trust Investment Suite",
            nameUr: "فیملی ٹرسٹ انوسٹمنٹ سوئٹ",
            dimensions: "3,150 Sq.ft",
            beds: "15 Desk Capacity",
            baths: "2 Executive Baths",
            featuresEn: ["Double glazing acoustic shield", "Integrated espresso bar", "Secure briefing chamber"],
            featuresUr: ["ڈبل شیشے کی صوتی موصلیت", "انٹیگریٹڈ کافی بار لاؤنج", "محفوظ بریفنگ ہال"],
            status: "Available"
          }
        ],
        hotspots: [
          { id: "boardroom", name: "Elite Boardroom Suite", nameUr: "صدارتی بورڈ روم", x: 35, y: 45, threeColor: 0x181a20, roomType: "boardroom" },
          { id: "lobby", name: "Executive Reception Lobby", nameUr: "کارپوریٹ استقبالیہ لابی", x: 65, y: 35, threeColor: 0x22242a, roomType: "lobby" },
          { id: "balcony", name: "North-South Sky Terrace", nameUr: "شمال جنوب اسکائی ٹیرس", x: 50, y: 85, threeColor: 0x3d3a35, roomType: "balcony" }
        ]
      },
      {
        id: "retail",
        nameEn: "Ground & Level 02: Atrium Retail",
        nameUr: "گراؤنڈ اور لیول ۰۲: ایٹریئم ریٹیل",
        elevation: "Ground Level",
        units: [
          {
            name: "Anchor Luxury Boutique 101",
            nameUr: "مرکزی لگژری بوتیک ۱۰۱",
            dimensions: "1,850 Sq.ft",
            beds: "Double Frontage",
            baths: "Shared Core",
            featuresEn: ["9m high glass storefront", "Polished travertine column backdrop", "Direct parking access"],
            featuresUr: ["۹ میٹر اونچا شیشے کا ڈسپلے", "پالش شدہ ٹراورٹائن ستون", "براہ راست پارکنگ رسائی"],
            status: "Reserved"
          },
          {
            name: "Sovereign Jewelry Salon 102",
            nameUr: "شاہی زیورات اور قیمتی برانڈز شوروم",
            dimensions: "1,450 Sq.ft",
            beds: "Atrium Corner",
            baths: "Shared Core",
            featuresEn: ["Bulletproof armored glass casings", "Private VIP consultation vault", "Biometric secure registry"],
            featuresUr: ["بولیٹ پروف شیشے کے کیبن", "وی آئی پی مشاورت کا نجی والٹ", "بایومیٹرک والٹ سیکیورٹی"],
            status: "Available"
          }
        ],
        hotspots: [
          { id: "lobby", name: "Central Sufi Water Atrium", nameUr: "مرکزی صوفی واٹر ایٹریئم", x: 50, y: 50, threeColor: 0x1d2a2c, roomType: "lobby" },
          { id: "bistro", name: "Atrium Promenade Culinary Hub", nameUr: "ایٹریئم پرومیناڈ کیفے", x: 25, y: 70, threeColor: 0x352b22, roomType: "bistro" }
        ]
      }
    ];
  }, []);

  const activeLevel = useMemo(() => {
    return blockLevels.find((l) => l.id === activeLevelId) || blockLevels[0];
  }, [blockLevels, activeLevelId]);

  const activeHotspot = useMemo(() => {
    return activeLevel.hotspots.find((h) => h.id === activeHotspotId) || activeLevel.hotspots[0];
  }, [activeLevel, activeHotspotId]);

  // Adjust default hotspot when level changes
  useEffect(() => {
    if (activeLevel) {
      setActiveHotspotId(activeLevel.hotspots[0].id);
    }
  }, [activeLevelId, activeLevel]);

  // Live Three.js 360-degree Interactive Interior Walkthrough Renderer
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !mountRef.current) return;

    setIsWalkthroughLoading(true);

    // 1. SETUP THREE.JS SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(activeHotspot.threeColor);
    // Add subtle ambient fog to look ultra-luxurious
    scene.fog = new THREE.FogExp2(activeHotspot.threeColor, 0.04);

    // 2. CAMERA SETUP (Inside the room looking out)
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 100);
    camera.position.set(0, 0, 0.1); // Placed in the exact center of the room

    // 3. RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. ORBIT CONTROLS (Enables dragging around to see 360 degrees)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 0.01;
    controls.maxDistance = 2;
    controls.enablePan = false; // Prevent user from moving outside center
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = -0.35; // Reverse rotate to drag naturally (feels like you're looking around)

    // Log user interaction to hide pointer help banner
    const handleInteract = () => setHasInteracted(true);
    renderer.domElement.addEventListener("pointerdown", handleInteract);

    // 5. IMMERSIVE LIGHTING
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.2);
    scene.add(ambientLight);

    // Luxury Warm Chandelier Spot Light
    const ceilingLight = new THREE.PointLight(0xffdf9e, 3.5, 15);
    ceilingLight.position.set(0, 4, 0);
    scene.add(ceilingLight);

    // Soft daylight stream coming from the panoramic windows
    const windowLight = new THREE.DirectionalLight(0xe8d2b0, 1.8);
    windowLight.position.set(8, 1, -5);
    scene.add(windowLight);

    // 6. BUILD HIGH-FIDELITY LUXURY INTERIOR ROOM (Box representing 360 space)
    // We construct a gorgeous virtual chamber with Travertine pillars, dark walnut ceiling, large windows looking out to Desert/Atrium
    const roomSize = 12;
    const roomGeo = new THREE.BoxGeometry(roomSize, 8, roomSize);
    
    // Custom shader or standard materials for each face of the cube
    // Faces: Right (0), Left (1), Top (2), Bottom (3), Front (4), Back (5)
    const travertineTexColor = activeLevelId === "retail" ? 0xeadac5 : 0xf4eae0;
    
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: travertineTexColor,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.BackSide // Render on the inside of the box!
    });

    const woodCeilingMat = new THREE.MeshStandardMaterial({
      color: 0x2c221a, // Rich Walnut wood ceiling
      roughness: 0.3,
      metalness: 0.2,
      side: THREE.BackSide
    });

    const floorMat = new THREE.MeshStandardMaterial({
      color: activeLevelId === "retail" ? 0xcfbc9e : 0xece3d5, // Terrazzo/Italian marble
      roughness: 0.15,
      metalness: 0.4,
      side: THREE.BackSide
    });

    // Materials array
    const roomMaterials = [
      wallMaterial, // Right Wall
      wallMaterial, // Left Wall
      woodCeilingMat, // Ceiling
      floorMat, // Floor
      wallMaterial, // Front Wall
      wallMaterial, // Back Wall
    ];

    const roomMesh = new THREE.Mesh(roomGeo, roomMaterials);
    scene.add(roomMesh);

    // Add luxury architectural pillars (Travertine & Gold) in corners
    const pillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 8, 16);
    const goldCapGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.2, 16);
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xc5ac83, metalness: 0.85, roughness: 0.15 });
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xdfd3c3, roughness: 0.65 });

    const pillarCoords = [
      { x: -5.5, z: -5.5 },
      { x: 5.5, z: -5.5 },
      { x: -5.5, z: 5.5 },
      { x: 5.5, z: 5.5 }
    ];

    pillarCoords.forEach((coord) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(coord.x, 0, coord.z);
      scene.add(pGroup);

      const column = new THREE.Mesh(pillarGeo, pillarMat);
      pGroup.add(column);

      // Gold base and capital decoration
      const capTop = new THREE.Mesh(goldCapGeo, goldMat);
      capTop.position.y = 3.9;
      pGroup.add(capTop);

      const capBottom = new THREE.Mesh(goldCapGeo, goldMat);
      capBottom.position.y = -3.9;
      pGroup.add(capBottom);
    });

    // 7. PANORAMIC WINDOW FRAME WITH DESERT/SKY VIEW OUTSIDE
    // We represent a vast sliding window and an external high-contrast environment plane
    const windowFrameGeo = new THREE.BoxGeometry(0.1, 5, 8);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1c1b1a, metalness: 0.9, roughness: 0.1 });
    const windowFrame = new THREE.Mesh(windowFrameGeo, frameMat);
    windowFrame.position.set(5.9, -0.5, 0);
    scene.add(windowFrame);

    // Window glass panes
    const windowGlassGeo = new THREE.BoxGeometry(0.02, 4.8, 3.8);
    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0x8abac5,
      transparent: true,
      opacity: 0.2,
      roughness: 0.1,
      metalness: 0.95
    });
    const pane1 = new THREE.Mesh(windowGlassGeo, windowGlassMat);
    pane1.position.set(5.88, -0.5, -1.9);
    scene.add(pane1);

    const pane2 = new THREE.Mesh(windowGlassGeo, windowGlassMat);
    pane2.position.set(5.86, -0.5, 1.9);
    scene.add(pane2);

    // 8. ADD COZY HIGH-END FURNITURE SETS DEPENDING ON ROOM TYPE
    const furnitureGroup = new THREE.Group();
    scene.add(furnitureGroup);

    const buildFurniture = () => {
      if (activeHotspot.roomType === "living" || activeHotspot.roomType === "bistro") {
        // Luxury Sofa Seat
        const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 4.2), new THREE.MeshStandardMaterial({ color: 0x3d352e, roughness: 0.8 }));
        sofaBase.position.set(-2.5, -3.5, 0);
        furnitureGroup.add(sofaBase);

        const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 4.2), new THREE.MeshStandardMaterial({ color: 0x3d352e, roughness: 0.8 }));
        sofaBack.position.set(-3.4, -3.1, 0);
        furnitureGroup.add(sofaBack);

        // Solid Travertine Coffee Table
        const tableBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.6, 24), new THREE.MeshStandardMaterial({ color: 0xeadac5, roughness: 0.4 }));
        tableBase.position.set(0, -3.5, 0);
        furnitureGroup.add(tableBase);

        // Glowing Table Lamp
        const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8), goldMat);
        lampPole.position.set(0, -2.8, 0);
        furnitureGroup.add(lampPole);

        const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 0.4, 16), new THREE.MeshBasicMaterial({ color: 0xffe2ab }));
        lampShade.position.set(0, -2.2, 0);
        furnitureGroup.add(lampShade);

        // Elegant Modern Painting Frame on wall
        const frame = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.5, 3.5), goldMat);
        frame.position.set(-5.9, 1.2, 0);
        furnitureGroup.add(frame);

        const canvasPaint = new THREE.Mesh(new THREE.BoxGeometry(0.02, 2.3, 3.3), new THREE.MeshBasicMaterial({ color: activeHotspot.threeColor }));
        canvasPaint.position.set(-5.84, 1.2, 0);
        furnitureGroup.add(canvasPaint);

      } else if (activeHotspot.roomType === "bedroom") {
        // King-Size Royal Bed
        const bedBase = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.6, 4.0), new THREE.MeshStandardMaterial({ color: 0x1e1b19, roughness: 0.9 }));
        bedBase.position.set(-1.8, -3.5, 0);
        furnitureGroup.add(bedBase);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.5, 3.8), new THREE.MeshStandardMaterial({ color: 0xfdfdfd, roughness: 0.75 }));
        mattress.position.set(-1.7, -3.0, 0);
        furnitureGroup.add(mattress);

        const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.8, 4.0), new THREE.MeshStandardMaterial({ color: 0xc5ac83, roughness: 0.4 }));
        headboard.position.set(-3.4, -2.4, 0);
        furnitureGroup.add(headboard);

        // Side tables
        const sideTableLeft = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), wallMaterial);
        sideTableLeft.position.set(-2.8, -3.4, -2.2);
        furnitureGroup.add(sideTableLeft);

        const sideTableRight = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), wallMaterial);
        sideTableRight.position.set(-2.8, -3.4, 2.2);
        furnitureGroup.add(sideTableRight);

      } else if (activeHotspot.roomType === "boardroom") {
        // Massive Walnut Conference Table
        const conferenceTable = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.15, 6.5), new THREE.MeshStandardMaterial({ color: 0x1d1511, roughness: 0.25, metalness: 0.1 }));
        conferenceTable.position.set(0, -2.6, 0);
        furnitureGroup.add(conferenceTable);

        // Solid gold pillar legs
        const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8), goldMat);
        leg1.position.set(0, -3.2, -2.2);
        furnitureGroup.add(leg1);

        const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8), goldMat);
        leg2.position.set(0, -3.2, 2.2);
        furnitureGroup.add(leg2);

        // Modern glowing neon grid ceiling pendant
        const pendantGeo = new THREE.BoxGeometry(1.4, 0.05, 5.0);
        const pendant = new THREE.Mesh(pendantGeo, goldMat);
        pendant.position.set(0, 3.2, 0);
        furnitureGroup.add(pendant);

        const lightTubes = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.02, 4.8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        lightTubes.position.set(0, 3.16, 0);
        furnitureGroup.add(lightTubes);

      } else if (activeHotspot.roomType === "cinema") {
        // Motorized Theater Recliners
        const leatherMat = new THREE.MeshStandardMaterial({ color: 0x0c0d10, roughness: 0.9 });
        for (let r = -2; r <= 2; r += 2) {
          const recliner = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 1.0), leatherMat);
          recliner.position.set(-1.5, -3.3, r);
          furnitureGroup.add(recliner);

          const back = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.4, 1.0), leatherMat);
          back.position.set(-2.0, -2.9, r);
          furnitureGroup.add(back);
        }

        // Giant acoustic projection screen board
        const screenBorder = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4.4, 8.5), goldMat);
        screenBorder.position.set(5.85, 0, 0);
        furnitureGroup.add(screenBorder);

        const screenSheet = new THREE.Mesh(new THREE.BoxGeometry(0.05, 4.1, 8.2), new THREE.MeshBasicMaterial({ color: 0xffffff }));
        screenSheet.position.set(5.9, 0, 0);
        furnitureGroup.add(screenSheet);
      }
    };

    buildFurniture();

    // 9. ANIMATED CAM DRIFT EFFECT
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth physics updates
      controls.update();

      // Idle camera cinematic rotation if the user has not clicked/dragged yet
      if (!hasInteracted) {
        const elapsedTime = clock.getElapsedTime();
        camera.rotation.y = Math.sin(elapsedTime * 0.05) * 0.25;
        camera.rotation.x = Math.sin(elapsedTime * 0.03) * 0.08;
      }

      renderer.render(scene, camera);
    };

    // Run loader timeout for polished look
    const timer = setTimeout(() => {
      setIsWalkthroughLoading(false);
      animate();
    }, 450);

    // 10. RESIZE OBSERVER
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(mountRef.current);

    // CLEANUP ACTIONS
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      renderer.domElement.removeEventListener("pointerdown", handleInteract);
      controls.dispose();
    };
  }, [isOpen, activeLevelId, activeHotspotId, activeHotspot, hasInteracted]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-[#090807]/90 backdrop-blur-md overflow-y-auto">
          
          {/* Modal Card Backdrop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full max-w-6xl rounded border shadow-2xl overflow-hidden flex flex-col md:h-[86vh] ${
              theme === "graphite"
                ? "bg-[#11100F] text-ivory border-white/10"
                : "bg-[#FAF7F2] text-graphite border-graphite/15"
            }`}
          >
            
            {/* Header section with coordinates */}
            <div className="p-4 md:p-6 border-b border-current/10 flex justify-between items-center bg-black/10">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-champagne text-black text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded tracking-widest">
                    Block {blockId} Blueprint
                  </span>
                  <div className="hidden sm:flex items-center space-x-1.5 font-mono text-[9px] opacity-50 uppercase tracking-widest">
                    <span>●</span>
                    <span>360° LiDAR Scanned</span>
                  </div>
                </div>
                <h2 className="text-lg md:text-xl font-serif font-light leading-tight">
                  {lang === "ur" ? `${blockName} - اندرونی معائنہ اور نقشہ جات` : `${blockName} Architectural Blueprint & Virtual Walkthrough`}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-full hover:bg-current/5 transition-all duration-300 cursor-pointer text-current/70 hover:text-current"
                title="Close Portal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Split Grid View layout */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden h-full items-stretch">
              
              {/* Left HUD Panel: Level Selectors & Specific Unit Metrics */}
              <div className="md:col-span-4 p-5 border-r border-current/10 flex flex-col justify-between overflow-y-auto space-y-6 h-full bg-black/5">
                
                <div className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-champagne uppercase tracking-[0.2em] block font-bold">
                      {lang === "ur" ? "منزل منتخب کریں:" : "1. SELECT STRUCTURAL LEVEL"}
                    </span>
                    <p className="text-[10px] opacity-60">Dimensions recalculate live based on active height program.</p>
                  </div>

                  {/* Vertically stacked level selector tabs */}
                  <div className="grid grid-cols-1 gap-1.5">
                    {blockLevels.map((lvl) => {
                      const isSelected = activeLevelId === lvl.id;
                      return (
                        <button
                          key={lvl.id}
                          onClick={() => setActiveLevelId(lvl.id)}
                          className={`w-full p-3 rounded text-left border flex items-center justify-between transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? "bg-champagne border-champagne text-black font-semibold shadow-md"
                              : "border-current/10 bg-transparent text-current/80 hover:border-current/20"
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className={`p-1 rounded ${isSelected ? "bg-black/10" : "bg-current/5"}`}>
                              {lvl.id === "rooftop" ? <Film size={12} /> : lvl.id === "apartments" ? <Home size={12} /> : lvl.id === "offices" ? <Briefcase size={12} /> : <ShoppingBag size={12} />}
                            </span>
                            <span className="text-xs font-serif truncate">
                              {lang === "ur" ? lvl.nameUr : lvl.nameEn}
                            </span>
                          </div>
                          <span className="text-[9px] font-mono opacity-70 flex-shrink-0 ml-1">
                            {lvl.elevation}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Unit Dimensions specifications */}
                  <div className="space-y-3 pt-4 border-t border-current/10">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono text-champagne uppercase tracking-[0.2em] font-bold">
                        {lang === "ur" ? "مخصوص پیمائش اور اثاثہ سائز:" : "2. UNIT DIMENSIONS & CORES"}
                      </span>
                      <span className="text-[8px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">Real-Time Data</span>
                    </div>

                    <div className="space-y-3">
                      {activeLevel.units.map((unit, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded border text-xs space-y-2 ${
                            theme === "graphite" ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-serif font-medium text-current/95 leading-tight">
                              {lang === "ur" ? unit.nameUr : unit.name}
                            </h4>
                            <span className={`text-[8px] uppercase tracking-widest font-mono font-bold px-1.5 py-0.5 rounded ${
                              unit.status === "Available"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : unit.status === "Reserved"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-amber-500/10 text-amber-400 animate-pulse"
                            }`}>
                              {unit.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-current/60 border-y border-current/5 py-1.5 my-1.5">
                            <div>
                              <p className="opacity-50 text-[8px] uppercase">COVERED SIZE</p>
                              <p className="font-bold text-champagne">{unit.dimensions}</p>
                            </div>
                            <div>
                              <p className="opacity-50 text-[8px] uppercase">BEDS / CAPACITY</p>
                              <p className="font-bold text-current/95">{unit.beds}</p>
                            </div>
                            <div>
                              <p className="opacity-50 text-[8px] uppercase">VIP ACCESS</p>
                              <p className="font-bold text-current/95">Biometric</p>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[8px] font-mono opacity-50 block uppercase">Premium Features</span>
                            <ul className="space-y-0.5 text-[10px] text-current/80 font-sans list-disc pl-3">
                              {(lang === "ur" ? unit.featuresUr : unit.featuresEn).map((f, fIdx) => (
                                <li key={fIdx} className="leading-tight">{f}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Secure Certification Footer */}
                <div className="p-3 rounded border border-champagne/20 bg-champagne/5 flex items-center space-x-2.5">
                  <Compass size={16} className="text-champagne flex-shrink-0 animate-spin-slow" />
                  <p className="text-[9px] font-mono uppercase tracking-wide leading-tight opacity-75">
                    {lang === "ur" 
                      ? "رابطہ کر کے پرائیویٹ بریفنگ اور پائلٹ وزٹ بک کریں۔" 
                      : "Direct connection with our concierge guarantees secure physical private pilot viewings."}
                  </p>
                </div>

              </div>

              {/* Center/Right Panel: SVG Floor Plan (Top) & Interactive Walkthrough (Bottom) */}
              <div className="md:col-span-8 flex flex-col justify-between h-full overflow-hidden">
                
                {/* Upper Half: Interactive SVG Architectural Blueprint */}
                <div className="flex-1 p-5 flex flex-col justify-between border-b border-current/10 relative overflow-hidden bg-[#0A0908]/20 min-h-[220px]">
                  <div className="absolute top-4 left-4 z-10 font-mono text-[9px] uppercase tracking-widest bg-black/60 p-1.5 rounded border border-white/5 text-white/90">
                    {lang === "ur" ? "۲ڈی تعمیراتی نقشہ" : "2D VECTOR BLUEPRINT LAYOUT"}
                  </div>
                  
                  {/* Floating legend */}
                  <div className="absolute top-4 right-4 z-10 font-mono text-[8px] uppercase tracking-wider space-y-0.5 bg-black/60 p-1.5 rounded border border-white/5 text-white/80">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-champagne"></span>
                      <span>Walkthrough Spot</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>VIP Core Lift</span>
                    </div>
                  </div>

                  {/* Floor Plan Canvas Layout */}
                  <div className="flex-1 w-full flex items-center justify-center py-4 relative">
                    <svg
                      viewBox="0 0 500 300"
                      className="w-full max-w-lg h-full max-h-[200px] text-current select-none"
                    >
                      {/* Grid background representing precision engineering */}
                      <defs>
                        <pattern id="modal-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.04" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#modal-grid)" />

                      {/* Outer boundary wall */}
                      <rect x="50" y="30" width="400" height="240" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeOpacity="0.3" strokeDasharray="4 2" />
                      <rect x="52" y="32" width="396" height="236" rx="2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.8" />

                      {/* Corridor and interior dividing walls */}
                      <line x1="160" y1="32" x2="160" y2="268" stroke="currentColor" strokeWidth="2" strokeOpacity="0.75" />
                      <line x1="340" y1="32" x2="340" y2="268" stroke="currentColor" strokeWidth="2" strokeOpacity="0.75" />
                      <line x1="160" y1="150" x2="340" y2="150" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />

                      {/* Suite demarcations */}
                      {/* Suite Left */}
                      <rect x="65" y="45" width="80" height="90" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                      <text x="105" y="95" textAnchor="middle" className="text-[10px] font-mono uppercase tracking-widest opacity-40 fill-current">SUITE A</text>
                      
                      {/* Suite Right */}
                      <rect x="355" y="45" width="80" height="130" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
                      <text x="395" y="115" textAnchor="middle" className="text-[10px] font-mono uppercase tracking-widest opacity-40 fill-current">SUITE B</text>

                      {/* Core lifts and elevators (Sovereign green highlight) */}
                      <g transform="translate(225, 60)" className="text-emerald-400">
                        <rect width="50" height="40" rx="2" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
                        <line x1="25" y1="0" x2="25" y2="40" stroke="currentColor" strokeWidth="1" />
                        <text x="25" y="24" textAnchor="middle" className="text-[8px] font-mono font-bold uppercase fill-current tracking-tighter">VIP LIFTS</text>
                      </g>

                      {/* Stairs and services core */}
                      <g transform="translate(225, 175)" className="opacity-40">
                        <rect width="50" height="40" rx="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
                        <line x1="0" y1="10" x2="50" y2="10" stroke="currentColor" strokeWidth="0.8" />
                        <line x1="0" y1="20" x2="50" y2="20" stroke="currentColor" strokeWidth="0.8" />
                        <line x1="0" y1="30" x2="50" y2="30" stroke="currentColor" strokeWidth="0.8" />
                        <text x="25" y="25" textAnchor="middle" className="text-[7px] font-mono fill-current">STAIRS</text>
                      </g>

                      {/* Render Interactive Hotspots */}
                      {activeLevel.hotspots.map((spot) => {
                        const isSelected = activeHotspotId === spot.id;
                        // Transform relative percents to coordinate systems (500x300 viewBox)
                        const spotX = 50 + (spot.x / 100) * 400;
                        const spotY = 30 + (spot.y / 100) * 240;

                        return (
                          <g
                            key={spot.id}
                            transform={`translate(${spotX}, ${spotY})`}
                            onClick={() => {
                              setActiveHotspotId(spot.id);
                              setHasInteracted(false); // Reset cinematic indicator so they explore
                            }}
                            className="cursor-pointer group"
                          >
                            {/* Glowing ripple ring around selected hotspot */}
                            {isSelected && (
                              <circle r="14" fill="none" stroke="#E3C193" strokeWidth="1.5" className="animate-ping" opacity="0.6" />
                            )}
                            
                            {/* Pulse background */}
                            <circle
                              r="8"
                              fill={isSelected ? "#E3C193" : "rgba(17,16,15,0.75)"}
                              stroke={isSelected ? "#FFF" : "#E3C193"}
                              strokeWidth={isSelected ? 2 : 1.2}
                              className="transition-all duration-300 group-hover:scale-125"
                            />
                            
                            {/* Visual Spot Marker */}
                            <circle r="2.5" fill={isSelected ? "#000" : "#E3C193"} />

                            {/* Floating tooltip label */}
                            <text
                              y="-13"
                              textAnchor="middle"
                              className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1 transition-all duration-300 pointer-events-none fill-current ${
                                isSelected ? "fill-champagne text-[9px]" : "opacity-50"
                              }`}
                            >
                              {lang === "ur" ? spot.nameUr : spot.name}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="text-[9px] font-mono opacity-60 text-center uppercase tracking-wider pb-1">
                    {lang === "ur"
                      ? "* نقشے پر موجود گول نشانات پر کلک کر کے اس کمرے کا ۳۶۰° پینورامک معائنہ کریں۔"
                      : "* Select any hotspot circle above to reposition your virtual 360° camera camera directly into that suite."}
                  </div>
                </div>

                {/* Lower Half: Immersive 360 Panoramic WebGL walk-around */}
                <div className={`relative flex flex-col justify-between transition-all duration-500 overflow-hidden ${
                  isFullscreenWalkthrough ? "absolute inset-0 z-40 h-full w-full bg-[#111]" : "h-[45%]"
                }`}>
                  
                  {/* Floating Walkthrough controls */}
                  <div className="absolute top-4 left-4 z-20 font-mono text-[9px] uppercase tracking-widest bg-black/75 p-2 rounded border border-white/5 text-white/90 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold">
                      {lang === "ur" ? `۳۶۰° نظارہ: ${activeHotspot.nameUr}` : `Live 360° View: ${activeHotspot.name}`}
                    </span>
                  </div>

                  {/* Hotspot select slider in view */}
                  <div className="absolute bottom-4 left-4 z-20 flex space-x-2 max-w-xs sm:max-w-md overflow-x-auto pb-1 scrollbar-none">
                    {activeLevel.hotspots.map((spot) => {
                      const isSelected = activeHotspotId === spot.id;
                      return (
                        <button
                          key={spot.id}
                          onClick={() => {
                            setActiveHotspotId(spot.id);
                            setHasInteracted(false);
                          }}
                          className={`px-2 py-1 text-[8px] uppercase tracking-wider font-mono rounded border cursor-pointer transition-all duration-300 ${
                            isSelected
                              ? "bg-champagne border-champagne text-black font-bold"
                              : "border-white/15 bg-black/80 text-white/90 hover:border-white/30"
                          }`}
                        >
                          {lang === "ur" ? spot.nameUr : spot.name}
                        </button>
                      );
                    })}
                  </div>

                  {/* Toggle Fullscreen walkthrough button */}
                  <div className="absolute top-4 right-4 z-20 flex space-x-2">
                    <button
                      onClick={() => setIsFullscreenWalkthrough(!isFullscreenWalkthrough)}
                      className="p-2 bg-black/75 border border-white/10 hover:border-white/30 text-white rounded transition-all duration-300 cursor-pointer flex items-center justify-center"
                      title={isFullscreenWalkthrough ? "Exit Immersive Mode" : "Immersive Cinema View"}
                    >
                      {isFullscreenWalkthrough ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                    </button>
                  </div>

                  {/* Drag-to-pan instructions overlay */}
                  {!hasInteracted && !isWalkthroughLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/20"
                    >
                      <div className="bg-black/80 p-3.5 rounded border border-white/10 text-center max-w-xs space-y-1 backdrop-blur-md">
                        <Move size={18} className="text-champagne mx-auto animate-bounce" />
                        <p className="text-[10px] font-mono text-white uppercase tracking-widest font-bold">Interactive 360° Virtual Tour</p>
                        <p className="text-[9px] text-white/60 leading-tight">Click and drag your cursor directly on the view to look around in a full 360-degree sphere.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Loading spinner overlay */}
                  {isWalkthroughLoading && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 space-y-3">
                      <Compass className="animate-spin text-champagne" size={24} />
                      <p className="font-mono text-[9px] uppercase tracking-widest text-champagne/60">Scaffolding High-Fidelity 3D Room...</p>
                    </div>
                  )}

                  {/* WebGL Panoramic Walkthrough Canvas */}
                  <div ref={mountRef} className="w-full h-full relative bg-black select-none">
                    <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
                  </div>

                </div>

              </div>

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
