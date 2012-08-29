Ext.Loader.setConfig({enabled:true});
Ext.application({
    name: 'SpWebPortal', 
    appFolder: 'app',   

    autoCreateViewport: true,

    models: ['FieldDefModel','AttachedImageModel'],
    stores: ['SettingsStore', 'FieldDefStore', 'NumericOps', 'DateOps', 'StringOps', 'Sorts'],
    controllers: ['ExpressSearch', 'AdvancedSearch', 'Mapper', 'Detailer',
		 'Image', 'Settings'],

    
    init: function () {
	Ext.getBody().setHTML("");

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
	    //This should be 'id' instead of 'cn' but 'id' won't work in Extjs
	    //Need to change solr build to use spid or some other fldname
	    //Then Detailer.js.onThumbnailDblClick needs to be adjusted to stop using 'cn' lookup
	    idProperty: 'cn',
	    fields: dataFlds
	});


	var settingsStore =  Ext.getStore('SettingsStore');
	var settings = settingsStore.getAt(0);
	var solrURL = settings.get('solrURL');
	var solrPort = settings.get('solrPort');
	var solrPageSize = settings.get('solrPageSize');
	var solrCore = settings.get('solrCore');
	var solrUrlTemplate = solrURL + solrPort + '/' + solrCore + '/select?indent=on&version=2.2&fq=&rows=' + solrPageSize + '&fl=*%2Cscore&qt=&wt=json&explainOther=&hl.fl=&q=';

    }
});
