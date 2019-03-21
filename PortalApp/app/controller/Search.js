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
Ext.define('SpWebPortal.controller.Search', {
    extend: 'Ext.app.Controller',
    
    config: {
	requireImages: false,
	requireGeoCoords: false,
	matchAll: false,
	fitToMap: false,
	forceFitToMap: false,
        writeToCsv: false,
        expOK: false
    },

    //localizable text...
    downloading: 'Downloading',
    //...localizable text
    
    init: function() {
	//console.info("Search.init");

        var settings = Ext.getStore('SettingsStore').getAt(0);
        var expOKSet = settings.get("allowExportToFile");
        if (typeof expOKSet === "undefined" || expOKSet != 0) {
            this.setExpOK(true);
        } else {
            this.setExpOK(false);
        }
        
	this.control({
	    'button[itemid="spwpexpcsvbtn"]' : {
		click: this.forCsv
	    },
	    'checkbox[itemid="req-img-ctl"]': {
		change: this.reqImgChange
	    },
	    'checkbox[itemid="req-geo-ctl"]': {
		change: this.reqGeoChange
	    },
	    'checkbox[itemid="fit-to-map"]': {
		change: this.fitToMapChange
	    }
	});

	this.callParent(arguments);
    },


    onSpecialKey: function(field, e) {
	if (e.getKey() == e.ENTER) {
            console.info("doSearch()?");
	    this.doSearch();
	}
    },

    adjustFitToMapStuff: function() {
        if (!this.mapViewIsActive()) {
	    var fitToMapCtl = Ext.getCmp('spwp-fit-to-map-chkbx');
	    if (fitToMapCtl != null && fitToMapCtl.getValue()) {
	        fitToMapCtl.setValue(false);
	    }
        }
        this.setForceFitToMap(false);
    },
    
    forCsv: function (cmp) {
        //export btn should only be visible when exports are allowed but just in case
        if (this.getExpOK()) {
            //One thing: If a user enters a search term, then clicks export-to-csv
            //w/o first searching, then the export will be different than the contents of the records tab.
            //kinda weird, but does it matter?
            this.setWriteToCsv(true);
            var mainStore = Ext.getStore('MainSolrStore');
            if (mainStore && mainStore.getFilterToMap()) {
                this.setForceFitToMap(true);
            }
            this.doSearch(cmp.srch);
            this.setWriteToCsv(false);
            if (mainStore && mainStore.getFilterToMap()) {
                this.setForceFitToMap(false);
            }
        }
    },
    
    mapViewIsActive: function() {
	return Ext.getCmp('spwpmainmappane').isVisible();
    },

    getViewAlias: function() {
	return "override me";
    },

    reqImgChange: function() {
	this.setRequireImages(!this.getRequireImages());
    },

    reqGeoChange: function() {
	this.setRequireGeoCoords(!this.getRequireGeoCoords());
    },

    fitToMapChange: function() {
	this.setFitToMap(!this.getFitToMap());
    },

    matchAllChange: function() {
	//console.info("match all change!");
	this.setMatchAll(!this.getMatchAll());
	//console.info("MatchAll = " + this.getMatchAll());
    },

    escapeForSolr: function(srchText, isFullText) {
	//assuming srchText is defined and non-null
        //fulltext seems case-insensitive, and advanced search which is not incorrectly flagged FullText, is case-sensitive,
        //so not changing case, for now...
        //var result = isFullText ? srchText.toLowerCase() : srchText;
        var result = srchText;
        result = result.replace('&', '%26');
	//etc...
	return result;
    },

    searchLaunched: function() {
	var resultsTab = Ext.getCmp('spwpmaintabpanel');
	if (!resultsTab.isVisible()) {
	    var background = Ext.getCmp('spwpmainbackground');
	    background.setVisible(false);
	    resultsTab.setVisible(true);
	}
	resultsTab.fireEvent('dosearch');
    },

    getCsvFileName: function(srchTrm) {
        if (srchTrm == '*') {
            return 'SpSearch';
        } else {
            return srchTrm.substring(0,12).replace(/\(|\)|\#|\@|\$|\%|\&|\+|\-|\=|\"|\'|\?|\<|\>|\.|\,|\:|\;|\*|\!|\/|\||\]|\[|\\n|\\t|\}|\{/g,'_');
        }
    },

    isIE: function() {
        var sAgent = window.navigator.userAgent;
        var Idx = sAgent.indexOf("MSIE");

        if (Idx >= 0) {
            return true;
        } else if (!!sAgent.match(/Trident\/7\./)) {
            return true;
        } else {
            return false;
        }   
    },

    doDownload: function() {
        if (this.isIE()) {
            return navigator.msSaveOrOpenBlob ? true : false;
        } else {
            return true;
        }
    },
    
    exportToCsv: function(url, fileName) {
        if (this.doDownload()) {
            Ext.getCmp('spwpexpcsvbtn').setDisabled(true);
            Ext.getCmp('spwpexpcsvstatustext').setText(this.downloading + fileName + '...');
            Ext.getCmp('spwpexpcsvstatustext').setVisible(true);
            $.ajax({
                url: url,
	        context: this,
	        crossDomain: true,
                success: function(src) {
                    var a = document.createElement("a");
                    var bom = '\uFEFF';
                    var file = new Blob([bom + src], {type: 'application/csv'});
                    if (navigator.msSaveOrOpenBlob) {
                        navigator.msSaveOrOpenBlob(file, fileName + '.csv');
                    } else {
                        a.href = URL.createObjectURL(file);
                        a.download = fileName + '.csv';
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(function() {
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                        }, 0);
                    }
                    Ext.getCmp('spwpexpcsvbtn').setDisabled(false);
                    Ext.getCmp('spwpexpcsvstatustext').setVisible(false);
                    Ext.getCmp('spwpexpcsvstatustext').setText(this.downloading);
                }
            });
        } else {
            window.open(url);
        }
    }
});

    
