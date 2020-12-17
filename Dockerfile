# Build it like this:
# docker build --tag webportal-service:improve-build .

# Run it like this:
# docker run -p 80:80 -v /absolute/location/of/your/export.zip:/home/specify/webportal-installer/specify_exports/export.zip webportal-service:improve-build

FROM ubuntu:18.04

LABEL maintainer="Specify Collections Consortium <github.com/specify>"

# Get Ubuntu packages
RUN apt-get update && apt-get -y install \
	nginx \
	unzip \
	curl \
	wget \
	python \
	python-lxml \
	make \
	lsof \
	default-jre

# Clean Up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 999 specify && \
    useradd -r -u 999 -g specify specify

RUN mkdir -p /home/specify/webportal-installer && chown specify.specify -R /home/specify

USER specify

# Get Web Portal
COPY --chown=specify:specify . /home/specify/webportal-installer
WORKDIR /home/specify/webportal-installer

EXPOSE 80

USER root

# Configure nginx to proxy the Solr requests and serve the static files by copying the provided webportal-nginx.conf to /etc/nginx/sites-available/
RUN install -o root -g root -m644 ./webportal-nginx.conf /etc/nginx/sites-available/

# Disable the default nginx site and enable the portal site
RUN rm /etc/nginx/sites-enabled/default \
	&& ln -s /etc/nginx/sites-available/webportal-nginx.conf /etc/nginx/sites-enabled/ \
	&& service nginx stop

RUN ln -sf /dev/stderr /var/log/nginx/error.log && ln -sf /dev/stdout /var/log/nginx/access.log

# Build the Solr app
# Run Solr in foreground
# Wait for Solr to load
# Import data from the .zip file
# Run Docker in foreground
CMD make clean-all && make build-all \
	&& ./build/bin/solr start -force \
	&& sleep 10 \
	&& make load-data \
	&& nginx -g 'daemon off;'