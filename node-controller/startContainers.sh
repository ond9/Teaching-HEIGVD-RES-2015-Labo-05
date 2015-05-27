#!/bin/bash

docker run -d --name node-controller --privileged -v /var/run/docker.sock:/var/run/docker.sock -v /vagrant/shared_volume:/shared_volume node/node-controller
