import { AMQPMessage, subscribe } from '../lib/amqp';
import log from '../lib/logger';

import { MessageInterface } from './consumer.model';

export const start = async (): Promise<void> => {
  await subscribe(
    'amqp.events',
    ['query.amqp.events'],
    async (body: AMQPMessage<MessageInterface>) => {
      log.info('Consumer received event: ', body);
    }
  );
};
