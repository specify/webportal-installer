Ext.define('SpWebPortal.controller.Mapper', {
    extend: 'Ext.app.Controller',
    xtype: 'mapcontroller',
    //id: 'spwpmapcontroller',

    geoCoordFlds: [],
    fldsOnMap: [],
    mapMarkTitleFld: '',
    mainMapCtl: null,
    mapPopupWin: null,
    mapMarkers: {},
    fitToMap: false,
    forceFitToMap: false,
    mapStore: null,
    lilMapStore: null,
    markerPlacementStepSize: 500,
    markerTask: null,
    recordsBeingMapped: [],
    progBar: null,
    statusTextCtl: null,
    statusText: '',
    loadingBtn: null,
    mapTaskPage: 0,
    
    minMappedLat: 90.0, 
    maxMappedLat:  -90.0,
    minMappedLng: 180.0, 
    maxMappedLng: -180.0,

    //localizable text...
    mapTitle: 'Map',
    noGeoCoordMsg: 'Geo coords are not present for this record',
    mapResultsText: 'Mapped {0} records at {1} points.',
    mapProgressText:'{0} - {1} of {2}',
    //...localizable text

    init: function() {
	//console.info("Mapper.init");
	this.control({
	    'expressSrch button[itemid="search-btn"]': {
		click: this.onExpressSearch
	    },
	    'expressSrch textfield': {
		specialkey: this.onExpressSearchSpecialKey
	    },
	    'advSrch button[itemid="search-btn"]': {
		click: this.onAdvancedSearch
	    },
	    'advSrch textfield': {
		specialkey: this.onAdvancedSearchSpecialKey
	    },
	    'spmaingrid': {
	        mapsetsready: this.mapSettingsReady
	    },
	    'actioncolumn[itemid="map-popup-ctl"]': {
		clicked: this.onPopupClk
	    },	
	    //'#spwpmainpagingtoolbar': {
	//	beforechange: this.onBeforePageChange,
	//	change: this.onPageChange
	  //  },
	    '#spwpmaintabpanel': {
		tabchange: this.onTabChange,
		dosearch: this.onDoSearch
	    },
	    'button[itemid="mapsearchbtn"]': {
		click: this.onMapSearchClk
	    },
	    'checkbox[itemid="fit-to-map"]': {
		change: this.fitToMapChange
	    },
	    'panel[itemid="spdetailmappane"]': {
		maprequest: this.detailMapRequest
	    }
	});

	this.callParent(arguments);
    },

    getMapPane: function() {
	return Ext.getCmp('spwpmainmappane');
    },

    fitToMapChange: function() {
	this.fitToMap = !this.fitToMap;
    },

    onExpressSearch: function() {
	console.info("Mapper.onExpressSearch()");
	this.forceFitToMap = false;
	//this.getMapPane().setLoading(true);
    },

    onExpressSearchSpecialKey: function(field, e) {
	if (e.getKey() == e.ENTER) {
	    this.onExpressSearch();
	}
    },

    onAdvancedSearch: function() {
	console.info("Mapper.onAdvancedSearch()");
	this.forceFitToMap = false;
    },

    onAdvancedSearchSpecialKey: function(field, e) {
	if (e.getKey() == e.ENTER) {
	    this.onAdvancedSearch();
	}
    },

    buildMapStoreModel: function(mainStore) {
	//use mainStore's geocoord flds
	//plus mapmarker fields
	//plus id/cn
    },

    onMapSearchClk: function() {
	console.info("Mapper.onMapSearchClk()");
	this.forceFitToMap = true;
	//this.getMapPane().setLoading(true);
	/*var store = Ext.getStore('MainSolrStore');


	if (this.lilMapStore == null) {
	    //var mapModel = this.buildMapStoreModel(store);
	    Ext.define('SpWebPortal.MapModel', {
		extend: 'Ext.data.Model',
		fields: [
		    {name: 'spid', type: 'string'},
		    {name: 'l1', type: 'tdouble'},
		    {name: 'l11', type: 'tdouble'}
		]
	    }),
	    this.lilMapStore = Ext.create('Ext.data.Store', {
		model: "SpWebPortal.MapModel",
		//model: mapModel;
		pageSize: 10000,
		proxy: {
		    type: 'jsonp',
		    callbackKey: 'json.wrf',
		    url: store.solrUrlTemplate,
		    reader: {
			root: 'response.docs',
			totalProperty: 'response.numFound'
		    }
		}
	    });
	}*/				 
	/*if (this.mapStore == null) {
	    this.mapStore = Ext.create('SpWebPortal.store.MainSolrStore', {
		pageSize: 15000
	    });
	}*/
	/*var pageSize = store.pageSize;
	var url = store.getProxy().url.replace("rows="+pageSize, "rows="+this.lilMapStore.pageSize);
	url = url.replace("fl=*,score", "fl=cn,l1,l11");
	//XXX need to add sort on geocoords too
	this.recordsBeingMapped = [];
	this.lilMapStore.getProxy().url = url;
	this.loadMapStore(1);*/
    },

    mapReadyTasked: function(records) {
	console.info("mapReadyTasked");
	if (typeof this.recordsBeingMapped  === "undefined" || this.recordsBeingMapped.length == 0) {
	    this.recordsBeingMapped = records;
	    var task = Ext.TaskManager.newTask({
		run: this.buildMapTasked,
		scope: this,
		interval: 1
	    });
	    this.mapTaskPage = this.lilMapStore.currentPage;
	    task.start();
	    if (this.lilMapStore.getTotalCount() > this.lilMapStore.currentPage * this.lilMapStore.pageSize) {
		console.info("loading page " + (this.lilMapStore.currentPage+1) + " of map store.");
		this.loadMapStore(this.lilMapStore.currentPage + 1);
	    }
	    return false;
	} else {
	    return true;
	}
    },

    loadMapStore: function(page) {
	//UI update...
	if (this.progBar == null) {
	    this.progBar = Ext.getCmp('spwpmainmapprogbar');
	    this.progBar.setWidth(400);
	    this.statusTextCtl = Ext.getCmp('spwpmainmapstatustext');
	    this.statusTextCtl.setWidth(400);
	    this.loadingBtn = Ext.getCmp('spwpmainmaploadbtn');
	}

	if (page == 1) {
	    this.statusTextCtl.setVisible(false);
	    this.progBar.setVisible(true);
	    this.loadingBtn.setVisible(true);
	}
	//this.progBar.setLoading(true);
	this.loadingBtn.setLoading(true);
	//...UI update

	this.lilMapStore.loadPage(page, {
	    scope: this,
	    callback: function(records) {
		console.info("MapStore loaded " + page + " with " + records.length + " of " + this.lilMapStore.getTotalCount() + " records.");
		if (page == 1) {
		    this.clearMarkers2();
		    this.progBar.updateProgress(0.0);
		}
		//this.progBar.setLoading(false);
		this.loadingBtn.setLoading(false);
		//this.recordsBeingMapped = records;
		var task = Ext.TaskManager.newTask({
		    //run: this.buildMapTasked,
		    run: this.mapReadyTasked,
		    args: [records],
		    scope: this,
		    interval: 10
		});
		task.start();
		//this.buildMap2(records, this.geoCoordFlds, this.fldsOnMap, this.mapMarkTitleFld, false, false, true/*until sort by geocoords is added*/);
	    }
	});
    },

    buildMapTasked: function(invocations) {
	var first = (invocations-1) * 1000;
	var totalFirst = ((this.mapTaskPage-1)*this.lilMapStore.pageSize) + first;
	if (first >= this.recordsBeingMapped.length) {
	    this.recordsBeingMapped = [];
	    //if (this.lilMapStore.getTotalCount() > this.lilMapStore.currentPage * this.lilMapStore.pageSize) {
	//	console.info("loading page " + (this.lilMapStore.currentPage+1) + " of map store.");
	//	this.loadMapStore(this.lilMapStore.currentPage + 1);
	  //  }

	    if (totalFirst >= this.lilMapStore.getTotalCount()) {
		this.mapTaskPage = 0;

		//UI update...
		this.progBar.reset();
		this.progBar.updateText('');
		this.progBar.setVisible(false);

		this.statusTextCtl.setText(Ext.String.format(this.mapResultsText,  
							     this.lilMapStore.getTotalCount(), 
							     _.size(this.mapMarkers)));
		this.statusTextCtl.setVisible(true);
		this.loadingBtn.setVisible(false);
		//...UI update

		if (!this.forceFitToMap) {
		    var bounds = null;
		    if (this.minMappedLat != null && this.minMappedLng != null && this.maxMappedLat != null && this.maxMappedLng != null) {
			var sw = new google.maps.LatLng(this.minMappedLat, this.minMappedLng);
			var ne = new google.maps.LatLng(this.maxMappedLat, this.maxMappedLng);
			bounds = new google.maps.LatLngBounds(sw, ne);
		    }
		    if (bounds != null) {
			this.mainMapCtl.fitBounds(bounds);
		    }
		}
	    }
	    return false;
	}
	var last = Math.min(first + 1000, this.recordsBeingMapped.length);
	console.info("mapping " + first + " to " + last);
	var totalLast = Math.min(totalFirst + 1000, totalFirst + this.recordsBeingMapped.length);
	var progText = Ext.String.format(this.mapProgressText, totalFirst, totalLast, 
					 this.lilMapStore.getTotalCount());
	this.progBar.updateProgress(totalFirst/this.lilMapStore.getTotalCount(), progText); 
	var chunk = this.recordsBeingMapped.slice(first, last);
	this.buildMap2(chunk, this.geoCoordFlds, this.fldsOnMap, this.mapMarkTitleFld, false, !this.forceFitToMap, false);
	return true;
    },
    
    onGoogleMarkerClick: function(record) {
	console.info("Mapper.onGoogleMarkerClick");
	var mappane = this.getMapPane();
	//mappane.setLoading(true);
	mappane.fireEvent('googlemarkerclick', record);
    },

    onGoogleMarkerClick2: function(geoCoords) {
	console.info("Mapper.onGoogleMarkerClick2");
	//console.info(arguments);
	var store = Ext.getStore('MainSolrStore');
	var url = store.getExpSearchLatLngUrl(geoCoords);
	var mappane = this.getMapPane();
	//mappane.setLoading(true);
	mappane.fireEvent('googlemarkerclick2', url);
    },

    doMap: function() {
	if (this.mainMapCtl == null) {
	    //this.buildMap(recs, this.geoCoordFlds, this.fldsOnMap, this.mapMarkTitleFld, false);
	    this.mainMapCtl = this.geWinInitializeEmpty(this.getDomForMap(false), true);
	    this.getMapPane().setMapCmp(this.mainMapCtl);
	}

	var store = Ext.getStore('MainSolrStore');
	if (store.getSearched()) {
	    this.minMappedLat = 90.0; 
	    this.maxMappedLat = -90.0;
	    this.minMappedLng = 180.0; 
	    this.maxMappedLng = -180.0;

	    if (this.lilMapStore == null) {
		Ext.define('SpWebPortal.MapModel', {
		    extend: 'Ext.data.Model',
		    fields: [
			{name: 'spid', type: 'string'},
			{name: 'l1', type: 'tdouble'},
			{name: 'l11', type: 'tdouble'}
		    ]
		}),
		this.lilMapStore = Ext.create('Ext.data.Store', {
		    model: "SpWebPortal.MapModel",
		    pageSize: 10000,
		    proxy: {
			type: 'jsonp',
			callbackKey: 'json.wrf',
			url: store.solrUrlTemplate,
			reader: {
			    root: 'response.docs',
			    totalProperty: 'response.numFound'
			}
		    }
		});
	    }				 
	    var pageSize = store.pageSize;
	    var url = store.getProxy().url.replace("rows="+pageSize, "rows="+this.lilMapStore.pageSize);
	    url = url.replace("fl=*", "fl=cn,l1,l11");
	    url = url + '&sort=l1+asc&l2+asc';

	    //Only remap if url/search has changed. This might not be completely
	    //safe. Currently Advanced and Express searches will re-execute even url is UN-changed.
	    //Technically, it would be better to track whether a search has been executed since last mapping.
	    if (url != this.lilMapStore.getProxy().url) {
		this.recordsBeingMapped = [];
		this.lilMapStore.getProxy().url = url;
		this.loadMapStore(1);
	    } else {
		Ext.getCmp('spwpmainmapprogbar').setVisible(false);
	    }
	}
    },

    setupToolbar: function(tabPanel, isMapTab) {
	if (isMapTab) {
	    Ext.getCmp('spwpmaintabpanel').down('button[itemid="mapsearchbtn"]').setVisible(true);
	    Ext.getCmp('spwpmainpagingtoolbar').setVisible(false);
	    Ext.getCmp('spwpmainmapprogbar').setVisible(true);
	} else {
	    tabPanel.down('button[itemid="mapsearchbtn"]').setVisible(false);
	    Ext.getCmp('spwpmainpagingtoolbar').setVisible(true);
	    Ext.getCmp('spwpmainmapprogbar').setVisible(false);
	    Ext.getCmp('spwpmainmapstatustext').setVisible(false);
	}
    },

    onTabChange: function(tabPanel, newCard) {
	this.setupToolbar(tabPanel, newCard.id == 'spwpmainmappane');
	if (newCard.id == 'spwpmainmappane') {
	    this.doMap();
	} 
    },


    mapSettingsReady: function(geoCoordFlds, fldsOnMap, mapMarkTitleFld) {
	//console.info('Mapper.mapSettingsReady()');
	//console.info(geoCoordFlds);
	//console.info(fldsOnMap);
	//console.info(mapMarkTitleFld);
	this.geoCoordFlds = geoCoordFlds;
	this.fldsOnMap = fldsOnMap;
	this.mapMarkTitleFld = mapMarkTitleFld;
    },

    onDoSearch: function() {
	var tabber = Ext.getCmp('spwpmaintabpanel');
	var tab = tabber.getActiveTab();
	if (tab.id == 'spwpmainmappane') {
	    this.doMap();
	}
    },

    onPopupClk: function(record, geoCoordFlds, fldsOnMap, mapMarkTitleFld) {
	//console.info('map popup clicked');
	//console.info(arguments);
	var rec = [];
	rec[0] = record;
	this.buildMap(rec, geoCoordFlds, fldsOnMap, mapMarkTitleFld, true);
    },
    
    detailMapRequest: function(record, aDom) {
	var rec = [];
	rec[0] = record;
	this.buildMap(rec, this.geoCoordFlds, this.fldsOnMap, this.mapMarkTitleFld, false, aDom); 
    },

    isMappable: function(geoCoord) {
	if (geoCoord == null) return false;
 
	if (typeof geoCoord == "string") return geoCoord.trim() != "";

	return true;
    },

    areMappable: function(geoCoords) {
	for (var c = 0; c < geoCoords.length; c++) {
	    if (!this.isMappable(geoCoords[c])) {
		return false;
	    }
	}
	return true;
    },
	
    getMapCtl: function(geoCoords, aDom, bnds, isPopup) {
	var minLat = bnds[1], maxLat = bnds[3], minLong = bnds[2], maxLong = bnds[4];
	var dom = (typeof aDom === "undefined" || aDom == null) ? this.getDomForMap(isPopup) : aDom;
	var mapCtl = (typeof aDom === "undefined" || aDom == null) ? this.mainMapCtl : null;
	var setMapCtl = false;
	if (geoCoords.length > 0) {
	    if (geoCoords.length == 1) {
		if (mapCtl == null) {
		    mapCtl = this.geWinInitializeSingle(geoCoords[0], dom, isPopup);
		} else {
		    Ext.apply(mapCtl, this.getSinglePointMapInitialOptions(geoCoords[0]));
		}
	    } else {
		if (mapCtl == null) {
		    mapCtl = this.geWinInitializeSet(minLat, minLong, maxLat, maxLong, dom, isPopup);
		} else {
		    var bounds = null;
		    if (minLat != null && minLong != null && maxLat != null && maxLong != null) {
			var sw = new google.maps.LatLng(minLat, minLong);
			var ne = new google.maps.LatLng(maxLat, maxLong);
			bounds = new google.maps.LatLngBounds(sw, ne);
		    }
		    if (bounds != null && !(this.fitToMap || this.forceFitToMap)) {
			mapCtl.fitBounds(bounds);
		    }
		}
	    }
	    setMapCtl = (!isPopup && (typeof aDom === "undefined" || aDom == null) && this.mainMapCtl == null);
	} else {
	    if (records.length > 0) {
		if (isPopup) {
		    alert(this.noGeoCoordMsg);
		}
	    } else if (!isPopup) {
		mapCtl = this.geWinInitializeEmpty(Ext.getDom('spwpmainmappane'), true);
		setMapCtl = this.mainMapCtl == null;
	    }
	}
	if (setMapCtl) {
	    this.mainMapCtl = mapCtl
	    this.getMapPane().setMapCmp(this.mainMapCtl);
	}
	return mapCtl;
    },

    buildMap: function(records, geoCoordFlds, fldsOnMap, mapMarkTitleFld, isPopup, aDom) {
	console.info('Mapper.buildMap. #Recs: ' + records.length);
	//console.info(arguments);
	var p = 0;
	var bnds = this.getMappedRecsWithBounds(records, geoCoordFlds, true);
	var geoCoords = bnds[0];
	var minLat = bnds[1], maxLat = bnds[3], minLong = bnds[2], maxLong = bnds[4];
	//worry about boxes and lines later...
	//console.info('points plotted: ' + geoCoords.length);
	if (geoCoords.length > 0) {
	    var dom = typeof aDom === "undefined" ? this.getDomForMap(isPopup) : aDom;
	    var mapCtl;
	    if (geoCoords.length == 1) {
		mapCtl = this.geWinInitializeSingle(geoCoords[0], dom, isPopup);
	    } else {
		mapCtl = this.geWinInitializeSet(minLat, minLong, maxLat, maxLong, dom, isPopup);
	    }
	    if (!isPopup && typeof aDom === "undefined") {
		if (this.mainMapCtl == null) {
		    this.mainMapCtl = mapCtl;
		    this.getMapPane().setMapCmp(this.mainMapCtl);
		}
	    }
	    var sortedCoords = this.sortGeoCoords(geoCoords);
	    geoCoords = [];
	    this.markMap(records, sortedCoords, mapCtl, fldsOnMap, mapMarkTitleFld, isPopup);
	} else {
	    if (records.length > 0 && isPopup) {
		alert(this.noGeoCoordMsg);
	    } else if (!isPopup) {
		if (typeof aDom === "undefined") {
		    mapCtl = this.geWinInitializeEmpty(Ext.getDom('spwpmainmappane'), true);
		    if (this.mainMapCtl == null) {
			this.mainMapCtl = mapCtl
			this.getMapPane().setMapCmp(this.mainMapCtl);
		    } 
		} else {
		    //Probably an unmappable detail view
		    var map = this.geWinInitializeEmpty(aDom, false);
		    map.setZoom(0);
		}
	    }
	}
	this.getMapPane().setLoading(false);
    },

    buildMap2: function(records, geoCoordFlds, fldsOnMap, mapMarkTitleFld, isPopup, checkBounds, sortGeoCoords) {
	//console.info('Mapper.buildMap. #Recs: ' + records.length);
	var p = 0;
	var bnds = this.getNewPoints(records, geoCoordFlds, checkBounds);
	var geoCoords = bnds;
	//worry about boxes and lines later...
	//console.info('points plotted: ' + geoCoords.length);
	var mapCtl = this.mainMapCtl == null ? this.getMapCtl(geoCoords, null, bnds, isPopup) : this.mainMapCtl; 
	if (geoCoords.length > 0) {
	    var sortedCoords = geoCoords;
	    if (sortGeoCoords) {
		sortedCoords = this.sortGeoCoords(geoCoords);
		geoCoords = [];
	    }
	    this.markMap2(records, sortedCoords, mapCtl, fldsOnMap, mapMarkTitleFld, isPopup);
	}	console.info("buildMap2 completing");
	t//his.getMapPane().setLoading(false);
    },

    markMap: function(records, sortedCoords, mapCtl, fldsOnMap, mapMarkTitleFld, isPopup) {
	var current = [];
	var recs = [];
	current[0] = sortedCoords[0][0];
	current[1] = sortedCoords[0][1];
	recs = [sortedCoords[0][2]];
	console.info("Mapper: marking " + sortedCoords.length + " points.");
	for (var p = 1; p < sortedCoords.length; p++) {
	    if (sortedCoords[p][0] == current[0] && sortedCoords[p][1] == current[1]) {
		recs[recs.length] = sortedCoords[p][2];
	    } 
	    if (!(sortedCoords[p][0] == current[0] && sortedCoords[p][1] == current[1])) {
		markRecs = [];
		for (var mr = 0; mr < recs.length; mr++) {
		    markRecs[mr] = records[recs[mr]];
		}    
		//console.info("  Mapper: marked " + recs.length); 
		this.addMarker(mapCtl, markRecs, current, fldsOnMap, mapMarkTitleFld);
		current[0] = sortedCoords[p][0];
		current[1] = sortedCoords[p][1];
		recs = [];
		recs[0] = sortedCoords[p][2];
	    }
	}
	markRecs = [];
	for (var mr = 0; mr < recs.length; mr++) {
	    markRecs[mr] = records[recs[mr]];
	}    
	//console.info("  Mapper: marked " + recs.length); 
	this.addMarker(mapCtl, markRecs, current, fldsOnMap, mapMarkTitleFld, isPopup);
    },

    markMap2: function(records, sortedCoords, mapCtl, fldsOnMap, mapMarkTitleFld, isPopup) {
	var current = [];
	var recs = [];
	//console.info("Mapper: marking " + sortedCoords.length + " points.");
	for (var p = 0; p < sortedCoords.length; p++) {
	    current[0] = sortedCoords[p][0];
	    current[1] = sortedCoords[p][1];
	    this.addMarker2(mapCtl, current, fldsOnMap, mapMarkTitleFld);
	}
    },

    getDomForMap: function(isPopup) {
	var dom;
	if (isPopup) {
	    if (this.mapPopupWin == null) {
		this.mapPopupWin = this.buildMapPopupWin();
	    }
	    this.mapPopupWin.show();
	    this.mapPopupWin.toFront();
	    dom = Ext.getDom('mapPopupWinMainPane');
	} else {
	    dom = Ext.getDom('spwpmainmappane');
	}
	return dom;
    },

    buildMapPopupWin: function() {
	var result = Ext.create('Ext.window.Window', {
	    title: this.mapTitle,
	    height: 400,
	    width: 400,
	    maximizable: false,
	    resizable: false,
	    closeAction: 'hide',
	    layout: 'fit',
	    items: {
		xtype: 'panel',
		name: 'mapPanel',
		id: 'mapPopupWinMainPane'
	    }
	});
	result.setPosition(1,1);
	return result;
    },

    sortGeoCoords: function(geoCoords) {
	//XXX Can't get sort function to work and can't find documentation
	//so the sort is alphabetical. Which might be OK?
	//geoCoords is an array with the lat at idx 0, lng at 1, AND a list of idxs of records at the point at 2.
	return Ext.Array.sort(geoCoords);/* function(arg1, arg2) {
						     //console.info(arguments);
						     lat1 = arg1[0];
						     long1 = arg1[1];
						     lat2 = arg2[0];
						     long2 = arg2[1];
						     if (lat1 < lat2) return -1;
						     if (lat2 > lat1) return 1;
						     if (long1 < long2) return -1;
						     if (long2 > long1) return 1;
						     return 0;
						     });*/
    },
	
    getMappedRecsWithBounds: function(records, geoCoordFlds, getBounds) {
	var geoCoords = [];
	var p = 0;
	var minLat = getBounds ? 90.0 : null, maxLat = getBounds ? -90.0 : null;
	var minLng = getBounds ? 180.0 : null, maxLng = getBounds ? -180.0 : null;
	var lastCoords = [];
	for (var r = 0; r < records.length; r++) {
	    var coords = [];
	    coords[0] = records[r].get(geoCoordFlds[0]);
	    coords[1] = records[r].get(geoCoordFlds[1]);
	    if (r == 0 || coords[0] != lastCoords[0] || coords[1] != lastCoords[1]) {
		lastCoords[0] = coords[0];
		lastCoords[1] = coords[1];
		if (this.areMappable(coords)) {
		    geoCoords[p] = [];
		    geoCoords[p][0] = coords[0];
		    geoCoords[p][1] = coords[1];
		    //geoCoords[p][2] = r;
		    if (getBounds) {
			if (minLat > coords[0]) {
			    minLat = coords[0];
			} 
			if (maxLat < coords[0]) {
			    maxLat = coords[0];
			}
			if (minLng > coords[1]) {
			    minLng = coords[1];
			} 
			if (maxLng < coords[1]) {
			    maxLng = coords[1];
			}
		    }
		    p++;
		}
	    }
	}
	return [geoCoords, minLat, minLng, maxLat, maxLng];
    },

    getNewPoints: function(records, geoCoordFlds, checkBounds) {
	var geoCoords = [];
	var p = 0;
	var added = {};
	var lastCoords = [];
	for (var r = 0; r < records.length; r++) {
	    var coords = [];
	    coords[0] = records[r].get(geoCoordFlds[0]);
	    coords[1] = records[r].get(geoCoordFlds[1]);
	    if (r == 0 || coords[0] != lastCoords[0] || coords[1] != lastCoords[1]) {
		lastCoords[0] = coords[0];
		lastCoords[1] = coords[1];
		if (this.areMappable(coords)) {
		    //worry about lines, boxes etc, later
		    var point = new google.maps.LatLng(coords[0], coords[1]).toString();
		    if (!this.mapMarkers[point] && !added[point]) {
			//XXX just need to add the point now
			geoCoords[p] = [];
			geoCoords[p][0] = coords[0];
			geoCoords[p][1] = coords[1];
			added[point] = 'y';
			if (checkBounds) {
			    if (this.minMappedLat > coords[0]) {
				this.minMappedLat = coords[0];
			    } 
			    if (this.maxMappedLat < coords[0]) {
				this.maxMappedLat = coords[0];
			    }
			    if (this.minMappedLng > coords[1]) {
				this.minMappedLng = coords[1];
			    } 
			    if (this.maxMappedLng < coords[1]) {
				this.maxMappedLng = coords[1];
			    }
			}

			p++;
		    }
		}
	    }
	}
	added = {};
	return geoCoords;
    },

    getDefaultMapType: function() {
	var defType = Ext.getStore('SettingsStore').getAt(0).get('defMapType');
	var result = google.maps.MapTypeId.ROADMAP;
	switch (defType) {
	case 'roadmap': result = google.maps.MapTypeId.ROADMAP;
	case 'hybrid': result = google.maps.MapTypeId.HYBRID;
	case 'satellite': result = google.maps.MapTypeId.SATELLITE;
	case 'terrain': result = google.maps.MapTypeId.TERRAIN;}
	return result;
    },

    getInitialMapType: function() {
	if (this.mainMapCtl != null) {
	    return this.mainMapCtl.getMapTypeId();
	}
	return this.getDefaultMapType();
    },

    geWinInitializeEmpty: function(dom, isMain) {
	var myOptions = {
	    zoom: 3,
            mapTypeId: this.getInitialMapType(),
	    center: new google.maps.LatLng(0, 0)
        };
	this.clearMarkers();
	if (this.mainMapCtl == null || !isMain) {
	    return new google.maps.Map(dom, myOptions);
	} else {  
            Ext.apply(this.mainMapCtl, myOptions);
	    return this.mainMapCtl;
	}
    },

    geWinInitializeSet: function(minLat, minLong, maxLat, maxLong, dom, isPopup) {
 	//worry about lines, boxes etc, later
        var bounds = null;
	if (minLat != null && minLong != null && maxLat != null && maxLong != null) {
	    var sw = new google.maps.LatLng(minLat, minLong);
	    var ne = new google.maps.LatLng(maxLat, maxLong);
	    bounds = new google.maps.LatLngBounds(sw, ne);
	}
	var myOptions = {
	    zoom: 0,
	    mapTypeId: this.getInitialMapType()
        };

        var result = this.mainMapCtl == null || isPopup ? new google.maps.Map(dom, myOptions)
	    : this.mainMapCtl;

	//this.clearMarkers(); //don't necessarily have to do this???
	if (bounds != null && !(this.fitToMap || this.forceFitToMap)) {
	    result.fitBounds(bounds);
	}	
	return result;
   },

    getSinglePointMapInitialOptions: function(geoCoords) {
	//worry about lines, boxes etc, later
        var point = new google.maps.LatLng(geoCoords[0], geoCoords[1]);
	var result = {
            zoom: 6,
            mapTypeId: this.getInitialMapType(),
            center: point
        };
	return result;
    },
		
    geWinInitializeSingle: function (geoCoords, dom, isPopup) {
	var myOptions = this.getSinglePointMapInitialOptions(geoCoords);
	
	//this.clearMarkers();  //don't necessarily have to do this ???
	//if (isPopup || this.mainMapCtl == null || dom != Ext.getDom(this.mainMapCtl.getId())) {
	    return new google.maps.Map(dom, myOptions);
	/*} else {
	    if (!(this.fitToMap || this.forceFitToMap)) {	    
		//this.clearMarkers();
		Ext.apply(this.mainMapCtl,myOptions);
	    }	    
	    return this.mainMapCtl;
	}*/
    },

    clearMarkers: function() {
	for (var m=0; m < this.mapMarkers.length; m++){
	    this.mapMarkers[m].setMap(null);
	}
	this.mapMarkers.length = 0;
	//also clear listeners on markers
	if (this.mainMapCtl != null) {
	    google.maps.event.clearListeners(this.mainMapCtl, 'click');
	}
    },

    clearMarkers2: function() {
	_.each(this.mapMarkers, function(marker) {marker.setMap(null)});
	this.mapMarkers = {};
	//also clear listeners on markers
	if (this.mainMapCtl != null) {
	    google.maps.event.clearListeners(this.mainMapCtl, 'click');
	}
    },

    getMarkerText: function(record, mapMarkTitleFld) {
	var titleTxt = 'specimen';
	if (!(typeof mapMarkTitleFld  === "undefined") && mapMarkTitleFld.length > 0) {
	    if (record instanceof Array) {
		var lineLen = 0;
		titleTxt = '';
		for (var r = 0; r < record.length && r < 20; r++) {
		    /*if (lineLen > 75) {
			titleTxt += '<br>';
			lineLen = 0;
		    } */
		    var txt = mapMarkTitleFld[1] + ': ' + record[r].get(mapMarkTitleFld[0]);
		    if (r < record.length - 1) {
			txt += ', ';
		    }
		    //lineLen += txt.length;
		    titleTxt += txt;
		}
		if (r < record.length) {
		    titleTxt += ' ...';
		}
	    } else {
		titleTxt = mapMarkTitleFld[1] + ': ' + record[0].get(mapMarkTitleFld[0]);
	    }
	}
	return titleTxt;
    },
	
    addPopupMarkerListener: function(marker, map, fldsOnMap, geoCoords, record) {
	var contentStr = '';
	for (var f = 0; f < fldsOnMap.length; f++) {
	    if (f > 0) {
		contentStr += '<br>';
	    }
	    contentStr += fldsOnMap[f][1] + ': ' + record[0].get(fldsOnMap[f][0]);
	}
	contentStr += '<br>' + geoCoords[0] + ', ' + geoCoords[1];
	
	google.maps.event.addListener(marker, 'click', function() {

	    var infowindow = new google.maps.InfoWindow({
		content: contentStr
	    });
	    infowindow.open(map, marker);
	});	
    },

    addMarker: function (map, record, geoCoords, fldsOnMap, mapMarkTitleFld, isPopup){
	//worry about lines, boxes etc, later
        var point = new google.maps.LatLng(geoCoords[0], geoCoords[1]);
	var titleTxt = this.getMarkerText(record, mapMarkTitleFld);

        var marker = new google.maps.Marker({
            position: point, 
            map: map,
            title: titleTxt
	});
	//this.mapMarkers.push(marker);
	this.mapMarkers[point.toString()] = marker;

	if (isPopup) {
	    this.addPopupMarkerListener(marker, map, fldsOnMap, geoCoords, record);
	} else {
	    var self = this;
	    google.maps.event.addListener(marker, 'click', function() {
		self.onGoogleMarkerClick(record);
	    });
	}
    },

    addMarker2: function (map, geoCoords, fldsOnMap, mapMarkTitleFld, isPopup){
	//worry about lines, boxes etc, later
        var point = new google.maps.LatLng(geoCoords[0], geoCoords[1]);
	//var titleTxt = this.getMarkerText(record, mapMarkTitleFld);

        var marker = new google.maps.Marker({
            position: point, 
            map: map,
            //title: "busted"
	});
	this.mapMarkers[point.toString()] = marker;

	if (isPopup) {
	    this.addPopupMarkerListener(marker, map, fldsOnMap, geoCoords, record);
	} else {
	    var self = this;
	    var ll = [];
	    for (var i = 0; i < geoCoords.length; i++) {
		ll[i] = geoCoords[i];
	    }
	    google.maps.event.addListener(marker, 'click', function() {
		self.onGoogleMarkerClick2(ll);
	    });
	}
    }

});
