import bunyan from 'bunyan';

interface LoggerOptions extends bunyan.LoggerOptions {
  traceId?: string;
}

const defaultConfig: LoggerOptions = {
  name: process.env.LOGGER_NAME || require('../../package.json').name,
  level: 'debug'
};

let logger = bunyan.createLogger(defaultConfig);

export const updateLogger = (config: any) => {
  logger = bunyan.createLogger({
    ...defaultConfig,
    ...config
  });
};

export default logger;
