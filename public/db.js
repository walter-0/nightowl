import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@8/+esm';

const db = openDB('person-db', 1, {
  upgrade(db) {
    console.log('Creating new object store');

    if (!db.objectStoreNames.contains('persons')) {
      db.createObjectStore('persons', { keyPath: 'id' });
    }
  },
});

export const addPerson = async (person) => {
  return (await db).add('persons', person);
};
