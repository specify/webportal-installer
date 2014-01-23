SOLR_HOME=/var/lib/specify-solr
SOLR_VERSION=4.6.0

SOLR_DIST=solr-$(SOLR_VERSION)

all: specify-solr.war solr-home/.dirstamp specify-config.xml

clean:
	rm -rf specify-solr specify-solr.war solr-home SolrFldSchema.xml \
		schema.xml solrconfig.xml

realclean: clean
	rm -rf $(SOLR_DIST) PortalApp $(SOLR_DIST).tgz TheSpecifyWebPortal.zip

$(SOLR_DIST).tgz:
	wget http://apache.cs.utah.edu/lucene/solr/$(SOLR_VERSION)/$@

TheSpecifyWebPortal.zip:
	wget http://update.specifysoftware.org/$@

$(SOLR_DIST)/.dirstamp: $(SOLR_DIST).tgz
	tar -zxf $<
	touch $@

PortalApp/.dirstamp: TheSpecifyWebPortal.zip
	unzip -q $<
	touch $@

specify-solr/.dirstamp: $(SOLR_DIST)/.dirstamp log4j.properties
	mkdir -p specify-solr

	# unpack the example SOLR webapp
	cd specify-solr && jar -xf ../$(SOLR_DIST)/example/webapps/solr.war

	# copy logging libraries used by SOLR
	cp $(SOLR_DIST)/example/lib/ext/* specify-solr/WEB-INF/lib/

	# configure the logging
	mkdir -p specify-solr/WEB-INF/classes/
	cp log4j.properties specify-solr/WEB-INF/classes/

	# done
	touch $@

specify-solr.war: specify-solr/.dirstamp
	jar -cf specify-solr.war -C specify-solr/ .

$(SOLR_DIST)/example/solr/collection1/conf/schema.xml: $(SOLR_DIST)/.dirstamp

SolrFldSchema.xml: PortalFiles/SolrFldSchema.xml
	# Add a root element to the schema field list.
	echo '<?xml version="1.0" encoding="UTF-8" ?>' > $@
	echo "<fields>" >> $@
	cat $< >> $@
	echo "</fields>" >> $@

schema.xml: patch_schema_xml.py $(SOLR_DIST)/example/solr/collection1/conf/schema.xml SolrFldSchema.xml
	python $^ > $@

solrconfig.xml: patch_solrconfig_xml.py $(SOLR_DIST)/example/solr/collection1/conf/solrconfig.xml
	python $^ > $@

solr-home/.dirstamp: $(SOLR_DIST)/.dirstamp PortalFiles schema.xml solrconfig.xml
	rm -rf solr-home
	cp -r $(SOLR_DIST)/example/solr solr-home
	rm -rf solr-home/collection1/data
	mkdir -p solr-home/collection1/data/index
	cp PortalFiles/solr/* solr-home/collection1/data/index
	cp schema.xml solr-home/collection1/conf/
	cp solrconfig.xml solr-home/collection1/conf/
	touch $@

specify-config.xml:
	echo '<?xml version="1.0" encoding="UTF-8"?>' > $@
	echo '<Context docBase="$(SOLR_HOME)/specify-solr.war">' >> $@
	echo '<Environment name="solr/home" type="java.lang.String" value="$(SOLR_HOME)" override="true" />' >> $@
	echo '</Context>' >> $@

install: all
	cp specify-config.xml /etc/tomcat7/Catalina/localhost/specify-solr.xml

	mkdir -p $(SOLR_HOME)
	cp -r solr-home/* $(SOLR_HOME)
	chown -R tomcat7.tomcat7 $(SOLR_HOME)

	cp specify-solr.war $(SOLR_HOME)
	echo "Restart Tomcat."
