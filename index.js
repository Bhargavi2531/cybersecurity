import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './db.js';
import checkRoutes from './routes/check.routes.js';
import adminRoutes from './routes/admin.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(helmet());
app.use(cors()); // in production, lock to your allowed origins
app.use(express.json({ limit: '200kb' }));
app.use(morgan('dev'));

// static demo page
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '..', 'public')));

// API
app.use('/api', checkRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
}).catch((e) => {
  console.error('DB connect failed', e);
  process.exit(1);
});
