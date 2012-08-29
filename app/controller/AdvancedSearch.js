Ext.define('SpWebPortal.controller.AdvancedSearch', {
    extend: 'SpWebPortal.controller.Search',

    refs: [
	{
	    ref: 'search',
	    selector: 'advSrch'
	}
    ],

    stores: ['MainSolrStore'],
    models: ['MainModel'],

    config: {
	solr: true
    },

    init: function() {
	console.info("AdvancedSearch.init");

	this.control({
	    'advSrch button[itemid="search-btn"]': {
		click: this.doSearch
	    },
	    'advSrch radiogroup[itemid="match-radio-grp"]': {
		change: this.matchAllChange
	    },
	    'advSrch textfield': {
		specialkey: this.onSpecialKey
	    }
	});

	this.setMatchAll(true);

	this.callParent(arguments);
    },

    doSearch: function() {
	console.info("AdvancedSearch.doSearch");
	var ctrls = this.getSearch().query('spsearchcriterion');
	var connector = this.getSolr() ? ' +' : ', ';
	var filterStr = '', c;
	for (c = 0; c < ctrls.length; c++) {
	    var filter = this.getSolr() ? ctrls[c].solrFilter() : ctrls[c].sqlPhpFilter();
	    console.info(filter);
	    if (filter == 'error') {
		filterStr = 'error';
		break;
	    } else if (filter != '') {
		if (filterStr != '') {
		    filterStr += connector;
		}
		filterStr += filter;
	    }
	}
	var images = this.getRequireImages();
	var maps = this.getRequireGeoCoords();
	if (filterStr.length > 0 && filterStr != 'error') {
	    if (!this.getSolr()) {
		SpecStore.getProxy().url = urlStrTemplateInit + '?WHERE=' +  '[' + filterStr + ']';
		SpecStore.setTree(null);
		SpecStore.loadPage(1);
	    } else {
		var solr = this.getMainSolrStoreStore();
		if (images || maps) {
		    filterStr = '_query_:"' + filterStr + '"+AND+_query_:"';
		}
		var url = solr.urlTemplate + filterStr;
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
		solr.load({ 
		    callback: function() {
			solr.loadPage(1);
		    }
		});
	    }
	}
    }
});
