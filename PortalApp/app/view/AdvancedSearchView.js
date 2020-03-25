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
Ext.define('SpWebPortal.view.AdvancedSearchView', {
    extend: 'Ext.form.Panel',
    alias: 'widget.advSrch',
    xtype: 'spadvsrch',

    //localizable text...
    advancedSearchTitle: 'Advanced',
    matchAny: 'Any ',
    matchAll: 'All',
    searchBtn: 'Search',
    //...localizable text

    title: this.advancedSearchTitle,
   
    requires: [
	'SpWebPortal.view.widget.SortButton',
	'SpWebPortal.view.widget.SearchCriterion',
	'SpWebPortal.view.widget.OpCombo',
	'SpWebPortal.view.widget.BangButton'
    ],

    autoScroll: true,

    initComponent: function() {
	var fieldStore = Ext.getStore('FieldDefStore');
	advSrchs = [];
	var a = 0;
	for (var s = 1; s < fieldStore.count(); s++) {
	    var fld = fieldStore.getAt(s);
	    if (fld.get('advancedsearch')) {
                var ops = this.getOps(fld);
		var adv = Ext.create('SpWebPortal.view.widget.SearchCriterion', {
		    layout: {
			align: 'stretch',
			type: 'hbox'
		    },
		    fld: fld,
		    itemid: fld.get('solrname'),
		    items: [
			{
			    xtype: 'label',
			    //text: fld.get('title'),
			    html: '<div style="margin-right:2px; padding-top:5%;" align="right">' + fld.get('title') + ': </div>',
			    flex: 4
			},
			{
			    xtype: 'panel',
			    border: false,
			    layout: {
				align: 'stretch',
				type: 'hbox'
			    },
			    flex: 4,
			    items: [
				{
				    xtype: 'textfield',
				    
				    flex: 4,
				    //columnWidth: 0.6,
				    
				    fieldLabel: fld.get('title'),
				    hideLabel: true,
				    labelAlign: 'right',
				    id: fld.get('solrname') + '-1'
				},
				{
				    xtype: 'textfield',
				    hideLabel: true,
				    flex: 4,
				    //columnWidth: 0.3,

				    hidden: true,
				    id: fld.get('solrname') + '-2'
				}
			    ]
			},
			Ext.create('SpWebPortal.view.widget.BangButton', {
			    //flex: 0.6,
			    width: 24,

			    id: fld.get('solrname') + '-not'
			}),
			Ext.create('SpWebPortal.view.widget.OpCombo', {
			    flex: 2.0,
			    //columnWidth: 0.1,

			    id: fld.get('solrname') + '-op',
			    store: ops,
			    value: ops.getAt(0).get('display')
			}),
			Ext.create('SpWebPortal.view.widget.SortButton', {
			    //flex: 1,
			    width: 24,
			    hidden: true,
			    id: fld.get('solrname') + '-sort'
			})	        
		    ]
		});
		advSrchs[a++] = adv;
	    }
	}
	advSrchs[a++] = Ext.create('Ext.form.RadioGroup', {
	    id: 'adv-match-radio',
	    itemid: 'match-radio-grp',
	    minWidth: 80,
	    maxWidth: 120,
	    allowBlank: false,
	    items: [
		{boxLabel: this.matchAny, name: 'advrb', inputValue: 3 },
		{boxLabel: this.matchAll, name: 'advrb', inputValue: 4, checked: true }
	    ]
	});
	advSrchs[a++] = Ext.create('Ext.button.Button', {
	    text: this.searchBtn,
	    id: 'adv-srch-btn',
	    itemid: 'search-btn'
	});

	this.items = advSrchs;

	this.title = this.advancedSearchTitle;

	this.callParent(arguments);

    },	

    getOps: function(fld) {
	var solrType = fld.get('solrtype');
	var spType = fld.get('type');
	if (spType == 'java.util.Calendar') {
	    return Ext.getStore('DateOps');
	} else if (solrType == 'string') {
	    return Ext.getStore('StringOps');
	} else if (solrType == 'tdouble' || solrType == 'int') {
	    return Ext.getStore('NumericOps');
	} else if (solrType == 'text_general') {
            console.info(Ext.getStore('FulltextOps'));
            return Ext.getStore('FulltextOps');
        }
	return Ext.getStore('DateOps');
    }
        
});
