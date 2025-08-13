import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';

const db = openDB('todo-db', 1, {
  upgrade(db) {
    console.log('Creating new object store');

    if (!db.objectStoreNames.contains('todos')) {
      const store = db.createObjectStore('todos', { autoIncrement: true });
      store.createIndex('user', 'user', { unique: false, multiEntry: true });
    }
  },
});

export const addTodo = async (todo) => {
  return (await db).add('todos', todo);
};
