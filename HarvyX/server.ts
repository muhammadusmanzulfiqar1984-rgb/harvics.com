import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
/** Default 3002 — avoids clash with HARVOICEX on 3000 */
const PORT = Number(process.env.PORT || 3002);

app.use(express.json());

/** Skip live Aviationstack calls after quota errors (avoids terminal spam). */
let aviationstackQuotaExhausted = false;
let aviationstackQuotaLogged = false;

function buildFallbackFlights(
  flight_iata: unknown,
  dep_iata: unknown,
  arr_iata: unknown
) {
  const requestedFlight = typeof flight_iata === "string" ? flight_iata.toUpperCase() : "EK008";
  const requestedDep = typeof dep_iata === "string" ? dep_iata.toUpperCase() : "LHR";
  const requestedArr = typeof arr_iata === "string" ? arr_iata.toUpperCase() : "DXB";

  return [
    {
      flight_date: new Date().toISOString().split("T")[0],
      flight_status: "active",
      departure: {
        airport: "London Heathrow",
        timezone: "Europe/London",
        iata: requestedDep || "LHR",
        icao: "EGLL",
        terminal: "5",
        gate: "A14",
        delay: 0,
        scheduled: new Date(Date.now() - 3600000).toISOString(),
        estimated: new Date(Date.now() - 3600000).toISOString(),
        actual: new Date(Date.now() - 3600000).toISOString(),
      },
      arrival: {
        airport: "Dubai International",
        timezone: "Asia/Dubai",
        iata: requestedArr || "DXB",
        icao: "OMDB",
        terminal: "3",
        gate: "B22",
        baggage: "B04",
        delay: 5,
        scheduled: new Date(Date.now() + 21600000).toISOString(),
        estimated: new Date(Date.now() + 21900000).toISOString(),
      },
      airline: { name: "Emirates", iata: "EK", icao: "UAE" },
      flight: {
        number: "8",
        iata: requestedFlight || "EK008",
        icao: "UAE008",
        codeshared: null,
      },
      aircraft: { registration: "A6-EOU", iata: "A388", icao: "A388" },
      live: {
        updated: new Date().toISOString(),
        latitude: 25.2528,
        longitude: 55.3644,
        altitude: 11582.4,
        speed_horizontal: 910.5,
        speed_vertical: 0,
        is_ground: false,
      },
    },
    {
      flight_date: new Date().toISOString().split("T")[0],
      flight_status: "scheduled",
      departure: {
        airport: "John F. Kennedy Intl",
        timezone: "America/New_York",
        iata: "JFK",
        icao: "KJFK",
        terminal: "7",
        gate: "4",
        scheduled: new Date(Date.now() + 7200000).toISOString(),
      },
      arrival: {
        airport: "Charles de Gaulle",
        timezone: "Europe/Paris",
        iata: "CDG",
        icao: "LFPG",
        terminal: "2E",
        gate: "K31",
        scheduled: new Date(Date.now() + 32400000).toISOString(),
      },
      airline: { name: "Air France", iata: "AF", icao: "AFR" },
      flight: { number: "22", iata: "AF022", icao: "AFR022" },
      aircraft: { registration: "F-GSQT", iata: "B773", icao: "B773" },
    },
  ];
}

