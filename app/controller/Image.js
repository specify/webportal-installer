
Ext.define('SpWebPortal.controller.Image', {
    extend: 'Ext.app.Controller',

    //localizable text...
    selectedImage: 'Selected Image',
    previewTitle: 'Preview (page {0} of {1})',
    //...localizable text
 
    config: {
	baseUrl: ''
    },

    init: function() {
	this.control({
	    'thumbnail': {
		selectionchange: this.onSelectionChange
	    },
	    '#spwpmainpagingtoolbar': {
		change: this.onPageChange
	    }
	});

	var settingsStore =  Ext.getStore('SettingsStore');
	var settings = settingsStore.getAt(0);
	this.setBaseUrl(settings.get('imageBaseUrl'));

	this.callParent(arguments);
    },

    onSelectionChange: function(dv, nodes) {
	var l = nodes.length,
        s = l !== 1 ? 's' : '';
	var v = dv.view;
	if (dv.getSelection().length > 0) {
	    var img = dv.getSelection()[0];  //single selection
	    var imgView = v.up('panel').up('panel').down('image'); //not good enough for real-world
	    var pane = imgView.up('panel'); //not good enough for reality
	    imgView.setSrc(this.getBaseUrl() + '/' + img.get('AttachmentLocation'));
	    var paneTitle = img.get('AttachedToDescr') + ' - ' + img.get('Title');
	    if (img.get('Width') != 0 && img.get('Height') != 0) {
		paneTitle +=  ' (' + img.get('Width') + ' x ' + img.get('Height') + ')';
	    } else {
		//I suspect that this will not consistently work. I don't think the setSrc method called
		//above is synchronous.
		paneTitle += ' (' + imgView.getWidth() + ' x ' + imgView.getHeight() + ')';
	    }
	    pane.setTitle(paneTitle);
	}
    },

    onPageChange: function(pager, pageData) {
	console.info('Image onPageChange()');
	var store = pager.getStore();
	var thumb = pager.up('tabpanel').down('spimageview').down('spthumbnail');
	thumb.up('panel').setTitle(Ext.String.format(this.previewTitle, store.currentPage, Math.ceil(store.getTotalCount()/store.pageSize)));
	var imgView = pager.up('tabpanel').down('spimageview').down('image'); 
	imgView.setSrc('');
	var pane = imgView.up('panel');
	pane.setTitle(this.selectedImage);
	//var imgStore = thumb.getStore();
	//imgStore.removeAll();
	
	var thbStore = thumb.getStore();
	thbStore.removeAll();
	var imgStore = pager.up('tabpanel').down('spimageview').getImageStore();
	imgStore.removeAll();

	for (var r = 0; r < store.getCount(); r++) {
	    var rec = store.getAt(r);
	    var imgDef = rec.get('img');
	    if (imgDef != null && imgDef != '') {
		var imgs = Ext.JSON.decode(imgDef);
		for (var i = 0; i < imgs.length; i++) {
		    Ext.apply(imgs[i], {
			//AttachedTo: rec.getId(),
			AttachedTo: r,
			AttachedToDescr: rec.get('cn')
		    });
		}
		imgStore.add(imgs);
	    }
	}
	pager.up('tabpanel').down('spimageview').down('pagingtoolbar').setVisible(imgStore.getTotalCount() > imgStore.pageSize);
	thbStore.loadPage(1);
    }

})
