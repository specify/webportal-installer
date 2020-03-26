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
            if (fld.get('linkify')) {
                //Display object is less than ideal for columns with values that may or may not
                //contain embedded links. Linkless values will be unbordered and unadorned and might
                //look strange.
                flds[f] = Ext.create('Ext.form.field.Display', {
		    fieldLabel: fld.get('title'),
		    name: fld.get('solrname'),
		    readOnly: true,
		    labelAlign: 'right',
		    anchor: '100%',
		    displaycolidx: fld.get('displaycolidx'),
                    linkify: fld.get('linkify')
	        });
            } else {
                flds[f] = Ext.create('Ext.form.field.Text', {
		    fieldLabel: fld.get('title'),
		    name: fld.get('solrname'),
		    labelAlign: 'right',
		    anchor: '100%',
		    displaycolidx: fld.get('displaycolidx'),
                    linkify: fld.get('linkify')
	        });
            }
	}
	flds.sort(function(a, b){return a.displaycolidx - b.displaycolidx;});
	this.items = flds;

	this.callParent(arguments);
    },

    loadRecord: function(record) {
	//console.info("DetailView.loadRecord in");
        if (!record.linkified) {
            for (var f = 0; f < this.items.items.length; f++) {
                if (this.items.items[f]['linkify']) {
                    var fldName = this.items.items[f]['name'];
                    if (!record.data[fldName]['linkified']) {
                        //using target tag makes link open in new browser tab
                        record.data[fldName] = linkify(record.data[fldName]).replace('<a href=', '<a target="_blank" href=');
                    }
                }
                record.linkified = true;
            }
        }
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
