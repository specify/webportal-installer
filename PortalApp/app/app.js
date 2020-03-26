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
Ext.Loader.setConfig({enabled:true});
//Ext.tip.QuickTipManager.init();
Ext.application({
    name: 'SpWebPortal', 
    appFolder: 'app',   
    id: 'spwp-webportal-app-obj',
    autoCreateViewport: true,

    models: ['FieldDefModel','AttachedImageModel'],
    stores: ['SettingsStore', 'FieldDefStore', 'NumericOps', 'DateOps', 'StringOps', 'FulltextOps', 'Sorts'],
    controllers: ['Mapper', 'ExpressSearch', 'AdvancedSearch', 'Detailer',
		  'Image', 'Settings', 'About'],
    
    init: function () {
	Ext.getBody().setHTML("");

	Ext.state.Manager.setProvider(new Ext.state.LocalStorageProvider({
	    prefix: Ext.getStore('SettingsStore').getAt(0).get('portalInstance')}));

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
	    idProperty: 'spid',
	    fields: dataFlds
	});
    }
});
