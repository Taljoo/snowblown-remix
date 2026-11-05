// Tiny static server so the browser can load the sketch's images
// (opening index.html straight from disk blocks them).
// Run:  node server.js   then open http://localhost:8000
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 8000;
const types = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".png": "image/png",
	".jpg": "image/jpeg",
	".css": "text/css",
};

http.createServer((req, res) => {
	let urlPath = decodeURIComponent(req.url.split("?")[0]);
	if (urlPath === "/") urlPath = "/index.html";
	const file = path.join(__dirname, path.normalize(urlPath));
	if (!file.startsWith(__dirname)) {
		res.writeHead(403).end();
		return;
	}
	fs.readFile(file, (err, data) => {
		if (err) {
			res.writeHead(404).end("Not found");
			return;
		}
		res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
		res.end(data);
	});
}).listen(PORT, () => console.log(`Snowblown viewer: http://localhost:${PORT}`));
