Ext.define('SpWebPortal.view.ImageView', {
    extend: 'Ext.panel.Panel',
    xtype: 'spimageview',
    alias: 'widget.imageview',

    //localizable text...
    previewTitle: 'Preview',
    selectedTitle: 'Selected Image',
    thumbPagerDisplayMsg: 'Displaying images {0} - {1} of {2}',
    thumbPagerEmptyMsg: 'No images to display',

    //...localizable text

    layout: 'border',
    
    requires: [
	'SpWebPortal.view.ThumbnailView',
	'SpWebPortal.model.AttachedImageModel'
    ],

    config: {
	imageStore: null,
   	baseUrl: '',
	previewSize: 200,
	viewSize: 500,
	imgServerResponse: null,
	imgServerError: null,
    },

    initComponent: function() {

	/*var thumbStore = Ext.create('Ext.data.Store', {
	    model: 'SpWebPortal.model.AttachedImageModel',
	    pageSize: 1000,
	    imageviewer: this,
	    loadPage: function(page) {
		console.info("ThumbStore store load page " + page);
		//this.detailer.setCurrentRecIdx(page-1);
		this.removeAll();
		var imgStore = this.imageviewer.getImageStore();
		//var records = [];
		var first = (page-1) * this.pageSize;
		var last = Math.min(imgStore.getTotalCount(), first + this.pageSize);
		for (var r = first; r < last; r++) {
		    this.add(imgStore.getAt(r));
		}
		//this.detailer.down('spdetailpanel').loadRecord(this.getAt(page-1));
		this.currentPage = page;
		//return this.currentPage;
		//return true;
		this.fireEvent('load');
	    },
	    getTotalCount: function() {
		//console.info("DetailsPanel store getTotalCount " + this.detailer.getCount());
		return this.imageviewer.getImageStore().getTotalCount();
	    },
	});*/

	this.setImageStore(Ext.create('Ext.data.Store', {
	    model: 'SpWebPortal.model.AttachedImageModel',
	    getTotalCount: function() {
		if (typeof this.data === "undefined" || this.data == null
		    || typeof this.data.items === "undefined" || this.data.items == null){
		    return 0;
		} else {
		    return this.data.items.length;
		}
	    }
	}));

	var cmps = [];

	cmps[0] = Ext.create('Ext.panel.Panel', {
	    title: this.previewTitle,
	    
	    //resizable: true,
	    collapsible: true,
	    //titleCollapse: true,
	    split: true,

	    region: 'center',
	    //width: 300,
	    autoScroll: true,
	    items: Ext.create('SpWebPortal.view.ThumbnailView', {
		//store: thumbStore
		store: this.getImageStore()
	    })
	});

	/*cmps[1] = Ext.create('Ext.panel.Panel', {
	    region: 'center',
	    autoScroll: true,
	    title: this.selectedTitle,
	    items: {
		xtype: 'image'
	    }
	});*/

	/*var dcmps = [];
	dcmps[0] = Ext.create('Ext.toolbar.Toolbar', {
	    dock: 'top',
	    items: [
		Ext.create('Ext.toolbar.Paging', {
		    store: thumbStore,
		    //vertical: true,
		    //shrinkWrap: 1,
		    displayInfo: true,
		    itemid: 'spwpthumbpager',
		    displayMsg: this.thumbPagerDisplayMsg,
		    emptyMsg: this.thumbPagerEmptyMsg
		})
	    ]
	});*/

	this.items = cmps;
	//this.dockedItems = dcmps;

	var settingsStore =  Ext.getStore('SettingsStore');
	var settings = settingsStore.getAt(0);
	this.setBaseUrl(settings.get('imageBaseUrl'));
	this.setPreviewSize(settings.get('imagePreviewSize'));
	this.setViewSize(settings.get('imageViewSize'));
	this.callParent(arguments);
    },

    getDescription: function(record) {
	//XXX use configged fields to build description
	return record.get('cn');
    },

    addImgForSpecRec: function(record) {
	var imgJson = record.get('img');
	if (imgJson != null && imgJson != '') {
	    var attachedTo = record.get('spid');
	    var attachedToDescr = this.getDescription(record);
	    return this.addImg(imgJson, attachedTo, attachedToDescr);
	} else {
	    return 0;
	}
    },

    addImg: function(imgJson, attachedTo, attachedToDescr) {
	if (imgJson != null && imgJson != '') {
	    var imgs = Ext.JSON.decode(imgJson);
	    for (var i = 0; i < imgs.length; i++) {
		this.getImgSrc(imgs[i]['AttachmentLocation'], this.getPreviewSize(), 'KUFishvoucher', 'ThumbSrc', imgs[i], true);
		//this.getImgSrc(imgs[i]['AttachmentLocation'], null, 'KUFishvoucher', false, imgs[i]);
		Ext.apply(imgs[i], {
		    AttachedTo: attachedTo,
		    AttachedToDescr: attachedToDescr,
		    //ThumbSrc: this.getImgSrc(imgs[i]['AttachmentLocation'], this.getPreviewSize(), 'KUFishvoucher'),
		    //Src: this.getImgSrc(imgs[i]['AttachmentLocation'], null, 'KUFishvoucher')
		});
	    }
	    //this.getImageStore().add(imgs);
	    return imgs.length;
	} else {
	    return 0;
	}
    },


    getImgSrc: function(fileName, scale, coll, srcFld, img, addToStore, callbackFn, callbackArgs) {
	//var url = this.getBaseUrl() + '/getfileref.php?coll=' + coll + '&type=O&filename=' + fileName + '&scale=' + scale;
	var url = this.getBaseUrl() + '/getfileref.php';
	this.imgServerResponse = null;
	this.imgServerError = null;
	/*$.ajax({url: url,
		type: "GET",
		params:  {
		    coll: coll,
		    type: 0,
		    filename: fileName,
		    scale: scale
		}

	       }).done(function(data) {
		   console.info("boxleyed");
	       });
	*/
	Ext.Ajax.method = 'GET';
	var params;
	if (scale != null && scale > 0) {
	    params =  {
		coll: coll,
		type: 0,
		filename: fileName,
		scale: scale
	    };
	} else {
	    params =  {
		coll: coll,
		type: 0,
		filename: fileName
	    };
	}
	this.waitingForImgUrl = true;
	try {
	    var req = Ext.Ajax.request({
		url: url,
		cors: true,
		params: params,
		//headers: 'Access-Control-Allow-Origin: *',
		scope: this,
		success: function(response) {
		    this.imgServerResponse = response.responseText;
		    this.imgServerError = null;
		},
		failure: function(response) {
		    this.imgServerError = response.status;
		    this.imgServerResponse = null;
		},
		callback: function(object) {
		    console.info("getImgSrc.callback happened");
		    var src = typeof object.params.scale === "undefined" ?
			"http://boxley.nhm.ku.edu/specifyassets/Ichthyology/originals/" + fileName :
			"http://boxley.nhm.ku.edu/specifyassets/Ichthyology/originals/" + fileName.replace('.jpg', '_' + scale + '.jpg');
		    if (!addToStore) {
			img.set(srcFld, src);
		    } else {
			if (srcFld == "ThumbSrc") {
			    Ext.apply(img, {
				ThumbSrc: src
			    });
			} else if (srcFld == "StdSrc") {
			    Ext.apply(img, {
				StdSrc: src
			    });
			} else if (srcFld == "Src") {
			    Ext.apply(img, {
				Src: src
			    });
			}
			this.getImageStore().add(img);
		    }
		    if (typeof callbackFn !== "undefined" && callbackFn != null) {
			callbackFn(img, callbackArgs);
		    }
		}
	    });
	} catch(e) {
	    //IF POSSIBLE just catch and ignore the cross domain header issue for now
	}
	//while (Ext.Ajax.isLoading(req));
	//return this.imgServerResponse;

	/*if (scale != null) {
	    return "http://boxley.nhm.ku.edu/specifyassets/Ichthyology/originals/" + fileName.replace('.jpg', '_' + scale + '.jpg');
	} else {
	    return "http://boxley.nhm.ku.edu/specifyassets/Ichthyology/originals/" + fileName;
	}*/

    },

});
