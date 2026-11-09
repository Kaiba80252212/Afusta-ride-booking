/* Zero-dependency local preview: serves the static frontend on :3000 and
 * proxies /api/* to a locally running API (default http://127.0.0.1:4000).
 * Usage: npm run dev:api   (in another shell, against your DATABASE_URL)
 *        npm run preview */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const API = process.env.API_URL || 'http://127.0.0.1:4000';
const PORT = Number(process.env.PORT || 3000);
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.json':'application/json'};
http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    const chunks = []; req.on('data', c => chunks.push(c));
    req.on('end', async () => {
      try {
        const upstream = await fetch(API + url.pathname + url.search, { method: req.method, headers: {...req.headers, host:new URL(API).host}, body: ['GET','HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
        res.writeHead(upstream.status, Object.fromEntries(upstream.headers.entries()));
        res.end(Buffer.from(await upstream.arrayBuffer()));
      } catch { res.writeHead(502); res.end(JSON.stringify({error:'API not reachable at '+API})); }
    });
    return;
  }
  const path = normalize(join(ROOT, decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)));
  if (!path.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
  try {
    const data = await readFile(path);
    res.writeHead(200, {'Content-Type': types[extname(path)] || 'application/octet-stream', 'Cache-Control': 'no-cache'});
    res.end(data);
  } catch { res.writeHead(404); res.end('not found'); }
}).listen(PORT, '0.0.0.0', () => console.log(`Preview on http://localhost:${PORT} (API proxy -> ${API})`));
