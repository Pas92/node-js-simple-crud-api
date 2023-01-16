import { createServer, request, RequestOptions } from 'node:http';
import * as dotenv from 'dotenv';
import { listenServer } from './listener';

import cluster from 'node:cluster';
import { cpus, hostname } from 'node:os';
import process from 'node:process';

dotenv.config();

const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  const PORT = +(process.env.port || 3000);

  // Fork workers.
  for (let i = 1; i <= numCPUs; i++) {
    try {
      const newPort = PORT + i;
      cluster.fork({
        NEW_PORT: newPort,
      });
    } catch (error) {
      console.log('Err');
    }
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

  const server = createServer((req, res) => {
    try {
      console.log(req.url);
      console.log(req.method);
      console.log(req.headers);

      let mainData = '';

      req.on('data', (chunk: string) => {
        mainData += chunk;
      });

      req.on('end', () => {
        const options: RequestOptions = {
          headers: req.headers,
          hostname: 'localhost',
          method: req.method,
          port: 5001,
          path: req.url,
        };

        const mainRequest = request(options, workerResp => {
          let dataFromWorker = '';
          workerResp.on('data', (chunk: string) => {
            dataFromWorker += chunk;
          });

          workerResp.on('end', () => {
            console.log(dataFromWorker);
            res.end(JSON.stringify(dataFromWorker));
          });
        });

        console.log(mainData);
        mainRequest.write(mainData);
        mainRequest.end();
      });
    } catch (error) {
      res.writeHead(500);
      res.end();
    }
  });

  server.listen(process.env.port || 3000);
} else {
  // Workers can share any TCP connection
  // In this case it is an HTTP server
  const server = createServer((req, res) => {
    try {
      console.log(req.headers.host);
      listenServer(req, res);
    } catch (error) {
      res.writeHead(500);
      res.end();
    }
  });
  server.listen(process.env.NEW_PORT);
  console.log(`Worker ${process.pid} started, port: ${process.env.NEW_PORT}`);
}
