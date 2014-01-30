/*
 * SpWebPortal.view.DetailsPanel
 *
 * Displays multiple records. Wraps loading and navigation around a DetailPanel.
 *
 */
Ext.define('SpWebPortal.view.DetailsPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'spdetailspanel',
    alias: 'widget.spdetailspanel',

    //localizable text...
    detailPagerDisplayMsg: 'Displaying record {0} of {2}',
    detailPagerEmptyMsg: 'No records to display',
    detailDetailTitle: 'Detail',
    detailGridTitle:'Table',
    pagerDisplayMsg: 'Displaying records {0} - {1} of {2}',
    pagerEmptyMsg: 'No records to display',
    recordText: 'Record',
    //...localizable text
    
    requires: [
	'SpWebPortal.view.DetailPanel',
	'SpWebPortal.model.MainModel'
    ],

    config: {
	currentRecIdx: 0,
	count: 0,
	showMap: false,
	recStore: null,
	mainBBar: null
    },
    loadCalledByDetail: false,

    layout: 'fit',

    setMapVisibility: function(value) {
	this.setShowMap(value);
	this.down('spdetailpanel').setShowMap(value);
    },

    getTabbedLayout: function() {
	return this.down('spdetailpanel').getTabbedLayout();
    },

    isMapTabActive: function() {
	return this.down('spdetailpanel').isMapTabActive();
    },

    initComponent: function() {
	//console.info("DetailsPanel.initComponent()");

	Ext.define('SpWebPortal.view.DetailStore', {
	    extend: 'Ext.data.Store', 
	    model: 'SpWebPortal.model.MainModel',
	    pageSize: 1,
	    proxy: {
		type: 'memory'
	    },
	    detailer: this,
	    config: {
		pageToLoad: 1
	    },
	    loadPage: function(page) {
		var actualPage = page % this.detailer.getRecStore().pageSize;
		if (actualPage == 0) actualPage = this.detailer.getRecStore().pageSize;
		var newBasePage = Math.floor((page - 1) / this.detailer.getRecStore().pageSize) + 1;

		var currBasePage = this.detailer.getRecStore().currentPage;
		//console.info("DetailsPanel store load page " + page + ", base page: " + newBasePage + ", currBasePage: " + currBasePage);

		if (newBasePage != currBasePage) {
		    this.pageToLoad = page;
		    this.detailer.loadPageForDetail(newBasePage);
		} else {
		    this.detailer.setCurrentRecIdx(actualPage-1);
		    var record = this.getAt(actualPage-1);
		    this.detailer.down('spdetailpanel').loadRecord(this.getAt(actualPage-1));
		    this.currentPage = page;
		    this.fireEvent('load');
		    if (this.detailer.getShowMap() && this.detailer.getMapTab().tab.isVisible()) {
			var mapPane = this.detailer.down('[itemid="spdetailmappane"]');
			var aDom = Ext.getDom(mapPane.getId());
			try {
			    mapPane.fireEvent('maprequest', record, aDom);
			} catch(e) {
			    //suppress error that occurs when aDom mapPane isn't ready
			}
		    }
		}
	    },
	    getTotalCount: function() {
		//console.info("DetailsPanel store getTotalCount " + this.detailer.getCount());
		
		//return this.detailer.getCount();

		return this.detailer.getRecStore().getTotalCount();
	    },
	    getCount: function() {
		//console.info("DetailsPanel store getCount " + this.detailer.getCount());
	    }
	});

	var theStore = Ext.create('SpWebPortal.view.DetailStore');
	
	var theRecStore = Ext.create('Ext.data.Store', {
	    model: "SpWebPortal.model.MainModel",
	    pageSize: 50,
	    remoteSort: true,
	    proxy: {
		type: 'jsonp',
		callbackKey: 'json.wrf',
		reader: {
		    root: 'response.docs',
		    totalProperty: 'response.numFound'
		}
	    },
	    setGeoCoordFlds: function() {},
	    //The listener is copied straight from MainSolrStore
	    listeners: {
		'beforeload': function(store, operation) {
		    //alert('beforeload: ' + store.getProxy().url);
		    if (store.sorters.getCount() > 0) {
			var url = store.getProxy().url;
			var sortIdx = url.lastIndexOf('&sort=');
			if (sortIdx != -1) {
			    url = url.substring(0, sortIdx);
			}
			var mStore = Ext.getStore("MainSolrStore"); //pretty lame. Need it for its getSortStr method.
			if (mStore.treeLevels == null) {
			    mStore.setupTreeLevels();
			}
			var sortStr = '';
			for (var s = 0; s < store.sorters.getCount(); s++) {
			    var sorter = store.sorters.getAt(s);
			    if (s > 0) sortStr += ',';
			    sortStr += mStore.getSortStr(sorter);
			}
			if (sortStr != '') {
			    sortStr = 'sort=' + sortStr;
			    store.getProxy().url = url + '&' + sortStr;
			}
		    }
		}
	    }
	});

	this.setRecStore(theRecStore);
	this.setMainBBar(Ext.create('Ext.toolbar.Paging', {
	    itemid: 'spwpdetailpagingtoolbar',
	    store: this.getRecStore(),
	    displayInfo: true,
	    displayMsg: this.pagerDisplayMsg,
	    emptyMsg: this.pagerEmptyMsg
	}));
	var items = [];
	items[0] = Ext.create('Ext.tab.Panel', {
	    itemid: 'spwp-details-panel-tab',
	    layout: 'fit',
	    bbar: [
		this.getMainBBar()
	    ],
	    items: [
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
			    emptyMsg: this.detailPagerEmptyMsg,
			    beforePageText: this.recordText
			})
		    ],

		    items: [
			Ext.create('SpWebPortal.view.DetailPanel', {
			    showMap: this.getShowMap()
			})
		    ]
		},
		{
		    xtype: 'spmaingrid',
		    title: this.detailGridTitle,
		    store: this.getRecStore(),
		    showMapAction: false,
		    isDetail: true
		}
	    ]
	});

	this.items = items;

	this.callParent(arguments);
    },

    loadPageForDetail: function(newBasePage) {
	this.loadCalledByDetail = true;
	this.getRecStore().loadPage(newBasePage);
    },

    fillStore: function(theStore, records, size) {
	theStore.removeAll();
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
	var rowStr = '&rows=' + Ext.getStore('MainSolrStore').pageSize;
	var newRowStr = '&rows=' + this.getRecStore().pageSize;
	var adjustedUrl = url.replace(rowStr, newRowStr);
	this.getRecStore().getProxy().url = adjustedUrl;
	this.getRecStore().loadPage(1, {
	    scope: this,
	    callback: function(records) {
		var mainBBarVisibility = this.getRecStore().getTotalCount() > this.getRecStore().pageSize
		    && this.down('tabpanel').getActiveTab().getXType() == 'spmaingrid';
		this.getMainBBar().setVisible(mainBBarVisibility);
		Ext.getCmp('spwpdetailpagerid').getStore().setPageToLoad(1);
		this.loadRecords(records);
	    }
	});
    },
	
    loadRecords: function(records) {
	//console.info("DetailsPanel.loadRecords()");
	var theStore = Ext.getCmp('spwpdetailpagerid').getStore();
	theStore.removeAll();
	this.setCount(0);
	if (true) {
	    theStore.add(records);
	    //console.info("DetailsPanel.loadRecords(): filled store");
	    this.setCount(records.length);
	    if (this.loadCalledByDetail) {
		this.loadCalledByDetail = false;
		theStore.loadPage(theStore.getPageToLoad());
	    } else {
		theStore.loadPage(((this.getRecStore().currentPage-1) * this.getRecStore().pageSize) + 1);
	    }
	    this.down('tabpanel').getActiveTab().setLoading(false);
	    Ext.getCmp('spwpdetailpagerid').setVisible(theStore.getTotalCount() > 1);
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

    getCurrentRecord: function() {
	return this.down('spdetailpanel').getRecord();
    },

    getMapTab: function() {
	return this.down('spdetailpanel').getMapTab();
    }
});
