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
        var srchTerm = (typeof control[0].value === "undefined" || control[0].value == null || control[0].value == '' || control[0].value == '*') 
	        ? '' 
	        : control[0].value;
        var mainQ;
        var terms = this.getSubTerms(srchTerm);
        for (var t = 0; t < terms.length; t++) {
            terms[t] = this.escapeForSolr(terms[t], true, '"');
        }
        if (srchTerm == '' || terms.length == 0) {
            mainQ = '*';
        } else {
            mainQ = this.getMatchAll() ? "" : "contents:";
            var prefix = this.getMatchAll() ? "+contents:" : "";
            for (t = 0; t < terms.length; t++) {
                if (t > 0) {
                    mainQ += " ";
                }
                mainQ += prefix + terms[t]; 
            }   
        }
            
	var filterToMap = (this.getForceFitToMap() || this.getFitToMap()) && (this.mapViewIsActive() || this.getWriteToCsv());
        var dummy_geocoords;

        //if not JSON queries
        //var url = solr.getSearchUrl(images, maps, mainQ, filterToMap, this.getMatchAll(), dummy_geocoords, this.getWriteToCsv());
        //
        
        this.adjustFitToMapStuff();
        Ext.apply(Ext.getCmp('spwpexpcsvbtn'), {srch: 'expr'});
        var srchObj = solr.getSearchSpecs4J(images, maps, mainQ, filterToMap, this.getMatchAll(), dummy_geocoords, this.getWriteToCsv());
        
        if (this.getWriteToCsv()) {
            //if not JSON
            //this.exportToCsv(url, this.getCsvFileName(mainQ));
            //else
            this.exportToCsv(srchObj.url, this.getCsvFileName(srchTerm), srchObj.query);
            //
        } else {
            //if not JSON queries
            //solr.getProxy().url = url;
            //else
            solr.getProxy().url = srchObj.url;
            solr.getProxy().qparams =  {query: srchObj.query};
            //
            solr.setSearched(true);
	    solr.loadPage(1);
	    this.searchLaunched();
        }
    }
});

