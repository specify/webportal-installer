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
	//console.info("ExpressSearch.init");

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
	if (!Ext.getCmp('spwpmainexpresssrch').getCollapsed()) {
	    this.setForceFitToMap(true);
	    this.doSearch();
	    this.setForceFitToMap(false);
	}
    },

    getCsvFileName(srchTrm) {
        if (srchTrm == '*') {
            return 'Everything';
        } else {
            return srchTrm.replace(/\(|\)|\#|\@|\$|\%|\&|\+|\-|\=|\"|\'|\?|\<|\>|\.|\,|\:|\;|\*|\!|\/|\|/g,'_');
        }
    },
    
    doSearch: function(exportSrc) {
	//console.info("ExpressSearch doSearch()");

        if (this.getWriteToCsv() && "adv" == exportSrc) {
            return;
        }
        
	var search = this.getSearch();
	var control = search.query('textfield[itemid="search-text"]');
	var solr = this.getMainSolrStoreStore();
	var images = this.getRequireImages();
	var maps = this.getRequireGeoCoords();
	var mainQ = (typeof control[0].value === "undefined" || control[0].value == null || control[0].value == '') 
	    ? '*' 
	        : this.escapeForSolr(control[0].value,true);
	var filterToMap = (this.getForceFitToMap() || this.getFitToMap()) && this.mapViewIsActive();
        var dummy_geocoords;
	var url = solr.getSearchUrl(images, maps, mainQ, filterToMap, this.getMatchAll(), dummy_geocoords, this.getWriteToCsv());

        if (this.getWriteToCsv()) {
	    /*console.info("sending jquery ajax request " + url);
            $.ajax({
                url: url,
	 	context: this,
	 	crossDomain: true,
                success: function(src) {
                    console.info("JQUERY to the rescue!");
                    var a = document.createElement("a");
                    var file = new Blob([src], {type: 'application/csv'});
                    a.href = URL.createObjectURL(file);
                    a.download = this.getCsvFileName(mainQ) + '.csv';
                    document.body.appendChild(a);
                    a.click();
                    setTimeout(function() {
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                    }, 0);
                }
             });*/

            this.exportToCsv(url, this.getCsvFileName(mainQ));
            
            //window.open(url);
            
        } else {
            this.setForceFitToMap(false);
            Ext.apply(Ext.getCmp('spwpexpcsvbtn'), {srch: 'expr'});
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
});

