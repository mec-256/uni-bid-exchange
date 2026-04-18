import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import authRoutes from "./routes/auth";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "UniBid Exchange backend is healthy",
  });
});

app.use("/api/auth", authRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.flatten(),
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Internal server error";

  res.status(500).json({
    success: false,
    message,
  });
});

export default app;