// Aviationstack API proxy endpoint (falls back to demo data when quota is hit)
app.get("/api/flights", async (req, res) => {
  const apiKey = process.env.AVIATIONSTACK_API_KEY || "2073bd914dab866afeef7d0c88ae8d85";
  const { flight_iata, dep_iata, arr_iata, limit = "10" } = req.query;
  const fallbackFlights = buildFallbackFlights(flight_iata, dep_iata, arr_iata);

  const respondFallback = (reason: string) =>
    res.json({
      success: true,
      source: "fallback_cache",
      reason,
      total: fallbackFlights.length,
      count: fallbackFlights.length,
      flights: fallbackFlights,
    });

  if (aviationstackQuotaExhausted || process.env.AVIATIONSTACK_FORCE_FALLBACK === "true") {
    return respondFallback("quota_or_forced_fallback");
  }

  const searchParams = new URLSearchParams();
  searchParams.append("access_key", apiKey);
  if (flight_iata && typeof flight_iata === "string" && flight_iata.trim()) {
    searchParams.append("flight_iata", flight_iata.trim().toUpperCase());
  }
  if (dep_iata && typeof dep_iata === "string" && dep_iata.trim()) {
    searchParams.append("dep_iata", dep_iata.trim().toUpperCase());
  }
  if (arr_iata && typeof arr_iata === "string" && arr_iata.trim()) {
    searchParams.append("arr_iata", arr_iata.trim().toUpperCase());
  }
  searchParams.append("limit", String(limit));

  const apiUrl = `http://api.aviationstack.com/v1/flights?${searchParams.toString()}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data?.data) {
      return res.json({
        success: true,
        source: "aviationstack",
        total: data.pagination?.total || data.data.length,
        count: data.data.length,
        flights: data.data,
      });
    }

    if (data?.error) {
      const code = String(data.error.code || "");
      if (code === "usage_limit_reached" || /usage.?limit/i.test(String(data.error.message || ""))) {
        aviationstackQuotaExhausted = true;
        if (!aviationstackQuotaLogged) {
          aviationstackQuotaLogged = true;
          console.warn(
            "[harvyx] Aviationstack monthly quota reached — using demo flight cache for this session. Set a new AVIATIONSTACK_API_KEY or upgrade the plan."
          );
        }
        return respondFallback("usage_limit_reached");
      }
      console.warn("[harvyx] Aviationstack error:", data.error.code || data.error.message);
    }
  } catch (error: any) {
    console.warn("[harvyx] Aviationstack unreachable — using fallback:", error?.cause?.code || error?.message || error);
  }

  return respondFallback("upstream_unavailable");
});

/** Duffel Flights — live offer search (test/live token via DUFFEL_ACCESS_TOKEN) */
app.post("/api/duffel/flights", async (req, res) => {
  const token = (process.env.DUFFEL_ACCESS_TOKEN || "").trim();
  if (!token) {
    return res.status(503).json({
      success: false,
      error: "DUFFEL_ACCESS_TOKEN missing in HarvyX/.env.local",
    });
  }

  const body = req.body || {};
  const origin = String(body.origin || body.dep_iata || "LHR").trim().toUpperCase();
  const destination = String(body.destination || body.arr_iata || "DXB").trim().toUpperCase();
  const cabinClass = String(body.cabin_class || body.cabin || "business").toLowerCase();
  const passengers = Math.max(1, Math.min(9, Number(body.passengers) || 1));

  let departureDate = String(body.departure_date || body.date || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    departureDate = d.toISOString().slice(0, 10);
  }

  const allowedCabins = new Set(["first", "business", "premium_economy", "economy"]);
  const cabin = allowedCabins.has(cabinClass) ? cabinClass : "business";

  try {
    const response = await fetch(
      "https://api.duffel.com/air/offer_requests?return_offers=true&supplier_timeout=15000",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "Duffel-Version": "v2",
        },
        body: JSON.stringify({
          data: {
            slices: [
              {
                origin,
                destination,
                departure_date: departureDate,
              },
            ],
            passengers: Array.from({ length: passengers }, () => ({ type: "adult" })),
            cabin_class: cabin,
          },
        }),
      }
    );

    const payload = await response.json();
    if (!response.ok) {
      const err = payload?.errors?.[0];
      console.warn("[harvyx] Duffel error:", err?.code || response.status, err?.message || "");
      return res.status(response.status).json({
        success: false,
        source: "duffel",
        error: err?.message || err?.title || `Duffel HTTP ${response.status}`,
      });
    }

    const data = payload?.data || {};
    const offers = Array.isArray(data.offers) ? data.offers : [];

    const normalized = offers.slice(0, 20).map((offer: any) => {
      const slice0 = (offer.slices || [])[0] || {};
      const segments = slice0.segments || [];
      const first = segments[0] || {};
      const last = segments[segments.length - 1] || first;
      const carrier = first.marketing_carrier || first.operating_carrier || {};
      const flightNumber = `${carrier.iata_code || ""}${first.marketing_carrier_flight_number || first.operating_carrier_flight_number || ""}`;

      return {
        id: offer.id,
        total_amount: offer.total_amount,
        total_currency: offer.total_currency,
        cabin_class: offer.cabin_class || cabin,
        expires_at: offer.expires_at,
        airline: {
          name: carrier.name || carrier.iata_code || "Airline",
          iata: carrier.iata_code || "",
        },
        flight: {
          iata: flightNumber,
          number: String(first.marketing_carrier_flight_number || ""),
        },
        departure: {
          airport: first.origin?.name || origin,
          iata: first.origin?.iata_code || origin,
          terminal: first.origin_terminal || undefined,
          scheduled: first.departing_at,
        },
        arrival: {
          airport: last.destination?.name || destination,
          iata: last.destination?.iata_code || destination,
          terminal: last.destination_terminal || undefined,
          scheduled: last.arriving_at,
        },
        duration: slice0.duration,
        stops: Math.max(0, segments.length - 1),
        segments: segments.map((s: any) => ({
          flight: `${s.marketing_carrier?.iata_code || ""}${s.marketing_carrier_flight_number || ""}`,
          from: s.origin?.iata_code,
          to: s.destination?.iata_code,
          departing_at: s.departing_at,
          arriving_at: s.arriving_at,
        })),
        raw_offer_id: offer.id,
      };
    });

    return res.json({
      success: true,
      source: "duffel",
      offer_request_id: data.id,
      count: normalized.length,
      origin,
      destination,
      departure_date: departureDate,
      cabin_class: cabin,
      offers: normalized,
    });
  } catch (error: any) {
    console.warn("[harvyx] Duffel unreachable:", error?.message || error);
    return res.status(502).json({
      success: false,
      source: "duffel",
      error: error?.message || "Duffel request failed",
    });
  }
});

app.get("/api/duffel/health", (_req, res) => {
  const token = (process.env.DUFFEL_ACCESS_TOKEN || "").trim();
  res.json({
    ok: Boolean(token),
    mode: token.startsWith("duffel_test_") ? "test" : token ? "live" : "missing",
  });
});

/** Booking.com (RapidAPI booking-com15) — hotels + attractions */
function bookingRapidConfig() {
  const key = (process.env.RAPIDAPI_KEY || "").trim();
  const host = (process.env.RAPIDAPI_BOOKING_HOST || "booking-com15.p.rapidapi.com").trim();
  return { key, host };
}

function bookingHeaders(key: string, host: string) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-rapidapi-key": key,
    "x-rapidapi-host": host,
  };
}

function defaultStayDates() {
  const arrival = new Date();
  arrival.setDate(arrival.getDate() + 14);
  const departure = new Date(arrival);
  departure.setDate(departure.getDate() + 2);
  return {
    arrival_date: arrival.toISOString().slice(0, 10),
    departure_date: departure.toISOString().slice(0, 10),
  };
}

app.get("/api/booking/health", (_req, res) => {
  const { key, host } = bookingRapidConfig();
  res.json({
    ok: Boolean(key),
    host,
    provider: "booking-com15",
  });
});

app.get("/api/booking/destinations", async (req, res) => {
  const { key, host } = bookingRapidConfig();
  if (!key) {
    return res.status(503).json({ success: false, error: "RAPIDAPI_KEY missing in HarvyX/.env.local" });
  }
  const query = String(req.query.q || req.query.query || "Dubai").trim();
  try {
    const url = new URL(`https://${host}/api/v1/hotels/searchDestination`);
    url.searchParams.set("query", query);
    const response = await fetch(url, { headers: bookingHeaders(key, host) });
    const payload = await response.json();
    if (!response.ok || payload?.status === false) {
      return res.status(response.status || 502).json({
        success: false,
        source: "booking",
        error: payload?.message || `Booking HTTP ${response.status}`,
      });
    }
    const destinations = (Array.isArray(payload?.data) ? payload.data : []).slice(0, 12).map((d: any) => ({
      dest_id: String(d.dest_id),
      search_type: d.search_type || d.dest_type || "city",
      name: d.name || d.city_name || d.label,
      label: d.label,
      city_name: d.city_name,
      country: d.country,
      hotels: d.hotels ?? d.nr_hotels,
      image_url: d.image_url,
    }));
    return res.json({ success: true, source: "booking", query, count: destinations.length, destinations });
  } catch (error: any) {
    console.warn("[harvyx] Booking destinations failed:", error?.message || error);
    return res.status(502).json({ success: false, source: "booking", error: error?.message || "destinations failed" });
  }
});

