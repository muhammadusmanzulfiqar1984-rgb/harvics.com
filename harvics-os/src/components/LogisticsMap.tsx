import React, { useEffect, useRef, useState, memo } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { motion, AnimatePresence } from "motion/react";
import {
  Info,
  TrendingUp,
  Activity,
  AlertTriangle,
  Clock,
  Ship,
  Globe,
  MapPin,
  Mic2,
  X as CloseIcon,
  Search,
  CheckCircle2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { GoogleMapComponent } from "./GoogleMapComponent";

interface Shipment {
  id: string;
  name: string;
  route: string;
  status:
    | "Green"
    | "Correcting"
    | "Pre-cleared"
    | "In Transit"
    | "Delayed"
    | "In Port"
    | "Customs Clearance";
  details?: string;
  eta?: string;
  lat?: number;
  lng?: number;
}

interface Corridor {
  id: string;
  name: string;
  from: [number, number]; // [lon, lat]
  to: [number, number];
  type: "Sea" | "Air";
  metrics: {
    volume: string;
    efficiency: string;
    risk: "Low" | "Medium" | "High";
    avgTime: string;
    status: string;
  };
}

const CORRIDORS: Corridor[] = [
  {
    id: "uk-gcc",
    name: "UK — GCC Corridor",
    from: [-0.1278, 51.5074], // London
    to: [55.2708, 25.2048], // Dubai
    type: "Sea",
    metrics: {
      volume: "1.2M TEU",
      efficiency: "94%",
      risk: "Low",
      avgTime: "18.5 Days",
      status: "Optimal",
    },
  },
  {
    id: "uk-eu",
    name: "UK — EU Corridor",
    from: [-0.1278, 51.5074], // London
    to: [4.4777, 51.9225], // Rotterdam
    type: "Sea",
    metrics: {
      volume: "4.8M TEU",
      efficiency: "88%",
      risk: "Medium",
      avgTime: "1.2 Days",
      status: "Congested",
    },
  },
  {
    id: "gcc-asia",
    name: "GCC — East Asia",
    from: [55.2708, 25.2048], // Dubai
    to: [121.4737, 31.2304], // Shanghai
    type: "Sea",
    metrics: {
      volume: "2.4M TEU",
      efficiency: "91%",
      risk: "Low",
      avgTime: "14.2 Days",
      status: "Optimal",
    },
  },
  {
    id: "gcc-africa",
    name: "GCC — West Africa",
    from: [55.2708, 25.2048], // Dubai
    to: [3.3792, 6.5244], // Lagos
    type: "Sea",
    metrics: {
      volume: "0.8M TEU",
      efficiency: "76%",
      risk: "High",
      avgTime: "22.1 Days",
      status: "Security Alert",
    },
  },
];

export const LogisticsMap = memo(({ shipments = [], voiceCommand = null, onAddShipment, isNaked = false }: {
  shipments?: Shipment[];
  voiceCommand?: string | null;
  onAddShipment?: (shipment: Partial<Shipment>) => void;
  isNaked?: boolean;
}) => {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor | null>(
    null,
  );
  const [hoveredCorridor, setHoveredCorridor] = useState<string | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null,
  );
  const [hoveredShipment, setHoveredShipment] = useState<Shipment | null>(null);
  const [connectivity, setConnectivity] = useState(99.85);
  const [shipmentSearchQuery, setShipmentSearchQuery] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showFullTelemetry, setShowFullTelemetry] = useState(false);
  const [showContactAgent, setShowContactAgent] = useState(false);
  const [agentMessage, setAgentMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [newShipmentCoords, setNewShipmentCoords] = useState<{lat: number, lng: number} | null>(null);
  const [newShipmentName, setNewShipmentName] = useState("");
  const [newShipmentOrigin, setNewShipmentOrigin] = useState("");
  const [newShipmentDestination, setNewShipmentDestination] = useState("");

  // Reset modal states when selected shipment changes
  useEffect(() => {
    setShowFullTelemetry(false);
    setShowContactAgent(false);
    setAgentMessage("");
    setMessageSent(false);
  }, [selectedShipment]);

  // Handle voice commands
  const [liveShipments, setLiveShipments] = useState<Shipment[]>([]);
  const liveShipmentsRef = useRef<Shipment[]>([]);

  // Sync with props
  useEffect(() => {
    setLiveShipments(shipments);
    liveShipmentsRef.current = shipments;
  }, [shipments]);

  useEffect(() => {
    if (!voiceCommand) return;
    const cmd = voiceCommand.toLowerCase();

    // Check for corridor commands
    if (cmd.includes("corridor") || cmd.includes("route")) {
      const foundCorridor = CORRIDORS.find((c) => {
        const idMatch = c.id.replace("-", " ");
        const nameMatch = c.name
          .toLowerCase()
          .replace(" — ", " ")
          .replace("-", " ");
        return (
          cmd.includes(idMatch) ||
          cmd.includes(nameMatch) ||
          cmd.includes(c.id.replace("-", ""))
        );
      });
      if (foundCorridor) {
        setSelectedCorridor(foundCorridor);
        setSelectedShipment(null);
      }
    }

    // Check for shipment commands
    if (
      cmd.includes("shipment") ||
      cmd.includes("find") ||
      cmd.includes("show me")
    ) {
      // Extract potential shipment name
      const words = cmd
        .replace("find shipment", "")
        .replace("show me shipment", "")
        .replace("find", "")
        .replace("show me", "")
        .trim();

      let foundShipment = null;
      if (words) {
        for (const s of liveShipments) {
          const sName = s.name.toLowerCase();
          if (words.includes(sName) || sName.includes(words)) {
            foundShipment = s;
            break;
          }
        }
      }

      if (foundShipment) {
        setSelectedShipment(foundShipment);
        setSelectedCorridor(null);
      }
    }
  }, [voiceCommand, liveShipments]);

  const handleMouseMove = (e: React.MouseEvent) => {
    let x = e.clientX + 15;
    let y = e.clientY + 15;

    // Prevent overflow on right side
    if (x + 250 > window.innerWidth) {
      x = e.clientX - 250;
    }

    // Prevent overflow on bottom
    if (y + 150 > window.innerHeight) {
      y = e.clientY - 150;
    }

    setMousePos({ x, y });
  };

  // Simulate real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveShipments((prev) => {
        const next = prev.map((shipment) => {
          if (Math.random() > 0.95) {
            // 5% chance to change status
            const statuses: Shipment["status"][] = [
              "Green",
              "Correcting",
              "Pre-cleared",
              "In Transit",
              "Delayed",
              "In Port",
              "Customs Clearance",
            ];
            const randomStatus =
              statuses[Math.floor(Math.random() * statuses.length)];
            return { ...shipment, status: randomStatus };
          }
          return shipment;
        });

        liveShipmentsRef.current = next;

        // Update selected and hovered shipments if they changed
        setSelectedShipment((curr) =>
          curr ? next.find((s) => s.id === curr.id) || curr : null,
        );
        setHoveredShipment((curr) =>
          curr ? next.find((s) => s.id === curr.id) || curr : null,
        );

        return next;
      });
    }, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const initialFilteredShipments = React.useMemo(() => {
    if (!shipmentSearchQuery.trim()) return shipments;
    const lowerQuery = shipmentSearchQuery.toLowerCase();
    return shipments.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.route.toLowerCase().includes(lowerQuery) ||
        s.id.toLowerCase().includes(lowerQuery),
    );
  }, [shipments, shipmentSearchQuery]);

  const filteredShipments = React.useMemo(() => {
    if (!shipmentSearchQuery.trim()) return liveShipments;
    const lowerQuery = shipmentSearchQuery.toLowerCase();
    return liveShipments.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.route.toLowerCase().includes(lowerQuery) ||
        s.id.toLowerCase().includes(lowerQuery),
    );
  }, [liveShipments, shipmentSearchQuery]);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectivity(99.8 + Math.random() * 0.15);
    }, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 1200;
    const height = 600;
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    svg.selectAll("*").remove();

    // Define glow filter
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const projection = d3
      .geoMercator()
      .scale(200)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const mainGroup = svg.append("g");

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 8])
      .on("zoom", (event) => {
        mainGroup.attr("transform", event.transform);
      });
    svg.call(zoom as any);

    svg.on("click", (event) => {
      const [x, y] = d3.pointer(event, mainGroup.node());
      const coords = projection.invert([x, y]);
      if (coords) {
        setNewShipmentCoords({ lng: coords[0], lat: coords[1] });
      }
    });

    // Add a dark background with a subtle grid
    const bgGroup = mainGroup.append("g");
    
    // Grid lines
    for (let i = 0; i < width; i += 40) {
      bgGroup.append("line")
        .attr("x1", i).attr("y1", 0)
        .attr("x2", i).attr("y2", height)
        .attr("stroke", "#800000")
        .attr("stroke-opacity", 0.05)
        .attr("stroke-width", 1);
    }
    for (let i = 0; i < height; i += 40) {
      bgGroup.append("line")
        .attr("x1", 0).attr("y1", i)
        .attr("x2", width).attr("y2", i)
        .attr("stroke", "#800000")
        .attr("stroke-opacity", 0.05)
        .attr("stroke-width", 1);
    }

    // Radar sweep effect
    const cx = width / 2;
    const cy = height / 1.5;
    const r = width / 1.5;
    const radar = bgGroup.append("path")
      .attr("d", `M${cx},${cy} L${cx},${cy - r} A${r},${r} 0 0,1 ${cx + r},${cy} Z`)
      .attr("fill", "url(#radarGradient)")
      .attr("opacity", 0.1)
      .style("transform-origin", "center");

    const radarGradient = defs.append("linearGradient")
      .attr("id", "radarGradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "100%").attr("y2", "100%");
    radarGradient.append("stop").attr("offset", "0%").attr("stop-color", "#D4AF37").attr("stop-opacity", 0.5);
    radarGradient.append("stop").attr("offset", "100%").attr("stop-color", "transparent").attr("stop-opacity", 0);

    let angle = 0;
    d3.timer(() => {
      angle = (angle + 1) % 360;
      radar.attr("transform", `rotate(${angle}, ${cx}, ${cy})`);
    });

    // Add a pulsing center
    const centerPulse = bgGroup.append("circle")
      .attr("cx", cx)
      .attr("cy", cy)
      .attr("r", 5)
      .attr("fill", "none")
      .attr("stroke", "#D4AF37")
      .attr("stroke-width", 2);

    function pulse() {
      centerPulse
        .attr("r", 5)
        .attr("opacity", 1)
        .transition()
        .duration(2000)
        .attr("r", 100)
        .attr("opacity", 0)
        .on("end", pulse);
    }
    pulse();

    // Load world data
    d3.json(
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
    ).then((data: any) => {
      const countries = topojson.feature(data, data.objects.countries) as any;

      // Draw countries
      const countryPaths = mainGroup
        .append("g")
        .selectAll("path")
        .data(countries.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#80000010")
        .attr("stroke", "#80000040")
        .attr("stroke-width", 1)
        .attr("filter", "url(#glow)");

      // Draw corridors
      const corridorGroup = mainGroup.append("g");

      CORRIDORS.forEach((corridor) => {
        const start = projection(corridor.from)!;
        const end = projection(corridor.to)!;

        // Quadratic curve for arc
        const mid = [
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2 - 80, // Pull up more for arc
        ];

        const lineData = `M${start[0]},${start[1]} Q${mid[0]},${mid[1]} ${end[0]},${end[1]}`;

        // Background glow arc (D3 glow)
        corridorGroup
          .append("path")
          .attr("d", lineData)
          .attr("fill", "none")
          .attr("stroke", corridor.id === "uk-gcc" ? "#D4AF37" : "#800000")
          .attr("stroke-width", 4)
          .attr("stroke-opacity", 0.15)
          .attr("filter", "url(#glow)")
          .style("pointer-events", "none");

        // Main line
        const mainLine = corridorGroup
          .append("path")
          .attr("d", lineData)
          .attr("fill", "none")
          .attr("stroke", corridor.id === "uk-gcc" ? "#D4AF37" : "#800000")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "5,5")
          .attr("class", "corridor-line")
          .style("cursor", "pointer")
          .on("mouseover", () => setHoveredCorridor(corridor.id))
          .on("mouseout", () => setHoveredCorridor(null))
          .on("click", (event) => {
            event.stopPropagation();
            setSelectedCorridor(corridor);
          });

        // Animated energy flow (D3)
        const energyFlow = corridorGroup
          .append("circle")
          .attr("r", 2.5)
          .attr("fill", corridor.id === "uk-gcc" ? "#D4AF37" : "#800000")
          .attr("filter", "url(#glow)");

        function animateEnergy() {
          energyFlow
            .transition()
            .duration(4000 + Math.random() * 2000)
            .ease(d3.easeLinear)
            .attrTween("transform", () => {
              const length = (
                mainLine.node() as SVGPathElement
              ).getTotalLength();
              return (t: number) => {
                const point = (
                  mainLine.node() as SVGPathElement
                ).getPointAtLength(t * length);
                return `translate(${point.x},${point.y})`;
              };
            })
            .on("end", animateEnergy);
        }
        animateEnergy();
      });

      // Draw shipment markers
      const shipmentGroup = mainGroup.append("g");

      initialFilteredShipments.forEach((shipment) => {
        const shipmentId = (shipment.id || shipment.name).replace(
          /[^a-zA-Z0-9]/g,
          "-",
        );
        const hash = (shipment.id || shipment.name)
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const corridor = CORRIDORS[hash % CORRIDORS.length];
        const start = projection(corridor.from)!;
        const end = projection(corridor.to)!;

        // Add a slight random offset to the mid point so paths don't overlap perfectly
        const offset = (hash % 40) - 20;

        const mid = [
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2 - 80 + offset,
        ];

        const lineData = `M${start[0]},${start[1]} Q${mid[0]},${mid[1]} ${end[0]},${end[1]}`;

        const getStatusColor = (status: string) => {
          switch (status) {
            case "Delayed":
              return "#e11d48"; // Rose
            case "Correcting":
              return "#f59e0b"; // Amber
            case "In Port":
              return "#3b82f6"; // Blue
            case "Customs Clearance":
              return "#8b5cf6"; // Purple
            default:
              return "#10b981"; // Emerald
          }
        };
        const ringColor = getStatusColor(shipment.status);

        // Draw the shipment's specific route path (faint)
        const shipmentPath = shipmentGroup
          .append("path")
          .attr("id", `path-${shipmentId}`)
          .attr("d", lineData)
          .attr("fill", "none")
          .attr("stroke", ringColor)
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "3,3")
          .attr("opacity", 0.2);

        // Draw the progress path (filled up to the marker)
        const progressPath = shipmentGroup
          .append("path")
          .attr("id", `progress-${shipmentId}`)
          .attr("d", lineData)
          .attr("fill", "none")
          .attr("stroke", ringColor)
          .attr("stroke-width", 2)
          .attr("opacity", 0.6);

        const pathNode = shipmentPath.node() as SVGPathElement;
        const totalLength = pathNode.getTotalLength();

        const marker = shipmentGroup
          .append("g")
          .attr("id", `marker-${shipmentId}`)
          .attr("class", "shipment-marker")
          .style("cursor", "pointer")
          .on("mouseover", () => {
            const liveShipment =
              liveShipmentsRef.current.find((s) => s.id === shipment.id) ||
              shipment;
            setHoveredShipment(liveShipment);
          })
          .on("mouseout", () => setHoveredShipment(null))
          .on("click", (event) => {
            event.stopPropagation();
            const liveShipment =
              liveShipmentsRef.current.find((s) => s.id === shipment.id) ||
              shipment;
            setSelectedShipment(liveShipment);
          });

        const sonar1 = marker
          .append("circle")
          .attr("class", "sonar-1")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 4)
          .attr("fill", "none")
          .attr("stroke", ringColor)
          .attr("stroke-width", 1)
          .attr("opacity", 0.6);

        const sonar2 = marker
          .append("circle")
          .attr("class", "sonar-2")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 4)
          .attr("fill", "none")
          .attr("stroke", ringColor)
          .attr("stroke-width", 1)
          .attr("opacity", 0.4);

        function animateSonar(element: any, delay: number) {
          element
            .attr("r", 4)
            .attr("opacity", 0.6)
            .transition()
            .delay(delay)
            .duration(2000)
            .ease(d3.easeQuadOut)
            .attr("r", 15)
            .attr("opacity", 0)
            .on("end", () => animateSonar(element, 0));
        }

        animateSonar(sonar1, 0);
        animateSonar(sonar2, 1000);

        // Core marker
        marker
          .append("circle")
          .attr("class", "core")
          .attr("cx", 0)
          .attr("cy", 0)
          .attr("r", 3.5)
          .attr("fill", ringColor)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1);

        // Animate marker and progress path
        const baseSpeed =
          shipment.status === "Delayed"
            ? 25000
            : shipment.status === "Correcting"
              ? 15000
              : 8000;
        const actualSpeed = baseSpeed + (hash % 5000);
        const startProgress = (hash % 100) / 100;

        progressPath
          .attr("stroke-dasharray", totalLength)
          .attr("stroke-dashoffset", totalLength - startProgress * totalLength);

        function animateShipment() {
          progressPath.attr("stroke-dashoffset", totalLength);

          marker
            .transition()
            .duration(actualSpeed)
            .ease(d3.easeLinear)
            .attrTween("transform", () => {
              return (t: number) => {
                const point = pathNode.getPointAtLength(t * totalLength);
                return `translate(${point.x},${point.y})`;
              };
            })
            .on("end", animateShipment);

          progressPath
            .transition()
            .duration(actualSpeed)
            .ease(d3.easeLinear)
            .attrTween("stroke-dashoffset", () => {
              return (t: number) => {
                return String(totalLength - t * totalLength);
              };
            });
        }

        // Initial partial animation
        marker
          .transition()
          .duration(actualSpeed * (1 - startProgress))
          .ease(d3.easeLinear)
          .attrTween("transform", () => {
            return (t: number) => {
              const currentT = startProgress + t * (1 - startProgress);
              const point = pathNode.getPointAtLength(currentT * totalLength);
              return `translate(${point.x},${point.y})`;
            };
          })
          .on("end", animateShipment);

        progressPath
          .transition()
          .duration(actualSpeed * (1 - startProgress))
          .ease(d3.easeLinear)
          .attrTween("stroke-dashoffset", () => {
            return (t: number) => {
              const currentT = startProgress + t * (1 - startProgress);
              return String(totalLength - currentT * totalLength);
            };
          });
      });
    });
  }, [initialFilteredShipments]);

  // Update colors dynamically without re-drawing the map
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const getStatusColor = (status: string) => {
      switch (status) {
        case "Delayed":
          return "#e11d48"; // Rose
        case "Correcting":
          return "#f59e0b"; // Amber
        case "In Port":
          return "#3b82f6"; // Blue
        case "Customs Clearance":
          return "#8b5cf6"; // Purple
        default:
          return "#10b981"; // Emerald
      }
    };

    liveShipments.forEach((shipment) => {
      const shipmentId = (shipment.id || shipment.name).replace(
        /[^a-zA-Z0-9]/g,
        "-",
      );
      const color = getStatusColor(shipment.status);

      svg.select(`#path-${shipmentId}`).attr("stroke", color);
      svg.select(`#progress-${shipmentId}`).attr("stroke", color);
      svg.select(`#marker-${shipmentId} .sonar-1`).attr("stroke", color);
      svg.select(`#marker-${shipmentId} .sonar-2`).attr("stroke", color);
      svg.select(`#marker-${shipmentId} .core`).attr("fill", color);
    });
  }, [liveShipments, shipmentSearchQuery]);

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "Delayed":
        return "text-rose-400";
      case "Correcting":
        return "text-amber-400";
      case "In Port":
        return "text-blue-400";
      case "Customs Clearance":
        return "text-purple-400";
      default:
        return "text-emerald-400";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "Delayed":
        return "bg-rose-500";
      case "Correcting":
        return "bg-amber-500";
      case "In Port":
        return "bg-blue-500";
      case "Customs Clearance":
        return "bg-purple-500";
      default:
        return "bg-emerald-500";
    }
  };

  const getStatusLightBgColor = (status: string) => {
    switch (status) {
      case "Delayed":
        return "bg-rose-100";
      case "Correcting":
        return "bg-amber-100";
      case "In Port":
        return "bg-blue-100";
      case "Customs Clearance":
        return "bg-purple-100";
      default:
        return "bg-emerald-100";
    }
  };

  const getStatusDarkTextColor = (status: string) => {
    switch (status) {
      case "Delayed":
        return "text-rose-600";
      case "Correcting":
        return "text-amber-600";
      case "In Port":
        return "text-blue-600";
      case "Customs Clearance":
        return "text-purple-600";
      default:
        return "text-emerald-600";
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <div className="absolute inset-0 z-0 bg-[#1A1A1A]">
        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
          <div className="absolute inset-0 z-0">
            <GoogleMapComponent 
              shipments={initialFilteredShipments} 
              selectedShipment={selectedShipment}
              onSelectShipment={setSelectedShipment}
              onMapClick={(coords: {lat: number, lng: number}) => {
                setNewShipmentCoords(coords);
              }}
              isNaked={isNaked}
              corridors={CORRIDORS}
            />
          </div>
        ) : (
          <svg ref={svgRef} viewBox="0 0 1200 600" className="w-full h-full" />
        )}
      </div>

      {/* UI Overlays - Hidden if isNaked */}
      {!isNaked && (
        <>
          {/* Shipment Search Bar */}
          <div className="absolute top-4 right-4 z-10 w-64">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 maroon-text opacity-40 group-focus-within:opacity-100 transition-opacity" />
          </div>
          <input
            type="text"
            value={shipmentSearchQuery}
            onChange={(e) => setShipmentSearchQuery(e.target.value)}
            placeholder={
              t("search_shipments_placeholder") || "Search shipments..."
            }
            className="block w-full pl-9 pr-3 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-[10px] text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-harvics-gold/30 focus:border-harvics-gold/50 transition-all shadow-lg"
          />
          {shipmentSearchQuery && (
            <button
              onClick={() => setShipmentSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <CloseIcon className="h-3 w-3 text-white opacity-40 hover:opacity-100" />
            </button>
          )}
        </div>

        {/* Search Results Count */}
        {shipmentSearchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 px-3 py-1.5 bg-harvics-maroon/90 backdrop-blur-md rounded-lg border border-harvics-gold/20 shadow-xl"
          >
            <p className="text-[8px] font-bold text-white uppercase tracking-widest font-serif">
              {filteredShipments.length}{" "}
              {t("results_found") || "Results Found"}
            </p>
          </motion.div>
        )}
      </div>

        {/* Map Legend & Status */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-3 z-10">
          <div className="flex items-center gap-3 bg-harvics-maroon/90 backdrop-blur-md px-3 py-2 rounded-xl border border-harvics-gold/30 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white font-serif">Neural Link Active</span>
            </div>
            <div className="w-[1px] h-3 bg-white/20" />
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3 text-harvics-gold animate-pulse" />
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-white/60 font-serif">Live Telemetry</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-harvics-gold border-t border-dashed border-harvics-gold" />
              <span className="text-[8px] uppercase tracking-widest font-bold text-white/60 font-serif">
                {t("active_corridor")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-harvics-gold animate-pulse" />
              <span className="text-[8px] uppercase tracking-widest font-bold text-white/60 font-serif">
                {t("live_asset_flow")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[8px] uppercase tracking-widest font-bold text-white/60 font-serif">
                {t("shipment_marker")}
              </span>
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
          <div className="flex flex-col bg-black/40 backdrop-blur-md rounded-xl border border-white/10 shadow-xl overflow-hidden">
            <button 
              onClick={() => {
                const svg = d3.select(svgRef.current);
                svg.transition().duration(750).call(d3.zoom().transform as any, d3.zoomIdentity.scale(1.5));
              }}
              className="p-3 hover:bg-white/10 transition-colors border-b border-white/10"
              title="Zoom In"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
            <button 
              onClick={() => {
                const svg = d3.select(svgRef.current);
                svg.transition().duration(750).call(d3.zoom().transform as any, d3.zoomIdentity);
              }}
              className="p-3 hover:bg-white/10 transition-colors"
              title="Reset View"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </div>
              {/* Hover Tooltip for Corridors */}
        <AnimatePresence>
          {hoveredCorridor && !selectedCorridor && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed pointer-events-none bg-harvics-maroon/90 backdrop-blur-xl border border-harvics-gold/30 p-3 rounded-xl shadow-2xl z-[100] min-w-[180px]"
              style={{
                left: mousePos.x,
                top: mousePos.y,
              }}
            >
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-white/10 pb-2 font-serif">
                  {CORRIDORS.find((c) => c.id === hoveredCorridor)?.name}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[7px] uppercase font-bold text-white/40 tracking-tighter">
                      Volume
                    </span>
                    <span className="text-[9px] font-mono text-harvics-gold font-serif">
                      {
                        CORRIDORS.find((c) => c.id === hoveredCorridor)?.metrics
                          .volume
                      }
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] uppercase font-bold text-white/40 tracking-tighter">
                      Risk
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase font-serif ${CORRIDORS.find((c) => c.id === hoveredCorridor)?.metrics.risk === "Low" ? "text-emerald-400" : "text-amber-400"}`}
                    >
                      {
                        CORRIDORS.find((c) => c.id === hoveredCorridor)?.metrics
                          .risk
                      }
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover Telemetry Overlay for Shipments */}
        <AnimatePresence>
          {hoveredShipment && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed pointer-events-none bg-harvics-maroon/90 backdrop-blur-xl border border-harvics-gold/30 p-4 rounded-2xl shadow-2xl z-[100] min-w-[220px]"
              style={{
                left: mousePos.x,
                top: mousePos.y,
              }}
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest font-serif">
                    {hoveredShipment.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[8px] font-bold uppercase tracking-widest font-serif ${getStatusTextColor(hoveredShipment.status)}`}
                    >
                      {hoveredShipment.status}
                    </span>
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${getStatusBgColor(hoveredShipment.status)} animate-pulse`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2">
                  <div className="flex flex-col">
                    <span className="text-[7px] uppercase font-bold text-white/40 tracking-tighter">
                      Route
                    </span>
                    <span className="text-[9px] font-bold text-white uppercase tracking-widest font-serif">
                      {hoveredShipment.route}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] uppercase font-bold text-white/40 tracking-tighter">
                      Velocity
                    </span>
                    <span className="text-[9px] font-mono text-harvics-gold font-serif">
                      18.4 kts
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[7px] uppercase font-bold text-white/40 tracking-tighter">
                    Dwell History
                  </span>
                  <div className="h-8 w-full flex items-end gap-0.5">
                    {[4, 7, 3, 8, 5, 9, 4, 6, 8, 5].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-harvics-gold/20 rounded-t-sm"
                        style={{ height: `${h * 10}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[8px] font-bold text-white/60 border-t border-white/10 pt-2">
                  <span className="uppercase tracking-widest font-serif">
                    {hoveredShipment.status}
                  </span>
                  <span className="font-mono font-serif">
                    ID: {hoveredShipment.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side Panel Overlay - Now absolute for clean map look */}
      <AnimatePresence>
        {selectedCorridor && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="absolute top-4 right-4 bottom-4 w-72 z-20"
          >
            <div className="h-full p-5 bg-harvics-maroon/90 backdrop-blur-xl rounded-2xl border border-harvics-gold/30 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-2">
                <button
                  onClick={() => setSelectedCorridor(null)}
                  className="text-[10px] font-bold text-white opacity-40 hover:opacity-100 transition-opacity"
                >
                  {t("close_btn")}
                </button>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[8px] uppercase tracking-[0.2em] font-bold text-white opacity-40">
                  {t("selected_route")}
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-widest font-serif">
                  {selectedCorridor.name}
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 opacity-40">
                    <TrendingUp className="w-3 h-3 text-white" />
                    <span className="text-[7px] uppercase font-bold text-white">
                      {t("volume_header")}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white font-serif">
                    {selectedCorridor.metrics.volume}
                  </span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 opacity-40">
                    <Clock className="w-3 h-3 text-white" />
                    <span className="text-[7px] uppercase font-bold text-white">
                      {t("avg_time_header")}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white font-serif">
                    {selectedCorridor.metrics.avgTime}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[8px] uppercase font-bold text-white opacity-60">
                      {t("efficiency_header")}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 font-serif">
                    {selectedCorridor.metrics.efficiency}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Activity
                      className={`w-3 h-3 ${selectedCorridor.metrics.status === "Optimal" ? "text-emerald-500" : "text-amber-500"}`}
                    />
                    <span className="text-[8px] uppercase font-bold text-white opacity-60">
                      Status
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold font-serif ${selectedCorridor.metrics.status === "Optimal" ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    {selectedCorridor.metrics.status}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-3 h-3 ${selectedCorridor.metrics.risk === "Low" ? "text-emerald-500" : selectedCorridor.metrics.risk === "Medium" ? "text-amber-500" : "text-rose-500"}`}
                    />
                    <span className="text-[8px] uppercase font-bold text-white opacity-60">
                      {t("risk_level_header")}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold font-serif ${selectedCorridor.metrics.risk === "Low" ? "text-emerald-400" : selectedCorridor.metrics.risk === "Medium" ? "text-amber-400" : "text-rose-400"}`}
                  >
                    {selectedCorridor.metrics.risk}
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-3 h-3 text-white opacity-40" />
                  <span className="text-[8px] uppercase font-bold text-white opacity-40">
                    {t("neural_insight")}
                  </span>
                </div>
                <p className="text-[9px] leading-relaxed text-white opacity-70 italic">
                  {selectedCorridor.id === "uk-gcc"
                    ? t("insight_uk_gcc")
                    : selectedCorridor.id === "uk-eu"
                      ? t("insight_uk_eu")
                      : t("insight_generic")}
                </p>
              </div>

              <button className="w-full py-2.5 bg-harvics-gold text-harvics-maroon rounded-xl text-[8px] font-bold uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all font-serif">
                {t("view_full_analytics")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shipment Detail Modal */}
      <AnimatePresence>
        {selectedShipment && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-harvics-maroon/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl relative border border-harvics-gold/30"
            >
              <button
                onClick={() => setSelectedShipment(null)}
                className="absolute top-6 right-6 p-2 hover:bg-harvics-maroon/5 rounded-full transition-colors"
              >
                <CloseIcon className="w-5 h-5 maroon-text opacity-40" />
              </button>

              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusLightBgColor(selectedShipment.status)}`}
                  >
                    <Ship
                      className={`w-6 h-6 ${getStatusDarkTextColor(selectedShipment.status)}`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-bold maroon-text uppercase tracking-widest font-serif">
                      {selectedShipment.name}
                    </h3>
                    <span className="text-[10px] maroon-text opacity-40 font-bold uppercase tracking-widest font-serif">
                      {selectedShipment.id}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-harvics-maroon/5 rounded-2xl flex flex-col gap-1">
                    <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold maroon-text">
                      {t("status_header")}
                    </span>
                    <span
                      className={`text-xs font-bold font-serif ${getStatusDarkTextColor(selectedShipment.status)}`}
                    >
                      {selectedShipment.status}
                    </span>
                  </div>
                  <div className="p-4 bg-harvics-maroon/5 rounded-2xl flex flex-col gap-1">
                    <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold maroon-text">
                      {t("route_header")}
                    </span>
                    <span className="text-xs font-bold maroon-text font-serif">
                      {selectedShipment.route}
                    </span>
                  </div>
                  <div className="p-4 bg-harvics-maroon/5 rounded-2xl flex flex-col gap-1">
                    <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold maroon-text">
                      {t("eta_header")}
                    </span>
                    <span className="text-xs font-bold maroon-text font-serif">
                      {selectedShipment.eta || "N/A"}
                    </span>
                  </div>
                  <div className="p-4 bg-harvics-maroon/5 rounded-2xl flex flex-col gap-1">
                    <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold maroon-text">
                      {t("coordinates_header")}
                    </span>
                    <span className="text-xs font-bold maroon-text font-serif">
                      {selectedShipment.lat?.toFixed(2)},{" "}
                      {selectedShipment.lng?.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold maroon-text">
                    {t("intelligence_summary")}
                  </span>
                  <p className="text-[11px] leading-relaxed maroon-text opacity-70 font-serif italic">
                    {selectedShipment.details || t("no_intel_logs")}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowFullTelemetry(!showFullTelemetry)}
                    className="flex-1 py-3 maroon-header text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg"
                  >
                    {showFullTelemetry ? "Hide Telemetry" : t("full_telemetry")}
                  </button>
                  <button
                    onClick={() => setShowContactAgent(!showContactAgent)}
                    className="flex-1 py-3 border border-harvics-maroon/20 maroon-text rounded-xl text-[10px] font-bold uppercase tracking-widest"
                  >
                    {showContactAgent ? "Cancel" : t("contact_agent")}
                  </button>
                </div>

                <AnimatePresence>
                  {showFullTelemetry && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-3 pt-4 border-t border-harvics-maroon/10 overflow-hidden"
                    >
                      <h4 className="text-[10px] font-bold maroon-text uppercase tracking-widest">
                        Live Telemetry Data
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1 p-3 bg-harvics-maroon/5 rounded-xl">
                          <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold maroon-text">
                            Speed
                          </span>
                          <span className="text-xs font-mono font-bold maroon-text">
                            18.4 knots
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 bg-harvics-maroon/5 rounded-xl">
                          <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold maroon-text">
                            Heading
                          </span>
                          <span className="text-xs font-mono font-bold maroon-text">
                            142° SE
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 bg-harvics-maroon/5 rounded-xl">
                          <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold maroon-text">
                            Draft
                          </span>
                          <span className="text-xs font-mono font-bold maroon-text">
                            14.2 m
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 bg-harvics-maroon/5 rounded-xl">
                          <span className="text-[8px] uppercase tracking-widest opacity-40 font-bold maroon-text">
                            Weather
                          </span>
                          <span className="text-xs font-mono font-bold maroon-text">
                            Clear, 12kn wind
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {showContactAgent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-3 pt-4 border-t border-harvics-maroon/10 overflow-hidden"
                    >
                      <h4 className="text-[10px] font-bold maroon-text uppercase tracking-widest">
                        Contact Port Agent
                      </h4>
                      {messageSent ? (
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="text-xs font-bold text-emerald-700">
                            Message Sent Successfully
                          </span>
                          <p className="text-[10px] text-emerald-600/70 text-center">
                            The agent has been notified and will respond
                            shortly.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <textarea
                            value={agentMessage}
                            onChange={(e) => setAgentMessage(e.target.value)}
                            placeholder="Type your message to the agent here..."
                            className="w-full p-3 bg-white border border-harvics-maroon/10 rounded-xl text-xs maroon-text placeholder:opacity-40 focus:outline-none focus:ring-2 focus:ring-harvics-gold/30 resize-none h-24"
                          />
                          <button
                            onClick={() => {
                              if (agentMessage.trim()) {
                                setMessageSent(true);
                                setTimeout(() => {
                                  setShowContactAgent(false);
                                  setMessageSent(false);
                                  setAgentMessage("");
                                }, 3000);
                              }
                            }}
                            disabled={!agentMessage.trim()}
                            className="w-full py-2.5 bg-harvics-gold text-harvics-maroon rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Send Message
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Add Shipment Modal */}
      <AnimatePresence>
        {newShipmentCoords && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-harvics-maroon/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#1A1A1A] border border-harvics-gold/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-[0_0_40px_rgba(90,15,26,0.3)]"
            >
              <div className="p-4 border-b border-harvics-gold/10 flex justify-between items-center bg-harvics-maroon/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-harvics-maroon/20 flex items-center justify-center border border-harvics-gold/30">
                    <MapPin className="w-3 h-3 text-harvics-gold" />
                  </div>
                  <h3 className="font-serif text-lg text-white">New Shipment</h3>
                </div>
                <button
                  onClick={() => setNewShipmentCoords(null)}
                  className="text-white/50 hover:text-white transition-colors p-1"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                    Shipment Name
                  </label>
                  <input
                    type="text"
                    value={newShipmentName}
                    onChange={(e) => setNewShipmentName(e.target.value)}
                    className="w-full bg-black/40 border border-harvics-gold/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-harvics-gold/50"
                    placeholder="e.g. SHP-9921"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                    Origin
                  </label>
                  <input
                    type="text"
                    value={newShipmentOrigin}
                    onChange={(e) => setNewShipmentOrigin(e.target.value)}
                    className="w-full bg-black/40 border border-harvics-gold/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-harvics-gold/50"
                    placeholder="e.g. Dubai, UAE"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={newShipmentDestination}
                    onChange={(e) => setNewShipmentDestination(e.target.value)}
                    className="w-full bg-black/40 border border-harvics-gold/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-harvics-gold/50"
                    placeholder="e.g. London, UK"
                  />
                </div>
                <div className="text-[10px] text-white/40 font-mono">
                  Lat: {newShipmentCoords.lat.toFixed(4)}, Lng: {newShipmentCoords.lng.toFixed(4)}
                </div>
              </div>

              <div className="p-4 border-t border-harvics-gold/10 flex gap-3">
                <button
                  onClick={() => setNewShipmentCoords(null)}
                  className="flex-1 py-2 rounded-lg border border-harvics-gold/30 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onAddShipment && newShipmentName) {
                      onAddShipment({
                        name: newShipmentName,
                        route: `${newShipmentOrigin || 'Unknown'} → ${newShipmentDestination || 'Unknown'}`,
                        status: "Green",
                        lat: newShipmentCoords.lat,
                        lng: newShipmentCoords.lng,
                      });
                      setNewShipmentCoords(null);
                      setNewShipmentName("");
                      setNewShipmentOrigin("");
                      setNewShipmentDestination("");
                    }
                  }}
                  disabled={!newShipmentName}
                  className="flex-1 py-2 rounded-lg bg-harvics-gold text-harvics-maroon text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Shipment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
});
