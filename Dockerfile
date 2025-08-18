# Build it like this:
# docker build --tag webportal-service:improve-build .

# Run it like this:
# docker run -p 80:80 -v /absolute/location/of/your/export.zip:/home/specify/webportal-installer/specify_exports/export.zip webportal-service:improve-build

FROM ubuntu:24.04

LABEL maintainer="Specify Collections Consortium <github.com/specify>"

# Install system packages
RUN apt-get update && apt-get -y install \
        nginx \
        unzip \
        curl \
        wget \
        python3 \
        python3-lxml \
        make \
        lsof \
        openjdk-17-jre-headless \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create 'specify' group and user if they don't already exist
RUN groupadd specify || true \
 && useradd -r -g specify specify || true

# Create application directory and set ownership
RUN mkdir -p /home/specify/webportal-installer \
    && chown specify:specify -R /home/specify

# Copy application code as the unprivileged 'specify' user
USER specify
COPY --chown=specify:specify . /home/specify/webportal-installer
WORKDIR /home/specify/webportal-installer
EXPOSE 80

# Switch back to root for system configuration
USER root

# Configure nginx
COPY webportal-nginx.conf /etc/nginx/sites-available/webportal-nginx.conf
RUN rm /etc/nginx/sites-enabled/default \
    && ln -s /etc/nginx/sites-available/webportal-nginx.conf /etc/nginx/sites-enabled/ \
    && service nginx stop

# Redirect nginx logs to Docker stdout/stderr
RUN ln -sf /dev/stderr /var/log/nginx/error.log \
    && ln -sf /dev/stdout /var/log/nginx/access.log

# Default command:
# 1. Clean & build your Solr-based portal
# 2. Start Solr and wait 20s
# 3. Import CSV into Solr
# 4. Launch nginx in foreground
CMD ["sh","-c", "\
    make clean-all && \
    make build-all && \
    ./build/bin/solr start -force && \
    sleep 20 && \
    make load-data || true && \
    nginx -g 'daemon off;' \
"]