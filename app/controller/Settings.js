Ext.define('SpWebPortal.controller.Settings', {
    extend: 'Ext.app.Controller',
    xtype: 'settingscontroller',
    
    //localizable text...
    settingsFormTitle: 'Settings',
invalidPageSizeErrMsg: 'Invalid page size: {0}. Pagesize must be a number between 1 and {1}',
    //..localizable text

    requires: [
	'SpWebPortal.view.SettingsView'
    ],

    init: function() {
	this.control({
	    'button[itemid="spwpsettingsbtn"]' : {
		click: this.onSettingsBtnClick
	    },
	    'button': {
		savesettings: this.onSaveSettings
	    }
	});
	
	this.callParent(arguments);
    },

    isValidPageSize: function(pageSize, maxPageSize) {
	return 0 < pageSize && pageSize <= maxPageSize;
    },

    onSaveSettings: function(form) {
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
   },

    onSettingsBtnClick: function() {
	console.info("Settings.onSettingsBtnClick");
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
    }
});
