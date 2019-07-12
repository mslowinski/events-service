import * as amqp from 'amqplib';
import Emmiter from 'events';

export const EventEmmiter = new Emmiter();
EventEmmiter.setMaxListeners(0);

let connection: amqp.Connection;
let channel: amqp.Channel;

export interface AMQPMessage<P> {
  traceId: string;
  payload: P;
}

export const connect = async (): Promise<amqp.Channel> => {
  if (!connection) {
    const connectOptions: amqp.Options.Connect = {
      protocol: 'amqp',
      hostname: process.env.RABBITMQ_HOST || 'localhost',
      port: Number(process.env.RABBITMQ_PORT || 5672),
      username: process.env.RABBITMQ_USER || 'guest',
      password: process.env.RABBITMQ_PASSWORD || 'guest',
      heartbeat: Number(process.env.RABBITMQ_HEARTBEAT) || 20
    };
    try {
      connection = await amqp.connect(connectOptions);
    } catch (err) {
      console.log(err);
    }
  }
  if (!channel && connection) {
    channel = await connection.createChannel();
  }
  await channel.assertExchange('default', 'topic');
  await channel.assertQueue('amqp.events');
  EventEmmiter.emit('connected');
  return channel;
};

export const publish = async (
  routingKey: string,
  content: any,
  correlationId?: string
): Promise<void> => {
  if (!channel) {
    throw new Error('Please connect to AMQP first.');
  }

  channel.publish('default', routingKey, Buffer.from(JSON.stringify(content)), {
    contentType: 'application/json',
    correlationId
  });
};

export const close = async () => {
  channel && channel.close();
  connection && connection.close();
  EventEmmiter.emit('closed');
};

// todo - can subscribe before and check subscription also is working
export const healthcheck = async () =>
  publish('healthcheck', { service: require('../../package.json').name });
