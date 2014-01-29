webportal-installer
===================


Making Tomcat use port 80
-------------------------

For Ubuntu, getting Tomcat to listen on the standard HTTP port 80
involves changing two files. In `/etc/default/tomcat7` change
```
#AUTHBIND=no
```
to
```
AUTHBIND=yes
```
.

Be sure to uncomment the
line in addition to changing it to "yes". And, in
`/etc/tomcat7/server.xml` change
```
<Connector port="8080" protocol="HTTP/1.1" ...
``` 
to
```
<Connector port="80" protocol="HTTP/1.1" ...
```
.

See: http://thelowedown.wordpress.com/2010/08/17/tomcat-6-binding-to-a-privileged-port-on-debianubuntu/


Making the portal app the "Default" Tomcat servlet
--------------------------------------------------

If you would like to have the web portal be the default app so that
the URL is of the form "http://your.server.foo/core-name/" instead of
"http://your.server.foo/specify-solr/core-name/", change the context
file name to `ROOT.xml` in Tomcat config directory. Assuming Ubuntu:

```
cd /etc/tomcat7/Catalina/localhost
sudo mv specify-solr.xml ROOT.xml
```

See: http://wiki.apache.org/tomcat/HowTo#How_do_I_make_my_web_application_be_the_Tomcat_default_application.3F
