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

# Running 'make install-context-file' will create the following
# context file to alert Tomcat to the web portal app. To make the
# portal the "default" app, change 'specify-solr.xml' to 'ROOT.xml'.
TOMCAT_CONTEXT_FILE := /etc/tomcat7/Catalina/localhost/specify-solr.xml

# The user and group to set on the installed files. The tomcat user
# must be in the given group because Solr writes some files to
# SOLR_HOME.
INSTALL_UID := $(USER)
INSTALL_GID := tomcat7

# Set to false to allow Solr admin page to be available.
export DISABLE_ADMIN := true

# Mirror for downloading Apache Solr.
SOLR_MIRROR := http://archive.apache.org/dist/lucene/solr

# Use latest available version of Solr 4.
export SOLR_VERSION := $(shell curl -s $(SOLR_MIRROR)/ | python get_latest_solr_vers.py)

export SOLR_DIST := solr-$(SOLR_VERSION)
export TOPDIR := $(shell pwd)

all: build

install: install-context-file install-solr-home

install-context-file:
	# Create config file for Tomcat to load our app.
	# Only needed when first installed, or changing SOLR_HOME.
	echo '<?xml version="1.0" encoding="UTF-8"?>' > $(TOMCAT_CONTEXT_FILE)
	echo '<Context docBase="$(SOLR_HOME)/specify-solr.war">' >> $(TOMCAT_CONTEXT_FILE)
	echo '<Environment name="solr/home" type="java.lang.String" value="$(SOLR_HOME)" override="true" />' >> $(TOMCAT_CONTEXT_FILE)
	echo '</Context>' >> $(TOMCAT_CONTEXT_FILE)

install-solr-home:
	# Copying Solr home directory into place.
	rm -rf $(INSTALL_DIR)
	mkdir -p $(INSTALL_DIR)
	cp -r build/solr-home/* $(INSTALL_DIR)
	chown -R $(INSTALL_UID).$(INSTALL_GID) $(INSTALL_DIR)
	chmod g+w $(INSTALL_DIR)/*/data/index

symlink:
	ln -s $(INSTALL_DIR) $(SOLR_HOME)

example.crontab:
	echo "*/10 * * * * cd $(TOPDIR) && make >> $$HOME/webportal-make.log 2>&1 && make update >> $$HOME/webportal-update.log 2>&1" > $@

update: .lastupdate

.lastupdate: build
	$(MAKE) install-solr-home
	sudo invoke-rc.d tomcat7 restart
	touch $@

clean:
	rm -rf build/

realclean: clean
	rm -rf solr-* unpacked-war

build: $(SOLR_DIST) unpacked-war build.make specify_exports specify_exports/*.zip
	mkdir -p build
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

unpacked-war: $(SOLR_DIST)/example/webapps/solr.war
	# Unpack the example Solr webapp.
	rm -rf $@
	mkdir -p unpacked-war
	cd unpacked-war && jar -xf ../$<
