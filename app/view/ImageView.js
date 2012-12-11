/*
* SpWebPortal.view.ImageView
*
*Displays image thumbnails. Used on main images tab and image tab for details windows.
*
*/
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
	imgDescriptionFlds: null
    },

    initComponent: function() {

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
	    region: 'center',
	    //width: 300,
	    autoScroll: true,
	    items: Ext.create('SpWebPortal.view.ThumbnailView', {
		//store: thumbStore
		store: this.getImageStore()
	    })
	});

	this.items = cmps;

	var settingsStore =  Ext.getStore('SettingsStore');
	var settings = settingsStore.getAt(0);
	this.setImgDescriptionFlds(this.initImgDescFlds(settings.get('imageInfoFlds')));
	this.setBaseUrl(settings.get('imageBaseUrl'));
	this.setPreviewSize(settings.get('imagePreviewSize'));
	this.setViewSize(settings.get('imageViewSize'));

	this.callParent(arguments);
    },

    initImgDescFlds: function(fldStr) {
	if (typeof fldStr === "undefined" || fldStr ==  null || fldStr == '') {
	    return this.getDefaultImgDescFlds();
	} else {
	    var result = [];
	    var flds = fldStr.split(' ');
	    var fldStore = Ext.getStore('FieldDefStore');
	    for (var f = 0; f < flds.length; f++) {
		var def4f = null;
		for (var d = 0; d < fldStore.count(); d++) {
		    if (fldStore.getAt(d).get('solrname') == flds[f]) {
			def4f = fldStore.getAt(d);
			break;
		    }
		}
		if (def4f != null) {
		    result.push([def4f.get('title'), flds[f], def4f.get('solrtype')]);
		} else {
		    console.info("error reading imageInfoFlds settings. Unable to locate '" + flds[f] + "'. Reverting to default.");
		    result = this.getDefaultImgDescFlds();
		    break;
		}
	    }
	    return result;
	}
    },

    getDefaultImgDescFlds: function() {
	//Use catalognumber and taxon fullname, if possible
	var result = [];
	var fldStore = Ext.getStore('FieldDefStore');
	for (var f = 0; f < fldStore.count(); f++) {
	    var def = fldStore.getAt(f);
	    var tbl = def.get('sptable');
	    var fld = def.get('spfld');
	    if ('collectionobject' == tbl && 'catalogNumber' == fld) {
		result.push([def.get('title'), def.get('solrname'), def.get('solrtype')]);
	    } else if ('taxon' == tbl && 'fullName' == fld) {
		result.push([def.get('title'), def.get('solrname'), def.get('solrtype')]);
	    }
	}
	return result;
    },

    getDescription: function(record) {
	//XXX use configged fields to build description
	//return record.get('cn');
	var result = '';
	for (var f=0; f < this.getImgDescriptionFlds().length; f++) {
	    var fld = this.getImgDescriptionFlds()[f];
	    if (f > 0) {
		result += "\n";
	    }
	    result += fld[0] + ": " + record.get(fld[1]);
	}
	//console.info(result);
	return result;
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
		    //console.info("getImgSrc.callback happened");
		    var src = typeof object.params.scale === "undefined" ?
			"http://anza.nhm.ku.edu/specifyassets/Ichthyology/originals/" + fileName :
			"http://anza.nhm.ku.edu/specifyassets/Ichthyology/originals/" + fileName.replace('.jpg', '_' + scale + '.jpg');
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
