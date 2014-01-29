webportal-installer
===================



Making the portal app the "Default" Tomcat servlet
==================================================

If you would like to have the web portal be the default app so that
the URL is of the form "http://your.server.foo/core-name/" instead of
"http://your.server.foo/specify-solr/core-name/", change the context
file name to `ROOT.xml` in Tomcat config directory:

```
cd /etc/tomcat7/Catalina/localhost
sudo mv specify-solr.xml ROOT.xml
```

See: http://wiki.apache.org/tomcat/HowTo#How_do_I_make_my_web_application_be_the_Tomcat_default_application.3F
