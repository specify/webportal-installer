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
        default-jre \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Create a user and group for the application
RUN groupadd -g 999 specify && \
    useradd -r -u 999 -g specify specify

# Create the application directory and set ownership
RUN mkdir -p /home/specify/webportal-installer && chown specify:specify -R /home/specify

# Switch to the specify user
USER specify

# Copy the application files into the container
COPY --chown=specify:specify . /home/specify/webportal-installer
WORKDIR /home/specify/webportal-installer

# Expose the port for the web portal
EXPOSE 80

# Switch back to root user for further configuration
USER root

# Configure nginx to proxy the Solr requests and serve the static files
COPY webportal-nginx.conf /etc/nginx/sites-available/webportal-nginx.conf

# Disable the default nginx site and enable the portal site
RUN rm /etc/nginx/sites-enabled/default \
        && ln -s /etc/nginx/sites-available/webportal-nginx.conf /etc/nginx/sites-enabled/ \
        && service nginx stop

# Redirect nginx logs to stdout and stderr
RUN ln -sf /dev/stderr /var/log/nginx/error.log && ln -sf /dev/stdout /var/log/nginx/access.log

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
