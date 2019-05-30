
all: solr-home setting_templates html html/index.html

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


html/index.html: $(TOPDIR)/make_toplevel_index.py $(TOPDIR)/index_skel.html cores html
	python $(TOPDIR)/make_toplevel_index.py $(TOPDIR)/index_skel.html \
		cores/*/webapp/resources/config/settings.json > $@

html: cores
	# Put the webapps in the html folder.
	mkdir -p html
	for core in cores/* ; do \
		cp -r $$core/webapp html/`basename $$core` ; \
	done

solr-home: $(TOPDIR)/$(SOLR_DIST) cores solr.xml
	# Build the Solr home directory.
	rm -rf solr-home
	cp -r $(TOPDIR)/$(SOLR_DIST)/example/multicore solr-home
	# Copy each core into place.
	rm -rf solr-home/core*
	for core in cores/* ; do \
		cp -r $$core/core solr-home/`basename $$core` ; \
	done
	# Copy top level Solr configuration into place.
	cp solr.xml solr-home/

solr.xml: $(TOPDIR)/make_solr_xml.py $(TOPDIR)/$(SOLR_DIST)/example/multicore/solr.xml cores
	# Generate top level Solr config that defines the available cores.
	python $(TOPDIR)/make_solr_xml.py $(TOPDIR)/$(SOLR_DIST)/example/multicore/solr.xml \
		cores/* > $@
