import {
  createServer,
  IncomingMessage,
  ServerResponse,
  STATUS_CODES,
} from 'node:http';
import * as dotenv from 'dotenv';

dotenv.config();

interface User {
  username: string;
  age: number;
  hobbies: string[];
}

interface UserFullData extends User {
  id: string;
}

const users: UserFullData[] = [];

const listenServer = (req: IncomingMessage, res: ServerResponse) => {
  console.log('Hi! I am a server');
  const urlParts: string[] = req.url?.slice(1).split('/') || [];
  console.log(urlParts);

  if (urlParts[0] !== 'api' || urlParts[1] !== 'users') {
    res.statusCode = 404;
    res.statusMessage = STATUS_CODES[404] || 'Not Found';
    res.end();
    return;
  }

  switch (true) {
    case req.method === 'GET' && urlParts.length === 2: {
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify(users));
      break;
    }
    case req.method === 'GET' && urlParts.length === 3: {
      // TODO: check ID
      // TODO: check if user is exist
      // TODO: return user
      break;
    }
    case req.method === 'POST' && urlParts.length === 2: {
      // TODO: check is valid user data
      // TODO: create new user
      break;
    }
    case req.method === 'PUT' && urlParts.length === 3: {
      // TODO: check ID
      // TODO: check if user is exist
      // TODO: update user data
      break;
    }
    case req.method === 'PUT' && urlParts.length === 3: {
      // TODO: check ID
      // TODO: check if user is exist
      // TODO: update user data
      break;
    }
    default: {
      res.statusCode = 400;
      res.statusMessage = STATUS_CODES[400] || 'Bad request';
      res.end();
    }
  }
  res.end();
};

const server = createServer(listenServer);

server.listen(process.env.port || 3000);
console.log('Hi all!');
