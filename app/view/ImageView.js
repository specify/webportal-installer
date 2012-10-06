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
	imageStore: null
    },

    initComponent: function() {


	var thumbStore = Ext.create('Ext.data.Store', {
	    model: 'SpWebPortal.model.AttachedImageModel',
	    pageSize: 10,
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
	});

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

	    region: 'west',
	    width: 300,
	    autoScroll: true,
	    items: Ext.create('SpWebPortal.view.ThumbnailView', {
		store: thumbStore
	    })
	});

	cmps[1] = Ext.create('Ext.panel.Panel', {
	    region: 'center',
	    autoScroll: true,
	    title: this.selectedTitle,
	    items: {
		xtype: 'image'
	    }
	});

	dcmps = [];
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
	});

	this.items = cmps;
	this.dockedItems = dcmps;

	this.callParent(arguments);
    }
});
