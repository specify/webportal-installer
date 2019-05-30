# Directory where Solr indices are stored.
SOLR_HOME := /var/lib/specify-solr

# Running 'make install-solr-home' will copy the built web app into
# this directory.  Should generally be the same as SOLR_HOME, but can
# be set to user writable location and symbolically linked to
# SOLR_HOME to allow 'make install-solr-home' to be ran by a
# non-privileged user.
INSTALL_DIR := $(SOLR_HOME)

# Example user writable INSTALL_DIR:
#INSTALL_DIR := $(HOME)/specify-solr

# Mirror for downloading Apache Solr.
SOLR_MIRROR := http://archive.apache.org/dist/lucene/solr

# Use latest available version of Solr 4.
export SOLR_VERSION := $(shell curl -s $(SOLR_MIRROR)/ | python get_latest_solr_vers.py)

export SOLR_DIST := solr-$(SOLR_VERSION)
export TOPDIR := $(shell pwd)

all: build

clean:
	rm -rf build/

realclean: clean
	rm -rf solr-* unpacked-war

build: $(SOLR_DIST) build.make specify_exports specify_exports/*.zip
	cp -r $(SOLR_DIST)/example build
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
