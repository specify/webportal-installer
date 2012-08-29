//var solrURL = 'http://129.237.201.103';
var solrURL = 'http://localhost';
//var solrPort = ':443';
var solrPort = ':8983';
var solrPageSize = 50;
var solrUrlTemplate = solrURL + solrPort + '/solr/select?indent=on&version=2.2&fq=&rows=' + solrPageSize + '&fl=*%2Cscore&qt=&wt=json&explainOther=&hl.fl=&q=';

Ext.define('SpWebPortal.store.SolrStore', {
    extend: 'Ext.data.Store',

    requires: 'SpWebPortal.model.SolrModel',
    pageSize: solrPageSize,
    configs: {
	urlTemplate: solrUrlTemplate
    },

    remoteSort: true,

    model: 'SpWebPortal.model.SolrModel',

    proxy: {
	type: 'jsonp',
	callbackKey: 'json.wrf',
	 url: solrUrlTemplate,
	reader: {
	    root: 'response.docs',
	    totalProperty: 'response.numFound'
	}
    },

    getImageRequirementFilter: function() {
	return 'im:["" TO ^]'; //this actually doesn't work? 
    }


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
		store.sorters.clear();
	    }
	}
    }
});
