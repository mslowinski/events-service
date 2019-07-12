import * as ProducerService from '../../src/producer/producer.service';
import * as amqp from '../../src/lib/amqp';

jest.mock('../../src/lib/amqp');

describe.only('ProducerService', () => {
  describe('sendEventToQueue', () => {
    it('should publish message', async () => {
      await ProducerService.sendEventToQueue({message: 'test'});
      expect(amqp.publish).toBeCalled();
    });
  });
});
