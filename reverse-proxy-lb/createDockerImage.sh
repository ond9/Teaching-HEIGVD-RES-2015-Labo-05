#!/bin/bash
docker build -t --name reverse-proxy-lb reverse-proxy-lb/reverse-proxy-lb-container .
docker images
