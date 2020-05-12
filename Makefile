# Mirror for downloading Apache Solr.
SOLR_MIRROR := http://archive.apache.org/dist/lucene/solr

export PYTHON := python2

# Use latest available version of Solr 4.
export SOLR_VERSION := $(shell curl -s $(SOLR_MIRROR)/ | $(PYTHON) get_latest_solr_vers.py)

export SOLR_DIST := solr-$(SOLR_VERSION)
export TOPDIR := $(shell pwd)

INPUTS := $(wildcard specify_exports/*.zip)
COLLECTIONS := $(patsubst specify_exports/%.zip, %, $(INPUTS))
CORES := $(addprefix build/cores/, $(COLLECTIONS))
PORTALFILES := $(addsuffix /PortalFiles, $(CORES))
WEBAPPS := $(addsuffix /webapp, $(CORES))
CCORES := $(addsuffix /core, $(CORES))

.SILENT:

.PHONY: usage
usage:
	@echo Usage:
	@echo make build-all  -- Do everything.

.PHONY: build-all build-cores build-html load-data
build-all: build-cores build-html
build-cores: $(CCORES)
build-html: $(WEBAPPS) build/html/index.html
load-data: $(addprefix load-data-, $(COLLECTIONS))

.PHONY: start-solr stop-solr
start-solr:
	build/bin/solr start

stop-solr:
	build/bin/solr stop

.PHONY: clean realclean
clean:
	rm -rf build/

realclean: clean
	rm -rf solr-*

build: $(SOLR_DIST)
	@echo Copying solr to build directory.
	cp -r $(SOLR_DIST)/ build
	$(PYTHON) patch_web_xml.py $(SOLR_DIST)/server/solr-webapp/webapp/WEB-INF/web.xml > $@/server/solr-webapp/webapp/WEB-INF/web.xml

build/cores: | build
	mkdir build/cores

build/cores/%/PortalFiles: specify_exports/%.zip | build/cores
	@echo Extracting $@.
	unzip -DD -qq -o -d build/cores/$* $^

build/cores/%/core: build/cores/%/PortalFiles
	@echo Generating $@.
	$(MAKE) CORENAME=$* -f $(TOPDIR)/core.make -C build/cores/$* core
	ln -sfT ../../cores/$*/core build/server/solr/$*
	touch $@

build/cores/%/webapp: build/cores/%/PortalFiles | build/html
	@echo Generating $@.
	$(MAKE) CORENAME=$* -B -f $(TOPDIR)/core.make -C build/cores/$* webapp
	ln -sfT ../../$@ build/html/$*
	touch $@

build/html: | build
	mkdir build/html

build/html/index.html: $(WEBAPPS) | build/html
	@echo Generating $@.
	$(PYTHON) make_toplevel_index.py index_skel.html \
		build/cores/*/webapp/resources/config/settings.json > $@

$(SOLR_DIST).tgz:
	@echo Fetching Solr distribution tar ball.
	wget $(SOLR_MIRROR)/$(SOLR_VERSION)/$@

$(SOLR_DIST): $(SOLR_DIST).tgz
	@echo Unpacking Solr distribution.
	rm -rf $@
	tar -zxf $<

$(SOLR_DIST)/%: $(SOLR_DIST)


.PHONY: load-data-%
load-data-%: build/cores/%/webapp/load-data ;

.PRECIOUS: build/cores/%/webapp/load-data
build/cores/%/webapp/load-data: build/cores/%/PortalFiles
	@echo Loading data into $*.
	curl -X POST "http://localhost:8983/solr/$*/update?commit=true" \
		-d '{ "delete": {"query":"*:*"} }' \
		-H 'Content-Type: application/json'
	curl "http://localhost:8983/solr/$*/update/csv?commit=true&encapsulator=\"&escape=\&header=true" \
		--data-binary @build/cores/$*/PortalFiles/PortalData.csv \
		-H 'Content-type:application/csv'
	date > $@
