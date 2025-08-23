import 'dotenv/config';
import { connectDB } from '../src/db.js'; // when running via `npm run seed` path matters
import mongoose from 'mongoose';
import { Blacklist } from '../src/models/Blacklist.js';

async function run() {
  await connectDB();
  await Blacklist.deleteMany({});
  await Blacklist.create([
    { kind: 'host', value: 'malicious.example', reason: 'demo malware host' },
    { kind: 'domain', value: 'bad-domain.com', reason: 'phishing network' },
    { kind: 'pattern', value: '.*phish.*', reason: 'pattern: phish in host' }
  ]);
  console.log('seeded blacklist');
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
