/*
 * st4ck 2015 Monitor
 * it seem to work (maybe)
 *
 * I do all of this like a fool... 
 * i have to look fo an object oriented version
 * 
 * comment : idClient is incremented and older disconnected idClient never can be resused
 * have to get better approch (ID is realy needed ?)
 *
 */

var host = "localhost", port = 33333;
var dgram = require( "dgram" );
var server = dgram.createSocket( "udp4" );

var idClient = 0;
var listCLient = [];
var timeInterval = 5000; // check every 5 seconds 
var timeOut = 10000; // timeout is 10 seconds max

// client struct
function Client(ID, ip, port, msg, date) {
  this.ID = ID;
  this.ip = ip;
  this.port = port;
  this.msg = msg;
  this.date = date;
}

/*
 *
 * Check if clientList contains client
 *
 */
Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i].ip === obj.ip) {

            var now = new Date();
            this[i].date = now;
            return true;
        }
    }
    return false;
}

/*
 *
 * Executed each time server receive udp datagram
 *
 */
server.on( "message", function( msg, rinfo ) {

    var p1 = new Client(idClient++, rinfo.address, rinfo.port, msg);
    console.log('new msg received');

    if ( !listCLient.contains(p1) ) {
      listCLient.push(p1);
      console.log('client est '  + p1.ID + ' : ' + p1.ip + ' : ' + p1.port + ' msg: ' + p1.msg, new Date());
    }
    else {
      delete p1;
    }    

});

server.bind( port, host );

/* mutlicast
server.setBroadcast(true)
server.setMulticastTTL(128);
server.addMembership('230.185.192.108'); 
*/

/*
 *
 * Check each timeInterval for all client in clientList 
 * and control timeOut expiration
 *
 */
setInterval( function() {

  var now = new Date();

   console.log('array lenght : ' + listCLient.length);

  for (var i = 0, len = listCLient.length; i < len; i++) {
    if ( now - listCLient[i].date > timeOut) {
      listCLient.pop(listCLient[i]);
      console.log('client removed');
    }
  }

}, timeInterval);