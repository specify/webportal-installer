/* Copyright (C) 2020, Specify Collections Consortium
 * 
 * Specify Collections Consortium, Biodiversity Institute, University of Kansas,
 * 1345 Jayhawk Boulevard, Lawrence, Kansas, 66045, USA, support@specifysoftware.org
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
