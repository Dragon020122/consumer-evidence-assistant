Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_PATH: ":memory:",
  PRIVATE_STORAGE_PATH: ".data/test-storage",
  GENERATED_STORAGE_PATH: ".data/test-generated",
  DEV_AUTH_ENABLED: "true",
  DEMO_MODE_ENABLED: "true",
  DEV_AUTH_SECRET: "test-only-secret-with-more-than-32-characters",
  EXTRACTION_PROVIDER: "mock"
});
