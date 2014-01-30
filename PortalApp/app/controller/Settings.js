Ext.define('SpWebPortal.controller.Settings', {
    extend: 'Ext.app.Controller',
    xtype: 'settingscontroller',
    
    //localizable text...
    settingsFormTitle: 'Settings',
    invalidPageSizeErrMsg: 'Invalid page size: {0}. Pagesize must be a number between 1 and {1}',
    //..localizable text

    requires: [
	'SpWebPortal.view.SettingsView', 'SpWebPortal.store.SettingsStore', 'SpWebPortal.store.FieldDefStore'
    ],

    init: function() {
	this.control({
	    'button[itemid="spwpsettingsbtn"]' : {
		click: this.onSettingsBtnClick
	    },
	    'button': {
		savesettingsform: this.onSaveSettingsForm
	    },
	    '#spwp-webportal-viewport': {
		initsettings: this.onInitSettings
	    },
	    //main grid configs
	    '#spwpmaingrid': {
		columnhide: this.onMainGridReconfig,
		columnmove: this.onMainGridReconfig,
		columnshow: this.onMainGridReconfig,
		columnresize: this.onMainGridReconfig
	    },
	    '#spwpmainmappane': {
		maptypechanged: this.onMapTypeChanged
	    }
	});
	
	this.callParent(arguments);
    },

    isValidPageSize: function(pageSize, maxPageSize) {
	return 0 < pageSize && pageSize <= maxPageSize;
    },

    onSaveSettingsForm: function(form) {
	//console.info("Settings.onSaveSettings");
	if (form.isValid()) {
	    var flds = form.getFields();
	    //can't look up by field name!?
	    //var pageSize = flds.get('solrPageSize').getValue();
	    var pageSize = -1;
	    for (var f = 0; f < flds.length; f++) {
		if (flds.getAt(f).getName() == 'solrPageSize') {
		    pageSize = flds.getAt(f).getValue();
		    break;
		}
	    }
	    var store = Ext.getStore('MainSolrStore');
	    if (this.isValidPageSize(pageSize, store.getMaxPageSize())) {
		console.info('Settings.onSaveSettings: solrPageSize: ' + pageSize);
		if (store.changePageSize(pageSize)) {
		    Ext.getStore('SettingsStore').getAt(0).set('solrPageSize', pageSize);
		    Ext.state.Manager.set('solrPageSize', pageSize);
		    return true;
		} else {
		    return false;
		}
	    } else {
		//the settings form should never let us get here, but
		msg = Ext.String.format(this.invalidPageSizeErrMsg, pageSize, store.getMaxPageSize());
		alert(msg);
		return false;
	    }
	}
	return false;
   },

    onSettingsBtnClick: function() {
	//console.info("Settings.onSettingsBtnClick");
	this.popupSettings();
    },

    popupSettings: function() {
	var form = Ext.widget('spwpsettings');
	var popupWin =  Ext.create('Ext.window.Window', {
	    title: this.settingsFormTitle,
	    height: 250,
	    width: 400,
	    maximizable: false,
	    resizable: true,
	    closeAction: 'destroy',
	    layout: 'fit',
	    items: [
		form
	    ]
	});
	popupWin.setPosition(1,1);

	form.loadRecord(Ext.getStore('SettingsStore').getAt(0));
	popupWin.show();
	popupWin.toFront();
    },

    onInitSettings: function() {
	//console.info("Settings.onInitSettings");
	var settingsStore =  Ext.getStore('SettingsStore');
	var settings = settingsStore.getAt(0);
	var solrURL = settings.get('solrURL');
	var solrPort = settings.get('solrPort');
	var solrPageSize = settings.get('solrPageSize');

	var localPageSize = Ext.state.Manager.get('solrPageSize', solrPageSize);
	if (localPageSize != solrPageSize) {
	    settings.set('solrPageSize', localPageSize);
	    var solrstore = Ext.getStore('MainSolrStore');
	    solrstore.changePageSize(localPageSize);
	}

	this.loadGridConfig('spwpmaingridconfig');

	var mapType = settings.get('defMapType');
	var localMapType = Ext.state.Manager.get('defMapType', mapType);
	if (localMapType != mapType) {
	    settings.set('defMapType', localMapType);
	}

	var solrCore = settings.get('solrCore');
	var solrUrlTemplate = solrURL + solrPort + '/' + solrCore + '/select?indent=on&version=2.2&fq=&rows=' + solrPageSize + '&fl=*%2Cscore&qt=&wt=json&explainOther=&hl.fl=&q=';
    },

    onMapTypeChanged: function(maptype) {
	var settingsStore =  Ext.getStore('SettingsStore');
	var settings = settingsStore.getAt(0);
	settings.set('defMapType',maptype);
	Ext.state.Manager.set('defMapType', maptype);
    },

    loadGridConfig: function(id) {
	var gridConfig = Ext.state.Manager.get(id, null);
	//console.info("loading grid config:");
	//console.info(gridConfig);
	if (gridConfig != null) {
	    this.configGrid(gridConfig);
	}
    },

    configGrid: function(gridConfig) {
	var fieldStore = Ext.getStore('FieldDefStore');
	var dataIdx = Ext.Array.pluck(gridConfig, 'dataIndex');
	for (var c = 1; c < fieldStore.count(); c++) {
	    var fld = fieldStore.getAt(c);
	    var idx = dataIdx.indexOf(fld.get('solrname'));
	    if (idx != -1) {
		var gc = gridConfig[idx];
		fld.set('displaycolidx', gc.index);
		fld.set('displaywidth', gc.width);
		fld.set('hiddenbydefault', gc.hidden);
		//console.info(fld);
	    }
	}		 
    },

    onMainGridReconfig: function(headers, column) {
	//console.info("Settings.onMainGridReconfig");
	//console.info(headers, column);
	var cols = headers.getGridColumns();
	var colSets = [];
	for (var h = 0; h < cols.length; h++) {
	    var colSet = {};
	    Ext.apply(colSet, {
		index: cols[h].getIndex(),
		dataIndex: cols[h].dataIndex,
		width: cols[h].getWidth(),
		hidden: !cols[h].isVisible()
	    });
	    colSets.push(colSet);
	}
	Ext.state.Manager.set('spwpmaingridconfig', colSets);
    }
	    
});
