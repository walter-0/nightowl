import express from 'express';
import fs from 'node:fs';
import { parse } from 'ndjson';
import { join } from 'node:path';

const app = express();
const port = 3000;

app.use(express.static(join(import.meta.dirname, '/public')));

app.get('/api', (req, res) => {
  const readStream = fs.createReadStream(join(import.meta.dirname, '/public/todos.ndjson')).pipe(parse());

  res.set({
    'Content-Type': 'application/x-ndjson',
    'Transfer-Encoding': 'chunked',
  });

  const chunks = [];

  readStream.on('data', (data) => {
    // chunks.push(JSON.stringify(data));
    res.write(JSON.stringify(data) + '\n');
  });

  readStream.on('end', () => {
    console.log('done');

    // const i = setInterval(() => {
    //   if (chunks.length) {
    //     res.write(chunks.shift() + '\n');
    //   } else {
    // clearInterval(i);
    res.end();
    // }
    // }, 1);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
