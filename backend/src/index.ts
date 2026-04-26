import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import { connectDb } from "./db/connect.js";
import { authRoutes } from "./routes/auth.js";
import { boardRoutes } from "./routes/boards.js";
import { taskRoutes } from "./routes/tasks.js";
import { seedDatabase } from "./seed/seedDatabase.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });
console.log("[ENV CHECK] JWT_SECRET loaded:", Boolean(process.env.JWT_SECRET));

const app = express();
const PORT = process.env.PORT ?? 4000;
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/editorial-kanban";

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000" }));
app.use(express.json());

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, service: "editorial-kanban-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/tasks", taskRoutes);

app.use(errorHandler);

async function start() {
  try {
    await connectDb(MONGODB_URI);
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

void start();
