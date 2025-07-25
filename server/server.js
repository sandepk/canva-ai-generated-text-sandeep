import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

if (!process.env.TOGETHER_API_KEY) {
  throw new Error('Missing TOGETHER_API_KEY in environment variables.');
}

app.use(cors());
app.use(express.json());

app.post('/api/generate-text', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' });

  try {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen3-Coder-480B-A35B-Instruct-FP8', // Free + powerful
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: `Summarize this briefly:\n${prompt}` },
        ],
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.9
      }),
    });
    console.log("RESPONSE: ", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together API error response:', errorText);
      return res.status(500).json({ error: 'Failed to generate text', detail: errorText });
    }

    const data = await response.json();
    console.log("Together API response:", data);

    const content = data.choices?.[0]?.message?.content?.trim();
    res.status(200).json({ content });
  } catch (error) {
    console.error('Together API error:', error);
    res.status(500).json({ error: 'Failed to generate text', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
