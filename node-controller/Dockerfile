#
# This image is based on another image
#
FROM node:0.10-onbuild

#
# For information: who maintains this Dockerfile?
#
MAINTAINER Olivier Liechti

#
# When we create the image, we copy files from the host into
# the image file system. This is NOT a shared folder!
#


#
# With RUN, we can execute commands when we create the image. Here,
# we install the PM2 process manager
#

EXPOSE 33333/udp
RUN npm install -g pm2@0.12.9

