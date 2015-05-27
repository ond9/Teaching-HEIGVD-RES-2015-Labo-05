#!/bin/bash

docker run -d --name reverse-proxy-lb -v /vagrant/shared_volume:/shared_volume reverse-proxy-lb/reverse-proxy-lb-container
