Ext.define('SpWebPortal.store.FieldDefStore', {
    extend: 'Ext.data.Store',
    id: 'fldDefStore',

    autoLoad: true,

    model: 'SpWebPortal.model.FieldDefModel',
    proxy: {
	type: 'ajax',
	url: 'fldmodel.json'
    },

    listeners: {
	'beforeload': function(store, operation) {
	    console.info(store.getProxy().url);
	    store.getProxy().url = 'resources/config/fldmodel.json';
	}				       
    }    
});
