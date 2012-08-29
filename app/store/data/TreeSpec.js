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
