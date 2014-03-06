
all: solr-home setting_templates

ifeq ($(DISABLE_ADMIN),true)
WEB_XML := ../no_admin_web.xml
else
WEB_XML := ../with_admin_web.xml
endif

cores: $(TOPDIR)/core.make $(TOPDIR)/$(SOLR_DIST) \
		 $(TOPDIR)/specify_exports  $(TOPDIR)/specify_exports/*.zip
	# We build a Solr core and webapp instance for
	# each subdir in specify_exports.
	rm -rf cores
	for zipfile in $(TOPDIR)/specify_exports/*.zip ; do \
		zipfile_name=`basename "$$zipfile"` ; \
		corename="$${zipfile_name%.*}" ; \
		mkdir -p "cores/$$corename" ; \
		unzip -d "cores/$$corename" "$$zipfile" ; \
		$(MAKE) CORENAME="$$corename" -f $(TOPDIR)/core.make -C "cores/$$corename" ; \
	done

setting_templates: $(TOPDIR)/make_settings_template.py $(TOPDIR)/make_fields_template.py cores
	mkdir -p $@
	for core in cores/* ; do \
		corename=`basename "$$core"` ; \
		mkdir -p "$@/$$corename" ; \
		python $(TOPDIR)/make_settings_template.py \
			$(TOPDIR)/PortalApp/resources/config/settings.json \
			> "$@/$$corename/settings.json" ; \
		python $(TOPDIR)/make_fields_template.py \
			"cores/$$corename/webapp/resources/config/fldmodel.json" \
			> "$@/$$corename/fldmodel.json" ; \
	done

index.html: $(TOPDIR)/make_toplevel_index.py $(TOPDIR)/index_skel.html cores
	python $(TOPDIR)/make_toplevel_index.py $(TOPDIR)/index_skel.html \
		cores/*/webapp/resources/config/settings.json > $@

specify-solr.war: $(TOPDIR)/unpacked-war $(TOPDIR)/$(SOLR_DIST) index.html \
		$(TOPDIR)/PortalApp $(TOPDIR)/log4j.properties $(WEB_XML) cores

	# Building directory for WAR file.
	rm -rf specify-solr
	mkdir -p specify-solr

	# Copy example WAR contents.
	cp -r $(TOPDIR)/unpacked-war/* specify-solr

ifeq ($(DISABLE_ADMIN),true)
	# Removing admin page.
	rm specify-solr/admin.html
endif

	# Include correct web.xml.
	cp $(WEB_XML) specify-solr/WEB-INF/web.xml

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

	# Packaging the Solr WAR file.
	jar -cf specify-solr.war -C specify-solr/ .

solr-home: $(TOPDIR)/$(SOLR_DIST) cores specify-solr.war solr.xml
	# Build the Solr home directory.
	rm -rf solr-home
	cp -r $(TOPDIR)/$(SOLR_DIST)/example/multicore solr-home
	# Copy each core into place.
	rm -rf solr-home/core*
	for core in cores/* ; do \
		cp -r $$core/core solr-home/`basename $$core` ; \
	done
	# Copy war file into place.
	cp specify-solr.war solr-home/
	# Copy top level Solr configuration into place.
	cp solr.xml solr-home/

solr.xml: $(TOPDIR)/make_solr_xml.py $(TOPDIR)/$(SOLR_DIST)/example/multicore/solr.xml cores
	# Generate top level Solr config that defines the available cores.
	python $(TOPDIR)/make_solr_xml.py $(TOPDIR)/$(SOLR_DIST)/example/multicore/solr.xml \
		cores/* > $@
