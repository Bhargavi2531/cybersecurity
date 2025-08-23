import { Router } from 'express';
import { Blacklist } from '../models/Blacklist.js';

const router = Router();

function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || '';
  if (!key || key !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

router.use(requireApiKey);

// list
router.get('/blacklist', async (req, res) => {
  const items = await Blacklist.find({}).sort('-createdAt').limit(100);
  res.json(items);
});

// add
router.post('/blacklist', async (req, res) => {
  const { kind = 'host', value, reason } = req.body;
  if (!value) return res.status(400).json({ error: 'value required' });
  const exists = await Blacklist.findOne({ kind, value });
  if (exists) return res.status(409).json({ error: 'exists' });
  const item = await Blacklist.create({ kind, value, reason });
  res.status(201).json(item);
});

// remove
router.delete('/blacklist/:id', async (req, res) => {
  const id = req.params.id;
  const del = await Blacklist.findByIdAndDelete(id);
  if (!del) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

export default router;
