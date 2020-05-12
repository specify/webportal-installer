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
    specify@wp:~$ git clone https://github.com/specify/webportal-installer.git
    ```
    
    This will create the directory `webportal-installer`.
    
1. Configure nginx to proxy the Solr requests and serve the static
   files by copying the provided `webportal-nginx.conf` to
   `/etc/nginx/sites-available/`:
   
   ```console
   root@wp:~# install -o root -g root -m644 /home/specify/webportal-installer/webportal-nginx.conf /etc/nginx/sites-available/
   ```
   
   N.B. this file will require changes if the `webportal-installer` is
   in a different location.
   
1. Disable the default nginx site and enable the portal site:
   ```console
   root@wp:~# rm /etc/nginx/sites-enabled/default
   root@wp:~# ln -s /etc/nginx/sites-available/webportal-nginx.conf /etc/nginx/sites-enabled/
   root@wp:~# systemctl restart nginx
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
   specify@wp:~/webportal-installer$ make clean-all && make build-all
   ```

5. Copy the provided `webportal-solr.service` systemd unit file to
   `/etc/systemd/system/webportal-solr.service` and reload the
   systemd daemon.
   
   ```console
   root@wp:~# install -o root -g root -m644 /home/specify/webportal-installer/webportal-solr.service /etc/systemd/system/
   root@wp:~# systemctl daemon-reload
   ```
   N.B. this file will require changes if the `webportal-installer` is
   in a different location.

6. Start and enable the service:

    ```console
    root@wp:~# systemctl start webportal-solr.service
    root@wp:~# systemctl enable webportal-solr.service
    ```
    
7. Load the Specify data into Solr:

   ```console
   specify@wp:~/webportal-installer$ make load-data
   ```
   
   When completing this step you will receive output consisting of
   blocks of JSON. This is normal unless one of the blocks includes an
   error message.
  
8. The Web Portal is now running and can be tested by visiting the
   server's address with a web browser.
   
9. Be aware that the Solr admin page is available by default on
   port 8983. This can be useful for troubleshooting but should be
   blocked in production using firewall rules such as the following:
   
    ```console
    root@wp:~# ufw default deny incoming
    root@wp:~# ufw default allow outgoing
    root@wp:~# ufw allow ssh
    root@wp:~# ufw allow http
    root@wp:~# ufw --force enable
    ```

Customization
-------------

Certain customizations of the webportal are possible such as
background images. To enable customizations, after the webportal is
built with `make build-all`, copy the folders inside
`webportal-installer/build/setting_templates/` into
`webportal-installer/custom_settings/` and edit the files in each
folder as desired. Afterwards, `make build-html` will incorporate the
customizations into the portal without restarting any services.

The provided `webportal-nginx.conf` serves the directory
`/home/specify/custom-images/` at `/custom-images/` allowing files
place there to be used in customization.

Data-only Updates
--------

The portal can be updated with new data from exported collections
without restarting the Solr service if the export mappings are the
same.

To update the Specify data in the webportal follow these steps.


2. Use the Specify Data Export tool to create a Web Portal export zip
   file (see the Specify 6 Data Export documentation) for each
   collection to be updated. If aggregated collections
   are desired, replace the single colleciton with the aggregated
   collections file after the initial Web Portal installation.


3. Copy the zip files from the Specify Data Export into the
   `webportal-installer/specify_exports` directory. The copied files
   in the `specify_exports` directory must have the same names as the
   original exports.
   
7. Load the Specify data into Solr:

    ```console
    specify@wp:~/webportal-installer$ make load-data
    ```
    
8. Only export files newer than the last update will be loaded. The
   target `make force-load-data` will force all collections to be
   reloaded.

Full Updates
--------

If new collections are to be added to the portal or mappings of
existing collections change, the Solr service has to be stopped and
the cores rebuilt.


1. Stop the webportal-solr systemd service:

    ```console
    root@wp:~# systemctl stop webportal-solr.service
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
    specify@wp:~/webportal-installer$ make build-all
    ```

6. Start the webportal-solr service:

    ```console
    root@wp:~# systemctl start webportal-solr.service
    ```
    
7. Load the Specify data into Solr:

    ```console
    specify@wp:~/webportal-installer$ make load-data
    ```
    
8. The Web Portal is now running and can be tested by visiting the
   server's address with a web browser.

