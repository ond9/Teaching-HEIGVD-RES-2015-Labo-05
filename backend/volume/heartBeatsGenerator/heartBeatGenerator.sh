#!/bin/bash


ID=$(cat /proc/self/cgroup | tail -n 1 | cut -d / -f 3)
TYPE=backend

node heartBeatGenerator.js ID[${ID}] TYPE[${TYPE}]