app.get("/api/booking/hotels", async (req, res) => {
  const { key, host } = bookingRapidConfig();
  if (!key) {
    return res.status(503).json({ success: false, error: "RAPIDAPI_KEY missing in HarvyX/.env.local" });
  }

  const defaults = defaultStayDates();
  let destId = String(req.query.dest_id || "").trim();
  const searchType = String(req.query.search_type || "city").trim();
  const query = String(req.query.q || req.query.query || "Dubai").trim();
  const arrival_date = String(req.query.arrival_date || req.query.checkin || defaults.arrival_date).trim();
  const departure_date = String(req.query.departure_date || req.query.checkout || defaults.departure_date).trim();
  const adults = Math.max(1, Math.min(8, Number(req.query.adults) || 2));
  const room_qty = Math.max(1, Math.min(4, Number(req.query.room_qty || req.query.rooms) || 1));
  const currency_code = String(req.query.currency_code || "USD").trim().toUpperCase();

  try {
    if (!destId) {
      const destUrl = new URL(`https://${host}/api/v1/hotels/searchDestination`);
      destUrl.searchParams.set("query", query);
      const destRes = await fetch(destUrl, { headers: bookingHeaders(key, host) });
      const destPayload = await destRes.json();
      const first = Array.isArray(destPayload?.data) ? destPayload.data[0] : null;
      if (!first?.dest_id) {
        return res.status(404).json({ success: false, source: "booking", error: `No destination for "${query}"` });
      }
      destId = String(first.dest_id);
    }

    const url = new URL(`https://${host}/api/v1/hotels/searchHotels`);
    url.searchParams.set("dest_id", destId);
    url.searchParams.set("search_type", searchType);
    url.searchParams.set("arrival_date", arrival_date);
    url.searchParams.set("departure_date", departure_date);
    url.searchParams.set("adults", String(adults));
    url.searchParams.set("room_qty", String(room_qty));
    url.searchParams.set("page_number", "1");
    url.searchParams.set("units", "metric");
    url.searchParams.set("temperature_unit", "c");
    url.searchParams.set("languagecode", "en-us");
    url.searchParams.set("currency_code", currency_code);

    const response = await fetch(url, { headers: bookingHeaders(key, host) });
    const payload = await response.json();
    if (!response.ok || payload?.status === false) {
      return res.status(response.status || 502).json({
        success: false,
        source: "booking",
        error: payload?.message || `Booking HTTP ${response.status}`,
      });
    }

    const rawHotels = Array.isArray(payload?.data?.hotels) ? payload.data.hotels : [];
    const hotels = rawHotels.slice(0, 16).map((h: any) => {
      const prop = h.property || h;
      const price = prop.priceBreakdown?.grossPrice || prop.priceBreakdown?.excludedPrice || {};
      const photos = Array.isArray(prop.photoUrls) ? prop.photoUrls : [];
      return {
        hotel_id: String(h.hotel_id || prop.id || ""),
        name: prop.name || h.accessibilityLabel || "Hotel",
        review_score: prop.reviewScore,
        review_word: prop.reviewScoreWord,
        review_count: prop.reviewCount,
        stars: prop.propertyClass || prop.accuratePropertyClass,
        price_amount: price.value ?? price.amount ?? null,
        price_currency: price.currency || currency_code,
        checkin: prop.checkinDate || arrival_date,
        checkout: prop.checkoutDate || departure_date,
        latitude: prop.latitude,
        longitude: prop.longitude,
        photo: photos[0],
        wishlist_name: prop.wishlistName,
        url: prop.countryCode
          ? `https://www.booking.com/hotel/${String(prop.countryCode).toLowerCase()}.html`
          : undefined,
      };
    });

    return res.json({
      success: true,
      source: "booking",
      dest_id: destId,
      query,
      arrival_date,
      departure_date,
      adults,
      room_qty,
      currency_code,
      count: hotels.length,
      hotels,
    });
  } catch (error: any) {
    console.warn("[harvyx] Booking hotels failed:", error?.message || error);
    return res.status(502).json({ success: false, source: "booking", error: error?.message || "hotels failed" });
  }
});

app.get("/api/booking/attractions", async (req, res) => {
  const { key, host } = bookingRapidConfig();
  if (!key) {
    return res.status(503).json({ success: false, error: "RAPIDAPI_KEY missing in HarvyX/.env.local" });
  }

  const query = String(req.query.q || req.query.query || "Dubai").trim();
  let locationId = String(req.query.id || "").trim();
  const currency_code = String(req.query.currency_code || "USD").trim().toUpperCase();
  const sortBy = String(req.query.sortBy || "trending").trim();

  try {
    if (!locationId) {
      const locUrl = new URL(`https://${host}/api/v1/attraction/searchLocation`);
      locUrl.searchParams.set("query", query);
      const locRes = await fetch(locUrl, { headers: bookingHeaders(key, host) });
      const locPayload = await locRes.json();
      const dests = locPayload?.data?.destinations || [];
      const products = locPayload?.data?.products || [];
      locationId = String(dests[0]?.id || products[0]?.id || "");
      if (!locationId) {
        return res.status(404).json({ success: false, source: "booking", error: `No attraction location for "${query}"` });
      }
    }

    const url = new URL(`https://${host}/api/v1/attraction/searchAttractions`);
    url.searchParams.set("id", locationId);
    url.searchParams.set("sortBy", sortBy);
    url.searchParams.set("page", "1");
    url.searchParams.set("currency_code", currency_code);
    url.searchParams.set("languagecode", "en-us");

    const response = await fetch(url, { headers: bookingHeaders(key, host) });
    const payload = await response.json();
    if (!response.ok || payload?.status === false) {
      return res.status(response.status || 502).json({
        success: false,
        source: "booking",
        error: payload?.message || `Booking HTTP ${response.status}`,
      });
    }

    const raw = Array.isArray(payload?.data?.products) ? payload.data.products : [];
    const attractions = raw.slice(0, 16).map((p: any) => {
      const price = p.representativePrice || {};
      const photo = p.primaryPhoto?.small || p.primaryPhoto?.medium || p.primaryPhoto;
      return {
        id: p.id,
        name: p.name || p.title,
        slug: p.slug || p.productSlug,
        short_description: p.shortDescription,
        price_amount: price.chargeAmount ?? price.publicAmount ?? null,
        price_currency: price.currency || currency_code,
        review_score: p.reviewsStats?.combinedNumericStats?.average,
        review_count: p.reviewsStats?.combinedNumericStats?.total,
        photo: typeof photo === "string" ? photo : photo?.url,
        city: p.ufiDetails?.cityName || p.cityName,
        cancellation: p.cancellationPolicy?.hasFreeCancellation ? "Free cancellation" : undefined,
        url: p.slug
          ? `https://www.booking.com/attractions/product/${p.slug}.html`
          : undefined,
      };
    });

    return res.json({
      success: true,
      source: "booking",
      query,
      location_id: locationId,
      currency_code,
      count: attractions.length,
      attractions,
    });
  } catch (error: any) {
    console.warn("[harvyx] Booking attractions failed:", error?.message || error);
    return res.status(502).json({ success: false, source: "booking", error: error?.message || "attractions failed" });
  }
});

app.get("/api/booking/attraction-detail", async (req, res) => {
  const { key, host } = bookingRapidConfig();
  if (!key) {
    return res.status(503).json({ success: false, error: "RAPIDAPI_KEY missing in HarvyX/.env.local" });
  }
  const slug = String(req.query.slug || "").trim();
  if (!slug) {
    return res.status(400).json({ success: false, error: "slug required" });
  }

  // Prefer booking-com15 detail path; fall back to api5-style path if host is api5
  const candidates =
    host.includes("api5")
      ? [
          `/attraction/product-detail?slug=${encodeURIComponent(slug)}&limit=1&page=1&currency_code=USD&languagecode=en`,
        ]
      : [
          `/api/v1/attraction/getAttractionDetails?slug=${encodeURIComponent(slug)}&currency_code=USD&languagecode=en-us`,
          `/api/v1/attraction/product-detail?slug=${encodeURIComponent(slug)}&limit=1&page=1&currency_code=USD&languagecode=en-us`,
        ];

  try {
    let lastError = "detail unavailable";
    for (const path of candidates) {
      const response = await fetch(`https://${host}${path}`, { headers: bookingHeaders(key, host) });
      const payload = await response.json();
      if (response.ok && payload?.status !== false && !payload?.message?.includes?.("not subscribed")) {
        return res.json({ success: true, source: "booking", slug, data: payload?.data ?? payload });
      }
      lastError = payload?.message || `HTTP ${response.status}`;
    }
    return res.status(502).json({ success: false, source: "booking", error: lastError });
  } catch (error: any) {
    return res.status(502).json({ success: false, source: "booking", error: error?.message || "detail failed" });
  }
});

/** TripAdvisor (RapidAPI tripadvisor16) — restaurants / dining */
let tripadvisorQuotaLogged = false;

