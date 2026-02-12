const http = require('http');
const PORT = process.env.PORT || 3001;

http.createServer((req, res) => {
  // 1. Handle the Health Check
  if (req.url === '/health') {
    console.log(`[Port ${PORT}] Health check received.`);
    res.writeHead(200);
    res.end('Healthy');
    return;
  }

  // 2. Handle Actual Traffic
  console.log(`[Port ${PORT}] Handling request: ${req.url}`);
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end(`Response from backend on port ${PORT}\n`);
}).listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});
