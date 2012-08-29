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
	    }
	});

	this.callParent(arguments);
    },

    config: {
	requireImages: false,
	requireGeoCoords: false,
	matchAll: false
    },

    onSpecialKey: function(field, e) {
	if (e.getKey() == e.ENTER) {
	    this.doSearch();
	}
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

    matchAllChange: function() {
	//console.info("match all change!");
	this.setMatchAll(!this.getMatchAll());
	console.info("MatchAll = " + this.getMatchAll());
    }
});

    
