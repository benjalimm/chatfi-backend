export default {
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config']
};
