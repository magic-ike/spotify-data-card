import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  setupFiles: ['dotenv/config', '<rootDir>/.jest/set-env-vars.ts']
};

export default config;
