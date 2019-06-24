# 
# Use 'schema.xml' if solr will be used to create the core
# Use 'managed-schema' if pre-configuring core 
SCHEMA_FILE := managed-schema
#location of default settings files in solr dist
DEFAULT_SETS := server/solr/configsets/_default

all: webapp core

# The custom setting file should really be a dependency here,
# but I don't know how to handle the case that it doesn't exist.
settings.json: $(TOPDIR)/patch_settings_json.py \
		$(TOPDIR)/PortalApp/resources/config/settings.json
	# Patch web app settings.
	python $^ $(TOPDIR)/custom_settings/$(CORENAME)/settings.json \
		 $(CORENAME) PortalFiles/*Setting.json > $@

SolrFldSchema.xml: PortalFiles/SolrFldSchema.xml
	# Add a root element to the schema field list.
	echo '<?xml version="1.0" encoding="UTF-8" ?>' > $@
	echo "<fields>" >> $@
	cat $< >> $@
	echo "</fields>" >> $@

$(SCHEMA_FILE): $(TOPDIR)/patch_schema_xml.py \
		$(TOPDIR)/$(SOLR_DIST)/$(DEFAULT_SETS)/conf/$(SCHEMA_FILE) \
		SolrFldSchema.xml
	# Patching Solr schema with fields from Specify export.
	python $^ > $@

web.xml: $(TOPDIR)/patch_web_xml.py \
		$(TOPDIR)/$(SOLR_DIST)/server/solr-webapp/webapp/WEB-INF/web.xml 
	# Patching solr server app for cross-domain access to enable extjs ajax stores to POST solr query params.
	#python $^ > $(TOPDIR)/$(SOLR_DIST)/server/solr-webapp/webapp/WEB-INF/web.xml
	python $^ > $@
	sudo cp $@ $(TOPDIR)/$(SOLR_DIST)/server/solr-webapp/webapp/WEB-INF/web.xml
 
solrconfig.xml: $(TOPDIR)/patch_solrconfig_xml.py \
		$(TOPDIR)/$(SOLR_DIST)/$(DEFAULT_SETS)/conf/solrconfig.xml
	# Patching Solr config for use with Specify.
	python $^ > $@

# The custom setting file should really be a dependency here,
# but I don't know how to handle the case that it doesn't exist.
fldmodel.json: $(TOPDIR)/make_fldmodel_json.py PortalFiles/*flds.json
	# Patch any custom settings into the field definitions.
	python $^ $(TOPDIR)/custom_settings/$(CORENAME)/fldmodel.json > $@

webapp: $(TOPDIR)/PortalApp settings.json fldmodel.json
	# Setup web app instance for this core.
	mkdir -p webapp
	cp -r $(TOPDIR)/PortalApp/* webapp/

	# Copy WebPortal field specs into place.
	cp fldmodel.json webapp/resources/config/fldmodel.json

	# Copy patched settings into place.
	cp settings.json webapp/resources/config/

	# Fix Solr URL format in WebApp.
	sed -i "s,solrURL + ':' + solrPort + '/',solrURL," webapp/app/store/MainSolrStore.js

core: $(TOPDIR)/$(SOLR_DIST) PortalFiles solrconfig.xml $(SCHEMA_FILE) web.xml
	# Setup solr-home subdir for this core.
	mkdir -p core/conf
	cp solrconfig.xml $(SCHEMA_FILE)  core/conf/
	#cp -r PortalFiles/solr core/data/index
	cp $(TOPDIR)/$(SOLR_DIST)/$(DEFAULT_SETS)/conf/protwords.txt core/conf/
	cp $(TOPDIR)/$(SOLR_DIST)/$(DEFAULT_SETS)/conf/synonyms.txt core/conf/
	cp $(TOPDIR)/$(SOLR_DIST)/$(DEFAULT_SETS)/conf/stopwords.txt core/conf/
	cp -r $(TOPDIR)/$(SOLR_DIST)/$(DEFAULT_SETS)/conf/lang/ core/conf/
	echo 'dataDir=data' > core/conf/core.properties
	echo 'name=$(CORENAME)' >> core/conf/core.properties
	echo 'config=conf/solrconfig.xml' >> core/core.properties
	mkdir core/data
