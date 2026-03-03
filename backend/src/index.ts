import express from 'express';
import cors, { CorsOptions } from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import routes from './routes';
import { localeMiddleware } from './middleware/locale';
import { ProfitSentinel } from './services/profitSentinel';
import { HarvicsAlphaEngine } from './services/harvicsAlphaEngine';

const app = express();
const server = http.createServer(app);

// TODO: Connect Postgres persistence layer once credentials are ready.
// TODO: Wire Redis/Vectordb caches for localisation lookups.
// TODO: Enforce auth middleware once identity module is hooked up.
const PORT = Number(process.env.PORT) || 4000;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const corsOptions: CorsOptions = {
  origin: true, // Allow all origins for development
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Socket.io (Harvics Orchestrator Real-Time Layer)
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend access
    methods: ["GET", "POST"]
  }
});

// Pass socket instance to Alpha Engine for broadcasting proposals
HarvicsAlphaEngine.setSocketServer(io);

io.on('connection', (socket) => {
  console.log('Harvics Orchestrator: CEO Dashboard Connected (Socket ID:', socket.id, ')');
  
  socket.on('disconnect', () => {
    console.log('Harvics Orchestrator: CEO Dashboard Disconnected');
  });
});

// UNIFIED SYSTEM: Add locale middleware BEFORE routes
// This extracts locale from headers (X-Locale or Accept-Language) and makes it available to all controllers
// When frontend selects country/language, backend will automatically return localized responses
app.use(localeMiddleware);

app.use('/api', routes);

app.get('/', (_req, res) => {
  res.send(`
    <h1>Harvics Sovereign Brain Active</h1>
    <p>Status: <strong>OPERATIONAL</strong></p>
    <p>Endpoints:</p>
    <ul>
      <li><a href="/health">/health</a> - System Status</li>
      <li><a href="/api/intelligence/attack-plan">/api/intelligence/attack-plan</a> - Daily Market Attack Plan</li>
    </ul>
  `);
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'harvics-backend',
    timestamp: new Date().toISOString()
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Harvics backend running on port ${PORT}`);
    
    // Start the Profit Sentinel Background Agent
    ProfitSentinel.start();
  });
}

export default app;

