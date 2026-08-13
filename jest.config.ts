import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/src/test/**/*.test.ts"],
  setupFiles: ["./setupTests.ts"],
  setupFilesAfterEnv: ["./setupTestsAfterEnv.ts"],
};

export default config;
