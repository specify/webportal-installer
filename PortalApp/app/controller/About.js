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
Ext.define('SpWebPortal.controller.About', {
    extend: 'Ext.app.Controller',
    xtype: 'aboutcontroller',
    
    //localizable text...
    aboutFormTitle: 'About',
    //..localizable text

    requires: [
	'SpWebPortal.view.AboutView', 'SpWebPortal.store.SettingsStore'
    ],

    init: function() {
	this.control({
	    'button[itemid="spwpinfobtn"]' : {
		click: this.onInfoBtnClick
	    }
	});
	this.callParent(arguments);
    },

    onInfoBtnClick: function() {
        var form = Ext.widget('spwpabout');
	var popupWin =  Ext.create('Ext.window.Window', {
	    title: this.aboutFormTitle,
	    height: 400,
	    width: 500,
	    maximizable: false,
	    resizable: true,
	    closeAction: 'destroy',
	    layout: 'anchor',
	    items: [
		form
	    ]
	});
	popupWin.setPosition(1,1);
        popupWin.show();
        popupWin.toFront();
    }
});
