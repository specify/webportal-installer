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
	var result = isFullText ? srchText.toLowerCase() : srchText;
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
                }
            });
        } else {
            window.open(url);
        }
    }
});

    
