export SOLR_HOME=/var/lib/specify-solr
export SOLR_VERSION=4.6.0
export DISABLE_ADMIN=false

export SOLR_DIST=solr-$(SOLR_VERSION)
export TOPDIR=$(shell pwd)

all: build

install: all
	# Adding app to Tomcat config.
	cp build/specify-config.xml /etc/tomcat7/Catalina/localhost/specify-solr.xml

	# Copying SOLR home directory into place.
	rm -rf $(SOLR_HOME)
	mkdir -p $(SOLR_HOME)
	cp -r build/solr-home/* $(SOLR_HOME)
	chown -R tomcat7.tomcat7 $(SOLR_HOME)

clean:
	rm -rf build/

realclean: clean
	rm -rf $(SOLR_DIST).tgz TheSpecifyWebPortal.zip \
		$(SOLR_DIST) PortalApp unpacked-war

build: $(SOLR_DIST) PortalApp unpacked-war build-makefile
	mkdir -p build
	$(MAKE) -f $(TOPDIR)/build-makefile -C build

$(SOLR_DIST).tgz:
	# Fetching SOLR distribution tar ball.
	wget http://apache.cs.utah.edu/lucene/solr/$(SOLR_VERSION)/$@

TheSpecifyWebPortal.zip:
	# Fetching the Specify web portal archive.
	wget http://update.specifysoftware.org/$@

$(SOLR_DIST): $(SOLR_DIST).tgz
	# Unpacking SOLR distribution.
	tar -zxf $<

$(SOLR_DIST)/%: $(SOLR_DIST)

PortalApp: TheSpecifyWebPortal.zip
	# Unpacking Specify web portal archive.
	unzip -q $<

unpacked-war: $(SOLR_DIST)/example/webapps/solr.war
	# Unpack the example SOLR webapp.
	mkdir -p unpacked-war
	cd unpacked-war && jar -xf ../$<

