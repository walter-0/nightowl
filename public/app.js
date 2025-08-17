import { addPerson } from './db.js';

const now = document.getElementById('now');
const debugEl = document.getElementById('debug');

const get1k = document.getElementById('get-1k');
const get10k = document.getElementById('get-10k');
const get100k = document.getElementById('get-100k');
const get1m = document.getElementById('get-1m');
const get10m = document.getElementById('get-10m');
const get100m = document.getElementById('get-100m');

/** @type {HTMLTableSectionElement} */
const tableBody = document.getElementById('the-table').getElementsByTagName('tbody')[0];

const debugPayload = {
  bufferSize: 0,
  totalSize: 0,
  linesToRead: 0,
  linesRead: 0,
  itemsRemaining: 0,
};

get1k.addEventListener('click', getData);
get10k.addEventListener('click', getData);
get100k.addEventListener('click', getData);

get1m.addEventListener('click', getData);
get10m.addEventListener('click', getData);
get100m.addEventListener('click', getData);

setInterval(() => {
  now.textContent = Date.now();
  printDebug();
}, 1);

function printDebug() {
  debugEl.textContent = JSON.stringify(debugPayload);
}

async function getData(event) {
  const itemsCount = event.target.dataset.itemsCount;
  console.log(`Fetching ${itemsCount} items`);

  try {
    const response = await fetch(`/api/${event.target.dataset.itemsCount}`);

    if (!response.ok) {
      throw new Error(`HTTP error :( status: ${response.status}`);
    }

    const t0 = performance.now();
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        debugPayload.totalSize += value.length;
        buffer += decoder.decode(value, { stream: true }); // NETWORK LIMITED
        debugPayload.bufferSize = buffer.length;

        const lines = buffer.split('\n');
        buffer = lines.pop();

        debugPayload.linesToRead = lines.length;

        for (const line of lines) {
          if (line.trim()) {
            try {
              const obj = JSON.parse(line);
              await addPerson(obj);
              debugPayload.linesRead++;
              debugPayload.itemsRemaining = itemsCount - debugPayload.linesRead;
              // addRow(obj);
            } catch (error) {
              console.error('something happened :(', error);
            }
          }
        }
      }
    }

    console.log(
      `Finished writing ${itemsCount} objects in ${Number((performance.now() - t0) / 1000).toFixed(
        3
      )} seconds. Total size ${debugPayload.totalSize} bytes`
    );
  } catch (error) {
    console.error('Fetch error', error);
  }
}

function addRow(rowData) {
  const newRow = tableBody.insertRow();

  const cell1 = newRow.insertCell();
  const cell2 = newRow.insertCell();
  const cell3 = newRow.insertCell();
  const cell4 = newRow.insertCell();

  cell1.textContent = rowData.id;
  cell2.textContent = rowData.firstName;
  cell3.textContent = rowData.lastName;
  cell4.textContent = rowData.bio;
}
