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
    unableToDownloadPrefix: 'Unable to download: ',
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

    escapeChars: function(text, toEscape, escapeWith) {
        var result = text;
        for (var i = 0; i < toEscape.length; i++) {
            result = result.split(toEscape[i]).join(escapeWith + toEscape[i]);
        }
        return result;
    },

    escapeSolrSpecialChars: function(text, isForFullText) {
        //According to http://lucene.apache.org/core/2_9_4/queryparsersyntax.html#Escaping%20Special%20Characters
        //+ - && || ! ( ) { } [ ] ^ " ~ * ? : \
        //need to be escaped with \
        if (isForFullText) {
            //remove * to allow wildcards
            return this.escapeChars(text, '+ - && || ! ( ) { } [ ] ^ " ~ ?'.split(' '), '\\');
        } else {
            return this.escapeChars(text, '+ - && || ! ( ) { } [ ] ^ " ~ * ?'.split(' '), '\\');
        }
    },
    
    escapeForSolr: function(srchText, isFullText, quoter) {
	//assuming srchText is defined and non-null
        //fulltext seems case-insensitive, and advanced search which is not incorrectly flagged FullText, is case-sensitive,
        //so not changing case, for now...
        //var result = isFullText ? srchText.toLowerCase() : srchText;
        
        if (srchText[0] == quoter && srchText[srchText.length-1] == quoter)
            return quoter + this.escapeSolrSpecialChars(srchText.slice(1, srchText.length-1), isFullText) + quoter;
        else 
	    return this.escapeSolrSpecialChars(srchText, isFullText);
    },

    getSrchTerm: function(control) {
        return (typeof control[0].value === "undefined" || control[0].value == null || control[0].value == '' || control[0].value == '*') 
	    ? '' 
	    : control[0].value;
    },

    getSrchQuery: function(srchTerm, matchAll, fldName) {
        var result;
        var terms = this.getSubTerms(srchTerm);
        for (var t = 0; t < terms.length; t++) {
            terms[t] = this.escapeForSolr(terms[t], true, '"');
        }
        if (srchTerm == '' || terms.length == 0) {
            result = '*';
        } else {
            result = matchAll ? "" : fldName + ":";
            var prefix = matchAll ? "+" + fldName + ":" : "";
            for (t = 0; t < terms.length; t++) {
                if (t > 0) {
                    result += " ";
                }
                result += prefix + terms[t]; 
            }   
        }
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

    getSubTerms: function(term, discardGroupers, ignoreGroupers) {
        var pre = term.split(" ");
        var post = [];
        var i = 0;
        var groupers = ignoreGroupers ? "" : "'" + '"';
        while (i < pre.length) {
            var subterm = pre[i++];
            var grouper = subterm.substr(0,1);
            if ((groupers).indexOf(grouper) >= 0) {
                var finalTerm = '';
                while(i < pre.length) {
                    subterm += ' ' + pre[i++];
                    if (subterm.endsWith(grouper)) {
                        if (grouper == "'") {
                            subterm = '"' + subterm.slice(1, subterm.length-1) + '"';
                        }
                        if (discardGroupers && subterm.endsWith('"')) {
                            subterm = subterm.slice(1, subterm.length-1);
                        }
                        break;
                    }
                }
            }
            post.push(subterm);
        }
        return post;
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
    
    exportToCsv: function(url, fileName, qparam) {
        if (this.doDownload()) {
            Ext.getCmp('spwpexpcsvbtn').setDisabled(true);
            Ext.getCmp('spwpexpcsvstatustext').setText(this.downloading + fileName + '...');
            Ext.getCmp('spwpexpcsvstatustext').setVisible(true);
            $.ajax({
                url: url,
	        context: this,
	        crossDomain: true,
                type: 'POST',
                data: "json=" + Ext.encode({query: qparam}),
                dataType: 'text',
                success: function(data) {
                    var a = document.createElement("a");
                    var bom = '\uFEFF';
                    var file = new Blob([bom + data], {type: 'application/csv'});
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
                },
                error: function(jqXHR, status, error) {
                    alert(this.unableToDownloadPrefix + " " + status + "\n" + error);
                },
                complete: function() {
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

    
