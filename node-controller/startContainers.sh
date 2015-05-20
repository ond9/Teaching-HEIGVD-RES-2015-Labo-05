#!/bin/bash

docker run -d --name node-controller --privileged -v /var/run/docker.sock:/var/run/docker.sock node/node-controller
