
.PHONY: link-cores

all: setting_templates html html/index.html link-cores server/solr-webapp/webapp/WEB-INF/web.xml


server/solr-webapp/webapp/WEB-INF/web.xml: $(TOPDIR)/patch_web_xml.py \
					   $(TOPDIR)/$(SOLR_DIST)/server/solr-webapp/webapp/WEB-INF/web.xml
	# Patching solr server app for cross-domain access to enable extjs ajax stores to POST solr query params.
	python2 $^ > $@


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
		python2 $(TOPDIR)/make_settings_template.py \
			$(TOPDIR)/PortalApp/resources/config/settings.json \
			> "$@/$$corename/settings.json" ; \
		python2 $(TOPDIR)/make_fields_template.py \
			"cores/$$corename/webapp/resources/config/fldmodel.json" \
			> "$@/$$corename/fldmodel.json" ; \
	done


html/index.html: $(TOPDIR)/make_toplevel_index.py $(TOPDIR)/index_skel.html cores html
	python2 $(TOPDIR)/make_toplevel_index.py $(TOPDIR)/index_skel.html \
		cores/*/webapp/resources/config/settings.json > $@

html: cores
	# Put the webapps in the html folder.
	mkdir -p html
	for core in cores/* ; do \
		cp -r $$core/webapp html/`basename $$core` ; \
	done

link-cores: cores
	# Link the cores into the solr home folder.
	for core in cores/* ; do \
		ln -s ../../$$core server/solr/ ; \
	done

