#!/bin/bash

docker run -d --name reverse-proxy-lb -p 80:80 -v /vagrant/shared_volume/httpd-vhosts.conf:/usr/local/apache2/conf/extra/httpd-vhosts.conf reverse-proxy-lb/reverse-proxy-lb-container
