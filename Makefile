# Directory where SOLR indices are stored.
export SOLR_HOME=/var/lib/specify-solr

# Version of SOLR to use.
export SOLR_VERSION=4.6.0

# Set to false to allow SOLR admin page to be available.
export DISABLE_ADMIN=true

# Directory where Tomcat finds which webapps to run.
TOMCAT_CONTEXT=/etc/tomcat7/Catalina/localhost

# Mirror for downloading Apache SOLR.
SOLR_MIRROR=http://apache.cs.utah.edu/lucene/solr

export SOLR_DIST=solr-$(SOLR_VERSION)
export TOPDIR=$(shell pwd)

all: build

install: all
	# Adding app to Tomcat config.
	cp build/specify-config.xml $(TOMCAT_CONTEXT)/specify-solr.xml

	# Copying SOLR home directory into place.
	rm -rf $(SOLR_HOME)
	mkdir -p $(SOLR_HOME)
	cp -r build/solr-home/* $(SOLR_HOME)
	chown -R tomcat7.tomcat7 $(SOLR_HOME)

clean:
	rm -rf build/

realclean: clean
	rm -rf $(SOLR_DIST).tgz $(SOLR_DIST) unpacked-war

build: $(SOLR_DIST) unpacked-war build.make
	mkdir -p build
	$(MAKE) -f $(TOPDIR)/build.make -C build

$(SOLR_DIST).tgz:
	# Fetching SOLR distribution tar ball.
	wget $(SOLR_MIRROR)/$(SOLR_VERSION)/$@

$(SOLR_DIST): $(SOLR_DIST).tgz
	# Unpacking SOLR distribution.
	tar -zxf $<

$(SOLR_DIST)/%: $(SOLR_DIST)

unpacked-war: $(SOLR_DIST)/example/webapps/solr.war
	# Unpack the example SOLR webapp.
	mkdir -p unpacked-war
	cd unpacked-war && jar -xf ../$<
