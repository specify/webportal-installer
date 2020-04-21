Specify Web Portal (Version 2.0)
================================

  The Specify Collections Consortium is funded by
  its member institutions. The Consortium web site is: http://wwww.specifysoftware.org
    
  Specify 7 Copyright © 2020 Specify Collections Consortium. Specify comes with ABSOLUTELY NO WARRANTY.  This is
  free software licensed under GNU General Public License 2
  (GPL2).

    Specify Collections Consortium
    Biodiversity Institute
    University of Kansas
    1345 Jayhawk Blvd.
    Lawrence, KS 66045 USA

Developer Instructions
========================

After completing these instructions you will be able to run Specify Web Portal 2.0.

These instructions are for deployment on a server running Ubuntu. An export file for a single collection is required for setting up the Specify Web Portal. This can be accomplished using the Schema Mappging tool tool within the Specify 6 application together with the stand alone Specify Data Export tool. 


Install system dependencies.
-----------------------------------

* Python 2.7
* Nginx webserver
* JRE for running Solr
* GNUMake
* Unzip utility
* cURL utility
* python-lxml


Installation Instructions
-------------------------

These instructions illustrate the fewest steps needed to install the
web portal. For a more advanced configuration providing automatic
updates, see below.

1. Clone the Web Portal 2.0 repository by clicking on the green button (Clone or Download) at the top of the page and unpack it on your server.

    This will install Solr on the server.

2. Use the Specify Data Export tool to create a Web Portal export zip
   file (see the Specify 6 Data Export documentation) for each collection
   to be hosted in the portal. During the initial Web Portal 2.0 setup use an export file for a single collection. If aggregated collections are desired replace the single collection with the aggregated collections.
3. Create a specify_exports directory in the web portal directory and copy the zip files into it. The copied files should be given names that are
   suitable for use in URLs; so no spaces, capital letters, slashes or
   other problematic characters. E.g. `kufish.zip`
4. Build the Solr app: `make clean && make`.
5. Copy the Solr core to the Solr installation:

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
   
   When completing this step the following warnings may be issued and can safely be ignored:
   
   *** [WARN] *** Your open file limit is currently 1024.
 It should be set to 65000 to avoid operational disruption.
 If you no longer wish to see this warning, set SOLR_ULIMIT_CHECKS to false in your profile or solr.in.sh
*** [WARN] ***  Your Max Processes Limit is currently 63590.
 It should be set to 65000 to avoid operational disruption.
 If you no longer wish to see this warning, set SOLR_ULIMIT_CHECKS to false in your profile or solr.in.sh
Waiting up to 180 seconds to see Solr running on port 8983 [|]
Started Solr server on port 8983 (pid=15422). Happy searching! 

8. Import the csv data:
`curl 'http://localhost:8983/solr/[CORENAME]/update/csv?commit=true&encapsulator="&escape=\&header=true' --data-binary @build/cores/[CORENAME]/PortalFiles/PortalData.csv -H 'Content-type:application/csv'`

When completing this step you may receive output similar to the following:

{
  "responseHeader":{
    "status":0,
    "QTime":1153}} 

9. Move the built webportal to convenient location:

[WPPATH] - the directory where the web portal files reside. (E.g. /home/specify/webportl)

  `mv build [WPPATH]`

10. Create the Nginx configuration file to serve the portal: 

`sudo emacs /etc/nginx/sites-available/webportal.conf`
   ```
   server {
       listen 80 default_server;

       rewrite ^/([^/]+)/select /solr/$1/select;

       location /solr/ {
                proxy_pass http://localhost:8983/solr/;
        }

       location / {
                root [WPPATH]/html;
        }
   }
   ```
11. Remove the default Nginx site and enable the portal site:
   ```
   sudo rm /etc/nginx/sites-enabled/default
   sudo ln -L /etc/nginx/sites-available/webportal.conf /etc/nginx/sites-enabled/
   ```
12. Restart Nginx: `sudo systemctl restart nginx`.

  The Web Portal is now running and can be tested.

Data Only Updates
-----------------

If the fields used in a portal are unchanged and only data is being updated, delete the current contents of the solr core with:

`curl 'http://localhost:8983/solr/hollow/update?commit=true&stream.body=<delete><query>*%3A*</query></delete>'`
(You will probably need to add/edit a requestParsers block in the `solr-[SOLRVERSION]/server/solr/[CORENAME]/conf/solrconfig.xml` file for the core. Add it to the requestDispatcher block:
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

Then use the curl CSV import command above to add the new data.


Schema Definition Updates
-------------------------

In this case, you will need to stop Solr (solr-[SOLRVERSION]/bin/solr stop), remove the cores to be updated from your Solr server directory, and follow all the installation steps besides the HTTP configuration.


Web Portal Application Updates
------------------------------

If a new version of the Web Portal is being installed it will be necessary to perform step 8 after building.