function tripadvisorConfig() {
  const key = (process.env.RAPIDAPI_KEY || "").trim();
  const host = (process.env.RAPIDAPI_TRIPADVISOR_HOST || "tripadvisor16.p.rapidapi.com").trim();
  return { key, host };
}

function tripadvisorHeaders(key: string, host: string) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-rapidapi-key": key,
    "x-rapidapi-host": host,
  };
}

const TA_CITY_LOCATION_IDS: Record<string, { locationId: string; label: string }> = {
  dubai: { locationId: "295424", label: "Dubai" },
  dxb: { locationId: "295424", label: "Dubai" },
  paris: { locationId: "187147", label: "Paris" },
  london: { locationId: "186338", label: "London" },
  "new york": { locationId: "60763", label: "New York City" },
  nyc: { locationId: "60763", label: "New York City" },
  milan: { locationId: "187849", label: "Milan" },
  tokyo: { locationId: "298184", label: "Tokyo" },
  singapore: { locationId: "294265", label: "Singapore" },
  mumbai: { locationId: "304554", label: "Mumbai" },
  "abu dhabi": { locationId: "294013", label: "Abu Dhabi" },
};

function resolveKnownLocationId(query: string) {
  const q = query.trim().toLowerCase();
  if (TA_CITY_LOCATION_IDS[q]) return TA_CITY_LOCATION_IDS[q];
  for (const [key, val] of Object.entries(TA_CITY_LOCATION_IDS)) {
    if (q.includes(key) || key.includes(q)) return val;
  }
  return TA_CITY_LOCATION_IDS.dubai;
}

function fallbackRestaurants(locationLabel: string) {
  return [
    {
      id: "ta-demo-1",
      name: "Ossiano",
      rating: 4.8,
      review_count: 2140,
      price_tag: "$$$$",
      cuisines: ["Seafood", "Fine Dining"],
      open_status: "OPEN",
      photo: undefined,
      location: locationLabel,
      url: "https://www.tripadvisor.com/Restaurant_Review-g295424-d1203283-Reviews-Ossiano-Dubai_Emirate_of_Dubai.html",
    },
    {
      id: "ta-demo-2",
      name: "Nobu Dubai",
      rating: 4.6,
      review_count: 3890,
      price_tag: "$$$$",
      cuisines: ["Japanese", "Sushi"],
      open_status: "OPEN",
      photo: undefined,
      location: locationLabel,
      url: "https://www.tripadvisor.com/Restaurant_Review-g295424-d1511787-Reviews-Nobu-Dubai_Emirate_of_Dubai.html",
    },
    {
      id: "ta-demo-3",
      name: "Zuma Dubai",
      rating: 4.7,
      review_count: 5120,
      price_tag: "$$$$",
      cuisines: ["Japanese", "Contemporary"],
      open_status: "OPEN",
      photo: undefined,
      location: locationLabel,
      url: "https://www.tripadvisor.com/Restaurant_Review-g295424-d1511794-Reviews-Zuma-Dubai_Emirate_of_Dubai.html",
    },
    {
      id: "ta-demo-4",
      name: "Pierchic",
      rating: 4.5,
      review_count: 2760,
      price_tag: "$$$$",
      cuisines: ["Seafood", "Mediterranean"],
      open_status: "OPEN",
      photo: undefined,
      location: locationLabel,
      url: "https://www.tripadvisor.com/Restaurant_Review-g295424-d791052-Reviews-Pierchic-Dubai_Emirate_of_Dubai.html",
    },
  ];
}

function normalizeTripadvisorRestaurants(rows: any[], locationLabel: string) {
  return (Array.isArray(rows) ? rows : []).slice(0, 16).map((r: any) => {
    const id = String(r.restaurantsId || r.restaurantId || r.locationId || r.id || "");
    const cuisines = Array.isArray(r.establishmentTypeAndCuisineTags)
      ? r.establishmentTypeAndCuisineTags
      : Array.isArray(r.cuisine)
        ? r.cuisine
        : [];
    return {
      id,
      name: r.name || "Restaurant",
      rating: r.averageRating ?? r.rating ?? null,
      review_count: r.userReviewCount ?? r.reviewCount ?? null,
      price_tag: r.priceTag || r.price_level || undefined,
      cuisines,
      open_status: r.currentOpenStatusCategory || r.openStatus || undefined,
      photo: r.heroImgUrl || r.squareImgUrl || r.thumbnail || undefined,
      location: locationLabel,
      url: id
        ? `https://www.tripadvisor.com/Restaurant_Review-d${id}`
        : "https://www.tripadvisor.com",
    };
  });
}

app.get("/api/tripadvisor/health", (_req, res) => {
  const { key, host } = tripadvisorConfig();
  res.json({
    ok: Boolean(key),
    host,
    provider: "tripadvisor16",
  });
});

app.get("/api/tripadvisor/locations", async (req, res) => {
  const { key, host } = tripadvisorConfig();
  if (!key) {
    return res.status(503).json({ success: false, error: "RAPIDAPI_KEY missing in HarvyX/.env.local" });
  }
  const query = String(req.query.q || req.query.query || "Dubai").trim();
  try {
    const url = new URL(`https://${host}/api/v1/restaurant/searchLocation`);
    url.searchParams.set("query", query);
    const response = await fetch(url, { headers: tripadvisorHeaders(key, host) });
    const payload = await response.json();
    if (!response.ok || payload?.message === "You are not subscribed to this API.") {
      const known = resolveKnownLocationId(query);
      return res.json({
        success: true,
        source: "tripadvisor_fallback",
        query,
        warning: payload?.message || `HTTP ${response.status}`,
        locations: [{ locationId: known.locationId, name: known.label, type: "geo" }],
      });
    }
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    const locations = rows.slice(0, 12).map((loc: any) => ({
      locationId: String(loc.locationId || loc.location_id || loc.id || ""),
      name: loc.localizedName || loc.name || loc.title || query,
      type: loc.locationV2?.placeType || loc.type || "geo",
      secondary: loc.localizedAdditionalNames || loc.hierarchy || undefined,
    }));
    return res.json({ success: true, source: "tripadvisor", query, count: locations.length, locations });
  } catch (error: any) {
    const known = resolveKnownLocationId(query);
    return res.json({
      success: true,
      source: "tripadvisor_fallback",
      query,
      warning: error?.message || "locations failed",
      locations: [{ locationId: known.locationId, name: known.label, type: "geo" }],
    });
  }
});

