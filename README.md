Specify Web Portal (Version 2.0)
================================

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

   [CORENAME] - the name of the exported archive without the file extension. (E.g. `kufish`)

   [SOLRVERSION] - the version of Solr. (E.g. `7.5.0`)

```
    mkdir solr-[SOLRVERSION]/server/solr/[CORENAME]
    cp -r build/cores/[CORENAME]/core/* solr-[SOLRVERSION]/server/solr/[CORENAME]
    cp build/cores/[CORENAME]/web.xml solr-[SOLRVERSION]/server/solr-webapp/webapp/WEB-INF/web.xml # Only necessary for the first core.
```
6. Restrict access to the solr admin web page. This can be done in solr 7.5 by editing `solr-[SOLRVERSION]/server/etc/jetty-http.xml`. In the ServerConnector section replace: `<Set name="host"><Property name="jetty.host" /></Set>` with `<Set name="host">127.0.0.1</Set>`
7. Start solr
   `solr-[SOLRVERSION]/bin/solr start`
8. Import the csv data:
`curl 'http://localhost:8983/solr/[CORENAME]/update/csv?commit=true&encapsulator="&escape=\&header=true' --data-binary @build/cores/[CORENAME]/PortalFiles/PortalData.csv -H 'Content-type:application/csv'`



9. Move the built webportal to convenient location: `mv build /home/speciy/webportal`.
10. Configure Nginx to serve the portal: `sudo emacs /etc/nginx/sites-available/webportal.conf`
   ```
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
11. Remove the default Nginx site and enable the portal site: 
   ```
   sudo rm /etc/nginx/sites-enabled/default
   sudo ln -L /etc/nginx/sites-available/webportal.conf /etc/nginx/sites-enabled/
   ```
12. Restart Nginx: `sudo systemctl restart nginx`.


Data Only Updates
-----------------

If the fields used in a portal are unchanged and only data is being updated, delete the current contents of the solr core with:

`curl 'http://localhost:8983/solr/hollow/update?commit=true&stream.body=<delete><query>*%3A*</query></delete>'`
(You will probably need to add/edit a requestParsers block in the `solr-[SOLRVERSION]/server/solr/[CORENAME]/config/solrconfig.xml` file for the core. Add it to the requestDispatcher block:
```
<requestDispatcher>
    <requestParsers enableRemoteStreaming="true"
                enableStreamBody="true"
                multipartUploadLimitInKB="2048"
                formdataUploadLimitInKB="2048"
                addHttpRequestToContext="false" />

    
    <httpCaching never304="true" />
</requestDispatcher>
```
(See http://lucene.apache.org/solr/guide/requestdispatcher-in-solrconfig.html)  
 
Then use the curl csv import command above to add the new data.


Schema Definition Updates
-------------------------
 
In this case you will need to stop solr (solr-[SOLRVERSION]/bin/solr stop), remove the cores to be updated from your solr server directory, and follow all the installation steps besides the http configuration. 


Web Portal Application Updates
------------------------------

If a new version of the Web Portal is being installed it will be necessary to perform step 8 after building.
