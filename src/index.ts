import { createServer } from 'node:http';
import 'dotenv/config';
import { listenServer } from './listener';

// config();

const server = createServer((req, res) => {
  try {
    listenServer(req, res);
  } catch (error) {
    res.writeHead(500);
    res.end();
  }
});

server.listen(process.env.port || 3000);
