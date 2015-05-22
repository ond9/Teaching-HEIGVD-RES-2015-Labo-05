// i have to fix to do fucking multicast and not unicast like this

/*
 * st4ck 2015
 * 
 *
 */

// check args
if (process.argv.length != 3) {
	console.log('usage: ' + process.argv[0] + ' ' + process.argv[1] + ' <msg>');
	return 1;
}

var dgram = require( "dgram" );
var client = dgram.createSocket( "udp4" );

var message = new Buffer(process.argv[2]);
var timeInterval = 10000; // send ping every 10 seconds

//client.setBroadcast(true);
//client.bind( function() { client.setBroadcast(true) } );

/* mutlicast
server.setBroadcast(true)
server.setMulticastTTL(128);
server.addMembership('230.185.192.108');*/


// send msg eacb timeInterval
setInterval( function() {

	
	client.send(message, 0, message.length, 33333, "127.0.0.1");

}, timeInterval);





