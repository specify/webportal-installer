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
		var adv = Ext.create('SpWebPortal.view.widget.SearchCriterion', {
		    layout: {
			align: 'flex',
			type: 'hbox'
		    },
		    itemid: fld.get('solrname'),
		    items: [
			{
			    xtype: 'textfield',
			    flex: 8,
			    fieldLabel: fld.get('title'),
			    labelAlign: 'right',
			    id: fld.get('solrname') + '-1'
			},
			{
			    xtype: 'textfield',
			    flex: 4,
			    hidden: true,
			    id: fld.get('solrname') + '-2'
			},
			Ext.create('SpWebPortal.view.widget.BangButton', {
			    flex: 0.6,
			    id: fld.get('solrname') + '-not'
			}),
			Ext.create('SpWebPortal.view.widget.OpCombo', {
			    flex: 2.0,
			    id: fld.get('solrname') + '-op',
			    store: Ext.getStore('StringOps'),
			    value: '='
			}),
			Ext.create('SpWebPortal.view.widget.SortButton', {
			    flex: 1,
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

    }	
});
