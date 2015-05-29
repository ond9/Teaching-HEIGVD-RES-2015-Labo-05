/*
 * st4ck 2015 Monitor
 * it seem to work (maybe)
 *
 * I do all of this like a fool... 
 * i have to look fo an object oriented version
 *
 */

/* UDP stuff */
var port = 33333;
var dgram = require( "dgram" );
var server = dgram.createSocket( "udp4" );

/* dockerode API */
var Docker = require("dockerode");
var docker = new Docker(); // to check don't know if correct
var container = docker.getContainer("reverse-proxy-lb");

var listClient = [];
var timeInterval = 5000; // check every 5 seconds 
var timeOut = 10000; // timeout is 10 seconds max
var path_httpd_file = new Buffer("/shared_volume/httpd-vhosts.conf")


/* head and tail of httpd.conf file */
/* note: maybe have to use templating (Handlebars) if i have time */
var httpd_head = new Buffer("<VirtualHost *:80> \n\
   \tServerName demo.applicationres.com \n\
   \tProxyRequests off \n\
   \n\
   \tHeader add Set-Cookie \"ROUTEID=.%{BALANCER_WORKER_ROUTE}e; path=/\" env=BALANCER_ROUTE_CHANGED \n\
   \t<Proxy balancer://frontend> \n\
   \t\tProxySet lbmethod=byrequests" );


var httpd_tail = new Buffer("\t</Proxy> \n\
   \n\
   \tProxyPassMatch /api/* balancer://backend/ \n\
   \tProxyPassMatch /*     balancer://frontend/ \n\
   \tProxyPassReverse /api balancer://backend/ \n\
   \tProxyPassReverse /  balancer://frontend/ \n\
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
 * rewrite conf file + reboot of loadbalancer
 *
 */
function UpdateConfig(listOfClient) {
 
  var fs = require('fs');

  var httpd_content = new Buffer(httpd_head);

  httpd_content += "\n";

  for(var i = 0 ; i < listOfClient.length ; i++){
    if(listOfClient[i].TYPE == "fronten")
      httpd_content += "\t\tBalancerMember http://" + listOfClient[i].ip + ":8000 route="+ listOfClient[i].ID +"\n";
  }

  httpd_content += "\n\t\tProxySet stickysession=ROUTEID \n\
   \t</Proxy> \
   \n\
   \t<Proxy balancer://backend>\n";

   for(var i = 0; i < listOfClient.length ; i++){
    if(listOfClient[i].TYPE == "backend" )
      httpd_content += "\t\tBalancerMember http://" + listOfClient[i].ip + ":8000\n";
  }

  httpd_content += "\n" + httpd_tail;

  fs.writeFile(path_httpd_file.toString(), httpd_content);

  /*reboot loadbalancer */
  container.restart(function (err, data) { // maybe restart ?
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
            this[i] = obj // update client (mostly due to Date.now() updating)
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

    var id = msg.toString().substr(3, 60);
    var type = msg.toString().substr(74, 7);

    /*new client come */
    var p1 = new Client( rinfo.address, rinfo.port, id, type, Date.now());

    if ( !listClient.contains(p1) ) {
      listClient.push(p1);
      
      UpdateConfig(listClient);

      console.log('new client : ' + p1.ip + ' : ' + p1.port + ' id: ' + p1.ID + ' type: ' + p1.TYPE);
    }
    else {
      delete p1;
    }    

});

/*
 * Binding and subscribe to multicast group
 *
 */
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
