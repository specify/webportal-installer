Ext.define('SpWebPortal.controller.Mapper', {
    extend: 'Ext.app.Controller',
    xtype: 'mapcontroller',
    //id: 'spwpmapcontroller',

    geoCoordFlds: [],
    fldsOnMap: [],
    mapMarkTitleFld: '',
    mainMapCtl: null,
    mapPopupWin: null,
    mapMarkers: [],
    fitToMap: false,
    forceFitToMap: false,

    //localizable text...
    mapTitle: 'Map',
    noGeoCoordMsg: 'Geo coords are not present for this record',
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
	    '#spwpmainpagingtoolbar': {
		beforechange: this.onBeforePageChange,
		change: this.onPageChange
	    },
	    '#spwpmaintabpanel': {
		tabchange: this.onTabChange
	    },
	    'button[itemid="mapsearchbtn"]': {
		click: this.onMapSearchClk
	    },
	    'checkbox[itemid="fit-to-map"]': {
		change: this.fitToMapChange
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
	this.getMapPane().setLoading(true);
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

    onMapSearchClk: function() {
	console.info("Mapper.onMapSearchClk()");
	this.forceFitToMap = true;
	this.getMapPane().setLoading(true);
    },

    onGoogleMarkerClick: function(record) {
	//console.info("Mapper.onGoogleMarkerClick");
	var mappane = this.getMapPane();
	//mappane.setLoading(true);
	mappane.fireEvent('googlemarkerclick', record);
    },

    onTabChange: function(tabPanel, newCard) {
	if (newCard.id == 'spwpmainmappane') {
	    this.getMapPane().setLoading(true);
	    this.mapPage();
	    tabPanel.down('button[itemid="mapsearchbtn"]').setVisible(true);
	} else {
	    tabPanel.down('button[itemid="mapsearchbtn"]').setVisible(false);
	}
    },

    mapPage: function() {
	var store = Ext.getStore('MainSolrStore');
	var recs = [];
	for (var r = 0; r < store.getCount(); r++) {
	    recs[r] = store.getAt(r);
	}
	this.buildMap(recs, this.geoCoordFlds, this.fldsOnMap, this.mapMarkTitleFld, false);
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

    onBeforePageChange: function(pager) {
	console.info('Mapper.onBeforePageChange()');
	var tabber = pager.up('tabpanel');
	var tab = tabber.getActiveTab();
	if (tab.id == 'spwpmainmappane') {
	    this.getMapPane().setLoading(true);
	}
	return true;
    },

    onPageChange: function(pager) {
	console.info('Mapper.onPageChange()');
	var tabber = pager.up('tabpanel');
	var tab = tabber.getActiveTab();
	if (tab.id == 'spwpmainmappane') {
	    this.mapPage();
	}
    },

    onPopupClk: function(record, geoCoordFlds, fldsOnMap, mapMarkTitleFld) {
	//console.info('map popup clicked');
	//console.info(arguments);
	var rec = [];
	rec[0] = record;
	this.buildMap(rec, geoCoordFlds, fldsOnMap, mapMarkTitleFld, true);
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
	
    buildMap: function(records, geoCoordFlds, fldsOnMap, mapMarkTitleFld, isPopup) {
	console.info('Mapper.buildMap. #Recs: ' + records.length);
	//console.info(arguments);
	var geoCoords = [];
	//var recIdx = [];
	var p = 0;
	var minLat = 90.0, maxLat = -90.0, minLong = 180.0, maxLong = -180.0;
	for (var r = 0; r < records.length; r++) {
	    var coords = [];
	    coords[0] = records[r].get(geoCoordFlds[0]);
	    coords[1] = records[r].get(geoCoordFlds[1]);
	    if (this.areMappable(coords)) {
		//coords[0] = parseFloat(coords[0]);
		//coords[1] = parseFloat(coords[1]);
		geoCoords[p] = [];
		geoCoords[p][0] = coords[0];
		geoCoords[p][1] = coords[1];
		//recIdx[p] = r;
		geoCoords[p][2] = r;
		if (minLat > coords[0]) {
		    minLat = coords[0];
		} 
		if (maxLat < coords[0]) {
		    maxLat = coords[0];
		}
		if (minLong > coords[1]) {
		    minLong = coords[1];
		} 
		if (maxLong < coords[1]) {
		    maxLong = coords[1];
		}
		p++;
	    }
	}
	//console.info(minLat);
	//console.info(maxLat);
	//console.info(minLong);
	//console.info(maxLong);
	//worry about boxes and lines later...
	//console.info('points plotted: ' + geoCoords.length);
	if (geoCoords.length > 0) {
	    //console.info("mapping...");
	    var dom;
	    if (isPopup) {
		if (this.mapPopupWin == null) {
		    this.mapPopupWin = Ext.create('Ext.window.Window', {
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
		    this.mapPopupWin.setPosition(1,1);
		}
		this.mapPopupWin.show();
		this.mapPopupWin.toFront();
		dom = Ext.getDom('mapPopupWinMainPane');
	    } else {
		dom = Ext.getDom('spwpmainmappane');
	    }
	    var mapCtl;
	    if (geoCoords.length == 1) {
		mapCtl = this.geWinInitializeSingle(geoCoords[0], dom, isPopup);
	    } else {
		mapCtl = this.geWinInitializeSet(minLat, minLong, maxLat, maxLong, dom, isPopup);
	    }
	    if (!isPopup) {
		if (this.mainMapCtl == null) {
		    this.mainMapCtl = mapCtl;
		    this.getMapPane().setMapCmp(this.mainMapCtl);
		}
	    }
	    //XXX Can't get sort function to work and can't find documentation
	    //so the sort is alphabetical. Which might be OK?
	    var sortedCoords = Ext.Array.sort(geoCoords);/* function(arg1, arg2) {
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
		    console.info("  Mapper: marked " + recs.length); 
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
	    console.info("  Mapper: marked " + recs.length); 
	    this.addMarker(mapCtl, markRecs, current, fldsOnMap, mapMarkTitleFld, isPopup);
	    
	} else {
	    if (records.length > 0) {
		if (isPopup) {
		    alert(this.noGeoCoordMsg);
		}
	    } else if (!isPopup) {
		mapCtl = this.geWinInitializeEmpty(Ext.getDom('spwpmainmappane'));
		if (this.mainMapCtl == null) {
		    this.mainMapCtl = mapCtl
		    this.getMapPane().setMapCmp(this.mainMapCtl);
		}
	    }
	}
	this.getMapPane().setLoading(false);
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

    geWinInitializeEmpty: function(dom) {
	var myOptions = {
	    zoom: 3,
            mapTypeId: this.getInitialMapType(),
	    center: new google.maps.LatLng(0, 0)
        };
	this.clearMarkers();
	if (this.mainMapCtl == null) {
	    return new google.maps.Map(dom, myOptions);
	} else {  
            Ext.apply(this.mainMapCtl, myOptions);
	    return this.mainMapCtl;
	}
    },

    geWinInitializeSet: function(minLat, minLong, maxLat, maxLong, dom, isPopup) {
 	//worry about lines, boxes etc, later
        var sw = new google.maps.LatLng(minLat, minLong);
	var ne = new google.maps.LatLng(maxLat, maxLong);
	var myOptions = {
	    zoom: 0,
            mapTypeId: this.getInitialMapType()
        };
	var bounds = new google.maps.LatLngBounds(sw, ne);
	

        var result = this.mainMapCtl == null || isPopup ? new google.maps.Map(dom, myOptions)
	    : this.mainMapCtl;
	this.clearMarkers(); //don't necessarily have to do this???
	if (!(this.fitToMap || this.forceFitToMap)) {
	    //this.clearMarkers();
	    result.fitBounds(bounds);
	}	return result;
   },

    geWinInitializeSingle: function (geoCoords, dom, isPopup) {
	//worry about lines, boxes etc, later
        var point = new google.maps.LatLng(geoCoords[0], geoCoords[1]);

	var myOptions = {
            zoom: 6,
            mapTypeId: this.getInitialMapType(),
            center: point
        };
	
	this.clearMarkers();  //don't necessarily have to do this ???
	if (isPopup || this.mainMapCtl == null) {
	    return new google.maps.Map(dom, myOptions);
	} else {
	    if (!(this.fitToMap || this.forceFitToMap)) {	    
		//this.clearMarkers();
		Ext.apply(this.mainMapCtl,myOptions);
	    }	    
	    return this.mainMapCtl;
	}
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

    addMarker: function (map, record, geoCoords, fldsOnMap, mapMarkTitleFld, isPopup){
	//worry about lines, boxes etc, later
        var point = new google.maps.LatLng(geoCoords[0], geoCoords[1]);
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
        var marker = new google.maps.Marker({
            position: point, 
            map: map,
            title: titleTxt
	});
	this.mapMarkers.push(marker);

	if (isPopup) {
	    google.maps.event.addListener(marker, 'click', function() {
		var contentStr = '';
		for (var f = 0; f < fldsOnMap.length; f++) {
		    if (f > 0) {
			contentStr += '<br>';
		    }
		    contentStr += fldsOnMap[f][1] + ': ' + record[0].get(fldsOnMap[f][0]);
		}
		contentStr += '<br>' + geoCoords[0] + ', ' + geoCoords[1];

		var infowindow = new google.maps.InfoWindow({
		    content: contentStr
		});
		infowindow.open(map, marker);
	    });
	} else {
	    var self = this;
	    google.maps.event.addListener(marker, 'click', function() {
		self.onGoogleMarkerClick(record);
	    });
	}
    }
});
