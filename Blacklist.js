import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
  kind: { type: String, enum: ['host','domain','pattern'], default: 'host' }, // host = exact host, domain = domain suffix, pattern = regex-style string
  value: { type: String, required: true, index: true }, // e.g. 'example.com' or 'bad.example' or '.*phish.*'
  reason: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const Blacklist = mongoose.model('Blacklist', blacklistSchema);
