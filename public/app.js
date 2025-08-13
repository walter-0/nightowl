import { addTodo } from './db.js';

const getData = async () => {
  console.log('lets get some data');
  try {
    const response = await fetch('/api');

    if (!response.ok) {
      throw new Error(`HTTP error :( status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let done = false;
    let debugCount = 0;
    let debugSize = 0;
    const t0 = performance.now();

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;

      if (value) {
        debugSize += value.length;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (line.trim()) {
            try {
              const obj = JSON.parse(line);
              await addTodo(obj);
              debugCount++;
            } catch (error) {
              console.error('something happened :(', error);
            }
          }
        }
      }
    }

    const t1 = performance.now();

    console.log(`Finished writing ${debugCount} objects in ${t1 - t0} ms. Total size ${debugSize} bytes`);
  } catch (error) {
    console.error('Fetch error', error);
  }
};

const button = document.getElementById('get-data-button');
button.addEventListener('click', getData);
