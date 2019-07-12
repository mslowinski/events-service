import bodyParser from 'body-parser';
import compression from 'compression';
import errorHandler from 'errorhandler';
import express from 'express';
import helmet from 'helmet';
import HttpStatus from 'http-status-codes';
import cron = require('node-cron');

import * as amqp from './lib/amqp';
import log, { updateLogger } from './lib/logger';
import * as ProducerService from './producer/producer.service';

const cronJob = cron.schedule(
  process.env.EVENTS_SENT_FREQUENCY_EXPRESSION || '* * * * *',
  async () => {
    await ProducerService.sendEventToQueue({ message: 'Sample event...' });
  }
);
const disconnect = async () => {
  await amqp.close();
};

export const destroy = async () => {
  await disconnect();
  cronJob.destroy();
};

const connect = async () => {
  await amqp.connect();
  cronJob.start();
};

export const create = async () => {
  await connect();

  const app = express();
  app.set('port', process.env.PRODUCER_PORT || 3000);
  app.set('env', process.env.NODE_ENV || 'development');

  app.use(compression());
  app.use(helmet());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.get('/healthz', async (req, res) => {
    try {
      await amqp.healthcheck();
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(err);
    }

    return res.status(HttpStatus.OK).json({ uptime: process.uptime() });
  });

  if (app.get('env') === 'development') {
    app.use(errorHandler());
  } else {
    app.use(
      (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        log.error(err); // todo - add traceId to error log, to bound client error message with error logs

        // follow: https://tools.ietf.org/html/rfc7807
        res.status(500).json({
          serviceName: require('../../package.json').name,
          error: 'Internal server error occurred',
          traceId: req.traceId,
          spanId: 'do we need spanId from istio here?',
          code: 'some global error codes?'
        });
      }
    );
  }

  return app;
};
