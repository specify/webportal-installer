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
var mysqlURL = 'localhost';
var urlStrTemplateInit = 'mysqliTree.php';
var mysqlPageSize = 50;


Ext.define('TreeSpec', {
    extend: 'Ext.data.Store',
    pageSize: mysqlPageSize,
    remoteSort: true,
    model: 'SpWebPortal.model.SpecRec',
    proxy: {
	type: 'ajax',
	url: urlStrTemplateInit,
	reader: {
	    type: 'json',
	    root: 'response.docs',
	    totalProperty: 'response.numFound'
	}
    },
    listeners: {
	'beforeload': function(store, operation) {
	    //alert('beforeload: ' + store.getProxy().url);
	    if (store.getTree() != null) {
		var selected = store.getTree().getView().getSelectionModel().selected;
		if (selected.length > 0) {
		    var node = selected.getAt(0);
		    var idFld = node.raw.iconCls.split('-')[1] + 'id';
		    var whereJson = '[{"property":"' + idFld + '",'
			+ '"operator":"=", "params":' + node.raw.nodeid + '}]'; 
		    store.getProxy().url = urlStrTemplateInit + '?WHERE=' +  whereJson;
		}
	    }
	}
    },    
    config: {
	tree: null
    }
});
