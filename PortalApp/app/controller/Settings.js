/* Copyright (C) 2018, University of Kansas Center for Research
 * 
 * Specify Software Project, specify@ku.edu, Biodiversity Institute,
 * 1345 Jayhawk Boulevard, Lawrence, Kansas, 66045, USA
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
Ext.define('SpWebPortal.controller.Settings', {
    extend: 'Ext.app.Controller',
    xtype: 'settingscontroller',
    
    //localizable text...
    settingsFormTitle: 'Settings',
    invalidPageSizeErrMsg: 'Invalid page size: {0}. Pagesize must be a number between 1 and {1}',
    collSearching: 'Searching',
    collAll: 'all collections',
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
            //searched collections settings
            'button[itemid="spwpcollectionsbtn"]' : {
                click: this.collectionSelect
            },
            'window[itemid="spwpcollpop"]' : {
                beforedestroy: this.collectionSelectClose
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

    collectionSelect: function() {
        var settings = Ext.getStore('SettingsStore').getAt(0);
        var colls = settings.get("collections");
        var solrStore = Ext.getStore('MainSolrStore');
        if (!solrStore.collItems) {
            solrStore.collItems = [];
            for (var i = 0; i < _.size(colls); i++) {
                solrStore.collItems.push({boxLabel: colls[i]['collname'], name: colls[i]['code'], inputValue: i+1, checked: true});
            }
        };
        var panel = Ext.create('Ext.form.Panel', {
            width: 250,
            height: 180,
            bodyPadding: 10,
            items:[{
                xtype: 'checkboxgroup',
                itemid: 'spwpcollgroup',
                columns: 1,
                vertical: true,
                items: solrStore.collItems
            }]
        });        
	this.popupWin =  Ext.create('Ext.window.Window', {
	    title: 'Collections',
	    height: 260,
	    width: 280,
	    maximizable: false,
	    resizable: true,
            itemid: 'spwpcollpop',
	    closeAction: 'destroy',
	    layout: 'fit',
	    items: [
		panel
	    ]
	});
	this.popupWin.setPosition(1,1);
	this.popupWin.show();
	this.popupWin.toFront();
    },

    collectionSelectClose: function(collPanel) {
        var collGroup = collPanel.down('checkboxgroup');
        var tipSeparator = ' ';
        var tipText = this.collSearching;
        if (collGroup) {
            var collItemSets = collGroup.items.items;
            var all = true;
            var none = true;
            var solrStore = Ext.getStore('MainSolrStore');
            for (var i = 0; i < collItemSets.length; i++) {
                solrStore.collItems[i].checked = collItemSets[i].checked;
                if (solrStore.collItems[i].checked) {
                    tipText += tipSeparator + solrStore.collItems[i].boxLabel;
                    tipSeparator = ', ';
                    none = false;
                } else {
                    all = false;
                }
            }
            if (all || none) {
                tipText = this.collSearching + ' ' + this.collAll;
                if (none) {
                    for (i = 0; i < solrStore.collItems.length; i++) {
                        solrStore.collItems[i].checked = true;
                    }
                }
            }
            Ext.getCmp('spwpcollectionsbtnid').setTooltip(tipText);
        } else {
            console.log("Collection search UI was null. Settings were not applied.");
        }
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
		}
	    } else {
		//the settings form should never let us get here, but
		msg = Ext.String.format(this.invalidPageSizeErrMsg, pageSize, store.getMaxPageSize());
		alert(msg);
		return false;
	    }
            return true;
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
