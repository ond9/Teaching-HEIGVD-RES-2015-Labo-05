/*
 * st4ck 2015
 * 
 *
 */

// check args
if (process.argv.length != 4) {
	console.log('usage: ' + process.argv[0] + ' ' + process.argv[1] + ' <ID> <TYPE>');
	return 1;
}

var dgram = require( "dgram" );
var client = dgram.createSocket( "udp4" );
    
var message = new Buffer(process.argv[2] + " " + process.argv[3]);
var timeInterval = 10000; // send "ping" every 10 seconds

// send msg eacb timeInterval
setInterval( function() {
	client.send(message, 0, message.length, 33333, "224.1.1.1");

}, timeInterval);

