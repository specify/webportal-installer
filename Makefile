# Mirror for downloading Apache Solr.
SOLR_MIRROR := http://archive.apache.org/dist/lucene/solr

# Use 'schema.xml' if solr will be used to create the core
# Use 'managed-schema' if pre-configuring core
SCHEMA_FILE := managed-schema

#location of default settings files in solr dist
DEFAULT_SETS := server/solr/configsets/_default

PYTHON := python2

# Use latest available version of Solr 4.
SOLR_VERSION := $(shell curl -s $(SOLR_MIRROR)/ | $(PYTHON) get_latest_solr_vers.py)

SOLR_DIST := solr-$(SOLR_VERSION)

INPUTS := $(wildcard specify_exports/*.zip)
COLLECTIONS := $(patsubst specify_exports/%.zip, %, $(INPUTS))
PORTALFILES := $(foreach c, $(COLLECTIONS), build/col/$c/PortalFiles)
WEBAPPS := $(addprefix build/html/, $(COLLECTIONS))
SETTING_TEMPLATES := $(addprefix build/setting_templates/$c, $(COLLECTIONS))
SOLR_CORES := $(addprefix build/server/solr/, $(COLLECTIONS))

###### Usage Information #####

.PHONY: usage
usage:
	@echo Usage:
	@echo make build-all  -- Do everything.

##### Main build targets #####

.PHONY: build-all build-cores build-html load-data
build-all: build-cores build-html build-setting-templates
build-cores: $(SOLR_CORES)
build-html: $(WEBAPPS) build/html/index.html
build-setting-templates: $(SETTING_TEMPLATES)
load-data: $(addprefix load-data-, $(COLLECTIONS))

##### Cleaning targets #####

.PHONY: clean realclean
clean:
	rm -rf build/

realclean: clean
	rm -rf solr-*

##### Common building steps #####

$(SOLR_DIST).tgz:
	@printf "\n\n### Fetching Solr distribution tar ball.\n\n"
	wget $(SOLR_MIRROR)/$(SOLR_VERSION)/$@

$(SOLR_DIST): $(SOLR_DIST).tgz
	@printf "\n\n### Unpacking Solr distribution.\n\n"
	rm -rf $@
	tar -zxf $<
	touch $@

build: $(SOLR_DIST)
	@printf "\n\n### Copying solr to build directory.\n\n"
	cp -r $(SOLR_DIST)/ build
	$(PYTHON) patch_web_xml.py \
		$(SOLR_DIST)/server/solr-webapp/webapp/WEB-INF/web.xml\
		> $@/server/solr-webapp/webapp/WEB-INF/web.xml

build/col: | build
	@printf "\n\n"
	mkdir build/col

.PRECIOUS: build/col/%/PortalFiles
build/col/%/PortalFiles: specify_exports/%.zip | build/col
	@printf "\n\n### Extracting $@.\n\n"
	unzip -DD -qq -o -d build/col/$* $^

##### Solr core building #####

build/server/solr/%: build/col/%/SolrFldSchema.xml | build
	@printf "\n\n### Generating $@.\n\n"
	mkdir -p $@/conf $@/data

	$(PYTHON) patch_solrconfig_xml.py \
		$(SOLR_DIST)/$(DEFAULT_SETS)/conf/solrconfig.xml \
		> $@/conf/solrconfig.xml

	$(PYTHON) patch_schema_xml.py \
		$(SOLR_DIST)/$(DEFAULT_SETS)/conf/$(SCHEMA_FILE) \
		build/col/$*/SolrFldSchema.xml \
		> $@/conf/$(SCHEMA_FILE)

	cp $(SOLR_DIST)/$(DEFAULT_SETS)/conf/protwords.txt $@/conf/
	cp $(SOLR_DIST)/$(DEFAULT_SETS)/conf/synonyms.txt $@/conf/
	cp $(SOLR_DIST)/$(DEFAULT_SETS)/conf/stopwords.txt $@/conf/
	cp -r $(SOLR_DIST)/$(DEFAULT_SETS)/conf/lang/ $@/conf/

	echo 'dataDir=data' > $@/core.properties
	echo 'name=$*' >> $@/core.properties
	echo 'config=conf/solrconfig.xml' >> $@/core.properties

	touch $@

build/col/%/SolrFldSchema.xml: build/col/%/PortalFiles
	@printf "\n\n### Generating $@.\n\n"
	echo '<?xml version="1.0" encoding="UTF-8" ?>' > $@
	echo "<fields>" >> $@
	cat $</SolrFldSchema.xml >> $@
	echo "</fields>" >> $@

##### Website building #####

build/html: | build
	@printf "\n\n"
	mkdir build/html

build/html/index.html: $(WEBAPPS) | build/html
	@printf "\n\n### Generating $@.\n\n"
	$(PYTHON) make_toplevel_index.py index_skel.html \
		$(addsuffix /resources/config/settings.json, $(WEBAPPS)) \
		> $@

build/html/%: build/col/%/PortalFiles | build/html
	@printf "\n\n### Generating $@.\n\n"
	mkdir -p $@
	cp -r PortalApp/* $@
	$(PYTHON) make_fldmodel_json.py \
		build/col/$*/PortalFiles/*flds.json \
		custom_settings/$*/fldmodel.json \
		> $@/resources/config/fldmodel.json
	$(PYTHON) patch_settings_json.py \
		PortalApp/resources/config/settings.json \
		custom_settings/$*/settings.json \
		$* \
		build/col/$*/PortalFiles/*Setting.json \
		> $@/resources/config/settings.json
	touch $@

##### Loading data #####

.PHONY: load-data-%
load-data-%: build/html/%/load-data ;

.PRECIOUS: build/html/%/load-data
build/html/%/load-data: build/col/%/PortalFiles | build/html/%
	@printf "\n\n### Loading data into $*.\n\n"
	curl -X POST "http://localhost:8983/solr/$*/update?commit=true" \
		-d '{ "delete": {"query":"*:*"} }' \
		-H 'Content-Type: application/json'
	curl "http://localhost:8983/solr/$*/update/csv?commit=true&encapsulator=\"&escape=\&header=true" \
		--data-binary @build/col/$*/PortalFiles/PortalData.csv \
		-H 'Content-type:application/csv'
	date > $@

##### Settings templates #####

build/setting_templates: | build
	@printf "\n\n"
	mkdir $@

build/setting_templates/%: build/html/% | build/setting_templates
	@printf "\n\n### Generating $@.\n\n"
	mkdir -p $@
	$(PYTHON) make_settings_template.py \
		PortalApp/resources/config/settings.json \
		> $@/settings.json
	$(PYTHON) make_fields_template.py \
		build/html/$*/resources/config/fldmodel.json \
		> $@/fldmodel.json
