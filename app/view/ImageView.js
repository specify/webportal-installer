Ext.define('SpWebPortal.view.ImageView', {
    extend: 'Ext.panel.Panel',
    xtype: 'spimageview',
    alias: 'widget.imageview',

    //localizable text...
    previewTitle: 'Preview',
    selectedTitle: 'Selected Image',
    //...localizable text

    layout: 'border',
    
    requires: [
	'SpWebPortal.view.ThumbnailView',
	'SpWebPortal.model.AttachedImageModel'
    ],

    initComponent: function() {


	var imgStore = Ext.create('Ext.data.Store', {
	    model: 'SpWebPortal.model.AttachedImageModel'
	});

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
		store: imgStore
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

	this.items = cmps;

	this.callParent(arguments);
    }
});
