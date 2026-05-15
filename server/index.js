const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
}));
app.use(express.json({ limit: '32kb' }));

const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20,
  message: { error: 'Daily limit reached. Come back tomorrow, superstar 👑' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/chat', limiter);

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const ALLOWED_MODELS = new Set(['llama-3.3-70b-versatile']);

function validateChatPayload(body) {
  if (!body || typeof body !== 'object') return 'Request body is required';
  if (!ALLOWED_MODELS.has(body.model)) return 'Unsupported model';
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 20) {
    return 'Messages must be a non-empty array with at most 20 entries';
  }

  for (const message of body.messages) {
    if (!message || typeof message !== 'object') return 'Each message must be an object';
    if (!['system', 'user', 'assistant'].includes(message.role)) return 'Invalid message role';
    if (typeof message.content !== 'string' || message.content.length > 2000) {
      return 'Message content must be a string under 2000 characters';
    }
  }

  return null;
}

app.post('/chat', async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server not configured' });

  const validationError = validateChatPayload(req.body);
  if (validationError) return res.status(400).json({ error: validationError });

  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);
  } catch (err) {
    console.error('Groq request failed:', err);
    res.status(502).json({ error: 'Chat provider request failed' });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GlazeBot server running on port ${PORT}`));
