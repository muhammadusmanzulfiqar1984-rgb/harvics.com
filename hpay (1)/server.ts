import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import {
  harveyFromLedger,
  mountHPayApi,
  seedHPayDb,
} from "./server/hpayApi";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3004);

  app.use(cors());
  app.use(express.json());

  await seedHPayDb();
  mountHPayApi(app);

  app.post("/api/harvey", (req, res) => {
    try {
      const { prompt } = req.body || {};
      const result = harveyFromLedger(String(prompt || ""));
      res.json({
        source: "local",
        reply: result.reply,
        text: result.reply,
        actionPrepared: result.actionPrepared,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "unknown";
      res.status(500).json({ error: "Harvey failed", details: message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 HPay → http://localhost:${PORT}`);
    console.log(`🏥 Health → http://localhost:${PORT}/api/health`);
  });
}

startServer();
