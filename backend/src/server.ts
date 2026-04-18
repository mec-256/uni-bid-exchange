import app from "./app";
import { connectDB } from "./config/db";
import { env } from "./config/env";

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(env.PORT, () => {
      console.log(`UniBid Exchange backend running on port ${env.PORT}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown startup error";
    console.error(`Server failed to start: ${message}`);
    process.exit(1);
  }
};

void startServer();
