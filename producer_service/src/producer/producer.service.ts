import uuidv4 from 'uuid/v4';

import { AMQPMessage, publish } from '../lib/amqp';

import log from '../lib/logger';
import { MessageInterface } from './producer.model';

export const sendEventToQueue = async (payload: MessageInterface) => {
  const traceId = uuidv4();
  const message: AMQPMessage<MessageInterface> = { traceId, payload };
  await publish('query.amqp.events', message, traceId);
  log.info(`Producer sent event with with traceId: ${traceId} at ${new Date()}`);
};
