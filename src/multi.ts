import { createServer, request, RequestOptions } from 'node:http';
import 'dotenv/config';
import { listenServer } from './listener';

import cluster from 'node:cluster';
import { Worker } from 'node:cluster';
import { cpus } from 'node:os';
import process from 'node:process';

import { UserFullData } from './db';

interface WorkersSet {
  [key: string]: Worker;
}

const numCPUs = cpus().length;

export interface MultiDatabase {
  users: UserFullData[];
}

const db: MultiDatabase = {
  users: [],
};

let counter = 0;

const workers: WorkersSet = {};

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  const PORT = +(process.env.port || 3000);
  for (let i = 1; i <= numCPUs; i++) {
    const newPort = PORT + i;
    const worker: Worker = cluster.fork({
      NEW_PORT: newPort,
    });

    workers[`${newPort}`] = worker;

    worker.on('message', message => {
      db.users = message;
    });
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

  const server = createServer((req, res) => {
    try {
      let mainData = '';

      req.on('data', (chunk: string) => {
        mainData += chunk;
      });

      req.on('end', () => {
        const WORKER_PORT = +(process.env.port || 3000) + counter + 1;
        workers[`${WORKER_PORT}`].send({ users: db.users });
        const options: RequestOptions = {
          headers: req.headers,
          hostname: 'localhost',
          method: req.method,
          port: WORKER_PORT,
          path: req.url,
        };

        const mainRequest = request(options, workerResp => {
          let dataFromWorker = '';
          workerResp.on('data', (chunk: string) => {
            dataFromWorker += chunk;
          });

          workerResp.on('end', () => {
            res.statusCode = workerResp.statusCode!;
            res.statusMessage = workerResp.statusMessage!;

            if (dataFromWorker) {
              res.setHeader('Content-Type', 'application/json');
              res.writeHead(res.statusCode);

              res.end(dataFromWorker);
            } else {
              res.writeHead(res.statusCode);
              res.end();
            }
          });
        });

        mainRequest.write(mainData);
        mainRequest.end();
        mainRequest.on('finish', () => {
          counter = (counter + 1) % numCPUs;
        });
      });
    } catch (error) {
      res.writeHead(500);
      res.end();
    }
  });

  server.listen(process.env.port || 3000);
} else {
  const server = createServer((req, res) => {
    try {
      console.log('Worker is using with port:', process.env.NEW_PORT);

      listenServer(req, res, db);
    } catch (error) {
      res.writeHead(500);
      res.end();
    }
  });
  server.listen(process.env.NEW_PORT);

  process.on('message', (message: MultiDatabase) => {
    db.users = message.users;

    // server.emit('request', ())
    // usersDatabase = message.usersDb;
  });
  console.log(`Worker ${process.pid} started, port: ${process.env.NEW_PORT}`);
}
