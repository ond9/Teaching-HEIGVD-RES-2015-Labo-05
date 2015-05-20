#!/bin/bash

docker run -d --name node-controller node/node-controller node /opt/res/heartbeats-monitor/heartbeats-monitor.js 
