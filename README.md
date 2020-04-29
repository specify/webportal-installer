Specify Web Portal (Version 2.0)
================================

The Specify Collections Consortium is funded by its member
institutions. The Consortium web site is:
[http://wwww.specifysoftware.org](http://wwww.specifysoftware.org/)

Specify Web Portal Copyright © 2020 Specify Collections
Consortium. Specify comes with ABSOLUTELY NO WARRANTY. This is free
software licensed under GNU General Public License 2 (GPL2).

```
Specify Collections Consortium
Biodiversity Institute
University of Kansas
1345 Jayhawk Blvd.
Lawrence, KS 66045 USA
```

## Developer Instructions

After completing these instructions you will be able to run Specify
Web Portal 2.0.

These instructions are for deployment on a server running Ubuntu. An
export file for a single collection is required for setting up the
Specify Web Portal. This can be accomplished using the Schema Mappging
tool tool within the Specify 6 application together with the stand
alone Specify Data Export tool.

Install system dependencies
------------

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
web portal. 

1. These instructions assume the Web Portal is being setup under a
   user account with the name `specify`. If a different account is
   used, the directory paths in these instructions will need to be
   updated accordingly.

1. Clone the Web Portal 2.0 repository using git:

    ```console
    specify:~$ git clone https://github.com/specify/webportal-installer.git
    ```
    
    This will create the directory `webportal-installer`.
    
1. Configure nginx to proxy the Solr requests and serve the static
   files by copying `webportal-nginx.conf` to
   `/etc/nginx/sites-available/`:
   
   ```console
   specify:~/webportal-installer$ sudo cp webportal-nginx.conf /etc/nginx/sites-available/
   ```
   
   N.B. this file will require changes if the `webportal-installer` is
   in a different location.
   
1. Disable the default nginx site and enable the portal site:
   ```console
   specify:~/webportal-installer$ sudo rm /etc/nginx/sites-enabled/default
   specify:~/webportal-installer$ sudo ln -s /etc/nginx/sites-available/webportal.conf /etc/nginx/sites-enabled/
   specify:~/webportal-installer$ sudo systemctl restart nginx
   ```

2. Use the Specify Data Export tool to create a Web Portal export zip
   file (see the Specify 6 Data Export documentation) for each
   collection to be hosted in the portal. If aggregated collections
   are desired, replace the single colleciton with the aggregated
   collections file after the initial Web Portal installation.

3. Copy the zip files from the Specify Data Export into the
   `webportal-installer/specify_exports` directory. The copied files
   should be given names that are suitable for use in URLs; so no
   spaces, capital letters, slashes or other problematic
   characters. E.g. `kufish.zip`

4. Build the Solr app: 
   ```console
   specify:~/webportal-installer$ make clean && make
   ```

5. Copy the `webportal-solr.service` systemd unit file to
   `/etc/systemd/system/webportal-solr.service` and reload the
   systemd daemon.
   
   ```console
   specify:~/webportal-installer$ sudo cp webportal-solr.service /etc/systemd/system/
   specify:~/webportal-installer$ sudo systemctl daemon-reload
   ```
   N.B. this file will require changes if the `webportal-installer` is
   in a different location.

6. Start and enable the service:

    ```console
    specify:~/webportal-installer$ sudo systemctl start webportal-solr.service
    specify:~/webportal-installer$ sudo systemctl enable webportal-solr.service
    ```
    
7. Load the Specify data into Solr:

    ```console
    specify:~/webportal-installer$ make load-data
    ```


  When completing this step you will receive output similar to the following: 

    ```json
    {
    "responseHeader":{
    "status":0,
    "QTime":1153}}
    ```
  
8. The Web Portal is now running and can be tested by visiting the
   server's address with a web browser.
   
9. Be aware that the Solr admin page is available by default on
   port 8983. This can be useful for troubleshooting but should be
   blocked in production using a firewall rule.

Customization
-------------

TODO

Updating
--------

To update the Specify data in the webportal follow these steps.

1. Stop the webportal-solr systemd service:

    ```console
    specify:~/webportal-installer$ sudo systemctl stop webportal-solr.service
    ```

2. Use the Specify Data Export tool to create a Web Portal export zip
   file (see the Specify 6 Data Export documentation) for each
   collection to be hosted in the portal. If aggregated collections
   are desired, replace the single colleciton with the aggregated
   collections file after the initial Web Portal installation.


3. Copy the zip files from the Specify Data Export into the
   `webportal-installer/specify_exports` directory. The copied files
   should be given names that are suitable for use in URLs; so no
   spaces, capital letters, slashes or other problematic
   characters. E.g. `kufish.zip`
   
4. Build the Solr app: 

    ```console
    specify:~/webportal-installer$ make clean && make
    ```

6. Start the webportal-solr service:

    ```console
    specify:~/webportal-installer$ sudo systemctl start webportal-solr.service
    ```
    
7. Load the Specify data into Solr:

    ```console
    specify:~/webportal-installer$ make load-data
    ```
    
8. The Web Portal is now running and can be tested by visiting the
   server's address with a web browser.

