Specify Web Portal
==================

Requirements
------------

* Recent Ubuntu server
* Apache Tomcat7
** `sudo apt-get install tomcat7`
* JDK for the `jar` utility
** `sudo apt-get install default-jdk`
* Python (should be installed in Ubuntu by default)

Installation Instructions
-------------------------

1. Unpack this repository on a server with Apache Tomcat7 installed.
1. Some variables at the top of `Makefile` can be customized, but the
   defaults should be fine for Debian based systems.
1. Use the Specify Data Export tool to create a Web Portal export
   directory (someone can expand on this) for each collection
   to be hosted in the portal.
1. Copy the exported directories into the `specify_exports` directory
   in this directory. The copied directories should be given names
   that are suitable for use in URLs; so no spaces, capital letters,
   slashes or other problematic characters.
1. Build the SOLR app: `make clean && make`.
1. Install the newly built Web Portal: `sudo make install && sudo
   invoke-rc.d tomcat7 restart`
1. The portal should now be accessible at
   http://localhost:8080/specify-solr/ to a browser running on the
   server, assuming default Tomcat configuration.

The Portal can be updated by updating the contents of
`specify_exports` with new exports and repeating the make clean
... restart steps.

Tomcat Configuration
--------------------

While strictly outside the scope of these instructions, you may
wish to make the following configuration changes to Tomcat:

### Making Tomcat use port 80

For Ubuntu, getting Tomcat to listen on the standard HTTP port 80
involves changing two files. In `/etc/default/tomcat7` change
```
#AUTHBIND=no
```
to
```
AUTHBIND=yes
```

Be sure to uncomment the
line in addition to changing it to "yes".

In `/etc/tomcat7/server.xml` change
```
<Connector port="8080" protocol="HTTP/1.1" ...
```
to
```
<Connector port="80" protocol="HTTP/1.1" ...
```

See: [Ref. 1](http://thelowedown.wordpress.com/2010/08/17/tomcat-6-binding-to-a-privileged-port-on-debianubuntu/)


### Making the portal app the "Default" Tomcat servlet

If you would like to have the web portal be the default app so that
the URL is of the form "http://your.server.foo/core-name/" instead of
"http://your.server.foo/specify-solr/core-name/", change the context
file name to `ROOT.xml` in Tomcat config directory. Assuming Ubuntu:

```
cd /etc/tomcat7/Catalina/localhost
sudo mv specify-solr.xml ROOT.xml
```

See: [Ref. 2](http://wiki.apache.org/tomcat/HowTo#How_do_I_make_my_web_application_be_the_Tomcat_default_application.3F)
