/* Copyright (C) 2020, Specify Collections Consortium
 *
 * Specify Collections Consortium, Biodiversity Institute, University of Kansas,
 * 1345 Jayhawk Boulevard, Lawrence, Kansas, 66045, USA, support@specifysoftware.org
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

    loadRecord: function(record) {
        this.callParent(arguments);
        this.saveButton.formBind = true;
    },

    initComponent: function() {
	var setsStore = Ext.getStore('SettingsStore');
	var settings = setsStore.getAt(0);
	var sets = setsStore.model.getFields();
	var flds = [];
        this.layout =  {
            type: 'vbox',
            align: 'left',
            stretchMaxPartner: true
        };
        for (var f = 0; f < sets.length; f++) {
	    var set = sets[f];
	    if (this.isViewable(set)) {
                if (this.isReadOnly(set)) {
		    flds[flds.length] = Ext.create('Ext.form.field.Display', {
		        fieldLabel: set.name,
		        name: set.name,
                        type: set.type,
		        labelAlign: 'right',
                        labelWidth: 150
		    });
                } else {
		    flds[flds.length] = Ext.create('Ext.form.field.Text', {
		        fieldLabel: set.name,
		        name: set.name,
		        labelAlign: 'right',
                        labelWidth: 150,
		        type: set.type,
		        allowBlank: false
		    });
                }
	    }
	}

	this.items = flds;

	this.saveButton = Ext.create('Ext.button.Button', {
	    itemid: 'spwpsettingsavebtn',
	    text: this.saveSettingsBtn,
	    formBind: false,
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

	this.buttons = [this.saveButton];

	this.callParent(arguments);
    }

});

