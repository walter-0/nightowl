import { Readable } from 'node:stream';
import { join } from 'node:path';
import express from 'express';
import { faker } from '@faker-js/faker';

const app = express();
const port = 3000;

app.use(express.static(join(import.meta.dirname, '/public')));

/**
 * @param {number} n
 */
function* dataGenerator(n) {
  for (let i = 0; i < n; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    yield {
      firstName,
      lastName,
      id: faker.string.uuid(),
      bio: faker.lorem.paragraph(),
      gender: faker.person.gender(),
      birthdate: faker.date.birthdate(),
      company: faker.company.name(),
      jobTitle: faker.person.jobTitle(),
      email: faker.internet.exampleEmail({ firstName, lastName }),
      phone: faker.phone.number(),
      favoriteColor: faker.color.human(),
      favoriteElement: faker.science.chemicalElement(),
      favoriteVehicleType: faker.vehicle.type(),
    };
  }
}

app.get('/api/:numItems', (req, res) => {
  const t0 = performance.now();
  const readStream = Readable.from(dataGenerator(req.params.numItems));

  res.set({
    'Content-Type': 'application/x-ndjson',
    'Transfer-Encoding': 'chunked',
  });

  console.log(`Sending ${req.params.numItems} items`);

  readStream.on('data', (chunk) => {
    res.write(JSON.stringify(chunk) + '\n');
  });

  readStream.on('end', () => {
    console.log(
      `Finished sending ${req.params.numItems} items in ${Number((performance.now() - t0) / 1000).toFixed(3)} seconds.`
    );
    res.end();
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
