# Mirror for downloading Apache Solr.
SOLR_MIRROR := http://archive.apache.org/dist/lucene/solr

# Use latest available version of Solr 4.
export SOLR_VERSION := $(shell curl -s $(SOLR_MIRROR)/ | python2 get_latest_solr_vers.py)

export SOLR_DIST := solr-$(SOLR_VERSION)
export TOPDIR := $(shell pwd)

.PHONY: all clean realclean load-data

all: build

load-data:
	for core in build/cores/* ; do \
		make $$core/webapp/load-data; \
	done

clean:
	rm -rf build/

realclean: clean
	rm -rf solr-* unpacked-war

build: $(SOLR_DIST) build.make specify_exports specify_exports/*.zip
	cp -r $(SOLR_DIST)/ build
	# The following file gets replaced by a patched version:
	rm build/server/solr-webapp/webapp/WEB-INF/web.xml
	$(MAKE) -f $(TOPDIR)/build.make -C build
	touch $@

$(SOLR_DIST).tgz:
	# Fetching Solr distribution tar ball.
	wget $(SOLR_MIRROR)/$(SOLR_VERSION)/$@

$(SOLR_DIST): $(SOLR_DIST).tgz
	# Unpacking Solr distribution.
	rm -rf $@
	tar -zxf $<

$(SOLR_DIST)/%: $(SOLR_DIST)

build/cores/%/rebuild-webapp:
	make CORENAME=$* -B -f $(TOPDIR)/core.make -C build/cores/$* webapp

build/cores/%/unpack:
	unzip -o -d build/cores/$* specify_exports/$*.zip

build/cores/%/webapp/load-data: build/cores/%/unpack specify_exports/%.zip
	curl -X POST "http://localhost:8983/solr/$*/update?commit=true" \
		-d '{ "delete": {"query":"*:*"} }' \
		-H 'Content-Type: application/json'
	curl "http://localhost:8983/solr/$*/update/csv?commit=true&encapsulator=\"&escape=\&header=true" \
		--data-binary @build/cores/$*/PortalFiles/PortalData.csv \
		-H 'Content-type:application/csv'
	date > $@
