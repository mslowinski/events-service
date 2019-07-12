import EventEmmiter from 'events';

const AMQPEvents = new EventEmmiter();

// Set max event listeners (0 == unlimited)
AMQPEvents.setMaxListeners(0);

export default AMQPEvents;
