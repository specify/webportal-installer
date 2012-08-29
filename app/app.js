Ext.Loader.setConfig({enabled:true});
Ext.application({
    name: 'SpWebPortal', 
    appFolder: 'app',   

    autoCreateViewport: true,

    models: ['FieldDefModel','AttachedImageModel'],
    stores: ['SettingsStore', 'FieldDefStore', 'NumericOps', 'DateOps', 'StringOps', 'Sorts'],
    controllers: ['ExpressSearch', 'AdvancedSearch', 'Mapper', 'Detailer',
		 'Image', 'Settings'],
    /*requires: [
	'Ext.ux.DataView.DragSelector',
	'Ext.ux.DataView.LabelEditor'
    ],*/

    /*isGeoCoordFld: function(flddef) {
	var fld = flddef.get('spfld').toLowerCase();
	return fld == 'latitude1' || fld == 'latitude2' 
	    || fld == 'lat1text' || fld == 'lat2text'
	    || fld == 'longitude1' || fld == 'longitude2' 
	    || fld == 'long1text'  || fld == 'long2text';
    },*/

    
    init: function () {
	Ext.getBody().setHTML("");

	//load the field definition store synchronously
	//(It seems that extjs-4.1.1 autoloads synchronously so
	//this is no longer necessary but may be in the future...

//	Ext.apply(Ext.data.Connection.prototype, {
//	    async: false
//	});
//	Ext.getStore('FieldDefStore').load();
//	Ext.apply(Ext.data.Connection.prototype, {
//	    async: true
//	});

	//set up the fields for the main model
	var fieldStore = Ext.getStore('FieldDefStore');
	//var fieldStore = Ext.create('SpWebPortal.store.FieldDefStore'), {
	//    storeId: 'FieldDefStore'
	//});

	var geoCoordFlds = [];
	var dataFlds = new Array(fieldStore.count());
	for (var f = 0; f < fieldStore.count(); f++) {
	    var fldDef = fieldStore.getAt(f);
	    var newFld = Ext.create('Ext.data.Field', {
		name: fldDef.get('solrname'),
		type: fldDef.get('solrtype')
	    });
	    dataFlds[f] = newFld;
	    //if (this.isGeoCoordFld(fldDef)) {
	//	geoCoordFlds[geoCoordFlds.length] = fldDef.get('solrname');
	  //  }
	}
	//var mModel = this.getModel('MainModel');
	//this.getModel('MainModel').fields = dataFlds;	
	Ext.define('SpWebPortal.model.MainModel', {
	    extend: 'Ext.data.Model',
	    //This should be 'id' instead of 'cn' but 'id' won't work in Extjs
	    //Need to change solr build to use spid or some other fldname
	    //Then Detailer.js.onThumbnailDblClick needs to be adjusted to stop using 'cn' lookup
	    idProperty: 'cn',
	    fields: dataFlds
	});
	/*Ext.apply(Ext.ModelManager.getModel('MainModel'), {
	    proxy: {
		type: 'jsonp',
		callbackKey: 'json.wrf',
		url: Ext.getStore('MainSolrStore').getUrlTemplate(),
		reader: {
		    root: 'response.docs',
		    totalProperty: 'response.numFound'
		}
	    }
	});*/	
	//var mStore = Ext.getStore('MainSolrStore');
	//Ext.getStore('MainSolrStore').model = Ext.ModelManager.getModel('MainModel');

	/*Ext.apply(Ext.getStore('MainSolrStore'), {
	    model: 'SpWebPortal.model.MainModel',
	    proxy: {
		type: 'jsonp',
		callbackKey: 'json.wrf',
		url: Ext.getStore('MainSolrStore').getUrlTemplate(),
		reader: {
		    root: 'response.docs',
		    totalProperty: 'response.numFound'
		}
	    }
	});*/

	var settingsStore =  Ext.getStore('SettingsStore');
	var settings = settingsStore.getAt(0);
	var solrURL = settings.get('solrURL');
	var solrPort = settings.get('solrPort');
	var solrPageSize = settings.get('solrPageSize');
	var solrCore = settings.get('solrCore');
	var solrUrlTemplate = solrURL + solrPort + '/' + solrCore + '/select?indent=on&version=2.2&fq=&rows=' + solrPageSize + '&fl=*%2Cscore&qt=&wt=json&explainOther=&hl.fl=&q=';

	/*Ext.create('SpWebPortal.store.MainSolrStore', {
	    pageSize: solrPageSize,
	    storeId: 'idmainsolrstore',
	    geoCoordFlds: geoCoordFlds,
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
	    autoLoad: false
	});*/
	//Ext.define('SpWebPortal.store.MainSolrStore', {
//	    model: 'SpWebPortal.model.MainModel',
	//    storeId: 'idmainsolrstore'
//	});	
	//console.info(Ext.getStore('idmainsolrstore').model.fields);
	//Ext.data.StoreManager.replace('MainSolrStore', newStore);
	//console.log(SpWebPortal.getDescription());
    }
});
