import {
  createServer,
  IncomingMessage,
  ServerResponse,
  STATUS_CODES,
} from 'node:http';
import * as dotenv from 'dotenv';
import * as uuid from 'uuid';

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

const isInvalidUrl = (urlParts: string[]): boolean =>
  urlParts[0] !== 'api' || urlParts[1] !== 'users';

const isInvalidUserData = (user: User): boolean => {
  const objKeys: string[] = Object.keys(user);
  if (objKeys.length !== 3) {
    return true;
  }

  if (
    !(
      objKeys.includes('username') &&
      objKeys.includes('age') &&
      objKeys.includes('hobbies')
    )
  ) {
    return true;
  }

  return false;
};

const listenServer = (req: IncomingMessage, res: ServerResponse) => {
  console.log('Hi! I am a server');
  const urlParts: string[] = req.url?.slice(1).split('/') || [];
  console.log(urlParts);

  if (isInvalidUrl(urlParts)) {
    res.writeHead(404);
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
      let dataFromClient = '';

      req.on('data', (chunk: string) => {
        dataFromClient += chunk;
      });

      req.on('end', () => {
        let user: User;

        try {
          user = JSON.parse(dataFromClient);

          if (isInvalidUserData(user)) {
            res.statusCode = 400;
            res.statusMessage =
              'Invalid user data! Body does not contain required fields!';
            res.end();
          }

          if (typeof user.age !== 'number') {
            res.statusCode = 400;
            res.statusMessage =
              'Invalid user data! Age field should be a number!';
            res.end();
          }

          if (typeof user.username !== 'string') {
            res.statusCode = 400;
            res.statusMessage =
              'Invalid user data! Username field should be a string!';
            res.end();
          }

          if (!Array.isArray(user.hobbies)) {
            res.statusCode = 400;
            res.statusMessage =
              'Invalid user data! Hobbies field should be an array!';
            res.end();
          }

          const dbUser: UserFullData = {
            ...user,
            id: uuid.v4(),
          };

          users.push(dbUser);

          console.log(users);

          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify(dbUser));
        } catch (error) {
          res.statusCode = 400;
          res.statusMessage = 'Invalid JSON data!';
          res.end();
        }
        // TODO: check is valid user data
        // TODO: create new user
      });
      break;
    }
    case req.method === 'PUT' && urlParts.length === 3: {
      const userId = urlParts[2];

      if (!uuid.validate(userId)) {
        res.statusCode = 400;
        res.statusMessage = 'Invalid user ID!';
        res.end();
      }

      const userIndex = users.findIndex(user => user.id === userId);

      if (userIndex === -1) {
        res.statusCode = 400;
        res.statusMessage = `User with ID ${userId} does not exist`;
        res.end();
      }

      //TODO

      let dataFromClient = '';

      req.on('data', (chunk: string) => {
        dataFromClient += chunk;
      });

      req.on('end', () => {
        let user: User;

        try {
          user = JSON.parse(dataFromClient);

          if (isInvalidUserData(user)) {
            res.statusCode = 400;
            res.statusMessage =
              'Invalid user data! Body does not contain required fields!';
            res.end();
          }

          if (typeof user.age !== 'number') {
            res.statusCode = 400;
            res.statusMessage =
              'Invalid user data! Age field should be a number!';
            res.end();
          }

          if (typeof user.username !== 'string') {
            res.statusCode = 400;
            res.statusMessage =
              'Invalid user data! Username field should be a string!';
            res.end();
          }

          if (!Array.isArray(user.hobbies)) {
            res.statusCode = 400;
            res.statusMessage =
              'Invalid user data! Hobbies field should be an array!';
            res.end();
          }

          users.splice(userIndex, 1);

          console.log(users);

          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify(user));
        } catch (error) {
          res.statusCode = 400;
          res.statusMessage = 'Invalid JSON data!';
          res.end();
        }

        // TODO: check is valid user data
        // TODO: create new user
      });

      res.end();
      // TODO: check ID
      // TODO: check if user is exist
      // TODO: update user data
      break;
    }
    case req.method === 'DELETE' && urlParts.length === 3: {
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
};

const server = createServer(listenServer);

server.listen(process.env.port || 3000);
console.log('Hi all!');
