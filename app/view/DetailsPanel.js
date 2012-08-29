Ext.define('SpWebPortal.view.DetailsPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'spdetailspanel',
    alias: 'widget.spdetailspanel',

    //localizable text...
    detailPagerDisplayMsg: 'Displaying record {0} of {2}',
    detailPagerEmptyMsg: 'No records to display',
    detailDetailTitle: 'Detail',
    detailGridTitle:'Records',
    //...localizable text
    
    requires: [
	'SpWebPortal.view.DetailPanel',
	'SpWebPortal.model.MainModel'
    ],

    config: {
	currentRecIdx: 0,
	count: 0,
	showMap: false
    },

    layout: 'fit',

    initComponent: function() {
	console.info("DetailsPanel.initComponent()");

	var theStore = Ext.create('Ext.data.Store', {
	    model: 'SpWebPortal.model.MainModel',
	    pageSize: 1,
	    proxy: {
		type: 'memory'
	    },
	    detailer: this,
	    loadPage: function(page) {
		console.info("DetailsPanel store load page " + page);
		this.detailer.setCurrentRecIdx(page-1);
		var record = this.getAt(page-1);
		this.detailer.down('spdetailpanel').loadRecord(this.getAt(page-1));
		this.currentPage = page;
		//return this.currentPage;
		//return true;
		this.fireEvent('load');
	    },
	    getTotalCount: function() {
		//console.info("DetailsPanel store getTotalCount " + this.detailer.getCount());
		return this.detailer.getCount();
	    },
	    getCount: function() {
		//console.info("DetailsPanel store getCount " + this.detailer.getCount());
	    },
	    setGeoCoordFlds: function(geoCoordFlds) {
	    }
	});
	

	var items = [];
	items[0] = Ext.create('Ext.tab.Panel', {
	    layout: 'fit',
	    items: [
		{
		    xtype: 'spmaingrid',
		    title: this.detailGridTitle,
		    store: theStore,
		    showMapAction: false,
		    isDetail: true
		},
		{
		    xtype: 'panel',
		    layout: 'fit',
		    title: this.detailDetailTitle,
		    bbar: Ext.create('Ext.toolbar.Paging', {
			store: theStore,
			displayInfo: true,
			itemid: 'spwpdetailpager',
			displayMsg: this.detailPagerDisplayMsg,
			emptyMsg: this.detailPagerEmptyMsg
		    }),

		    items: Ext.create('SpWebPortal.view.DetailPanel', {
			showMap: this.getShowMap()
		    })
		}
	    ]
	});

	this.items = items;

	this.callParent(arguments);
    },

    loadRecords: function(records) {
	var theStore = this.down('pagingtoolbar').getStore();
	theStore.removeAll();
	this.setCount(0);
	for (var r = 0; r < records.length; r++) {
	    theStore.add(records[r]);
	}
	this.setCount(records.length);
	theStore.loadPage(1);
	//this.down('spdetailpanel').loadRecord(record
    },

    loadCurrentRecord: function() {
	//var theStore = this.down('pagingtoolbar').getStore();
	//var rec = theStore.getAt(this.getCurrentRecIdx());
	//this.down('spdetailpanel').loadRecord(rec);
    }

});
