Ext.define('SpWebPortal.SpecStore', {
    extend: 'Ext.data.Store',
    pageSize: 50,
    proxy: {
	type: 'ajax',
	url: '',
	model: 'SpWebPortal.SpecRec',
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
		    store.getProxy().url = specStoreBaseUrl + store.getTree().getTreeType() + '.' 
			+ node.raw.nodeid + '.json' + '.' + store.currentPage;
		}
	    }
	}
    },    
    config: {
	tree: null
    }
});
