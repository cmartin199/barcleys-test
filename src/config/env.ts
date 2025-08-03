import "dotenv/config";

export const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "3000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "sqlite://./dev.db",
  JWT_SECRET:
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
} as const;

// Validate required environment variables in production
if (config.NODE_ENV === "production") {
  const requiredEnvVars = ["JWT_SECRET", "DATABASE_URL"];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }
}

console.log(`🔧 Environment: ${config.NODE_ENV}`);
console.log(`🌐 Port: ${config.PORT}`);
