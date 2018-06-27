/* Copyright (C) 2018, University of Kansas Center for Research
 * 
 * Specify Software Project, specify@ku.edu, Biodiversity Institute,
 * 1345 Jayhawk Boulevard, Lawrence, Kansas, 66045, USA
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
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

        Ext.onReady(this.runInitialSearch(this));
    },

    runInitialSearch: function(myself) {
        return function() {
            var filterParam = myself.getParams('filter');
            if (filterParam) {
                myself.searchFor(filterParam, false, false, false);
            }
        };
    },

    getParams: function(param) {
        var vars = {};
	window.location.href.replace( location.hash, '' ).replace(
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;
	}
	return vars;
    },

    onMapSearchClick: function() {
	if (!Ext.getCmp('spwpmainadvsrch').getCollapsed()) {
	    this.setForceFitToMap(true);
	    this.doSearch();
	    this.setForceFitToMap(false);
	}
    },

    searchFor: function(filterStr, images, maps, filterToMap) {
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
		    this.searchLaunched();
                }
	    }
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
	var filterToMap = (this.getForceFitToMap() || this.getFitToMap()) && (this.mapViewIsActive() || this.getWriteToCsv());
	if (filterStr.length == 0) {
	    filterStr = "*";
	}
        this.searchFor(filterStr, images, maps, filterToMap);
    }
});
