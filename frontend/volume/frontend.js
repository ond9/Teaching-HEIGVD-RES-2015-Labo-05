#!/usr/bin/nodejs
var os = require('os');
var http = require('http');

var server = http.createServer().listen(8000);

server.on('request', function(req, res) {
	req.setEncoding('utf8');

	// beginning of large string
	var main_html = "<!DOCTYPE html>\n\
	<html lang=\"en_US\">\n\
	<head>\n\
	<title>Wonderfull Quotes From Beyond the InterWeb</title>\n\
	<script src=\"http://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js\"></script>\n\
	<!--\n\
	<script src=\"http://localhost/jquery-1.11.3.min.js\"></script>\n\
	-->\n\
	<script>\n\
	function loadNewQuote() {\n\
	   var url = \"http://192.168.42.42/api\";\n\
	 	  $.getJSON(url, {format: \"json\"}).done(function(data) {\n\
	 	  $.each(data, function(key, val) {\n\
	 		  if (key == 'quote') {\n\
	 			  console.log(val.toString());\n\
	 				  document.getElementById(\"quote\").innerHTML = val;\n\
	 		  }\n\
	 		  else if (key == 'ip') {\n\
	 			  console.log(val.toString());\n\
	 				  document.getElementById(\"backendIP\").innerHTML = val;\n\
	 		  }\n\
	 	  });\n\
	});\n\
	}\n\
	</script>\n\
	</head>\n\
	<body onload=\"loadNewQuote()\">\n\
	<h1>Wonderfull Quotes From Beyond the InterWeb</h1>\n\
	<div>\n\
	<a id=\"quote\"></a>\n\
	</div>\n\
	<br\>\n\
	<form name=\"getNewQuote\" action=\"gen_html.sh\" method=\"POST\">\n\
	<div align=\"center\">\n\
	<input type=\"button\" onClick=\"loadNewQuote()\" value=\"Get quote!\">\n\
	</div>\n\
	</form>\n\
	<br\>\n\
	<br\>\n\
	IP backend: <a id=\"backendIP\"></a>\n\
	<br\>\n\
	IP frontend: ";
	// end of string


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

	main_html += ipaddrs.toString();
	main_html += "</body></html>";

	res.writeHead(200, {
		'Content-Type': 'text/html',
	});

	res.write(main_html);
	res.end();
});
