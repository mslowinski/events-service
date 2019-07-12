import Polyglot from 'node-polyglot'
import { ExecFileSyncOptionsWithBufferEncoding } from 'child_process';

declare global {
  namespace Express {
    interface Request {
      polyglot: Polyglot
      microservice: string
      traceId: string,
    }
  }
}
