Ext.define('SpWebPortal.store.SettingsStore', {
    extend: 'Ext.data.Store',
    id: 'settingStore',

    autoLoad: true,

    model: 'SpWebPortal.model.SettingsModel',
    proxy: {
	type: 'ajax',
	url: 'settings.json'
    },

    listeners: {
	'beforeload': function(store, operation) {
	    console.info(store.getProxy().url);
	    store.getProxy().url = 'resources/config/settings.json';
	}				       
    }    
    
});
