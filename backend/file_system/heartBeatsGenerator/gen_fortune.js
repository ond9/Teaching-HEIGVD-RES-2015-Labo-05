var os = require('os');
var http = require('http');
var spawn = require('child_process').spawn;

var server = http.createServer().listen(8000);

server.on('request', function(req, res) {
	if(req.url == '/api?format=json') {
		req.setEncoding('utf8');

		var ifaces = os.networkInterfaces();
		var ipaddrs = [];

		for (var eth in ifaces) {
			for (var i in ifaces[eth]) {
				var addr = ifaces[eth][i];
				if (addr.family === 'IPv4' && !addr.internal) {
					ipaddrs.push(addr.address);
				}
			}
		}

		var fortune = spawn('fortune', ['-a']);

		fortune.stdout.on('data', function(data) {
			var jsonObj = {
				quote: data.toString('utf8'),
				ip: ipaddrs
			};

			var json = JSON.stringify(jsonObj);

			res.writeHead(200, {
				'Content-Type': 'application/json',
				'Access-Control-Allow-Origin': '*'
			});

			res.write(json);
			res.end();

			console.log(json);
		});
	}
	else {
			res.writeHead(404);
			res.end();
			console.log('Not found: request ' + req.url.toString());
	}
});
