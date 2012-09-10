Ext.define('SpWebPortal.controller.Search', {
    extend: 'Ext.app.Controller',
    
    init: function() {
	console.info("Search.init");
	this.control({
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

    config: {
	requireImages: false,
	requireGeoCoords: false,
	matchAll: false,
	fitToMap: false,
	forceFitToMap: false
    },

    onSpecialKey: function(field, e) {
	if (e.getKey() == e.ENTER) {
	    this.doSearch();
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
	console.info("MatchAll = " + this.getMatchAll());
    }
});

    
