
Ext.define('SpWebPortal.controller.Image', {
    extend: 'Ext.app.Controller',

    //localizable text...
    selectedImage: 'Selected Image',
    previewTitle: 'Preview (page {0} of {1})',
    //...localizable text
 
    mainImgStore: null,
    imgView: null,
    thumb: null,
    lastSearchCancelled: false,
    mainImgRecords: [],

    init: function() {
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

	this.callParent(arguments);
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
	console.info('Image setUpImgPreview()');

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
	console.info('Image onPageChange()');
	if (this.imgView == null) {
	    this.imgView = pager.up('tabpanel').down('spimageview');
	}
	if (this.thumb == null) {
	    this.thumb = pager.up('tabpanel').down('spimageview').down('spthumbnail');
	}

	this.doImages();
	//this.setupImgPreview(pager.getStore());

//	var store = pager.getStore();
//	var thumb = pager.up('tabpanel').down('spimageview').down('spthumbnail');
//	thumb.up('panel').setTitle(Ext.String.format(this.previewTitle, store.currentPage, Math.ceil(store.getTotalCount()/store.pageSize)));
	//var imgView = pager.up('tabpanel').down('spimageview').down('image'); 
	//imgView.setSrc('');
	//var pane = imgView.up('panel');
	//pane.setTitle(this.selectedImage);
	//var imgStore = thumb.getStore();
	//imgStore.removeAll();
	
//	this.doImages();
	
//	var thbStore = thumb.getStore();
//	thbStore.removeAll();
//	var imgView = pager.up('tabpanel').down('spimageview');
//	var imgStore = imgView.getImageStore();
//	imgStore.removeAll();
//	
//	for (var r = 0; r < store.getCount(); r++) {
//	    var rec = store.getAt(r);
//	    imgView.addImgForSpecRec(rec);
	    /*var imgDef = rec.get('img');
	    if (imgDef != null && imgDef != '') {
		var imgs = Ext.JSON.decode(imgDef);
		for (var i = 0; i < imgs.length; i++) {
		    Ext.apply(imgs[i], {
			//AttachedTo: rec.getId(),
			AttachedTo: r,
			AttachedToDescr: rec.get('cn'),
			ThumbSrc: this.getImgSrc(imgs[i]['AttachmentLocation'], this.getPreviewScale(), 'KUFishvoucher'),
			Src: this.getImgSrc(imgs[i]['AttachmentLocation'], null, 'KUFishvoucher')
		    });
		}
		imgStore.add(imgs);
	    }*/
//	}
	//pager.up('tabpanel').down('spimageview').down('pagingtoolbar').setVisible(imgStore.getTotalCount() > imgStore.pageSize);
	//thbStore.loadPage(1);
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
	//if (newCard.id == 'spwpmainimageview') {
	//    this.doImages();
	//} 
    },

    doImages: function() {
	var store = Ext.getStore('MainSolrStore');
	if (store.getSearched()) {
	    if (this.mainImgStore == null) {
		Ext.define('SpWebPortal.MainImgModel', {
		    extend: 'Ext.data.Model',
		    fields: [
			{name: 'spid', type: 'string'},
			{name: 'cn', type: 'int'},  //XXX instead of cn need to add fields needed for customized image description settings;
			{name: 'img', type: 'string'},
		    ]
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
	    url = url.replace("fl=*", "fl=spid,cn,img") //XXX instead of cn need to add fields needed for customized image description settings;
	    
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
		    console.info("MainImgStore loaded " + page + " with " + records.length + " of " + this.mainImgStore.getTotalCount() + " records.");
		    if (page == 1) {
			//this.clearMarkers2();
			//this.progBar.updateProgress(0.0);
		    }
		    //this.loadingBtn.setLoading(false);
		    if (!this.lastSearchCancelled) {
			this.setupImgPreview(this.mainImgStore);
			//this.mapReadyTasks[this.mapReadyTasks.length] = Ext.TaskManager.newTask({
			//    run: this.mapReadyTasked,
			//    args: [records],
			//    scope: this,
			//    interval: 10
			//});
			//this.mapReadyTasks[this.mapReadyTasks.length - 1].start();
		    }
		}
	    });
	}
	
    }

});
