# API Services - Safe Integration Guide

## ✅ Important Notes

### **NO PYTHON NEEDED!** 🎉
- These APIs are **Node.js/TypeScript** (NOT Python)
- Uses `undici` (already installed in your project)
- **Zero additional installation required**

### Safe Integration Features

1. **Automatic Fallback**: If real APIs fail, falls back to mock/profile data
2. **Error Handling**: All API calls wrapped in try-catch
3. **Caching**: Reduces API calls and improves performance
4. **No Breaking Changes**: Existing functionality preserved

---

## 🔒 Safety Features

### 1. Environment Variable Control

```bash
# Use mocks (default - safe)
USE_MOCK_PROVIDERS=true

# Use real APIs (when ready)
USE_MOCK_PROVIDERS=false
```

**The system will ONLY use real APIs when explicitly enabled!**

### 2. Graceful Fallback

If any API fails:
- ✅ Logs error (for debugging)
- ✅ Uses mock data (existing functionality)
- ✅ Never crashes
- ✅ System continues working

### 3. Caching

- Currency: 1 hour cache
- Country data: 24 hour cache  
- Weather: 30 minute cache

This means:
- ✅ Fewer API calls
- ✅ Faster responses
- ✅ Less chance of rate limits

---

## 📦 Dependencies

**Already Installed:**
- ✅ `undici@6.22.0` - HTTP client (built into Node.js)
- ✅ No additional packages needed!

**Optional (for weather):**
- `OPENWEATHER_API_KEY` - Only if you want weather data

---

## 🧪 Testing Integration

### Test 1: With Mocks (Safe - Default)
```bash
# System uses mocks - everything works as before
curl http://localhost:4000/api/localisation/countries/summary
```

### Test 2: With Real APIs
```bash
# Set environment variable
export USE_MOCK_PROVIDERS=false

# Restart backend
# Then test
curl http://localhost:4000/api/localisation/countries/summary
```

---

## 🔍 What Each Service Does

### currencyService.ts
- **API**: ExchangeRate-API
- **Cost**: FREE (no key needed)
- **Fallback**: Uses profile FX rate if API fails

### countryService.ts
- **API**: REST Countries API
- **Cost**: FREE (no key needed)
- **Fallback**: Uses profile population if API fails

### weatherService.ts
- **API**: OpenWeatherMap
- **Cost**: FREE tier (1,000 calls/day)
- **Requires**: `OPENWEATHER_API_KEY` in .env
- **Fallback**: Uses profile data if API fails or key missing

### mapService.ts
- **API**: OpenStreetMap Nominatim
- **Cost**: FREE (no key needed)
- **Rate Limit**: 1 request/second (automatically handled)

---

## 🚨 Important: Python vs Node.js

### ❌ **NOT Python**
- These API services are **Node.js/TypeScript**
- No Python installation needed
- No Python dependencies

### ✅ **AI Engine is Python** (Separate)
- Located in: `ai-engine/`
- Uses Python for AI models
- **This is separate** from these API services

---

## ✅ Verification Checklist

Before enabling real APIs:

- [x] `undici` is installed (already installed ✅)
- [x] All service files created
- [x] Error handling in place
- [x] Fallback mechanisms working
- [x] No breaking changes to existing code

**Status**: ✅ **SAFE TO USE**

---

## 🚀 Quick Start

**Default (Safe Mode - Uses Mocks):**
```bash
# Just start the server - uses mocks automatically
npm run backend
```

**Enable Real APIs (When Ready):**
```bash
# Set environment variable
export USE_MOCK_PROVIDERS=false

# Optional: Add weather API key
export OPENWEATHER_API_KEY=your_key_here

# Start server
npm run backend
```

---

## 🛡️ Safety Guarantees

1. **No Breaking Changes**: Existing code continues working
2. **Automatic Fallback**: APIs fail → use mocks
3. **Error Logging**: All errors logged, not hidden
4. **Environment Control**: Only enabled when you want
5. **Caching**: Reduces load on APIs

**Your system is protected!** ✅