app.get("/api/tripadvisor/restaurants", async (req, res) => {
  const { key, host } = tripadvisorConfig();
  if (!key) {
    return res.status(503).json({ success: false, error: "RAPIDAPI_KEY missing in HarvyX/.env.local" });
  }

  const query = String(req.query.q || req.query.query || "Dubai").trim();
  let locationId = String(req.query.locationId || req.query.location_id || "").trim();
  let locationLabel = query;

  const respondFallback = (warning: string, locId: string, label: string) => {
    if (!tripadvisorQuotaLogged) {
      console.warn(
        "[harvyx] TripAdvisor restaurants unavailable:",
        warning,
        "— using curated dining fallback until provider restaurant endpoints recover."
      );
      tripadvisorQuotaLogged = true;
    }
    const restaurants = fallbackRestaurants(label);
    return res.json({
      success: true,
      source: "tripadvisor_fallback",
      warning,
      locationId: locId,
      location: label,
      query,
      count: restaurants.length,
      restaurants,
    });
  };

  try {
    if (!locationId) {
      // hotels/searchLocation is healthier than restaurant/searchLocation right now
      const hotelLocUrl = new URL(`https://${host}/api/v1/hotels/searchLocation`);
      hotelLocUrl.searchParams.set("query", query);
      try {
        const hotelLocRes = await fetch(hotelLocUrl, { headers: tripadvisorHeaders(key, host) });
        const hotelLocPayload = await hotelLocRes.json();
        const firstHotelLoc = Array.isArray(hotelLocPayload?.data) ? hotelLocPayload.data[0] : null;
        if (firstHotelLoc?.geoId) {
          locationId = String(firstHotelLoc.geoId);
          locationLabel = String(firstHotelLoc.title || query).replace(/<\/?b>/g, "");
        }
      } catch {
        /* continue */
      }

      if (!locationId) {
        const locUrl = new URL(`https://${host}/api/v1/restaurant/searchLocation`);
        locUrl.searchParams.set("query", query);
        const locRes = await fetch(locUrl, { headers: tripadvisorHeaders(key, host) });
        const locPayload = await locRes.json();
        const first = Array.isArray(locPayload?.data) ? locPayload.data[0] : null;
        if (first && (first.locationId || first.location_id || first.geoId || first.id)) {
          locationId = String(first.locationId || first.location_id || first.geoId || first.id);
          locationLabel = first.localizedName || first.name || locationLabel;
        } else {
          const known = resolveKnownLocationId(query);
          locationId = known.locationId;
          locationLabel = known.label;
        }
      }
    }

    const url = new URL(`https://${host}/api/v1/restaurant/searchRestaurants`);
    url.searchParams.set("locationId", locationId);
    url.searchParams.set("page", "1");
    const response = await fetch(url, { headers: tripadvisorHeaders(key, host) });
    const payload = await response.json();

    const notSubscribed =
      response.status === 403 ||
      payload?.message === "You are not subscribed to this API." ||
      String(payload?.message || "").toLowerCase().includes("not subscribed");

    const providerDown =
      payload?.status === false ||
      (typeof payload?.message === "string" &&
        payload.message.toLowerCase().includes("something went wrong")) ||
      (payload?.message &&
        typeof payload.message === "object" &&
        Object.keys(payload.message).length === 0);

    if (!response.ok || notSubscribed || providerDown) {
      const warning = notSubscribed
        ? "Not subscribed to tripadvisor16"
        : typeof payload?.message === "string" && payload.message
          ? payload.message
          : `Restaurant endpoint returned status=${payload?.status} (provider error)`;
      return respondFallback(warning, locationId, locationLabel);
    }

    const rows = Array.isArray(payload?.data?.data)
      ? payload.data.data
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

    if (!rows.length) {
      return respondFallback("Empty restaurant list from TripAdvisor", locationId, locationLabel);
    }

    const restaurants = normalizeTripadvisorRestaurants(rows, locationLabel);
    return res.json({
      success: true,
      source: "tripadvisor",
      locationId,
      location: locationLabel,
      query,
      count: restaurants.length,
      restaurants,
    });
  } catch (error: any) {
    console.warn("[harvyx] TripAdvisor unreachable:", error?.message || error);
    const known = resolveKnownLocationId(query);
    return respondFallback(error?.message || "unreachable", locationId || known.locationId, known.label);
  }
});

/** Skyscanner Flights (RapidAPI) — airport autocomplete + fare search */
function skyscannerConfig() {
  const key = (process.env.RAPIDAPI_KEY || "").trim();
  const host = (process.env.RAPIDAPI_SKYSCANNER_HOST || "skyscanner-flights-travel-api.p.rapidapi.com").trim();
  return { key, host };
}

function skyscannerHeaders(key: string, host: string) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-rapidapi-key": key,
    "x-rapidapi-host": host,
  };
}

async function skyscannerResolvePlace(
  key: string,
  host: string,
  query: string
): Promise<{ skyId: string; entityId: string; iataCode?: string; name: string; placeType?: string } | null> {
  const q = query.trim();
  if (!q) return null;
  const url = new URL(`https://${host}/flights/searchAirport`);
  url.searchParams.set("query", q);
  url.searchParams.set("market", "US");
  url.searchParams.set("locale", "en-US");
  const res = await fetch(url, { headers: skyscannerHeaders(key, host) });
  const payload = await res.json();
  const places = Array.isArray(payload?.places) ? payload.places : [];
  if (!places.length) return null;

  const upper = q.toUpperCase();
  const byIata = places.find(
    (p: any) => String(p.iataCode || "").toUpperCase() === upper && p.skyId && p.entityId
  );
  const city = places.find((p: any) => p.placeType === "CITY" && p.skyId && p.entityId);
  const airport = places.find((p: any) => p.placeType === "AIRPORT" && p.skyId && p.entityId);
  const pick = byIata || city || airport || places[0];
  if (!pick?.skyId || !pick?.entityId) return null;
  return {
    skyId: String(pick.skyId),
    entityId: String(pick.entityId),
    iataCode: pick.iataCode ? String(pick.iataCode) : undefined,
    name: String(pick.name || pick.cityName || q),
    placeType: pick.placeType,
  };
}

function normalizeSkyscannerItineraries(rows: any[]) {
  return (Array.isArray(rows) ? rows : []).slice(0, 20).map((itin: any) => {
    const leg0 = Array.isArray(itin.legs) ? itin.legs[0] || {} : {};
    const carriers = Array.isArray(leg0.carriers) ? leg0.carriers : [];
    const airlineName = carriers[0]?.name || "Airline";
    const flightHint = String(itin.id || "").split("-")[0] || airlineName;
    return {
      id: String(itin.id || ""),
      total_amount: itin.price?.amount != null ? String(itin.price.amount) : undefined,
      total_currency: itin.price?.currency || "USD",
      price_formatted: itin.price?.formatted,
      airline: { name: airlineName },
      flight: { iata: flightHint },
      departure: {
        iata: leg0.origin,
        scheduled: leg0.departure,
      },
      arrival: {
        iata: leg0.destination,
        scheduled: leg0.arrival,
      },
      duration_minutes: leg0.durationMinutes,
      stops: leg0.stopCount ?? 0,
      booking_url: itin.bookingUrl,
      score: itin.score,
      tags: Array.isArray(itin.tags) ? itin.tags : [],
    };
  });
}

app.get("/api/skyscanner/health", (_req, res) => {
  const { key, host } = skyscannerConfig();
  res.json({ ok: Boolean(key), host, provider: "skyscanner-flights-travel-api" });
});

