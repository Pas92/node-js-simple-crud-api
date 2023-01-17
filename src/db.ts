export interface User {
  username: string;
  age: number;
  hobbies: string[];
}

export interface UserFullData extends User {
  id: string;
}

// export interface DbMessage {
//   usersDb: DataBase;
// }

// export const getUsersFromDb = (): UserFullData[] => {
//   return usersDB;
// };

// export const getUserIndex = (userId: string): number => {
//   return usersDB.findIndex(user => user.id === userId);
// };

// export const getUserByIndex = (userIndex: number): UserFullData => {
//   return usersDB[userIndex];
// };

// export const addUser = (user: UserFullData): void => {
//   usersDB.push(user);
// };

// export const updateUser = (
//   userIndex: number,
//   userFullData: UserFullData
// ): void => {
//   usersDB.splice(userIndex, 1, userFullData);
// };

// export const deleteUser = (userIndex: number): void => {
//   usersDB.splice(userIndex, 1);
// };

// export class DataBase {
//   private usersDB: UserFullData[] = [];

//   getUsersFromDb = (): UserFullData[] => {
//     return this.usersDB;
//   };

//   getUserIndex = (userId: string): number => {
//     return this.usersDB.findIndex(user => user.id === userId);
//   };

//   getUserByIndex = (userIndex: number): UserFullData => {
//     return this.usersDB[userIndex];
//   };

//   addUser = (user: UserFullData): void => {
//     this.usersDB.push(user);
//   };

//   updateUser = (userIndex: number, userFullData: UserFullData): void => {
//     this.usersDB.splice(userIndex, 1, userFullData);
//   };

//   deleteUser = (userIndex: number): void => {
//     this.usersDB.splice(userIndex, 1);
//   };
// }
