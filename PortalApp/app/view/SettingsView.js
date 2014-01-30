Ext.define('SpWebPortal.view.SettingsView', {
    extend: 'Ext.form.Panel',
    xtype: 'spwpsettingsview',
    alias: 'widget.spwpsettings',

    autoScroll: true,

    //localizable text...
    saveSettingsBtn: 'Save',
    //..localizable text

    isReadOnly: function(field) {
	return field.name != 'solrPageSize'
	    && field.name != 'defInitialView'
	    && field.name != 'defMapType';
    },

	
    isViewable: function(field) {
	return field.name != 'id';
    },

    initComponent: function() {
	var setsStore = Ext.getStore('SettingsStore');
	var settings = setsStore.getAt(0);
	var sets = setsStore.model.getFields();
	var flds = [];
	for (var f = 0; f < sets.length; f++) {
	    var set = sets[f];
	    if (this.isViewable(set)) {
		flds[flds.length] = Ext.create('Ext.form.field.Text', {
		    fieldLabel: set.name,
		    name: set.name,
		    lableAlign: 'right',
		    anchor: '100%',
		    type: set.type,
		    allowBlank: false,
		    readOnly: this.isReadOnly(set),
		    disabled: this.isReadOnly(set)
		});
	    }
	}

	this.items = flds;

	var btns = [];
	btns[0] = Ext.create('Ext.button.Button', {
	    itemid: 'spwpsettingsavebtn',
	    text: this.saveSettingsBtn,
	    formBind: true,
	    disabled: true,
	    handler: function() {
		var form = this.up('form').getForm();
		if (form.isValid()) {
		    var ok = this.fireEvent('savesettingsform', form);
		    if (ok) {
			this.up('window').close();
		    }
		}
	    }
	});
	
	this.buttons = btns;

	this.callParent(arguments);
    }

});
    
