# Mirror for downloading Apache Solr.
SOLR_MIRROR := http://archive.apache.org/dist/lucene/solr

# Use latest available version of Solr 4.
export SOLR_VERSION := $(shell curl -s $(SOLR_MIRROR)/ | python2 get_latest_solr_vers.py)

export SOLR_DIST := solr-$(SOLR_VERSION)
export TOPDIR := $(shell pwd)

.PHONY: all clean realclean update-data

all: build

update-data: build
	for core in build/cores/* ; do \
		corename=`basename "$$core"` ; \
		curl -X POST 'http://localhost:8983/solr/vimsfish/update?commit=true' \
	 		-d '{ "delete": {"query":"*:*"} }' \
			-H 'Content-Type: application/json' ; \
		curl "http://localhost:8983/solr/$$corename/update/csv?commit=true&encapsulator=\"&escape=\&header=true" \
			--data-binary @$$core/PortalFiles/PortalData.csv \
			-H 'Content-type:application/csv' ; \
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
