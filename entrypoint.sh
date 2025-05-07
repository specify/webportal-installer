#!/bin/sh

# Build the Solr app
# Run Solr in foreground
# Wait for Solr to load
# Import data from the .zip file
# Run Docker in foreground

set -e

echo "==> Moving to project directory"
cd /home/specify/webportal-installer

echo "DEBUG ==> Listing current directory contents:"
ls -la

echo "==> Cleaning previous builds"
make clean-all

echo "==> Building web portal and Solr cores"
make build-all

echo "==> Starting Solr"
./build/bin/solr start -force

echo "==> Waiting for Solr to start"
sleep 20

echo "==> Importing CSV data into Solr"
curl -v "http://localhost:8983/solr/export/update/csv?commit=true&encapsulator=\"&escape=\&header=true" \
  --data-binary @./build/col/export/PortalFiles/PortalData.csv \
  -H 'Content-type:application/csv'

echo "==> Starting Nginx"
exec nginx -g 'daemon off;'
