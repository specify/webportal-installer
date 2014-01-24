SOLR_HOME=/var/lib/specify-solr
SOLR_VERSION=4.6.0

SOLR_DIST=solr-$(SOLR_VERSION)

all: solr-home/.dirstamp specify-config.xml

clean:
	rm -rf specify-solr specify-solr.war solr-home SolrFldSchema.xml \
		schema.xml solrconfig.xml specify-config.xml

realclean: clean
	rm -rf $(SOLR_DIST) PortalApp $(SOLR_DIST).tgz TheSpecifyWebPortal.zip

$(SOLR_DIST).tgz:
	# Fetching SOLR distribution tar ball.
	wget http://apache.cs.utah.edu/lucene/solr/$(SOLR_VERSION)/$@

TheSpecifyWebPortal.zip:
	# Fetching the Specify web portal archive.
	wget http://update.specifysoftware.org/$@

$(SOLR_DIST)/.dirstamp: $(SOLR_DIST).tgz
	# Unpacking SOLR distribution.
	tar -zxf $<
	touch $@

$(SOLR_DIST)/%: $(SOLR_DIST)/.dirstamp

PortalApp/.dirstamp: TheSpecifyWebPortal.zip
	# Unpacking Specify web portal archive.
	unzip -q $<
	touch $@

PortalApp/%: PortalApp/.dirstamp

specify-solr/.dirstamp: $(SOLR_DIST)/.dirstamp PortalApp/.dirstamp log4j.properties
	# Building directory for WAR file.
	mkdir -p specify-solr

	# Unpack the example SOLR webapp.
	cd specify-solr && jar -xf ../$(SOLR_DIST)/example/webapps/solr.war

	# Copy logging libraries used by SOLR.
	cp $(SOLR_DIST)/example/lib/ext/* specify-solr/WEB-INF/lib/

	# Configure the logging.
	mkdir -p specify-solr/WEB-INF/classes/
	cp log4j.properties specify-solr/WEB-INF/classes/

	# Copy WebPortal frontend into place.
	cp -r PortalApp/* specify-solr
	touch $@

specify-solr.war: specify-solr/.dirstamp
	# Packaging the SOLR WAR file.
	jar -cf specify-solr.war -C specify-solr/ .

SolrFldSchema.xml: PortalFiles/SolrFldSchema.xml
	# Add a root element to the schema field list.
	echo '<?xml version="1.0" encoding="UTF-8" ?>' > $@
	echo "<fields>" >> $@
	cat $< >> $@
	echo "</fields>" >> $@

schema.xml: patch_schema_xml.py $(SOLR_DIST)/example/solr/collection1/conf/schema.xml SolrFldSchema.xml
	# Patching SOLR schema with fields from Specify export.
	python $^ > $@

solrconfig.xml: patch_solrconfig_xml.py $(SOLR_DIST)/example/solr/collection1/conf/solrconfig.xml
	# Patching SOLR config for use with Specify.
	python $^ > $@

solr-home/.dirstamp: $(SOLR_DIST)/.dirstamp PortalFiles schema.xml solrconfig.xml specify-solr.war
	# Build the SOLR home directory.
	rm -rf solr-home
	cp -r $(SOLR_DIST)/example/solr solr-home
	rm -rf solr-home/collection1/data
	mkdir -p solr-home/collection1/data/index
	cp PortalFiles/solr/* solr-home/collection1/data/index
	cp schema.xml solr-home/collection1/conf/
	cp solrconfig.xml solr-home/collection1/conf/
	cp specify-solr.war solr-home
	touch $@

specify-config.xml:
	# Create config file for Tomcat to load our app.
	echo '<?xml version="1.0" encoding="UTF-8"?>' > $@
	echo '<Context docBase="$(SOLR_HOME)/specify-solr.war">' >> $@
	echo '<Environment name="solr/home" type="java.lang.String" value="$(SOLR_HOME)" override="true" />' >> $@
	echo '</Context>' >> $@

install: all
	# Adding app to Tomcat config.
	cp specify-config.xml /etc/tomcat7/Catalina/localhost/specify-solr.xml

	# Copying SOLR home directory into place.
	mkdir -p $(SOLR_HOME)
	cp -r solr-home/* $(SOLR_HOME)
	chown -R tomcat7.tomcat7 $(SOLR_HOME)
