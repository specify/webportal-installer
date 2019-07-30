Specify Web Portal
==================

Requirements
------------

* Python 2.7
* Nginx webserver
* JRE for running Solr
* GNUMake
* Unzip utility
* cURL utility


Installation Instructions
-------------------------

These instructions illustrate the fewest steps needed to install the
web portal. For a more advanced configuration providing automatic
updates, see below.

1. Unpack this repository on your server.
2. Use the Specify Data Export tool to create a Web Portal export zip
   file (see the Specify 6 Data Export documentation) for each collection
   to be hosted in the portal.
3. Copy the zip files into the `specify_exports` directory in this
   directory. The copied files should be given names that are
   suitable for use in URLs; so no spaces, capital letters, slashes or
   other problematic characters. E.g. `kufish.zip`
4. Build the SOLR app: `make clean && make`.
5. Copy the solr core to the solr installation:
    mkdir ../solr-7.5.0/server/solr/[CORENAME]
    cp -r cores/[CORENAME]/core/* ../solr-7.5.0/server/solr/[CORENAME]
    cp cores/[CORENAME]/web.xml ../solr-7.5.0/server/solr-webapp/webapp/WEB-INF/web.xml (Only necessary for first core.)
6. Start solr
   solr-7.5.0/bin/solr start
7. Import the csv data:
curl 'http://localhost:8983/solr/[CORENAME]/update/csv?commit=true&encapsulator="&escape=\&header=true' --data-binary @.../build/cores/[CORENAME]/PortalFiles/PortalData.csv -H 'Content-type:application/csv'



8. Move the built webportal to convenient location: `mv build /home/speciy/webportal`.
9. Configure Nginx to serve the portal: `sudo emacs /etc/nginx/sites-available/webportal.conf`
   ```conf
   server {
       listen 80 default_server;

       rewrite ^/([^/]+)/select /solr/$1/select;

       location /solr/ {
                proxy_pass http://localhost:8983/solr/;
        }

       location / {
                root /home/specify/webportal/html;
        }
   }
   ```
10. Remove the default Nginx site and enable the portal site: 
   ```
   sudo rm /etc/nginx/sites-enabled/default
   sudo ln -l /etc/nginx/sites-available/webportal.conf /etc/nginx/sites-enabled/
   ```
11. Restart Nginx: `sudo systemctl restart nginx`.


Data Only Updates
-----------------

If the fields used in a portal are unchanged and only data is being updated, delete the current contents of the solr core with:

curl 'http://localhost:8983/solr/hollow/update?commit=true&stream.body=<delete><query>*%3A*</query></delete>'
(You will probably need to add a requestParsers block to the solrconfig.xml file for the core. Add it to the requestDispatcher block:
<requestDispatcher>
    <requestParsers enableRemoteStreaming="true"
                enableStreamBody="true"
                multipartUploadLimitInKB="2048"
                formdataUploadLimitInKB="2048"
                addHttpRequestToContext="false" />

    
    <httpCaching never304="true" />
</requestDispatcher>
(See http://lucene.apache.org/solr/guide/requestdispatcher-in-solrconfig.html)  
 
Then use the curl csv import command above to add the new data.


Schema Definition Updates
-------------------------
 
In this case you will need to stop solr (solr-7.5.0/bin/solr stop), remove the cores to be updated from your solr server directory, and follow all the installation steps besides the http configuration. 



