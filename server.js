const http = require('http');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const server = http.createServer();
let port = 8080;
let logged = false;

server.on('request', (req, res) => {
  const url = req.url == '/' ? 'index.html' : req.url.substring(1);
  const fullUrl = path.resolve(__dirname, 'public', url);

  fs.exists(fullUrl, exists => {
    if (exists) {
      res.setHeader('Content-Type', getResourceType(fullUrl));
      fs.createReadStream(fullUrl).pipe(res);
    } else {
      res.end(`Cannot GET ${req.url}`);
    }
  });
});

server.on('error', err => {
  if (err.code == 'EADDRINUSE') {
    port++;
    listen();
  }
});

listen();

function listen() {
  server.listen(port, err => {
    if (logged) return;

    logged = true;
    
    console.log(`Server running on port ${port}`);

    const projectUrl = `http://localhost:${port}`;
    exec(`start ${projectUrl}`, err => {
      if (err)
        console.log(`Couldn\'t open project in browser. Manually visit ${projectUrl}`);
    });
  });
}

function getResourceType(url) {
  let ext = path.extname(url).substring(1);
  switch (ext) {
    case 'js':
      return 'text/javascript';
    default:
      return `text/${ext}`;
  }
}