//var solrURL = 'http://129.237.201.103';
//var solrURL = 'http://localhost';
//var solrPort = ':443';
//var solrPort = ':8983';
//var solrPageSize = 50;
//var solrUrlTemplate = solrURL + solrPort + '/solr/select?indent=on&version=2.2&fq=&rows=' + solrPageSize + '&fl=*%2Cscore&qt=&wt=json&explainOther=&hl.fl=&q=';

var settingsStore =  Ext.getStore('SettingsStore');
var settings = settingsStore.getAt(0);
var solrURL = settings.get('solrURL');
var solrPort = settings.get('solrPort');
var solrPageSize = settings.get('solrPageSize');
var maxPageSizeSetting = settings.get('maxSolrPageSize');
var solrCore = settings.get('solrCore');
var solrUrlTemplate = solrURL + ':' + solrPort + '/' + solrCore + '/select?indent=on&version=2.2&fq=&rows=' + solrPageSize + '&fl=*%2Cscore&qt=&wt=json&explainOther=&hl.fl=&q=';

Ext.define('SpWebPortal.store.MainSolrStore', {
    extend: 'Ext.data.Store',
    id: 'mainsolr',

    //requires: 'SpWebPortal.model.MainModel',

    pageSize: solrPageSize,
    config: {
	urlTemplate: solrUrlTemplate,
	geoCoordFlds: [], //due to mysterious initialization behavior, this
	                 //is not set until the MainGrid.js initComponent() is executed
	maxPageSize: typeof maxPageSizeSetting === "undefined" ? 5000 : maxPageSizeSetting,
	geoCoordVals: [] 
    },

    autoLoad: false,
    remoteSort: true,

    model: 'SpWebPortal.model.MainModel',

    proxy: {
	type: 'jsonp',
	callbackKey: 'json.wrf',
	url: solrUrlTemplate,
	reader: {
	    root: 'response.docs',
	    totalProperty: 'response.numFound'
	}
    },

    getLatLngFitFilter: function(lat, lng, sw, ne) {
	var result = lat + ':[' + sw.lat() + ' TO ' + ne.lat() + ']+AND+';
	if (sw.lng() > 0 && ne.lng() < 0) {
	    result += 'NOT ' + lng + ':[' + ne.lng() + ' TO ' + sw.lng() + ']';
	} else if (sw.lng() > 0 && ne.lng() > 0 && sw.lng() > ne.lng()) {
	    result += lng + ':[' + ne.lng() + ' TO ' + sw.lng() + ']';
	} else {
	    result +=  lng + ':[' + sw.lng() + ' TO ' + ne.lng() + ']';
	}
	return result;
    },

    getMapFitFilter: function() {
	var map = Ext.getCmp('spwpmainmappane').getMapCmp();
	var bnds = map.getBounds();
	var sw = bnds.getSouthWest();
	var ne = bnds.getNorthEast();

	var lat1Fld = this.getGeoCoordFlds()[0];
	var lng1Fld = this.getGeoCoordFlds()[1];
	var lat2Fld = this.getGeoCoordFlds().length > 2 ? this.getGeoCoordFlds()[2] : null;
	var lng2Fld = this.getGeoCoordFlds().length > 3 ? this.getGeoCoordFlds()[3] : null;

	var result = '';
	if (lat1Fld != null && lng1Fld != null) {
	    result += this.getLatLngFitFilter(lat1Fld, lng1Fld, sw, ne);
	}
	if (lat2Fld != null && lng2Fld != null) {
	    result += this.getLatLngFitFilter(lat2Fld, lng2Fld, sw, ne)
	}
	//console.info(result);
	return result;
    },

    changePageSize: function(newPageSize) {
	if (newPageSize > 0 && newPageSize <= this.getMaxPageSize() && newPageSize != this.pageSize) {
	    this.pageSize = newPageSize;
	    var newTemplate = solrURL + ':' + solrPort + '/' + solrCore + '/select?indent=on&version=2.2&fq=&rows=' + newPageSize + '&fl=*%2Cscore&qt=&wt=json&explainOther=&hl.fl=&q=';
	    this.proxy.url = this.proxy.url.replace(this.urlTemplate, newTemplate);
	    this.urlTemplate = newTemplate;
	    solrUrlTemplate = newTemplate;
	    if (this.getCount() > 0) {
		this.loadPage(1);
	    }
	    return true;
	}
	return false;
    },
	
    getImageRequirementFilter: function() {
	return 'img:[\\"\\" TO ^]';
    },

    getGeoCoordRequirementFilter: function() {
	var result = '';
	var gFlds = this.getGeoCoordFlds();
	for (var f = 0; f < gFlds.length; f++) {
	    if (f > 0) {
		result += '+AND+';
	    }
	    result += gFlds[f] + ':[\\"\\" TO ^]';
	}
	return result;
    },

    listeners: {
	'beforeload': function(store, operation) {
	    //alert('beforeload: ' + store.getProxy().url);
	    if (store.sorters.getCount() > 0) {
		var url = store.getProxy().url;
		var sortIdx = url.lastIndexOf('&sort=');
		if (sortIdx != -1) {
		    url = url.substring(0, sortIdx);
		}
		var sortStr = '';
		for (var s = 0; s < store.sorters.getCount(); s++) {
		    var sorter = store.sorters.getAt(s);
		    if (s > 0) sortStr += ',';
		    sortStr += sorter.property + '+' + sorter.direction.toLowerCase();
		}
		if (sortStr != '') {
		    sortStr = 'sort=' + sortStr;
		    store.getProxy().url = url + '&' + sortStr;
		}
	    }
	}
    }
});
