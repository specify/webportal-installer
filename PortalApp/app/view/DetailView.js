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
Ext.define('SpWebPortal.view.DetailView', {
    extend: 'Ext.form.Panel',
    xtype: 'spdetailview',
    alias: 'widget.spdetail',


    autoScroll: true,

    initComponent: function() {
	//console.info('DetailView.initComponent');
	var fieldStore = Ext.getStore('FieldDefStore');
	var flds = [];
	for (var f = 1; f < fieldStore.count(); f++) {
	    var fld = fieldStore.getAt(f);
	    flds[f] = Ext.create('Ext.form.field.Text', {
		fieldLabel: fld.get('title'),
		name: fld.get('solrname'),
		readOnly: true,
		labelAlign: 'right',
		anchor: '100%',
		displaycolidx: fld.get('displaycolidx')
	    });
	}
	flds.sort(function(a, b){return a.displaycolidx - b.displaycolidx;});
	this.items = flds;

	this.callParent(arguments);
    },

    loadRecord: function(record) {
	//console.info("DetailView.loadRecord in");
	this.callParent(arguments);
	var imgFld = this.getForm().findField('img');
	if (imgFld != null) {
	    var value = imgFld.getValue();
	    if (value != null && value != '') {
		var newValue = '';
		var data = Ext.JSON.decode(value);
		var store = Ext.create('Ext.data.Store', {
		    model: 'SpWebPortal.model.AttachedImageModel',
		    data: data
		});
			
		for (var r = 0; r < store.getCount(); r++) {
		    if (newValue != '') {
			newValue += ', ';
		    }
		    newValue += store.getAt(r).get('Title');
		}
		imgFld.setValue(newValue);
	    }
	}	    
	//console.info("DetailView.loadRecord out");
    }

});
