Ext.define('SpWebPortal.controller.Mapper', {
    extend: 'Ext.app.Controller',
    xtype: 'mapcontroller',

    geoCoordFlds: [],
    fldsOnMap: [],
    mapMarkTitleFld: '',
    mainMapCtl: null,
    mapPopupWin: null,
    mapMarkers: {},
    fitToMap: false,
    forceFitToMap: false,
    lilMapStore: null,
    markerPlacementStepSize: 500,
    markerTask: null,
    recordsBeingMapped: [],
    progBar: null,
    statusTextCtl: null,
    loadingBtn: null,
    cancelBtn: null,
    lastSearchCancelled: false,
    mapTaskPage: 0,
    mapReadyTasks: [],
    buildMapTask: null,
    useFacets: true,
    lastFacetUrl: '',
    
    minMappedLat: 90.0, 
    maxMappedLat:  -90.0,
    minMappedLng: 180.0, 
    maxMappedLng: -180.0,

    //localizable text...
    mapTitle: 'Map',
    noGeoCoordMsg: 'Geo coords are not present for this record',
    mapResultsText: 'Mapped {0} records at {1} points.',
    mapProgressText:'{0} - {1} of {2}',
    simpleMapProgressText: 'Mapping {0} records',
    mapCancelledText: 'Mapping cancelled',
    loadingGeoCoordsText: 'Loading geocoordinates',
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
	    '#spwpmaintabpanel': {
		tabchange: this.onTabChange,
		dosearch: this.onDoSearch
	    },
	    '#spwpmainmappane': {
		resize: this.onMainMapPaneResize
	    },
	    'button[itemid="mapsearchbtn"]': {
		click: this.onMapSearchClk
	    },
	    'button[itemid="mapcancelbtn"]': {
		click: this.cancelMapping
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

    onMainMapPaneResize: function() {
	if (this.mainMapCtl != null) {
	    google.maps.event.trigger(this.mainMapCtl, 'resize');
	}
    },

    getMapPane: function() {
	return Ext.getCmp('spwpmainmappane');
    },

    fitToMapChange: function() {
	this.fitToMap = !this.fitToMap;
    },

    onExpressSearch: function() {
	//console.info("Mapper.onExpressSearch()");
	this.forceFitToMap = false;
	//this.getMapPane().setLoading(true);
    },

    onExpressSearchSpecialKey: function(field, e) {
	if (e.getKey() == e.ENTER) {
	    this.onExpressSearch();
	}
    },

    onAdvancedSearch: function() {
	//console.info("Mapper.onAdvancedSearch()");
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
	//console.info("Mapper.onMapSearchClk()");
	this.forceFitToMap = true;
    },

    mapReadyTasked: function(records) {
	//console.info("mapReadyTasked");
	if (!this.lastSearchCancelled 
	    && (typeof this.recordsBeingMapped  === "undefined" || this.recordsBeingMapped.length == 0)) {
	    this.recordsBeingMapped = records;
	    if (this.buildMapTask != null) {
		this.buildMapTask.destroy();
	    }
	    this.buildMapTask = Ext.TaskManager.newTask({
		run: this.buildMapTasked,
		scope: this,
		interval: 1
	    });
	    this.mapTaskPage = this.lilMapStore.currentPage;
	    this.buildMapTask.start();
	    if (this.lilMapStore.getTotalCount() > this.lilMapStore.currentPage * this.lilMapStore.pageSize) {
		//console.info("loading page " + this.lilMapStore.currentPage + " of map store.");
		this.loadMapStore(this.lilMapStore.currentPage + 1);
	    }
	    return false;
	} else {
	    return true;
	}
    },

    cancelMapping: function() {
	//console.info('cancelMapping');
	this.lastSearchCancelled = true;
	this.mappingDone();
	if (this.buildMapTask != null) {
	    this.buildMapTask.stop();
	    this.buildMapTask.destroy();
	    this.buildMapTask = null;
	}
	//XXX clear points, status text, ...???
	this.updateUIAfterMapping(this.mapCancelledText);	
   },
	
	
    mappingDone: function() {
	//console.info("mappingDone: stopping " + this.mapReadyTasks.length + " tasks");
	for (var t = 0; t < this.mapReadyTasks.length; t++) {
	    this.mapReadyTasks[t].stop();
	    this.mapReadyTasks[t].destroy();
	    this.mapReadyTasks = [];
	}  
	this.recordsBeingMapped = [];
	this.mapTaskPage = 0;
    },
	
    initUICmps: function() {
	if (this.progBar == null) {
	    this.progBar = Ext.getCmp('spwpmainmapprogbar');
	    this.progBar.setWidth(400);
	    this.statusTextCtl = Ext.getCmp('spwpmainmapstatustext');
	    this.statusTextCtl.setWidth(400);
	    this.loadingBtn = Ext.getCmp('spwpmainmaploadbtn');
	    this.cancelBtn = Ext.getCmp('spwpmainmapcancelbtn');
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
	    this.cancelBtn = Ext.getCmp('spwpmainmapcancelbtn');
	}

	if (page == 1) {
	    this.statusTextCtl.setVisible(false);
	    this.progBar.setVisible(true);
	    this.loadingBtn.setVisible(true);
	    this.cancelBtn.setVisible(true);
	}
	//...UI update

	if (!this.lastSearchCancelled) {
	    //UI update
	    this.loadingBtn.setLoading(true);
	    //...UI update
	    this.lilMapStore.loadPage(page, {
		scope: this,
		callback: function(records) {
		    //console.info("MapStore loaded " + page + " with " + records.length + " of " + this.lilMapStore.getTotalCount() + " records.");
		    if (page == 1) {
			//this.clearMarkers2();
			this.progBar.updateProgress(0.0);
		    }
		    this.loadingBtn.setLoading(false);
		    if (!this.lastSearchCancelled) {
			this.mapReadyTasks[this.mapReadyTasks.length] = Ext.TaskManager.newTask({
			    run: this.mapReadyTasked,
			    args: [records],
			    scope: this,
			    interval: 10
			});
			this.mapReadyTasks[this.mapReadyTasks.length - 1].start();
		    }
		}
	    });
	}
    },


    getDistinctPoints: function(url) {
	//var url = 'http://stooge:8983/solr/core3/select/?q=*%3A*&version=2.2&start=0&rows=0&indent=on&qt=&wt=json&fl=cn,l1,l11&facet=on&facet.field=geoc&facet.limit=-1';
        var me = this;
	me.lastFacetUrl = '';
	me.initUICmps();
	me.getMapPane().setLoading(true);
	me.progBar.setVisible(false);
	me.statusTextCtl.setVisible(true);
	me.statusTextCtl.setText(me.loadingGeoCoordsText);
	$.ajax({url: url,
                jsonp: 'json.wrf',
                dataType: 'jsonp'
	       }).done(function(data) {
		   //console.info("Mapper.getDistinctPoints() done");
		   me.lastFacetUrl = url;
		   var numFound = data.response.numFound;
		   me.minMappedLat = 90.0; 
		   me.maxMappedLat = -90.0;
		   me.minMappedLng = 180.0; 
		   me.maxMappedLng = -180.0;
		   me.statusTextCtl.setText(Ext.String.format(me.simpleMapProgressText, numFound));
		   var pts = me.createPointArrayFromFacets(data);
		   var ptsMapped = pts.length;
		   var text = Ext.String.format(me.mapResultsText, numFound, ptsMapped); 
		   me.buildMap2(pts, me.geoCoordFlds, me.fldsOnMap, me.mapMarkTitleFld, false, !me.forceFitToMap, false);
		   me.getMapPane().setLoading(false);
		   if (!(me.fitToMap || me.forceFitToMap)) {
		       var bounds = null;
		       if (me.minMappedLat != null && me.minMappedLng != null && me.maxMappedLat != null && me.maxMappedLng != null) {
			   var sw = new google.maps.LatLng(me.minMappedLat, me.minMappedLng);
			   var ne = new google.maps.LatLng(me.maxMappedLat, me.maxMappedLng);
			   bounds = new google.maps.LatLngBounds(sw, ne);
		       }
		       if (bounds != null) {
			   me.mainMapCtl.fitBounds(bounds);
			   //me.mainMapCtl.fitBounds(me.balanceBounds(bounds));
		       }
		   }
		   
		   me.statusTextCtl.setText(text);

	       });
    },

    balanceBounds: function(bounds) {
	//Messing around with idea to adjust bounds to match the aspect ratio of the map pane, in hopes of preventing
	//map from duplicating continents when lng bounds are wide
	//Not easy, I don't think it's really possible for a general fix. It seems the problem is not with the bounds per se,
	//but the zoom level required to show them, and the screen resolution, and more. At low zooms duplicating continents is what Google does...
	if (bounds == null) {
	    return null;
	} else {
	    var latRat = (bounds.ca.f - bounds.ca.b)/180.0;
	    var lngRat = (bounds.ea.f - bounds.ea.b)/360.0;
	    var mapPane = this.getMapPane();
	    var mapRat = mapPane.getWidth() / mapPane.getHeight();
	    //var llRat =  (bounds.ea.f - bounds.ea.b)/(bounds.ca.f - bounds.ca.b);
	    var llRat = lngRat / latRat;
	    //console.info("mapRat: " + mapRat + ", llRat: " + llRat + ", latRat: " + latRat + ", lngRat: " + lngRat);

	    return bounds;
	}
    },

    createPointArrayFromFacets: function(data) {
	var facets = data.facet_counts.facet_fields.geoc;
	var result = [];
	for (var f = 0; f < facets.length; f += 2) {
	    var ll = facets[f].split(' ');
	    var pnt = [];
	    pnt[0] = parseFloat(ll[0]);
	    pnt[1] = parseFloat(ll[1]);
	    pnt[2] = facets[f+1];
	    //result[f/2] = facets[f].split(' ');
	    result[f/2] = pnt;
	}
	return result;
    },    
	    
    updateUIAfterMapping: function(statusText) {
	this.progBar.reset();
	this.progBar.updateText('');
	this.progBar.setVisible(false);

	this.statusTextCtl.setText(statusText);
	this.statusTextCtl.setVisible(true);
	this.loadingBtn.setVisible(false);
	this.cancelBtn.setVisible(false);
    },
	
    buildMapTasked: function(invocations) {
	var first = (invocations-1) * 1000;
	var totalFirst = ((this.mapTaskPage-1)*this.lilMapStore.pageSize) + first;
	if (first >= this.recordsBeingMapped.length) {
	    this.recordsBeingMapped = [];
	    if (totalFirst >= this.lilMapStore.getTotalCount()) {
		this.mappingDone();
		this.updateUIAfterMapping(Ext.String.format(this.mapResultsText,  
							    this.lilMapStore.getTotalCount(), 
							    _.size(this.mapMarkers)));
		
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
	//console.info("mapping " + first + " to " + last);
	var totalLast = Math.min(totalFirst + 1000, totalFirst + this.recordsBeingMapped.length);
	var progText = Ext.String.format(this.mapProgressText, totalFirst, totalLast, 
					 this.lilMapStore.getTotalCount());
	this.progBar.updateProgress(totalFirst/this.lilMapStore.getTotalCount(), progText); 
	var chunk = this.recordsBeingMapped.slice(first, last);
	this.buildMap2(chunk, this.geoCoordFlds, this.fldsOnMap, this.mapMarkTitleFld, false, !this.forceFitToMap, false);
	return true;
    },
    
    onGoogleMarkerClick: function(record) {
	//console.info("Mapper.onGoogleMarkerClick");
	var mappane = this.getMapPane();
	//mappane.setLoading(true);
	mappane.fireEvent('googlemarkerclick', record);
    },

    onGoogleMarkerClick2: function(geoCoords, count) {
	//console.info("Mapper.onGoogleMarkerClick2");
	//console.info(arguments);
	var store = Ext.getStore('MainSolrStore');
	var ll = geoCoords.slice(0, geoCoords.length-1);
	var url = store.getSearchLatLngUrl(ll);
	var mappane = this.getMapPane();
	//mappane.setLoading(true);
	mappane.fireEvent('googlemarkerclick2', url, geoCoords[geoCoords.length-1]);
    },

    doMap: function() {
	//console.info("Mapaper.doMap()");
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
	    if (this.useFacets) {
		url = url.replace("fl=*", "fl=l1,l11");

		url += '&facet=on&facet.field=geoc&facet.limit=-1&facet.mincount=1';
	    } else {
		url = url.replace("fl=*", "fl=cn,l1,l11");
		url = url + '&sort=l1+asc&l2+asc';
	    }
	    //Only remap if url/search has changed. This might not be completely
	    //safe. Currently Advanced and Express searches will re-execute even url is UN-changed.
	    //Technically, it would be better to track whether a search has been executed since last mapping.
	    //BUT With facets, currently, remapping always occurs
	    if ((this.useFacets && this.lastFacetUrl != url) 
		|| (!this.useFacets && (url != this.lilMapStore.getProxy().url || this.lastSearchCancelled))) {
		this.clearMarkers2();
		this.lastSearchCancelled = false;
		this.recordsBeingMapped = [];
		if (this.useFacets) {
		    this.getDistinctPoints(url);
		} else {
		    this.lilMapStore.getProxy().url = url;
		    this.loadMapStore(1);
		}
	    } else {
 		this.progBar.setVisible(false);
		this.cancelBtn.setVisible(false);
	    }
	}
    },

    setupToolbar: function(tabPanel, isMapTab, isPagedTab) {
	if (isMapTab) {
	    Ext.getCmp('spwpmaintabpanel').down('button[itemid="mapsearchbtn"]').setVisible(true);
	    Ext.getCmp('spwpmainpagingtoolbar').setVisible(false);
	    Ext.getCmp('spwpmainmapprogbar').setVisible(true);
	    Ext.getCmp('spwpsettingsbtn').setVisible(false);
	    Ext.getCmp('spwpexpcsvbtn').setVisible(false);
	} else {
	    tabPanel.down('button[itemid="mapsearchbtn"]').setVisible(false);
	    Ext.getCmp('spwpmainpagingtoolbar').setVisible(isPagedTab);
	    Ext.getCmp('spwpmainmapprogbar').setVisible(false);
	    Ext.getCmp('spwpmainmapstatustext').setVisible(false);
	    Ext.getCmp('spwpmainmapcancelbtn').setVisible(false);
	    Ext.getCmp('spwpsettingsbtn').setVisible(isPagedTab);
	    Ext.getCmp('spwpexpcsvbtn').setVisible(isPagedTab);
	}
    },

    onTabChange: function(tabPanel, newCard) {
	this.setupToolbar(tabPanel, newCard.id == 'spwpmainmappane', newCard.id == 'spwpmaingrid');
	if (newCard.id == 'spwpmainmappane') {
	    this.doMap();
	} 
	var fitToMapCtl = Ext.getCmp('spwp-fit-to-map-chkbx');
	if (fitToMapCtl != null) {
	    fitToMapCtl.setVisible(newCard.id == 'spwpmainmappane');
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
    
    detailMapRequest: function(record, aDom, aMapPane) {
	var rec = [];
	rec[0] = record;
	var map = this.buildMap(rec, this.geoCoordFlds, this.fldsOnMap, this.mapMarkTitleFld, true, aDom); 
	if (typeof aMapPane !== "undefined" && aMapPane != null) {
	    aMapPane.setMapCtl(map);
	}
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
	    this.mainMapCtl = mapCtl;
	    this.getMapPane().setMapCmp(this.mainMapCtl);
	}
	return mapCtl;
    },

    buildMap: function(records, geoCoordFlds, fldsOnMap, mapMarkTitleFld, isPopup, aDom) {
	//console.info('Mapper.buildMap. #Recs: ' + records.length);
	//console.info(arguments);
	var p = 0;
	var bnds = this.getMappedRecsWithBounds(records, geoCoordFlds, true, true);
	var geoCoords = bnds[0];
	var minLat = bnds[1], maxLat = bnds[3], minLong = bnds[2], maxLong = bnds[4];
	//worry about boxes and lines later...
	//console.info('points plotted: ' + geoCoords.length);
	var mapCtl = null;
	if (geoCoords.length > 0) {
	    var dom = typeof aDom === "undefined" ? this.getDomForMap(isPopup) : aDom;
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
			this.mainMapCtl = mapCtl;
			this.getMapPane().setMapCmp(this.mainMapCtl);
		    } 
		} else {
		    //Probably an unmappable detail view
		    mapCtl = this.geWinInitializeEmpty(aDom, false);
		    map.setZoom(0);
		}
	    }
	}
	this.getMapPane().setLoading(false);
	return mapCtl;
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
	    this.markMap2(sortedCoords, mapCtl, fldsOnMap, mapMarkTitleFld, isPopup);
	}	
	//console.info("buildMap2 completing");
	//this.getMapPane().setLoading(false);
    },

    markMap: function(records, sortedCoords, mapCtl, fldsOnMap, mapMarkTitleFld, isPopup) {
	var current = [];
	var recs = [];
	current[0] = sortedCoords[0][0];
	current[1] = sortedCoords[0][1];
	recs = [sortedCoords[0][2]];
	//console.info("Mapper: marking " + sortedCoords.length + " points.");
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

    markMap2: function(sortedCoords, mapCtl, fldsOnMap, mapMarkTitleFld, isPopup) {
	var current = [];
	//console.info("Mapper: marking " + sortedCoords.length + " points.");
	for (var p = 0; p < sortedCoords.length; p++) {
	    current[0] = sortedCoords[p][0];
	    current[1] = sortedCoords[p][1];
	    current[2] = sortedCoords[p][2];
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
	
    getMappedRecsWithBounds: function(records, geoCoordFlds, getBounds, associateRecordsWithPoints) {
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
		    if (associateRecordsWithPoints) {
			geoCoords[p][2] = r;
		    }
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
	//XXX this really isn't necessary with Facets? 
	var geoCoords = [];
	var p = 0;
	var added = {};
	var lastCoords = [];
	for (var r = 0; r < records.length; r++) {
	    var coords = [];
	    if (this.useFacets) {
		coords[0] = records[r][0];
		coords[1] = records[r][1];
		coords[2] = records[r][2];
	    } else {
		coords[0] = records[r].get(geoCoordFlds[0]);
		coords[1] = records[r].get(geoCoordFlds[1]);
	    }
	    if (this.useFacets || r == 0 || coords[0] != lastCoords[0] || coords[1] != lastCoords[1]) {
		lastCoords[0] = coords[0];
		lastCoords[1] = coords[1];
		if (this.areMappable(coords)) {
		    //worry about lines, boxes etc, later
		    var point = new google.maps.LatLng(coords[0], coords[1]).toString();
		    //having the results sorted by geoCoord and checking for changes in the above if
		    //should make looking up in mapMarkers unnecessary - right?
		    //But it doesn't...
		    if (this.useFacets || (!this.mapMarkers[point.toString()] && !added[point])) {
			//XXX just need to add the point now
			geoCoords[p] = [];
			geoCoords[p][0] = coords[0];
			geoCoords[p][1] = coords[1];
			geoCoords[p][2] = coords[2];
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
	case 'roadmap': result = google.maps.MapTypeId.ROADMAP; break;
	case 'hybrid': result = google.maps.MapTypeId.HYBRID; break;
	case 'satellite': result = google.maps.MapTypeId.SATELLITE; break;
	case 'terrain': result = google.maps.MapTypeId.TERRAIN; break;}
	return result;
    },

    getInitialMapType: function() {
	/*if (this.mainMapCtl != null) {
	    return this.mainMapCtl.getMapTypeId();
	}*/
	return this.getDefaultMapType();
    },

    onMapTypeChanged: function(maptypeid) {
	var newType = 'roadmap';
	switch (maptypeid) {
	case google.maps.MapTypeId.ROADMAP: newType = 'roadmap'; break;
	case google.maps.MapTypeId.HYBRID: newType = 'hybrid'; break;
	case google.maps.MapTypeId.SATELLITE: newType = 'satellite'; break;
	case google.maps.MapTypeId.TERRAIN: newType = 'terrain'; break;}

	var mappane = this.getMapPane();
	mappane.fireEvent('maptypechanged', newType);
    },

    geWinInitializeEmpty: function(dom, isMain) {
	var myOptions = {
	    zoom: 3,
            mapTypeId: this.getInitialMapType(),
	    center: new google.maps.LatLng(0, 0)
        };
	this.clearMarkers2();
	if (this.mainMapCtl == null || !isMain) {
	    var result = new google.maps.Map(dom, myOptions);
	    var me = this;
	    google.maps.event.addListener(result, 'maptypeid_changed', function() {
		me.onMapTypeChanged(result.getMapTypeId());
	    });	
	    return result;
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
	
	var newMap =  this.mainMapCtl == null || isPopup;
        var result = newMap ? new google.maps.Map(dom, myOptions)
	    : this.mainMapCtl;
	if (newMap) {
	    var me = this;
	    google.maps.event.addListener(result, 'maptypeid_changed', function() {
		me.onMapTypeChanged(result.getMapTypeId());
	    });	
	}
	//if (!isPopup) {
	//    this.clearMarkers2(); 
	//}
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
	
	//if (!isPopup) {
	//    this.clearMarkers2(); 
	//}
	var result = new google.maps.Map(dom, myOptions);
	var me = this;
	google.maps.event.addListener(result, 'maptypeid_changed', function() {
	    me.onMapTypeChanged(result.getMapTypeId());
	});	
	return result;
    },

    clearMarkers2: function() {
	//console.info("clearMarkers2");
	if (this.mainMapCtl != null) {
	    google.maps.event.clearListeners(this.mainMapCtl, 'click');
	}
	var cleared = 0;
	_.each(this.mapMarkers, function(marker) {marker.setMap(null); cleared++;});
	this.mapMarkers = {};
	//console.info("   cleared " + cleared);
	//also clear listeners on markers
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

    addBoundsChangeListener: function(map, handler) {
	google.maps.event.addListener(map, 'bounds_changed', handler);
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

        if (this.mapMarkers[point.toString()]) {
	    //console.info("hey already marked: " + point.toString());
	} else {
	    var marker = new google.maps.Marker({
		position: point, 
		map: map
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
    }

});
