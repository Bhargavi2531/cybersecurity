import { Router } from 'express';
import { Blacklist } from '../models/Blacklist.js';
import { URL } from 'url';

const router = Router();

/**
 * GET /api/check?url=<url>
 * Response:
 *  { safe: true/false, reasons: [..], host, protocol }
 */
router.get('/check', async (req, res) => {
  const raw = req.query.url;
  if (!raw) return res.status(400).json({ error: 'Missing url parameter' });

  let parsed;
  try {
    parsed = new URL(raw);
  } catch (e) {
    // try add scheme
    try {
      parsed = new URL('http://' + raw);
    } catch (e2) {
      return res.status(400).json({ error: 'Invalid URL' });
    }
  }

  const host = parsed.hostname.toLowerCase();
  const protocol = parsed.protocol.replace(':', '');
  const reasons = [];

  // 1) Insecure protocol (not https)
  if (protocol !== 'https') {
    reasons.push('Connection is not HTTPS');
  }

  // 2) Check blacklists: exact host match
  const hostMatch = await Blacklist.findOne({ kind: 'host', value: host }).lean();
  if (hostMatch) reasons.push(`Host blacklisted: ${hostMatch.reason || hostMatch.value}`);

  // 3) Check domain-level blacklist (e.g., example.com should match sub.example.com)
  const domainMatches = await Blacklist.find({ kind: 'domain' }).lean();
  for (const dm of domainMatches) {
    if (host === dm.value || host.endsWith('.' + dm.value)) {
      reasons.push(`Domain blacklisted: ${dm.reason || dm.value}`);
      break;
    }
  }

  // 4) Pattern checks (regex-like values)
  const patterns = await Blacklist.find({ kind: 'pattern' }).lean();
  for (const p of patterns) {
    try {
      const re = new RegExp(p.value, 'i');
      if (re.test(host) || re.test(parsed.href)) {
        reasons.push(`Pattern matched: ${p.reason || p.value}`);
        break;
      }
    } catch (e) {
      // ignore broken regex in DB
    }
  }

  // 5) Simple heuristics: suspicious characters or long domain labels
  if (host.includes('@') || host.includes(' ')) reasons.push('Suspicious host characters');
  const labels = host.split('.');
  if (labels.some(l => l.length > 63)) reasons.push('Unusually long domain label');

  const safe = reasons.length === 0;
  return res.json({
    safe,
    host,
    protocol,
    reasons
  });
});

export default router;
