Specify Web Portal
==================

Requirements
------------

* Ubuntu Server (Tested with 18.04lts)
* Python 2.7
* Nginx webserver
* JDK for the `jar` utility
* GNUMake
* Unzip utility
* cURL utility

The necessary packages can be installed through apt.

`sudo apt-get install make python2.7 default-jdk tomcat7 unzip curl`

Installation Instructions
-------------------------

These instructions illustrate the fewest steps needed to install the
web portal. For a more advanced configuration providing automatic
updates, see below.

1. Unpack this repository on your server.
1. Use the Specify Data Export tool to create a Web Portal export zip
   file (see the Specify 6 Data Export documentation) for each collection
   to be hosted in the portal.
1. Copy the zip files into the `specify_exports` directory in this
   directory. The copied files should be given names that are
   suitable for use in URLs; so no spaces, capital letters, slashes or
   other problematic characters. E.g. `kufish.zip`
1. Build the SOLR app: `make clean && make`.
1. Move the built webportal to convenient location: `mv build /home/speciy/webportal`.
1. Create a *systemd* unit file to run Solr: `sudo nano /etc/systemd/system/webportal-solr.service`
```conf
[Unit]
Description=Solr server for Specify webportal
After=network.target

[Service]
User=specify
Group=specify
WorkingDirectory=/home/specify/webportal
ExecStart=/usr/bin/java -Djetty.host=localhost -Dsolr.solr.home=solr-home -jar start.jar

[Install]
WantedBy=multi-user.target
```
1. Start Solr: `sudo systemctl start webportal-solr`.
1. Tell Systemd to start Solr at boot: `sudo systemctl enable webportal-solr`.
1. Configure Nginx to serve the portal: `sudo emacs /etc/nginx/sites-available/webportal.conf`
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
1. Remove the default Nginx site and enable the portal site: 
```
sudo rm /etc/nginx/sites-enabled/default
sudo ln -l /etc/nginx/sites-available/webportal.conf /etc/nginx/sites-enabled/
```
1. Restart Nginx: `sudo systemctl restart nginx`.

The Portal can be updated by updating the contents of
`specify_exports` with new exports, rebuilding the portal and
restarting the webportal-solr service.
