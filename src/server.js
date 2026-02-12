const http = require('http');

const backend_servers = [
  { host: 'localhost', port: 3001, health: true },
  { host: 'localhost', port: 3002, health: true },
  { host: 'localhost', port: 3003, health: true },
];

const PORT = 3000;


function checkBackendHealth() {
  backend_servers.forEach((server) => {
    const options = {
      hostname: server.host,
      port: server.port,
      path: '/health',
      method: 'GET',
    };
    const req = http.request(options, (res) => {
      server.health = res.statusCode === 200;
    });

    req.on('error', () => {
      server.health = false;
    });

    req.end();
  });
}

setInterval(checkBackendHealth, 10000);


const server = http.createServer((req, res) => {

  const healthy_servers = backend_servers.filter((s) => s.health);

  if (healthy_servers.length === 0) {
    res.writeHead(503, { 'Content-Type': 'text/plain' });
    res.end('Service Unavailable');
    return;
  }
  const backend_server = healthy_servers[Math.floor(Math.random() * healthy_servers.length)];

  const headers = { ...req.headers, 'X-Forwarded-For': req.socket.remoteAddress };

  const options = {
    hostname: backend_server.host,
    port: backend_server.port,
    path: req.url,
    method: req.method,
    headers,
  };

  const proxy_req = http.request(options, (proxy_res) => {
    res.writeHead(proxy_res.statusCode, proxy_res.headers);
    proxy_res.pipe(res, { end: true });
  });

  req.pipe(proxy_req, { end: true });

  proxy_req.on('error', (err) => {
    console.error(`Error forwarding request to ${backend_server.host}:${backend_server.port} - ${err.message}`);
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway');
  });
});

server.listen(PORT, () => {
  console.log(`Load balancer running on port ${PORT}`);
});

