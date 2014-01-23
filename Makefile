SOLR_HOME=/var/lib/specify-solr/ # Should reflect the value in specify-config.xml

all: specify-solr.war solr-home/.dirstamp

clean:
	rm -rf specify-solr specify-solr.war solr-home SolrFldSchema.xml \
		schema.xml solrconfig.xml

realclean: clean
	rm -rf solr-4.6.0 PortalApp solr-4.6.0.tgz TheSpecifyWebPortal.zip

solr-4.6.0.tgz:
	wget http://apache.cs.utah.edu/lucene/solr/4.6.0/$@

TheSpecifyWebPortal.zip:
	wget http://update.specifysoftware.org/$@

solr-4.6.0/.dirstamp: solr-4.6.0.tgz
	tar -zxf $<
	touch $@

PortalApp/.dirstamp: TheSpecifyWebPortal.zip
	unzip -q $<
	touch $@

specify-solr/.dirstamp: solr-4.6.0/.dirstamp log4j.properties
	mkdir -p specify-solr

	# unpack the example SOLR webapp
	cd specify-solr && jar -xf ../solr-4.6.0/example/webapps/solr.war

	# copy logging libraries used by SOLR
	cp solr-4.6.0/example/lib/ext/* specify-solr/WEB-INF/lib/

	# configure the logging
	mkdir -p specify-solr/WEB-INF/classes/
	cp log4j.properties specify-solr/WEB-INF/classes/

	# done
	touch $@

specify-solr.war: specify-solr/.dirstamp
	jar -cf specify-solr.war -C specify-solr/ .

solr-4.6.0/example/solr/collection1/conf/schema.xml: solr-4.6.0/.dirstamp

SolrFldSchema.xml: PortalFiles/SolrFldSchema.xml
	# Add a root element to the schema field list.
	echo '<?xml version="1.0" encoding="UTF-8" ?>' > $@
	echo "<fields>" >> $@
	cat $< >> $@
	echo "</fields>" >> $@

schema.xml: patch_schema_xml.py solr-4.6.0/example/solr/collection1/conf/schema.xml SolrFldSchema.xml
	python $^ > $@

solrconfig.xml: patch_solrconfig_xml.py solr-4.6.0/example/solr/collection1/conf/solrconfig.xml
	python $^ > $@

solr-home/.dirstamp: solr-4.6.0/.dirstamp PortalFiles schema.xml solrconfig.xml
	rm -rf solr-home
	cp -r solr-4.6.0/example/solr solr-home
	rm -rf solr-home/collection1/data
	mkdir -p solr-home/collection1/data/index
	cp PortalFiles/solr/* solr-home/collection1/data/index
	cp schema.xml solr-home/collection1/conf/
	cp solrconfig.xml solr-home/collection1/conf/
	touch $@

install: all specify-config.xml
	cp specify-config.xml /etc/tomcat7/Catalina/localhost/

	mkdir -p $(SOLR_HOME)
	cp -r solr-home/* $(SOLR_HOME)
	chown -R tomcat7.tomcat7 $(SOLR_HOME)

	cp specify-solr.war $(SOLR_HOME)
	echo "Restart Tomcat."
