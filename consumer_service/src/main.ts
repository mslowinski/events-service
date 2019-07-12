import log from './lib/logger';
import { start } from './server';

start().catch((error) => {
  log.error('Unexpected application crash', error);
  process.exit(1);
});
