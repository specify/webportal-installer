Ext.define('SpWebPortal.controller.Detailer', {
    extend: 'Ext.app.Controller',

    //localizable text...
    detailPopupTitle: 'Detail',
    //...localizable text

    requires: [
	'SpWebPortal.view.DetailPanel',
	'SpWebPortal.view.DetailsPanel',
	'SpWebPortal.view.ImageSingleView',
	'Ext.TaskManager'
    ],

    detailsPopWin: null,
    detailsForm: null,
    detailPopWin: null,
    detailForm: null,
    imagePopWinPos: [1,1],
    imagePopWinYpos: 1,

    init: function() {
	console.info("Detailer.init");
	this.control({
	    'actioncolumn[itemid="detail-popup-ctl"]': {
		clicked: this.onGridDetailClk
	    },
	    'spmaingrid': {
		itemdblclick: this.onGridDblClk,
		googlemarkerclick: this.onGoogleMarkerClick
	    },
	    'spthumbnail': {
		itemdblclick: this.onThumbDblClk
	    },
	    '#spwpmainmappane': {
		googlemarkerclick: this.onGoogleMarkerClick,
		googlemarkerclick2: this.onGoogleMarkerClick2
	    },
	    '#spwpmaintabpanel': {
		tabchange: this.onTabChange,
		dosearch: this.onDoSearch
	    },
	    'pagingtoolbar[itemid="spwpdetailpager"]': {
		change: this.onDetailsRecordChange
	    },
	    'pagingtoolbar[itemid="spwpdetailpagingtoolbar"]': {
		change: this.onDetailsPageChange
	    },
	    '#spwp-detail-image-popwin': {
		beforeclose: this.onImagePopBeforeClose
	    },
	    '#spwp-detail-pop-win-zero': {
		beforeclose: this.onDetailPopBeforeClose
	    },
	    '#spwp-details-pop-win-zero': {
		beforeclose: this.onDetailPopBeforeClose
	    },
	    '#spwp-img-single-specimenbtn': {
		click: this.onImageViewSpecDetailsClick
	    },
	    '#spwp-img-single-viewsize-btn': {
		click: this.onImageViewSizeClick
	    }
	});
	this.callParent(arguments);
    },


    onTabChange: function() {
	this.closePopups();
    },

    onDoSearch: function() {
	this.closePopups();
    },

    closePopups: function() {
	if (this.detailsPopWin != null && this.detailsPopWin.isVisible()) {
	    this.detailsPopWin.hide();
	}
	if (this.detailPopWin != null && this.detailPopWin.isVisible()) {
	    this.detailPopWin.hide();
	}
	if (this.getImgPopWin() != null && this.getImgPopWin().isVisible()) {
	    this.getImgPopWin().close();
	}
    },

    onGoogleMarkerClick: function(record) {
	console.info("Detailer.onGoogleMarkerClick");
	//Ext.getCmp('spwpmainmappane').setLoading(true);
	if (record instanceof Array) {
	    if (record.length > 1) {
		this.popupDetails(record, false);
	    } else if (record.length == 1) {
		this.popupDetail(record[0], false);
	    }
	} else {
	    this.popupDetail(record, false);
	}
	//Ext.getCmp('spwpmainmappane').setLoading(false);
    },

    onGoogleMarkerClick2: function(url) {
	console.info("Detailer.onGoogleMarkerClick2");
	//Ext.getCmp('spwpmainmappane').setLoading(true);
	this.popupDetails2(url, false);
	//Ext.getCmp('spwpmainmappane').setLoading(false);
    },

    onGridDetailClk: function(record, isDetailGrid, rowIndex) {
	//console.info('grid detail clicked -- ' + arguments);
	if (isDetailGrid) {
	    this.showDetailForm(rowIndex);
	} else {
	    this.popupDetail(record, true);
	}
    },

    onGridDblClk: function(dataview, record, item, rowIndex) {
	//console.info(record);
	var grid = dataview.up('spmaingrid');
	if (grid.getIsDetail()) {
	    this.showDetailForm(rowIndex);
	} else {
	    this.popupDetail(record, true);
	}
    },

    getOwnerForThumbnailer: function(thumbnailer) {
	var result = thumbnailer.up('spimageview'); 
	if (result != null) {
	    if (result.getId() == 'spwpmainimageview') {
		console.info("Detailer.getOwnerForThumbnailer(): spimageview");
		return result;
	    }
	    result = result.up('spdetailspanel');
	    if (result != null) {
		console.info("Detailer.getOwnerForThumbnailer(): spdetailpanel");
		return result;
	    } 
	    result = thumbnailer.up('spimageview').up('spdetailpanel');
	    if (result != null) {
		console.info("Detailer.getOwnerForThumbnailer(): spdetailpanel");
		return result;
	    } 
	}
	return null;
    },

    onThumbDblClk: function(thumbnailer, record) {
	console.info("thumb dbl-clicked");
	console.info(arguments);
	if (false) {
	    this.popupSpecDetailsForImage(record);
	} else {
	    //don't popup image view if the thumbnailer is on a detail popped from another image view...
	    var owner = this.getOwnerForThumbnailer(thumbnailer);
	    var popIt = true;
	    if (owner != null && (owner.getXType() == 'spdetailpanel' || owner.getXType() == 'spdetailspanel')) {
		var popWin = this.getImgFrm();
		popIt =  popWin == null || popWin.getSpOwner() == owner;
	    }
	    if (popIt) {
		this.popupImage(record, false, this.getOwnerForThumbnailer(thumbnailer));
	    }
	}
    },

    popupSpecDetailsForImage: function(imgRecord) {
	console.info("popupSpecDetailsForImage");
	console.info(arguments);
	var attacheeIDs = [];
	//var attacheeData = imgRecord.get('AttachedTo');
	//when 'id' is re-named then use above. (See notes in app.js where MainModel is built.
	var attacheeData = imgRecord.get('AttachedTo'); 
	//eventually attacheData will be json list of attachees,
	//just one for now
	attacheeIDs[0] = attacheeData;
	
	var store = Ext.getStore('MainSolrStore');
	this.popupDetails2(store.getIdUrl(attacheeIDs), true);

    },

    onDetailsRecordChange: function() {
	//console.info("Detailer.onDetailsPageChange()");
	this.detailsForm.loadCurrentRecord();
    },

    onDetailsPageChange: function(pager, pageData) {
	this.detailsForm.loadRecords(pager.getStore().data.items);
    },

    getImgPopWin: function() {
	return Ext.getCmp('spwp-detail-image-popwin');
    },

    getImgFrm: function() {
	var imgPopWin = this.getImgPopWin();
	if (imgPopWin != null) {
	    return imgPopWin.down('spimagesingleview');
	} else {
	    return null;
	}
    },

    onDetailPopBeforeClose: function(window) {
	if (this.getImgPopWin() != null && this.getImgPopWin().isVisible()) {
	    var imgFrm = this.getImgFrm();
	    if (imgFrm != null && imgFrm.getSpOwner() != null) {
		if (imgFrm.getSpOwner() == this.detailsForm 
		    || imgFrm.getSpOwner() == this.detailForm) {
		    this.getImgPopWin().close();
		}
	    }
	}
    },

    onImagePopBeforeClose: function() {
	var killDetails = true;
	if (this.getImgPopWin() != null) {
	    this.imagePopWinPos = this.getImgPopWin().getPosition();
	    var imgFrm = this.getImgFrm();
	    if (imgFrm != null && imgFrm.getSpOwner() != null) {
		killDetails = imgFrm.getSpOwner() != this.detailsForm 
		    && imgFrm.getSpOwner() != this.detailForm;
	    }
	}
	if (killDetails) {
	    if (this.detailsPopWin != null) {
		this.detailsPopWin.hide();
	    }
	    if (this.detailPopWin != null)  {
		this.detailPopWin.hide();
	    }
	}
    },


    onImageViewSpecDetailsClick: function(btn) {
	//console.info("OnImageViewSpecDetailsClick()");
	//console.info(arguments);
	this.popupSpecDetailsForImage(btn.up('spimagesingleview').getImageRecord());
    },

    onImageViewSizeClick: function(btn) {
	var imgView = btn.up('spimagesingleview');
	this.popupImage(imgView.getImageRecord(), !imgView.getIsActualSize(), imgView.getSpOwner());
    },

    popupImageSrcReady: function(imgRecord, args) {
	//Always creating new ImagePop due to issues with changing images in already constructed ImageSingleView objects.
	//only one ImagePopWin can be open at a time.
	//if (this.imagePopWin != null) {
	var isActualSize = args[0];
	var imgWinOwner = args[1];
	var imgPopWin = Ext.getCmp('spwp-detail-image-popwin');
	if (imgPopWin != null) {
	    console.info("Detailer.popupImageSrcReady: closing imagePopWin");
	    //this.skipImagePopWinDestroy = true;
	    //this.imagePopWin.close();

	    imgPopWin.close();
	}
	var imgSize = settings.get('imageViewSize');
	var showSpecBtn = false;
	if (typeof imgWinOwner !== "undefined" && imgWinOwner != null) {
	    showSpecBtn = imgWinOwner.getXType() != 'spdetailpanel' && imgWinOwner.getXType() != 'spdetailspanel';
	}
	var imgPopWin = Ext.create('Ext.window.Window', {
	    id: 'spwp-detail-image-popwin',
	    title: imgRecord.get('Title'),
	    height: imgSize + 70,
	    width: imgSize + 25,
	    maximizable: false,
	    resizable: true,
	    //closeAction: 'destroy',
	    layout: 'fit',
	    items:  Ext.widget('spimagesingleview', {
		imageRecord: imgRecord, 
		isActualSize: isActualSize,
		spOwner: imgWinOwner,
		showSpecDetailBtn: showSpecBtn
	    })
	});
	imgPopWin.setPosition(this.imagePopWinPos);

	
	imgPopWin.show();
	imgPopWin.toFront();
    },
	
    popupImage: function(imgRecord, isActualSize, imgWinOwner) {
	var settings =  Ext.getStore('SettingsStore').getAt(0);
	var imgSize = settings.get('imageViewSize');
	var srcFld = 'StdSrc';
	if (imgSize <= 0 || isActualSize) {
	    srcFld = 'Src';
	    if (imgSize <= 0) {
		imgSize = 500;
	    }
	}	
	var srcVal = imgRecord.get(srcFld);
	if (typeof srcVal  === "undefined" || srcVal.trim().length == 0) {
	    var imgView = Ext.getCmp('spwpmainimageview');
	    //srcVal = imgView.getImgSrc(imgRecord.get('AttachmentLocation'), srcFld == 'Src' ? null : imgSize, 'KUFishvoucher');
	    //imgRecord.set(srcFld, srcVal);
	    imgView.getImgSrc(imgRecord.get('AttachmentLocation'), srcFld == 'Src' ? null : imgSize, 'KUFishvoucher', srcFld, imgRecord, false, 
			     this.popupImageSrcReady, [isActualSize, imgWinOwner]);
	} else {
	    this.popupImageSrcReady(imgRecord, [isActualSize, imgWinOwner]);
	}
    },

    popupDetails: function(records, showMap) {
	if (this.detailsPopWin == null) {
	    this.detailsForm = Ext.widget('spdetailspanel', {
		showMap: showMap
	    });
	    this.detailsPopWin = Ext.create('Ext.window.Window', {
		title: this.detailPopupTitle,
		height: 600,
		width: 800,
		maximizable: false,
		resizable: true,
		closeAction: 'hide',
		layout: 'fit',
		items: [
		    this.detailsForm
		]
	    });
	    this.detailsPopWin.setPosition(1,1);
	}
	if (this.detailPopWin != null && this.detailPopWin.isVisible()) {
	    //probably can just put panels on same form!
	    this.detailsPopWin.setPosition(this.detailPopWin.getPosition());
	    this.detailsPopWin.setHeight(this.detailPopWin.getHeight());
	    this.detailsPopWin.setWidth(this.detailPopWin.getWidth());
	    this.detailPopWin.hide();
	}

	this.detailsForm.loadRecords(records);
	
	this.detailsPopWin.show();
	this.detailsPopWin.toFront();
    },

    popupDetails2: function(url, showMap) {
	if (this.detailsPopWin == null) {
	    this.detailsForm = Ext.widget('spdetailspanel', {
		showMap: showMap
	    });
	    this.detailsPopWin = Ext.create('Ext.window.Window', {
		title: this.detailPopupTitle,
		id: 'spwp-details-pop-win-zero',
		height: 600,
		width: 800,
		maximizable: false,
		resizable: true,
		closeAction: 'hide',
		layout: 'fit',
		items: [
		    this.detailsForm
		]
	    });
	    this.detailsPopWin.setPosition(1,1);
	}
	if (this.detailPopWin != null && this.detailPopWin.isVisible()) {
	    //probably can just put panels on same form!
	    this.detailsPopWin.setPosition(this.detailPopWin.getPosition());
	    this.detailsPopWin.setHeight(this.detailPopWin.getHeight());
	    this.detailsPopWin.setWidth(this.detailPopWin.getWidth());
	    this.detailPopWin.hide();
	}

	this.detailsForm.getAndLoadRecords(url);
	
	this.detailsPopWin.show();
	this.detailsPopWin.toFront();
    },
	
    popupDetail: function(record, showMap) {
	if (this.detailPopWin == null) {
	    this.detailForm = Ext.widget('spdetailpanel', {
		showMap: showMap
	    });
	    this.detailPopWin = Ext.create('Ext.window.Window', {
		title: this.detailPopupTitle,
		id: 'spwp-detail-pop-win-zero',
		height: 600,
		width: 800,
		maximizable: false,
		resizable: true,
		closeAction: 'hide',
		layout: 'fit',
		items: [
		    this.detailForm
		]
	    });
	    this.detailPopWin.setPosition(1,1);
	}
	if (this.detailsPopWin != null && this.detailsPopWin.isVisible()) {
	    //probably can just put panels on same form!
	    this.detailPopWin.setPosition(this.detailsPopWin.getPosition());
	    this.detailPopWin.setHeight(this.detailsPopWin.getHeight());
	    this.detailPopWin.setWidth(this.detailsPopWin.getWidth());
	    this.detailsPopWin.hide();
	}
	this.detailForm.loadRecord(record);
	this.detailPopWin.show();
	if (showMap) {
	    var mapPane = this.detailPopWin.down('[itemid="spdetailmappane"]');
	    var aDom = Ext.getDom(mapPane.getId());
	    mapPane.fireEvent('maprequest', record, aDom);
	}
	this.detailPopWin.toFront();
    },

    showDetailForm: function(rowIndex) {
	if (this.detailsPopWin != null && this.detailsPopWin.isVisible() && this.detailsForm != null) {
	    var tab = this.detailsForm.down('tabpanel');
	    var detailPager = this.detailsForm.down('pagingtoolbar');
	    detailPager.getStore().loadPage(rowIndex+1);
	    tab.setActiveTab(1); 
	} else {
	    //something strange has happened
	    console.info("Detailer: unable to show detail form on a details popup because the details popup has evaporated.");
	}
    },

});
