Ext.Loader.setConfig({enabled:true});
//Ext.tip.QuickTipManager.init();
Ext.application({
    name: 'SpWebPortal', 
    appFolder: 'app',   
    id: 'spwp-webportal-app-obj',
    autoCreateViewport: true,

    models: ['FieldDefModel','AttachedImageModel'],
    stores: ['SettingsStore', 'FieldDefStore', 'NumericOps', 'DateOps', 'StringOps', 'Sorts'],
    controllers: ['Mapper', 'ExpressSearch', 'AdvancedSearch', 'Detailer',
		 'Image', 'Settings'],

    
    init: function () {
	Ext.getBody().setHTML("");

	Ext.state.Manager.setProvider(new Ext.state.LocalStorageProvider({
	    prefix: Ext.getStore('SettingsStore').getAt(0).get('portalInstance')}));

	//load the field definition store synchronously
	//(It seems that extjs-4.1.1 autoloads synchronously so
	//this is no longer necessary but may be in the future...
	//See earlier revisions of this file for store set up code that
	//might be necessary if app initialization changes in future extjs releases.


	//set up the fields for the main model
	var fieldStore = Ext.getStore('FieldDefStore');

	var dataFlds = new Array(fieldStore.count());
	for (var f = 0; f < fieldStore.count(); f++) {
	    var fldDef = fieldStore.getAt(f);
	    var newFld = Ext.create('Ext.data.Field', {
		name: fldDef.get('solrname'),
		type: fldDef.get('solrtype')
	    });
	    dataFlds[f] = newFld;
	}

	Ext.define('SpWebPortal.model.MainModel', {
	    extend: 'Ext.data.Model',
	    idProperty: 'spid',
	    fields: dataFlds
	});

    }
});
