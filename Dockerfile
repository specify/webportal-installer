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
	python3 \
	python3-lxml \
	unzip \
	wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*


FROM specify_base_ubuntu as webportal

# Get Web Portal
RUN cd /home/ \
	&& mkdir specify \
	&& cd specify \
	&& git clone https://github.com/cryoarks/webportal-installer/
WORKDIR /home/specify/webportal-installer/
RUN git checkout python3_solr8.11


# Copy the zip files from the Specify Data Export into the webportal-installer/specify_exports
COPY export.zip ./specify_exports/

# Build the Solr app
RUN cd /home/specify/webportal-installer/  && make clean && make build

# Run Solr in foreground
# Give Solr time to get up and running
# Import .zip file
CMD ./build/bin/solr start -force -p 8983 \
	&& sleep 10 \
        && ./build/bin/solr create_core -c export -p 8983 -force \
	&& curl 'http://localhost:8983/solr/export/update?commit=true' --data-binary @./build/cores/export/PortalFiles/PortalData.csv  -H 'Content-type:application/csv' \
        && sleep infinity

