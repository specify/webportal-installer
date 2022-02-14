# Build it like this:
# docker build --tag webportal-service:improve-build .

# Run it like this:
# docker run -p 80:80 -v /absolute/location/of/your/export.zip:/home/specify/webportal-installer/specify_exports/export.zip webportal-service:improve-build



FROM ubuntu:20.04 as specify_base_ubuntu

LABEL maintainer="Specify Collections Consortium <github.com/specify>"

ENV DEBIAN_FRONTEND=noninteractive

# Get Ubuntu packages
RUN apt-get update && apt-get -y install \
	curl \
	default-jre \
        git \
	lsof \
	make \
	nginx \
	python3 \
	python3-lxml \
	unzip \
	wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Get Ubuntu packages
#RUN apt-get update && apt-get -y install \
#	unzip curl git sudo


FROM specify_base_ubuntu as webportal

# Get Web Portal
RUN cd /home/ \
	&& mkdir specify \
	&& cd specify \
	&& git clone https://github.com/cryoarks/webportal-installer/
WORKDIR /home/specify/webportal-installer/
RUN git checkout python3_solr8.11


### INSTALL AND CONFIGURE WEB PORTAL ###

# Configure nginx to proxy the Solr requests and serve the static files by copying the provided webportal-nginx.conf to /etc/nginx/sites-available/
RUN install -o root -g root -m644 ./webportal-nginx.conf /etc/nginx/sites-available/

# Disable the default nginx site and enable the portal site:
RUN rm /etc/nginx/sites-enabled/default \
	&& ln -s /etc/nginx/sites-available/webportal-nginx.conf /etc/nginx/sites-enabled/ \
	&& service nginx stop

# Copy the zip files from the Specify Data Export into the webportal-installer/specify_exports
COPY export.zip ./specify_exports/

# Build the Solr app
RUN cd /home/specify/webportal-installer/  && make clean && make build

# Run Solr in foreground
# Give Solr time to get up and running
# Import .zip file
# Run Nginx in foreground
CMD ./build/bin/solr start -force -p 8983 \
	&& sleep 10 \
        && ./build/bin/solr create_core -c export -p 8983 -force \
	&& curl 'http://localhost:8983/solr/export/update?commit=true' --data-binary @./build/cores/export/PortalFiles/PortalData.csv  -H 'Content-type:application/csv' \
	&& nginx -g 'daemon off;'

