/**
 * Production static file server for Azure App Service
 * Serves the Vite-built SPA with correct MIME types and SPA fallback routing.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;

// MIME type mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.wasm': 'application/wasm',
};

// File extensions that are static assets (should NOT fallback to index.html)
const ASSET_EXTENSIONS = new Set(Object.keys(MIME_TYPES).filter(ext => ext !== '.html'));

const ROOT_DIR = __dirname;
const INDEX_HTML = path.join(ROOT_DIR, 'index.html');

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function isAssetRequest(urlPath) {
  const ext = path.extname(urlPath).toLowerCase();
  return ASSET_EXTENSIONS.has(ext) || urlPath.startsWith('/assets/');
}

function serveFile(res, filePath, statusCode = 200) {
  const mimeType = getMimeType(filePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const headers = {
      'Content-Type': mimeType,
      'Content-Length': stats.size,
      'X-Content-Type-Options': 'nosniff',
    };

    // Immutable caching for hashed assets (Vite uses content hashes)
    if (filePath.includes('/assets/')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else if (filePath.endsWith('index.html')) {
      // Never cache index.html so new deployments are picked up
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    } else {
      headers['Cache-Control'] = 'public, max-age=3600';
    }

    res.writeHead(statusCode, headers);
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  // Only handle GET and HEAD
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
    return;
  }

  // Parse URL and remove query string
  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Prevent directory traversal
  const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  // Security: ensure the resolved path is within ROOT_DIR
  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  // Try to serve the exact file
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      // File exists - serve it with correct MIME type
      serveFile(res, filePath);
    } else if (isAssetRequest(urlPath)) {
      // Asset request but file not found - return 404 (NOT index.html)
      // This prevents the MIME type mismatch error
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      // SPA route - serve index.html for client-side routing
      serveFile(res, INDEX_HTML);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Serving files from: ${ROOT_DIR}`);
});
