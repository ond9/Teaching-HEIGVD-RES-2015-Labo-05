/*
 * st4ck 2015 Monitor
 * it seem to work (maybe a)
 *
 * I do all of this like a fool... 
 * i have to look fo an object oriented version
 * 
 * comment : idClient is incremented and older disconnected idClient never can be resused
 * have to get better approch (ID is realy needed ?)
 *
 */

var port = 33333;
var dgram = require( "dgram" );
var server = dgram.createSocket( "udp4" );

/* dockerode API */
var Docker = require('dockerode');
var docker = new Docker(); // to check don't know if correct
var container = docker.getContainer('reverse_proxy');

var listClient = [];
var timeInterval = 5000; // check every 5 seconds 
var timeOut = 10000; // timeout is 10 seconds max


var httpd_head = new Buffer("<VirtualHost *:80> \n\
   \tProxyRequests off \n\
   \n\
   \tHeader add Set-Cookie \"ROUTEID=.%{BALANCER_WORKER_ROUTE}e; path=/\" env=BALANCER_ROUTE_CHANGED \n\
   \t<Proxy balancer://frontend>");


var httpd_tail = new Buffer("\t\tProxySet lbmethod = byresquests \n\
   \t</Proxy> \n\
   \n\
   \tProxyPass /api/ balancer://backend/ \n\
   \tProxyPass /    balancer://frontend/ \n\
   \tProxyPassReverse /api/ balancer://backend/ \n\
   \tProdyPassReverse /  balancer://frontend/ \n\
   \n\
</VirtualHost>")

// client struct
function Client(ip, port, ID, TYPE, date_timeout) {
  this.ip = ip;
  this.port = port;
  this.ID = ID;
  this.TYPE = TYPE;
  this.date_timeout = date_timeout;
}


/*
 *
 * rewrite conf file + do reboot of loadbalancer
 *
 */
function UpdateConfig(listOfClient) {
 
  var fs = require('fs');

  var http_content = new Buffer(httpd_head);

  for(var i = 0 ; i < listOfClient.length ; i++){
    if(listOfClient[i].TYPE === "frontend")
      http_content += "\t\tBalancerMember http://" + listOfClient[i].ip + ":80 route=["+ listOfClient[i].ID +"]\n";
  }

  http_content += "\n\t\tProxySet stickysession=ROUTEID \n\
      \t\tProxySet lbmethod = byrequests \n\
   \t</Proxy> \
   \n\
   \t<Proxy balancer://backend>\n";

   for(var i = 0; i < listOfClient.length ; i++){
    if(listOfClient[i].TYPE == "backend" )
      http_content += "\t\tBalancerMember http://" + listOfClient[i].ip + ":80\n";
    else
      console.log(listOfClient[i].TYPE + " != backend");
  }

  http_content += "\n" + httpd_tail;

  fs.writeFile("/tmp/test", http_content);

  /*do reboot loadbalancer */
  container.start(function (err, data) { // maybe restart ?
    console.log(data);
  });
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
            this[i] = obj // update client
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

    var id = msg.toString().substr(3, 64);
    var type = msg.toString().substr(74, 7);
    var p1 = new Client( rinfo.address, rinfo.port, id, type, Date.now());
    console.log('new msg received');


    /*new client come */
    if ( !listClient.contains(p1) ) {
      listClient.push(p1);
      
      UpdateConfig(listClient);

      console.log('client est : ' + p1.ip + ' : ' + p1.port + ' id: ' + p1.ID + ' type: ' + p1.TYPE, p1.date_timeout);
    }
    else {
      delete p1;
    }    

});

server.bind( port, function() {
  server.setBroadcast(true);
  server.setMulticastTTL(128);
  server.addMembership('224.1.1.1');
});


/*
 *
 * Check each timeInterval for all client in clientList 
 * and control timeOut expiration
 *
 */
setInterval( function() {

   console.log('array lenght : ' + listClient.length);

  for (var i = 0 ; i < listClient.length; i++) {

    console.log(Date.now() - listClient[i].date_timeout )
    if ( (Date.now() - listClient[i].date_timeout) > timeOut) {
      listClient.pop(listClient[i]);
      UpdateConfig(listClient);
      console.log('client removed');
    }
  }

}, timeInterval);