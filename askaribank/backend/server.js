const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');
const path    = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize local JSON database (creates data/db.json if missing)
require('./db');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));


// Health check
app.get('/health', (req, res) => {
  res.json({ server: 'running', database: 'local-json', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => res.send('AskariBank API is running (Local DB)...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ AskariBank server running on http://localhost:${PORT}`);
  console.log(`💾 Data stored at: ${path.resolve(__dirname, 'data/db.json')}`);
});
