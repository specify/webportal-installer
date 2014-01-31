# Directory where Solr indices are stored.
export SOLR_HOME = /var/lib/specify-solr

# Set to false to allow Solr admin page to be available.
export DISABLE_ADMIN = true

# Directory where Tomcat finds which webapps to run.
TOMCAT_CONTEXT = /etc/tomcat7/Catalina/localhost

# Mirror for downloading Apache Solr.
SOLR_MIRROR = http://archive.apache.org/dist/lucene/solr

# Use latest available version of Solr 4.
export SOLR_VERSION := $(shell curl -s $(SOLR_MIRROR)/ | python get_latest_solr_vers.py)

export SOLR_DIST := solr-$(SOLR_VERSION)
export TOPDIR := $(shell pwd)

all: build

install:
	# Adding app to Tomcat config.
	cp build/specify-config.xml $(TOMCAT_CONTEXT)/specify-solr.xml

	# Copying Solr home directory into place.
	rm -rf $(SOLR_HOME)
	mkdir -p $(SOLR_HOME)
	cp -r build/solr-home/* $(SOLR_HOME)
	chown -R tomcat7.tomcat7 $(SOLR_HOME)

update: .lastupdate

.lastupdate: build
	$(MAKE) install
	invoke-rc.d tomcat7 restart
	touch $@

clean:
	rm -rf build/

realclean: clean
	rm -rf solr-* unpacked-war

build: $(SOLR_DIST) unpacked-war build.make specify_exports
	mkdir -p build
	$(MAKE) -f $(TOPDIR)/build.make -C build
	touch $@

$(SOLR_DIST).tgz:
	# Fetching Solr distribution tar ball.
	wget $(SOLR_MIRROR)/$(SOLR_VERSION)/$@

$(SOLR_DIST): $(SOLR_DIST).tgz
	# Unpacking Solr distribution.
	rm -rf $@
	tar -zxf $<

$(SOLR_DIST)/%: $(SOLR_DIST)

unpacked-war: $(SOLR_DIST)/example/webapps/solr.war
	# Unpack the example Solr webapp.
	rm -rf $@
	mkdir -p unpacked-war
	cd unpacked-war && jar -xf ../$<