app.get("/api/skyscanner/airports", async (req, res) => {
  const { key, host } = skyscannerConfig();
  if (!key) {
    return res.status(503).json({ success: false, error: "RAPIDAPI_KEY missing in HarvyX/.env.local" });
  }
  const query = String(req.query.q || req.query.query || "").trim();
  if (!query) {
    return res.status(400).json({ success: false, error: "query required" });
  }
  try {
    const url = new URL(`https://${host}/flights/searchAirport`);
    url.searchParams.set("query", query);
    url.searchParams.set("market", String(req.query.market || "US"));
    url.searchParams.set("locale", String(req.query.locale || "en-US"));
    const response = await fetch(url, { headers: skyscannerHeaders(key, host) });
    const payload = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        source: "skyscanner",
        error: payload?.message || `HTTP ${response.status}`,
      });
    }
    const places = (Array.isArray(payload?.places) ? payload.places : []).slice(0, 12).map((p: any) => ({
      skyId: p.skyId,
      entityId: p.entityId,
      iataCode: p.iataCode,
      name: p.name,
      cityName: p.cityName,
      countryName: p.countryName,
      placeType: p.placeType,
      coordinates: p.coordinates,
    }));
    return res.json({ success: true, source: "skyscanner", query, count: places.length, places });
  } catch (error: any) {
    return res.status(502).json({ success: false, source: "skyscanner", error: error?.message || "airports failed" });
  }
});

app.get("/api/skyscanner/flights", async (req, res) => {
  const { key, host } = skyscannerConfig();
  if (!key) {
    return res.status(503).json({ success: false, error: "RAPIDAPI_KEY missing in HarvyX/.env.local" });
  }

  const originQ = String(req.query.origin || req.query.from || "London").trim();
  const destinationQ = String(req.query.destination || req.query.to || "Dubai").trim();
  let date = String(req.query.date || req.query.departure_date || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    date = d.toISOString().slice(0, 10);
  }
  const cabinClass = String(req.query.cabinClass || req.query.cabin || "business").toLowerCase();
  const adults = Math.max(1, Math.min(8, Number(req.query.adults) || 1));
  const currency = String(req.query.currency || "USD").toUpperCase();

  try {
    const [origin, destination] = await Promise.all([
      skyscannerResolvePlace(key, host, originQ),
      skyscannerResolvePlace(key, host, destinationQ),
    ]);
    if (!origin || !destination) {
      return res.status(404).json({
        success: false,
        source: "skyscanner",
        error: `Could not resolve airports for "${originQ}" → "${destinationQ}"`,
      });
    }

    const url = new URL(`https://${host}/flights/searchFlights`);
    url.searchParams.set("originSkyId", origin.skyId);
    url.searchParams.set("destinationSkyId", destination.skyId);
    url.searchParams.set("originEntityId", origin.entityId);
    url.searchParams.set("destinationEntityId", destination.entityId);
    url.searchParams.set("date", date);
    url.searchParams.set("cabinClass", cabinClass);
    url.searchParams.set("adults", String(adults));
    url.searchParams.set("currency", currency);
    url.searchParams.set("market", "US");
    url.searchParams.set("locale", "en-US");

    const response = await fetch(url, { headers: skyscannerHeaders(key, host) });
    const payload = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        source: "skyscanner",
        error: payload?.message || `HTTP ${response.status}`,
      });
    }

    const rows = Array.isArray(payload?.itineraries) ? payload.itineraries : [];
    const offers = normalizeSkyscannerItineraries(rows);
    return res.json({
      success: true,
      source: "skyscanner",
      status: payload?.status,
      total: payload?.total ?? offers.length,
      origin,
      destination,
      date,
      cabinClass,
      currency,
      count: offers.length,
      offers,
    });
  } catch (error: any) {
    console.warn("[harvyx] Skyscanner flights failed:", error?.message || error);
    return res.status(502).json({ success: false, source: "skyscanner", error: error?.message || "flights failed" });
  }
});

/** Weather (RapidAPI weather-api167) */
function weatherConfig() {
  const key = (process.env.RAPIDAPI_KEY || "").trim();
  const host = (process.env.RAPIDAPI_WEATHER_HOST || "weather-api167.p.rapidapi.com").trim();
  return { key, host };
}

function weatherHeaders(key: string, host: string) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-rapidapi-key": key,
    "x-rapidapi-host": host,
  };
}

function normalizeWeatherPlace(place: string) {
  const p = place.trim();
  if (!p) return "London,GB";
  if (p.includes(",")) return p;
  const map: Record<string, string> = {
    london: "London,GB",
    dubai: "Dubai,AE",
    paris: "Paris,FR",
    milan: "Milan,IT",
    tokyo: "Tokyo,JP",
    singapore: "Singapore,SG",
    "new york": "New York,US",
    nyc: "New York,US",
    dxb: "Dubai,AE",
    lhr: "London,GB",
  };
  return map[p.toLowerCase()] || `${p}`;
}

function normalizeForecastItem(item: any) {
  const main = item?.main || {};
  const weather0 = Array.isArray(item?.weather) ? item.weather[0] || {} : {};
  const wind = item?.wind || {};
  return {
    at: item?.dt_txt || undefined,
    timestamp: item?.dt,
    summary: item?.summery || item?.summary || weather0.description,
    temp: main.temprature ?? main.temperature ?? main.temp ?? null,
    feels_like: main.temprature_feels_like ?? main.feels_like ?? null,
    temp_min: main.temprature_min ?? main.temp_min ?? null,
    temp_max: main.temprature_max ?? main.temp_max ?? null,
    unit: main.temprature_unit || main.temperature_unit || "°C",
    humidity: main.humidity ?? null,
    condition: weather0.main,
    description: weather0.description,
    icon: weather0.icon,
    wind_speed: wind.speed ?? null,
    wind_dir: wind.direction || undefined,
    pop: item?.probability_of_precipitation ?? null,
  };
}

app.get("/api/weather/health", (_req, res) => {
  const { key, host } = weatherConfig();
  res.json({ ok: Boolean(key), host, provider: "weather-api167" });
});

app.get("/api/weather/forecast", async (req, res) => {
  const { key, host } = weatherConfig();
  if (!key) {
    return res.status(503).json({ success: false, error: "RAPIDAPI_KEY missing in HarvyX/.env.local" });
  }

  const place = normalizeWeatherPlace(String(req.query.place || req.query.q || "London,GB"));
  const cnt = Math.max(1, Math.min(16, Number(req.query.cnt) || 5));
  const units = String(req.query.units || "metric");
  const type = String(req.query.type || "three_hour");
  const lang = String(req.query.lang || "en");

  try {
    const url = new URL(`https://${host}/api/weather/forecast`);
    url.searchParams.set("place", place);
    url.searchParams.set("cnt", String(cnt));
    url.searchParams.set("units", units);
    url.searchParams.set("type", type);
    url.searchParams.set("mode", "json");
    url.searchParams.set("lang", lang);

    const response = await fetch(url, { headers: weatherHeaders(key, host) });
    const payload = await response.json();
    if (!response.ok || String(payload?.cod) === "404" || (payload?.cod && String(payload.cod) !== "200")) {
      return res.status(response.ok ? 502 : response.status).json({
        success: false,
        source: "weather",
        error: payload?.message || `Weather HTTP ${response.status}`,
      });
    }

    const city = payload?.city || {};
    const list = Array.isArray(payload?.list) ? payload.list.map(normalizeForecastItem) : [];
    return res.json({
      success: true,
      source: "weather",
      place,
      city: {
        name: city.name,
        country: city.country,
        lat: city.coord?.lat,
        lon: city.coord?.lon,
        sunrise: city.sunrise_txt,
        sunset: city.sunset_txt,
      },
      count: list.length,
      forecast: list,
    });
  } catch (error: any) {
    console.warn(
      "[harvyx] Weather forecast failed:",
      error?.message || error,
      error?.cause?.code || error?.cause?.message || ""
    );
    return res.status(502).json({
      success: false,
      source: "weather",
      error: error?.message || "forecast failed",
      detail: error?.cause?.code || error?.cause?.message || undefined,
    });
  }
});

