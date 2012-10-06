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
	showMap: false,
	recStore: null
    },

    layout: 'fit',

    initComponent: function() {
	console.info("DetailsPanel.initComponent()");

	Ext.define('SpWebPortal.view.DetailStore', {
	    extend: 'Ext.data.Store', 
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

	var theStore = Ext.create('SpWebPortal.view.DetailStore');
	
	var theRecStore = Ext.create('Ext.data.Store', {
	    model: "SpWebPortal.model.MainModel",
	    pageSize: 1000,
	    proxy: {
		type: 'jsonp',
		callbackKey: 'json.wrf',
		reader: {
		    root: 'response.docs',
		    totalProperty: 'response.numFound'
		}
	    }
	});
	this.setRecStore(theRecStore);

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
		    bbar: [
			Ext.create('Ext.toolbar.Paging', {
			    store: theStore,
			    displayInfo: true,
			    itemid: 'spwpdetailpager',
			    id: 'spwpdetailpagerid',
			    displayMsg: this.detailPagerDisplayMsg,
			    emptyMsg: this.detailPagerEmptyMsg
			})
		    ],

		    items: [
			Ext.create('SpWebPortal.view.DetailPanel', {
			    showMap: this.getShowMap()
			})
		    ]
		}
	    ]
	});

	this.items = items;

	this.callParent(arguments);
    },

    fillStore: function(theStore, records, size) {
	var start = theStore.data.items.length;
	var r;
	//console.log("filling records " + start + " to " + (start+size));
	if (start == 0) {
	    this.down('tabpanel').getActiveTab().setLoading(true);
	} 
	var result = start + size <= records.length;
	var end = result ? start + size : records.length;
	theStore.add(records.slice(start, end));
	if (!result) {
	    this.setCount(records.length);
	    theStore.loadPage(1);
	    this.down('tabpanel').getActiveTab().setLoading(false);
	}	    
	return result;
    },

    getAndLoadRecords: function(url) {
	this.getRecStore().getProxy().url = url;
	this.getRecStore().load({
	    scope: this,
	    callback: function(records) {
		this.loadRecords(records);
	    }
	});
    },
	
    loadRecords: function(records) {
	//console.info("DetailsPanel.loadRecords()");
	var theStore = Ext.getCmp('spwpdetailpagerid').getStore();
	theStore.removeAll();
	this.setCount(0);
	if (false) {
	    theStore.add(records);
	    //console.info("DetailsPanel.loadRecords(): filled store");
	    this.setCount(records.length);
	    theStore.loadPage(1);
	    this.down('tabpanel').getActiveTab().setLoading(false);
	} else {
	    var task = Ext.TaskManager.newTask({
		run: this.fillStore,
		args: [
		    theStore,
		    records,
		    400
		],
		scope: this,
		interval: 200
	    });
	    task.start();
	}
	//this.down('spdetailpanel').loadRecord(record
    },

    loadCurrentRecord: function() {
	//var theStore = this.down('pagingtoolbar').getStore();
	//var rec = theStore.getAt(this.getCurrentRecIdx());
	//this.down('spdetailpanel').loadRecord(rec);
    }

});
