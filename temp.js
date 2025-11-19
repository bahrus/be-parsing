//created by copilot

// sw.js
/* Service Worker: Convert JSON responses into streamed HTML.
   - If Content-Type includes application/json -> wrap as HTML.
   - If content looks like NDJSON (newline-delimited JSON) -> stream each line incrementally.
*/

self.addEventListener('install', (event) => {
  // Activate immediately for easier development.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(handle(event.request));
});

async function handle(request) {
  // Pass through non-GET or cross-origin if you want stricter scoping.
  if (request.method !== 'GET') return fetch(request);

  const res = await fetch(request);

  // Only transform JSON responses
  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');

  if (!isJson || !res.body) {
    // Return as-is if not JSON or body not streamable
    return res;
  }

  // Peek: decide NDJSON vs standard JSON
  // We can't reliably sniff without consuming. We'll use the header or URL hint.
  const isNdjson = ct.includes('ndjson') || /ndjson/.test(ct) || /\.ndjson($|\?)/i.test(new URL(request.url).pathname);

  return isNdjson
    ? ndjsonToHtmlStream(res)
    : jsonToHtmlStream(res);
}

// Stream NDJSON line-by-line into HTML
function ndjsonToHtmlStream(res) {
  const encoder = new TextEncoder();

  const htmlStart = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>NDJSON stream</title>
  <style>
    body { font: 14px/1.5 system-ui, sans-serif; margin: 0; }
    header { position: sticky; top: 0; background: #111; color: #eee; padding: 8px 12px; }
    pre { margin: 0; padding: 8px 12px; border-bottom: 1px solid #eee; white-space: pre-wrap; word-break: break-word; }
    .err { color: #b00; }
  </style>
</head>
<body>
<header>Streaming NDJSON → HTML</header>
<main>
`;

  const htmlEnd = `</main>
</body>
</html>`;

  const stream = new ReadableStream({
    async start(controller) {
      // Write initial HTML
      controller.enqueue(encoder.encode(htmlStart));
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buf = '';

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          // Flush complete lines
          let idx;
          while ((idx = buf.indexOf('\n')) !== -1) {
            const line = buf.slice(0, idx).trim();
            buf = buf.slice(idx + 1);
            if (!line) continue;

            try {
              const obj = JSON.parse(line);
              const html = renderJsonAsHtmlFragment(obj);
              controller.enqueue(encoder.encode(html));
            } catch (e) {
              controller.enqueue(encoder.encode(`<pre class="err">Invalid JSON line: ${escapeHtml(line)}</pre>`));
            }
          }
        }

        // Flush any trailing fragment (best-effort)
        const tail = buf.trim();
        if (tail) {
          try