app.get("/api/weather/current", async (req, res) => {
  const { key, host } = weatherConfig();
  if (!key) {
    return res.status(503).json({ success: false, error: "RAPIDAPI_KEY missing in HarvyX/.env.local" });
  }
  const place = normalizeWeatherPlace(String(req.query.place || req.query.q || "London,GB"));
  const units = String(req.query.units || "metric");
  const lang = String(req.query.lang || "en");

  try {
    const url = new URL(`https://${host}/api/weather/current`);
    url.searchParams.set("place", place);
    url.searchParams.set("units", units);
    url.searchParams.set("lang", lang);
    const response = await fetch(url, { headers: weatherHeaders(key, host) });
    const payload = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        source: "weather",
        error: payload?.message || `Weather HTTP ${response.status}`,
      });
    }
    const main = payload?.main || {};
    const weather0 = Array.isArray(payload?.weather) ? payload.weather[0] || {} : {};
    const wind = payload?.wind || {};
    return res.json({
      success: true,
      source: "weather",
      place,
      current: {
        summary: payload?.summery || payload?.summary || weather0.description,
        temp: main.temprature ?? main.temperature ?? main.temp ?? null,
        feels_like: main.temprature_feels_like ?? main.feels_like ?? null,
        unit: main.temprature_unit || "°C",
        humidity: main.humidity ?? null,
        condition: weather0.main,
        description: weather0.description,
        icon: weather0.icon,
        wind_speed: wind.speed ?? null,
        wind_dir: wind.direction || undefined,
        coord: payload?.coord,
      },
    });
  } catch (error: any) {
    return res.status(502).json({ success: false, source: "weather", error: error?.message || "current failed" });
  }
});

/** Live FX (RapidAPI exchange-rate-api1) */
function fxConfig() {
  const key = (process.env.RAPIDAPI_KEY || "").trim();
  const host = (process.env.RAPIDAPI_FX_HOST || "exchange-rate-api1.p.rapidapi.com").trim();
  return { key, host };
}

function fxHeaders(key: string, host: string) {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    "x-rapidapi-key": key,
    "x-rapidapi-host": host,
  };
}

let fxCache: { base: string; rates: Record<string, number>; fetchedAt: number; time_update?: string } | null =
  null;
const FX_CACHE_MS = 15 * 60 * 1000;

app.get("/api/fx/health", (_req, res) => {
  const { key, host } = fxConfig();
  res.json({ ok: Boolean(key), host, provider: "exchange-rate-api1", cached: Boolean(fxCache) });
});

app.get("/api/fx/latest", async (req, res) => {
  const { key, host } = fxConfig();
  if (!key) {
    return res.status(503).json({ success: false, error: "RAPIDAPI_KEY missing in HarvyX/.env.local" });
  }

  const base = String(req.query.base || "USD").trim().toUpperCase() || "USD";
  const now = Date.now();
  if (fxCache && fxCache.base === base && now - fxCache.fetchedAt < FX_CACHE_MS) {
    return res.json({
      success: true,
      source: "fx_cache",
      base: fxCache.base,
      rates: fxCache.rates,
      time_update: fxCache.time_update,
      cached: true,
    });
  }

  try {
    const url = new URL(`https://${host}/latest`);
    url.searchParams.set("base", base);
    const response = await fetch(url, { headers: fxHeaders(key, host) });
    const payload = await response.json();
    if (!response.ok || (payload?.code && Number(payload.code) >= 400)) {
      return res.status(response.status || 502).json({
        success: false,
        source: "fx",
        error: payload?.msg || payload?.message || `FX HTTP ${response.status}`,
      });
    }

    const ratesRaw = payload?.rates || payload?.conversion_rates || {};
    const rates: Record<string, number> = {};
    for (const [code, value] of Object.entries(ratesRaw)) {
      const n = Number(value);
      if (!Number.isNaN(n)) rates[String(code).toUpperCase()] = n;
    }
    rates[base] = rates[base] ?? 1;

    fxCache = {
      base,
      rates,
      fetchedAt: now,
      time_update: payload?.time_update || payload?.time || undefined,
    };

    return res.json({
      success: true,
      source: "fx",
      base,
      rates,
      time_update: fxCache.time_update,
      count: Object.keys(rates).length,
      cached: false,
    });
  } catch (error: any) {
    console.warn("[harvyx] FX latest failed:", error?.message || error);
    if (fxCache && fxCache.base === base) {
      return res.json({
        success: true,
        source: "fx_cache",
        base: fxCache.base,
        rates: fxCache.rates,
        time_update: fxCache.time_update,
        cached: true,
        warning: error?.message || "upstream failed",
      });
    }
    return res.status(502).json({ success: false, source: "fx", error: error?.message || "fx failed" });
  }
});

/** Expedia cars (RapidAPI expedia15) — live rental search + curated luxury fallback */
function expediaConfig() {
  const key = (process.env.RAPIDAPI_KEY || "").trim();
  const host = (process.env.RAPIDAPI_EXPEDIA_HOST || "expedia15.p.rapidapi.com").trim();
  return { key, host };
}

function expediaHeaders(key: string, host: string) {
  return {
    Accept: "application/json",
    "x-rapidapi-key": key,
    "x-rapidapi-host": host,
  };
}

/** Verified Expedia region IDs that return car inventory on expedia15 */
const EXPEDIA_CAR_LOCATIONS: Record<string, { id: string; label: string }> = {
  london: { id: "178279", label: "London" },
  lhr: { id: "178279", label: "London" },
  uk: { id: "178279", label: "London" },
  paris: { id: "179898", label: "Paris" },
  cdg: { id: "179898", label: "Paris" },
  nyc: { id: "178293", label: "New York" },
  "new york": { id: "178293", label: "New York" },
  jfk: { id: "178293", label: "New York" },
  milan: { id: "179900", label: "Milan" },
  milano: { id: "179900", label: "Milan" },
  dubai: { id: "6053840", label: "Dubai" },
  dxb: { id: "6053840", label: "Dubai" },
};

function resolveCarLocation(raw: string): { id: string; label: string; query: string } {
  const query = String(raw || "London").trim();
  const key = query.toLowerCase();
  if (/^\d+$/.test(query)) return { id: query, label: query, query };
  for (const [alias, loc] of Object.entries(EXPEDIA_CAR_LOCATIONS)) {
    if (key === alias || key.includes(alias)) return { ...loc, query };
  }
  return { ...EXPEDIA_CAR_LOCATIONS.london, query };
}

