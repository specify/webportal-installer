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
    
