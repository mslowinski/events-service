import bodyParser from 'body-parser';
import compression from 'compression';
import errorHandler from 'errorhandler';
import express from 'express';
import helmet from 'helmet';
import HttpStatus from 'http-status-codes';

import * as AMQPEventsWorker from './consumer/consumer.worker';
import * as amqp from './lib/amqp';
import log from './lib/logger';

const workers = [AMQPEventsWorker];

const onConnected = () => {
  return Promise.all(workers.map((worker) => worker.start()));
};

amqp.EventEmmiter.on('connected', onConnected);

const disconnect = async () => {
  await amqp.close();
};
export const destroy = async () => {
  await disconnect();
};
const connect = async () => {
  await amqp.connect();
};
export const create = async () => {
  await connect();

  const app = express();
  app.set('port', process.env.CONSUMER_PORT || 3001);
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
