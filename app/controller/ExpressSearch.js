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
	    }
	});
	this.callParent(arguments);
    },

    doSearch: function() {
	console.info("ExpressSearch doSearch()");
    	var search = this.getSearch();
	var control = search.query('textfield[itemid="search-text"]');
	var solr = this.getMainSolrStoreStore();
	var images = this.getRequireImages();
	var maps = this.getRequireGeoCoords();
	var mainQ = control[0].value.toLowerCase();
	if (images || maps) {
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
	if (images || maps) {
	    url += '"';
	}
	if (this.getMatchAll()) { 
	    url += "&q.op=AND";
	} 

	solr.getProxy().url = url; 

	solr.loadPage(1);
    }
});

