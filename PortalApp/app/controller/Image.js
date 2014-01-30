"use strict";

Ext.define('SpWebPortal.controller.Image', {
    extend: 'Ext.app.Controller',

    //localizable text...
    selectedImage: 'Selected Image',
    previewTitle: 'Preview (page {0} of {1})',
    //...localizable text
 
    mainImgStore: null,
    imgView: null,
    solrImgFl: null,
    thumb: null,
    lastSearchCancelled: false,
    mainImgRecords: [],

    init: function() {
	var settings = Ext.getStore('SettingsStore').getAt(0);
	var attUrl = settings.get("imageBaseUrl");
	var attachmentsPresent = typeof attUrl === "string" && attUrl.length > 0;  

	if (attachmentsPresent) {
	    this.control({
		'thumbnail': {
		    selectionchange: this.onSelectionChange
		},
		'#spwpmainpagingtoolbar': {
		    change: this.onPageChange
		},
		'#spwpmaintabpanel': {
		    tabchange: this.onTabChange
		    //dosearch: this.onDoSearch
		}
	    });
	}

	this.superclass.init.apply(this, arguments);
    },

    onSelectionChange: function(dv, nodes) {
	var l = nodes.length,
        s = l !== 1 ? 's' : '';
	var v = dv.view;
	if (dv.getSelection().length > 0) {
	    /*
	    var img = dv.getSelection()[0];  //single selection
	    var imgView = v.up('panel').up('panel').down('image'); //not good enough for real-world
	    var pane = imgView.up('panel'); //not good enough for reality
	    //imgView.setSrc(this.getBaseUrl() + '/' + img.get('AttachmentLocation'));
	    imgView.setSrc(img.get('Src'));
	    var paneTitle = img.get('AttachedToDescr') + ' - ' + img.get('Title');
	    if (img.get('Width') != 0 && img.get('Height') != 0) {
		paneTitle +=  ' (' + img.get('Width') + ' x ' + img.get('Height') + ')';
	    } else {
		//I suspect that this will not consistently work. I don't think the setSrc method called
		//above is synchronous.
		paneTitle += ' (' + imgView.getWidth() + ' x ' + imgView.getHeight() + ')';
	    }
	    pane.setTitle(paneTitle);
	    */
	}
    },

    setupImgPreview: function(store) {
	//console.info('Image setUpImgPreview()');

	this.thumb.up('panel').setTitle(Ext.String.format(this.previewTitle, store.currentPage, Math.ceil(store.getTotalCount()/store.pageSize)));
	
	var thbStore = this.thumb.getStore();
	thbStore.removeAll();
	var imgStore = this.imgView.getImageStore();
	imgStore.removeAll();
	
	for (var r = 0; r < store.getCount(); r++) {
	    var rec = store.getAt(r);
	    this.imgView.addImgForSpecRec(rec);
	}
    },	
    
    onPageChange: function(pager) {
	//console.info('Image onPageChange()');
	if (this.imgView == null) {
	    this.imgView = pager.up('tabpanel').down('spimageview');
	}
	if (this.thumb == null) {
	    this.thumb = pager.up('tabpanel').down('spimageview').down('spthumbnail');
	}

	this.doImages();
    },

    setupToolbar: function(tabPanel, isMyTab, isPagedTab) {
	if (isMyTab) {
	    Ext.getCmp('spwpmainpagingtoolbar').setVisible(false);
	} else {
	    Ext.getCmp('spwpmainpagingtoolbar').setVisible(isPagedTab);
	}
    },

    onTabChange: function(tabPanel, newCard) {
	this.setupToolbar(tabPanel, newCard.id == 'spwpmainmappane', newCard.id == 'spwpmaingrid');
	if (this.imgView == null) {
	    this.imgView = tabPanel.down('spimageview');
	}
	if (this.thumb == null) {
	    this.thumb = tabPanel.down('spimageview').down('spthumbnail');
	}
    },

    doImages: function() {
	var store = Ext.getStore('MainSolrStore');
	if (store.getSearched()) {
	    var fl = 'spid,';
	    if (this.mainImgStore == null) {
		var flds = [];
		var fld = {};
		Ext.apply(fld, {name: 'spid', type: 'string'});
		flds.push(fld);
		var imgDescFlds = this.imgView.getImgDescriptionFlds();
		for (var df = 0; df < imgDescFlds.length; df++) {
		    fld = {};
		    Ext.apply(fld, {name: imgDescFlds[df][1], type: imgDescFlds[df][2]});
		    flds.push(fld);
		    fl += imgDescFlds[df][1] + ",";
		}
		fld = {};
		Ext.apply(fld, {name: 'img', type: 'string'});
		flds.push(fld);
		fl += "img";
		this.solrImgFl = fl;
		Ext.define('SpWebPortal.MainImgModel', {
		    extend: 'Ext.data.Model',
		    fields: flds
		}),
		this.mainImgStore = Ext.create('Ext.data.Store', {
		    model: "SpWebPortal.MainImgModel",
		    pageSize: 10000,
		    proxy: {
			type: 'jsonp',
			callbackKey: 'json.wrf',
			url: store.solrUrlTemplate,
			reader: {
			    root: 'response.docs',
			    totalProperty: 'response.numFound'
			}
		    }
		});
	    }				 
	    var pageSize = store.pageSize;
	    var url;
	    if (!store.getImages()) {
		url = store.getSearchUrl(true, store.getMaps(), store.getMainTerm(), store.getFilterToMap(), store.getMatchAll());
		store.setImages(false);
	    } else {
		url = store.getProxy().url;
	    }
	    url = url.replace("rows="+pageSize, "rows="+this.mainImgStore.pageSize);
	    url = url.replace("fl=*", "fl="+this.solrImgFl); //XXX instead of cn need to add fields needed for customized image description settings
	    
	    //Only remap if url/search has changed. This might not be completely
	    //safe. Currently Advanced and Express searches will re-execute even url is UN-changed.
	    //Technically, it would be better to track whether a search has been executed since last mapping.
	    if (url != this.mainImgStore.getProxy().url || this.lastSearchCancelled) {
		this.lastSearchCancelled = false;
		this.mainImgRecords = [];
		this.mainImgStore.getProxy().url = url;
		this.loadMainImgStore(1);
	    }
	}

    },
    
    loadMainImgStore: function(page) {
	if (!this.lastSearchCancelled) {
	    this.mainImgStore.loadPage(page, {
		scope: this,
		callback: function(records) {
		    //console.info("MainImgStore loaded " + page + " with " + records.length + " of " + this.mainImgStore.getTotalCount() + " records.");
		    if (page == 1) {
			//this.clearMarkers2();
			//this.progBar.updateProgress(0.0);
		    }
		    //this.loadingBtn.setLoading(false);
		    if (!this.lastSearchCancelled) {
			this.setupImgPreview(this.mainImgStore);
		    }
		}
	    });
	}
	
    }

});
