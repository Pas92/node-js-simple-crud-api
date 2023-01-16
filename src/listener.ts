import { IncomingMessage, ServerResponse, STATUS_CODES } from 'node:http';
import * as uuid from 'uuid';
import { User, UserFullData } from './db';
import { MultiDatabase } from './multi';

const mainDatabase: UserFullData[] = [];

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

export const listenServer = (
  req: IncomingMessage,
  res: ServerResponse,
  workerDb?: MultiDatabase
) => {
  const urlParts: string[] = req.url?.slice(1).split('/') || [];
  const usersDatabase = workerDb?.users || mainDatabase;

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
      res.end(JSON.stringify(usersDatabase));

      if (workerDb) {
        process.send?.(usersDatabase);
      }
      break;
    }
    case req.method === 'GET' && urlParts.length === 3: {
      const userId = urlParts[2];

      if (!uuid.validate(userId)) {
        res.statusCode = 400;
        res.statusMessage = 'Invalid user ID!';
        res.end();
      }

      const userIndex = usersDatabase.findIndex(user => user.id === userId);

      if (userIndex === -1) {
        res.statusCode = 400;
        res.statusMessage = `User with ID ${userId} does not exist`;
        res.end();
      }

      res.writeHead(200, {
        'Content-Type': 'application/json',
      });
      res.end(JSON.stringify(usersDatabase[userIndex]));

      if (workerDb) {
        process.send?.(usersDatabase);
      }
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

          usersDatabase.push(dbUser);

          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify(dbUser));

          if (workerDb) {
            process.send?.(usersDatabase);
          }
        } catch (error) {
          res.statusCode = 400;
          res.statusMessage = 'Invalid JSON data!';
          res.end();
        }
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

      const userIndex = usersDatabase.findIndex(user => user.id === userId);

      if (userIndex === -1) {
        res.statusCode = 400;
        res.statusMessage = `User with ID ${userId} does not exist`;
        res.end();
      }

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

          const userFullData: UserFullData = {
            ...user,
            id: userId,
          };

          usersDatabase.splice(userIndex, 1, userFullData);

          res.setHeader('Content-Type', 'application/json');
          res.writeHead(200);
          res.end(JSON.stringify(user));

          if (workerDb) {
            process.send?.(usersDatabase);
          }
        } catch (error) {
          res.statusCode = 400;
          res.statusMessage = 'Invalid JSON data!';
          res.end();
        }
      });
      break;
    }
    case req.method === 'DELETE' && urlParts.length === 3: {
      const userId = urlParts[2];

      if (!uuid.validate(userId)) {
        res.statusCode = 400;
        res.statusMessage = 'Invalid user ID!';
        res.end();
      }

      const userIndex = usersDatabase.findIndex(user => user.id === userId);

      if (userIndex === -1) {
        res.statusCode = 400;
        res.statusMessage = `User with ID ${userId} does not exist`;
        res.end();
      }

      usersDatabase.splice(userIndex, 1);

      res.writeHead(204);
      res.end();

      if (workerDb) {
        process.send?.(usersDatabase);
      }
      break;
    }
    default: {
      res.statusCode = 400;
      res.statusMessage = STATUS_CODES[400] || 'Bad request';
      res.end();
    }
  }
};