function defaultCarDates() {
  const pickUp = new Date();
  pickUp.setDate(pickUp.getDate() + 14);
  const dropOff = new Date(pickUp);
  dropOff.setDate(dropOff.getDate() + 3);
  return {
    pickUpDate: pickUp.toISOString().slice(0, 10),
    dropOffDate: dropOff.toISOString().slice(0, 10),
  };
}

function matchesCarClass(category: string, carType: string): boolean {
  const cat = category.toLowerCase();
  const want = carType.toLowerCase();
  if (!want || want === "any") return true;
  if (want.includes("super") || want.includes("luxury") || want.includes("exotic")) {
    return /luxury|premium|sport|convertible|elite|exotic|supercar|special/.test(cat);
  }
  if (want.includes("suv")) return /suv|van|people|minivan|4x4|jeep/.test(cat);
  if (want.includes("sedan")) return /sedan|midsize|standard|fullsize|compact|economy|intermediate|mini/.test(cat);
  return true;
}

function fallbackLuxuryCars(label: string, carType: string) {
  const fleet = [
    {
      id: "hx-car-rr",
      name: "Rolls-Royce Ghost or similar",
      category: "Luxury",
      vendor: "HARVICS Elite Fleet",
      price_per_day: "AED 2,400",
      price_total: "On request",
      image: "",
      attributes: ["4 seats", "Automatic", "Chauffeur optional"],
      url: "",
    },
    {
      id: "hx-car-bent",
      name: "Bentley Continental GT or similar",
      category: "Supercar",
      vendor: "HARVICS Elite Fleet",
      price_per_day: "AED 3,100",
      price_total: "On request",
      image: "",
      attributes: ["4 seats", "Automatic", "Airport delivery"],
      url: "",
    },
    {
      id: "hx-car-range",
      name: "Range Rover Autobiography or similar",
      category: "Luxury SUV",
      vendor: "HARVICS Elite Fleet",
      price_per_day: "AED 1,850",
      price_total: "On request",
      image: "",
      attributes: ["5 seats", "Automatic", "Unlimited mileage"],
      url: "",
    },
    {
      id: "hx-car-sclass",
      name: "Mercedes-Benz S-Class or similar",
      category: "Luxury Sedan",
      vendor: "HARVICS Elite Fleet",
      price_per_day: "AED 1,450",
      price_total: "On request",
      image: "",
      attributes: ["5 seats", "Automatic", "Wi-Fi"],
      url: "",
    },
  ];
  return fleet
    .filter((c) => matchesCarClass(c.category, carType))
    .map((c) => ({ ...c, location: label }));
}

function normalizeExpediaCarOffer(card: any, index: number) {
  const vehicle = card?.vehicle || {};
  const vendor = card?.vendor?.image?.description || card?.vendor?.name || "Partner";
  const attrs = Array.isArray(vehicle?.attributes)
    ? vehicle.attributes.map((a: any) => String(a?.text || "")).filter(Boolean).slice(0, 5)
    : [];
  const lead = card?.priceSummary?.lead?.formattedValue || card?.priceSummary?.lead?.accessibility || "";
  const total = card?.priceSummary?.total?.formattedValue || card?.priceSummary?.total?.accessibility || "";
  const a11y = String(card?.accessibilityString || card?.action?.accessibility || "");
  const parsed = a11y.match(/Reserve Item,\s*(.+?)\s+from\s+(.+?)\s+at\s+(\$?[\d,.]+)\s+total/i);
  return {
    id: String(card?.detailsContext?.offerToken || card?.infositeURL || `exp-car-${index}`),
    name: String(vehicle?.description || parsed?.[1] || vehicle?.category || "Vehicle"),
    category: String(vehicle?.category || parsed?.[1] || "Car"),
    vendor: String(parsed?.[2] || vendor),
    price_per_day: String(lead || ""),
    price_total: String(total || parsed?.[3] || ""),
    image: String(vehicle?.image?.url || ""),
    attributes: attrs,
    url: String(card?.infositeURL || ""),
    free_cancellation: Boolean(
      Array.isArray(card?.actionableConfidenceMessages) &&
        card.actionableConfidenceMessages.some((m: any) => /cancel/i.test(String(m?.text || "")))
    ),
  };
}

app.get("/api/cars/health", (_req, res) => {
  const { key, host } = expediaConfig();
  res.json({ ok: Boolean(key), host, provider: "expedia15", locations: Object.keys(EXPEDIA_CAR_LOCATIONS) });
});

app.get("/api/cars/search", async (req, res) => {
  const { key, host } = expediaConfig();
  if (!key) {
    return res.status(503).json({ success: false, error: "RAPIDAPI_KEY missing in HarvyX/.env.local" });
  }

  const pickupRaw = String(req.query.q || req.query.pickup || req.query.location || "London").trim();
  const carType = String(req.query.carType || req.query.class || "Any").trim();
  const defaults = defaultCarDates();
  const pickUpDate = String(req.query.pickUpDate || req.query.pickupDate || defaults.pickUpDate).trim();
  const dropOffDate = String(req.query.dropOffDate || req.query.dropoffDate || defaults.dropOffDate).trim();
  const pickUpTime = String(req.query.pickUpTime || "10:00").trim();
  const dropOffTime = String(req.query.dropOffTime || "10:00").trim();
  const loc = resolveCarLocation(pickupRaw);

  const respondFallback = (warning: string) => {
    const cars = fallbackLuxuryCars(loc.label, carType);
    return res.json({
      success: true,
      source: "cars_fallback",
      warning,
      location: loc.label,
      locationId: loc.id,
      query: pickupRaw,
      pickUpDate,
      dropOffDate,
      carType,
      count: cars.length,
      cars,
    });
  };

  try {
    const url = new URL(`https://${host}/car/search`);
    url.searchParams.set("pickUpLocation", loc.id);
    url.searchParams.set("dropOffLocation", loc.id);
    url.searchParams.set("pickUpDate", pickUpDate);
    url.searchParams.set("dropOffDate", dropOffDate);
    url.searchParams.set("pickUpTime", pickUpTime);
    url.searchParams.set("dropOffTime", dropOffTime);

    const response = await fetch(url, { headers: expediaHeaders(key, host) });
    const payload = await response.json();
    if (!response.ok || payload?.status === false) {
      return respondFallback(payload?.message || `Expedia HTTP ${response.status}`);
    }

    const listings =
      payload?.data?.carSearchOrRecommendations?.carSearchResults?.carSearchListings || [];
    const cards = (Array.isArray(listings) ? listings : [])
      .filter((c: any) => c?.__typename === "CarOfferCard")
      .map((c: any, i: number) => normalizeExpediaCarOffer(c, i))
      .filter((c: any) => matchesCarClass(c.category, carType));

    if (!cards.length) {
      return respondFallback("No Expedia inventory for this class/location — curated elite fleet.");
    }

    return res.json({
      success: true,
      source: "expedia",
      location: loc.label,
      locationId: loc.id,
      query: pickupRaw,
      pickUpDate,
      dropOffDate,
      carType,
      count: cards.length,
      cars: cards.slice(0, 24).map((c: any) => ({ ...c, location: loc.label })),
    });
  } catch (error: any) {
    console.warn("[harvyx] Expedia cars failed:", error?.message || error);
    return respondFallback(error?.message || "cars search failed");
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
