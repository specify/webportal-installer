Ext.define('SpWebPortal.controller.ExpressSearch', {
    extend: 'SpWebPortal.controller.Search',
    
    refs: [
	{
	    ref: 'search',
	    selector: 'expressSrch'
	}
    ],

    stores: ['MainSolrStore'],
    models: ['MainModel'],

    init: function() {
	console.info("ExpressSearch.init");

	this.control({
	    'expressSrch button[itemid="search-btn"]': {
		click: this.doSearch
	    },
	    'expressSrch radiogroup[itemid="match-radio-grp"]': {
		change: this.matchAllChange
	    },
	    'expressSrch textfield': {
		specialkey: this.onSpecialKey
	    },
	    'button[itemid="mapsearchbtn"]': {
		click: this.onMapSearchClick
	    }
	});
	this.callParent(arguments);
    },

    onMapSearchClick: function() {
	this.setForceFitToMap(true);
	this.doSearch();
	this.setForceFitToMap(false);
    },

    doSearch: function() {
	console.info("ExpressSearch doSearch()");
    	var search = this.getSearch();
	var control = search.query('textfield[itemid="search-text"]');
	var solr = this.getMainSolrStoreStore();
	var images = this.getRequireImages();
	var maps = this.getRequireGeoCoords();
	var mainQ = control[0].value.toLowerCase();
	var filterToMap = (this.getForceFitToMap() || this.getFitToMap()) && this.mapViewIsActive();
	if (images || maps || filterToMap) {
	    mainQ = '_query_:"' + mainQ + '"+AND+_query_:"';
	}
	var url = solr.urlTemplate + mainQ;

	if (images) {
	    url += solr.getImageRequirementFilter();
	}
	if (maps) {
	    if (images) {
		url += '+AND+';
	    }
	    url += solr.getGeoCoordRequirementFilter();
	}
	if (filterToMap) {
	    if (images || maps) {
		url += '+AND+';
	    }
	    url += solr.getMapFitFilter();
	}
	if (images || maps || filterToMap) {
	    url += '"';
	}
	if (this.getMatchAll()) { 
	    url += "&q.op=AND";
	} 

	solr.getProxy().url = url; 

	solr.loadPage(1, {
	    callback: function() {
		//Ext.getCmp('spwpmainpagingtoolbar').fireEvent('change');
	    }
	});
    }
});

