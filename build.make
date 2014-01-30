
all: solr-home specify-config.xml

ifeq ($(DISABLE_ADMIN),true)
web.xml: ../no_admin_web.xml
else
web.xml: ../with_admin_web.xml
endif
	cp $< $@

cores: $(TOPDIR)/core.make $(TOPDIR)/$(SOLR_DIST)
	# We build a SOLR core and webapp instance for
	# each subdir in specify_exports.
	cp -r $(TOPDIR)/specify_exports cores
	rm cores/README
	for core in cores/* ; do \
		$(MAKE) CORENAME=`basename $$core` -f $(TOPDIR)/core.make -C $$core ; \
	done

index.html: $(TOPDIR)/make_toplevel_index.py $(TOPDIR)/index_skel.html cores
	python $(TOPDIR)/make_toplevel_index.py $(TOPDIR)/index_skel.html \
		cores/*/webapp/resources/config/settings.json > $@

specify-solr.war: $(TOPDIR)/unpacked-war $(TOPDIR)/$(SOLR_DIST) index.html \
		$(TOPDIR)/PortalApp $(TOPDIR)/log4j.properties web.xml cores

	# Building directory for WAR file.
	rm -rf specify-solr
	mkdir -p specify-solr

	# Copy example WAR contents.
	cp -r $(TOPDIR)/unpacked-war/* specify-solr

ifeq ($(DISABLE_ADMIN),true)
	# Removing admin page.
	rm specify-solr/admin.html
endif

	# Include patched web.xml.
	cp web.xml specify-solr/WEB-INF/

	# Copy logging libraries used by SOLR.
	cp $(TOPDIR)/$(SOLR_DIST)/example/lib/ext/* specify-solr/WEB-INF/lib/

	# Configure the logging.
	mkdir -p specify-solr/WEB-INF/classes/
	cp $(TOPDIR)/log4j.properties specify-solr/WEB-INF/classes/

	# Copy the webapp instances into place.
	for core in cores/* ; do \
		cp -r $$core/webapp specify-solr/`basename $$core` ; \
	done

	# Copy toplevel index.html into place.
	cp index.html specify-solr/

	# Packaging the SOLR WAR file.
	jar -cf specify-solr.war -C specify-solr/ .

solr-home: $(TOPDIR)/$(SOLR_DIST) cores specify-solr.war solr.xml
	# Build the SOLR home directory.
	rm -rf solr-home
	cp -r $(TOPDIR)/$(SOLR_DIST)/example/multicore solr-home
	# Copy each core into place.
	rm -rf solr-home/core*
	for core in cores/* ; do \
		cp -r $$core/core solr-home/`basename $$core` ; \
	done
	# Copy war file into place.
	cp specify-solr.war solr-home/
	# Copy top level SOLR configuration into place.
	cp solr.xml solr-home/

solr.xml: $(TOPDIR)/make_solr_xml.py $(TOPDIR)/$(SOLR_DIST)/example/multicore/solr.xml cores
	# Generate top level SOLR config that defines the available cores.
	python $(TOPDIR)/make_solr_xml.py $(TOPDIR)/$(SOLR_DIST)/example/multicore/solr.xml \
		cores/* > $@

specify-config.xml:
	# Create config file for Tomcat to load our app.
	echo '<?xml version="1.0" encoding="UTF-8"?>' > $@
	echo '<Context docBase="$(SOLR_HOME)/specify-solr.war">' >> $@
	echo '<Environment name="solr/home" type="java.lang.String" value="$(SOLR_HOME)" override="true" />' >> $@
	echo '</Context>' >> $@
