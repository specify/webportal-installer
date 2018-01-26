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
Ext.define('SpWebPortal.view.ExpressSearchView', {
    extend: 'Ext.form.Panel',
    xtype: 'spexpresssrch',
    alias: 'widget.expressSrch',

    //localizable text...
    expressSearchTitle: 'Express',
    searchBtnHint: 'enter a search term',
    matchAny: 'Any ',
    matchAll: 'All',
    //...localizable text

    requires: [
	'SpWebPortal.view.ExpressSearchButton'
    ],

    bodyStyle:'padding:5px 5px 0',
    height: 30,
    maxHeight: 60,
    layout: {
        align: 'flex',
        type: 'hbox'
    },
    
    /*items: [
	{
	    xtype: 'textfield',
	    flex: 9,
	    tooltip: this.searchBtnHint,
	    name: 'search-text',
	    itemid: 'search-text',
	    enableKeyEvents:true
	},
	{
	    xtype: 'spexpsrchbtn',
	    flex: 1,
	    minWidth: 20,
	    maxWidth: 36,
	    itemid: 'search-btn'
	},
	{
	    xtype: 'radiogroup',
	    flex: 6,
	    minWidth: 100,
	    maxWidth: 120,
	    itemid: 'match-radio-grp',
	    allowBlank: false,
	    items: [
		{itemid: 'match-any-ctl', boxLabel: this.matchAny, name: 'expr', 
		 inputValue: 1, checked: true },
		{id: 'match-all-ctl', itemid: 'match-all-ctl', boxLabel: this.matchAll, name: 'expr', inputValue: 2 }
	    ]
	}
    ]*/

    initComponent: function() {
	var cmps = [];
	cmps[0] = Ext.create('Ext.form.field.Text', {
	    flex: 9,
	    tooltip: this.searchBtnHint,
	    itemid: 'search-text',
	    enableKeyEvents:true
	});
	cmps[1] = Ext.widget('spexpsrchbtn', {
	    flex: 1,
	    minWidth: 20,
	    maxWidth: 36,
	    itemid: 'search-btn'
	});
	cmps[2] = Ext.create('Ext.form.RadioGroup', {
	    flex: 6,
	    minWidth: 100,
	    maxWidth: 120,
	    itemid: 'match-radio-grp',
	    allowBlank: false,
	    items: [
		{itemid: 'match-any-ctl', boxLabel: this.matchAny, name: 'expr', 
		 inputValue: 1, checked: true },
		{id: 'match-all-ctl', itemid: 'match-all-ctl', boxLabel: this.matchAll, name: 'expr', inputValue: 2 }
	    ]
	});

	this.items = cmps;

	this.title = this.expressSearchTitle;

	this.callParent(arguments);
    }
});
