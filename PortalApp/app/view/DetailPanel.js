/*
 * SpWebPortal.view.DetailPanel
 *
 * Displays a single record. Consists of three tabs: form, image and map.
 *
 */
Ext.define('SpWebPortal.view.DetailPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'spdetailpanel',
    alias: 'widget.spdetailpanel',

    layout: 'border',

    config: {
	showMap: true,
	showImages: true,
	showFullImageView: true,
	tabbedLayout: true
    },

    //localizable text...
    mapTabTitle: 'Map',
    imgTabTitle: 'Images',
    specTabTitle: 'Specimen',
    //...localizable text

    requires: [
	'SpWebPortal.view.DetailView', 'SpWebPortal.view.ImageView',
	'SpWebPortal.view.DetailMapPanel'
    ],

    initComponent: function() {
	//console.info('DetailPanel.initComponent');

	var cmps = [];

	var settings = Ext.getStore('SettingsStore').getAt(0);
	var attUrl = settings.get("imageBaseUrl");
	this.setShowImages(typeof attUrl === "string" && attUrl.length > 0);  

	if (this.getTabbedLayout()) {
	    cmps[0] = Ext.create('Ext.tab.Panel', {
		layout: 'fit',
		region: 'center',
		itemid: 'spwp-detail-panel-tab',
		items: [
		    Ext.widget('spdetail', {title: this.specTabTitle}),
		    {
			xtype: 'spimageview',
			title: this.imgTabTitle,
			hidden: !this.getShowImages()
		    },
		    {
			xtype: 'spdetailmappanel',
			title: this.mapTabTitle
		    }
		]
	    });

	} else {
	    cmps[0] = Ext.widget('spdetail', {
		region: 'center'
	    });

	    cmps[1] = Ext.create('Ext.panel.Panel', {
		collapsible: true,
		header: false,
		split: true,
		layout: 'border',
		region: 'east',
		itemid: 'img-and-map-view',
		width: 300,
		items: [
		    {
			xtype: 'spdetailmappanel',
			region: 'north',
			height: 300,
			collapsible: true,
			split: true,
			collapsed: !this.getShowMap()
		    },
		    {
			xtype: 'spimageview',
			region: 'center'
		    }
		]
	    });
	}

	this.items = cmps;

	this.callParent(arguments);
    },

    isMapTabActive: function() {
	result = false;
	if (this.getTabbedLayout()) {
	    result = this.down('tabpanel').getActiveTab().getXType() == 'spdetailmappanel';
	}
	return result;
    },

    getImgTab: function() {
	return this.down('spimageview');
    },

    getMapTab: function() {
	return this.down('spdetailmappanel');
    },

    isMapped: function(record) {
	return Ext.getCmp('spwpmaingrid').hasGeo(null, null, record);
    },

    loadRecord: function(record) {
	var frm = this.down('spdetailview');
	this.down('spdetailview').loadRecord(record);

	//set up image view
	var imgView = this.down('spimageview');
	var imgStore = imgView.getImageStore();
	imgStore.removeAll();
	var imagesPresent = imgView.addImgForSpecRec(record) > 0 && this.getShowImages();
	if (this.getTabbedLayout()) {
	    this.getImgTab().tab.setVisible(imagesPresent);
	    this.getMapTab().tab.setVisible(this.getShowMap() && this.isMapped(record));
	    var activeTab = this.down('tabpanel').getActiveTab();
	    if (!activeTab.tab.isVisible()) {
		this.down('tabpanel').setActiveTab(0);
	    }
	} else {
	    var imgMapView = this.down('[itemid="img-and-map-view"]');
	    if (!imagesPresent && !this.getShowMap()) {
		imgMapView.setTitle('');
		if (!imgMapView.getCollapsed()) {
		    imgMapView.collapse();
		}
	    } else if (imagesPresent && imgMapView.getCollapsed()) {
		//print msg in title for now
		imgMapView.setTitle("expand to view image(s)");
	    }
	}
    },
    
    getRecord: function() {
	return this.down('spdetailview').getRecord();
    }

});
