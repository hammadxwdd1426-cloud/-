import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// API endpoint to resolve any image URL or page URL (like ibb.co, imgur, etc.) to the direct image URL or base64
app.post('/api/resolve-image', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  const trimmed = url.trim();

  // If already direct image or data URL
  if (
    trimmed.startsWith('data:') ||
    trimmed.match(/^https?:\/\/i\.ibb\.co\//i) ||
    trimmed.match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i)
  ) {
    return res.json({ directUrl: trimmed });
  }

  try {
    const fetchResp = await fetch(trimmed, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });

    const contentType = fetchResp.headers.get('content-type') || '';

    // If it redirected directly to an image
    if (contentType.startsWith('image/')) {
      const buffer = await fetchResp.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const dataUrl = `data:${contentType.split(';')[0]};base64,${base64}`;
      return res.json({ directUrl: dataUrl });
    }

    // It is an HTML page (like https://ibb.co/Kz0VkSRB)
    const html = await fetchResp.text();

    // Check og:image
    const ogMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                    html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
    if (ogMatch && ogMatch[1]) {
      return res.json({ directUrl: ogMatch[1] });
    }

    // Check direct i.ibb.co
    const ibbMatch = html.match(/(https?:\/\/i\.ibb\.co\/[^\s"'<>]+)/i);
    if (ibbMatch && ibbMatch[1]) {
      return res.json({ directUrl: ibbMatch[1] });
    }

    // Check twitter:image
    const twMatch = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
    if (twMatch && twMatch[1]) {
      return res.json({ directUrl: twMatch[1] });
    }

    // Fallback: return the trimmed original
    return res.json({ directUrl: trimmed });
  } catch (err) {
    console.error('Error resolving image URL:', err);
    return res.json({ directUrl: trimmed });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
