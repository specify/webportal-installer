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
	//console.info("AdvancedSearch.init");

	this.control({
	    'advSrch button[itemid="search-btn"]': {
		click: this.doSearch
	    },
	    'advSrch radiogroup[itemid="match-radio-grp"]': {
		change: this.matchAllChange
	    },
	    'advSrch textfield': {
		specialkey: this.onSpecialKey
	    },
	    'button[itemid="mapsearchbtn"]': {
		click: this.onMapSearchClick
	    }
	});

	this.setMatchAll(true);

	this.callParent(arguments);
    },

    onMapSearchClick: function() {
	if (!Ext.getCmp('spwpmainadvsrch').getCollapsed()) {
	    this.setForceFitToMap(true);
	    this.doSearch();
	    this.setForceFitToMap(false);
	}
    },

    doSearch: function(srchSrc) {
	//console.info("AdvancedSearch.doSearch");

        if (this.getWriteToCsv() && "expr" == srchSrc) {
            return;
        }
        
	var ctrls = this.getSearch().query('spsearchcriterion');
	var connector = this.getSolr() ? ' +' : ', ';
	var filterStr = '', c;
	for (c = 0; c < ctrls.length; c++) {
	    var filter = this.getSolr() ? ctrls[c].solrFilter(this.getMatchAll(), this) : ctrls[c].sqlPhpFilter();
	    //console.info(filter);
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
	var filterToMap = (this.getForceFitToMap() || this.getFitToMap()) && this.mapViewIsActive();
	if (filterStr.length == 0) {
	    filterStr = "*";
	}
	if (filterStr.length > 0 && filterStr != 'error') {
	    if (!this.getSolr()) {
		SpecStore.getProxy().url = urlStrTemplateInit + '?WHERE=' +  '[' + filterStr + ']';
		SpecStore.setTree(null);
		SpecStore.loadPage(1);
		/*var resultsTab = Ext.getCmp('spwpmaintabpanel');
		if (!resultsTab.isVisible()) {
		    var background = Ext.getCmp('spwpmainbackground');
		    background.setVisible(false);
		    resultsTab.setVisible(true);
		}
		resultsTab.fireEvent('dosearch');*/
		this.searchLaunched();
	    } else {
		var solr = this.getMainSolrStoreStore();
		var dummy_geocoords;		
		var url = solr.getSearchUrl(images, maps, filterStr, filterToMap, this.getMatchAll(), dummy_geocoords, this.getWriteToCsv());
		if (this.getWriteToCsv()) {
                    this.exportToCsv(url, this.getCsvFileName(filterStr));
                } else {
		    this.setForceFitToMap(false);
                    Ext.apply(Ext.getCmp('spwpexpcsvbtn'), {srch: 'adv'});

		    solr.getProxy().url = url; 
		    solr.setSearched(true);
		    solr.loadPage(1);

		    /*var resultsTab = Ext.getCmp('spwpmaintabpanel');
		     if (!resultsTab.isVisible()) {
		     var background = Ext.getCmp('spwpmainbackground');
		     background.setVisible(false);
		     resultsTab.setVisible(true);
		     }
		     resultsTab.fireEvent('dosearch');*/
		    this.searchLaunched();
                }
	    }
	}
    }
});
