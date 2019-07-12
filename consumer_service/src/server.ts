import { Server } from 'http';

import * as app from './app';
import * as amqp from './lib/amqp';
import log from './lib/logger';

let httpServer: Server | undefined;

const shutDown = async (exitcode: number) => {
  httpServer && httpServer.close();
  await app.destroy();
  process.exit(exitcode);
};

const registerSignals = () => {
  process.on('SIGTERM', () => shutDown(0));
  process.on('SIGINT', () => shutDown(0));

  process.on('unhandledRejection', async (err) => {
    log.error('Unhandled Rejection at:', err.stack || err);
    return shutDown(1);
  });

  process.on('uncaughtException', async (err) => {
    log.error('Unhandled Exception at:', err.stack || err);
    return shutDown(1);
  });
};

export const start = async () => {
  registerSignals();
  const expressApp = await app.create();
  httpServer = expressApp.listen(expressApp.get('port'), () => {
    log.info(
      '  Consumer App is running at http://localhost:%d in %s mode',
      expressApp.get('port'),
      expressApp.get('env')
    );
  });
};
