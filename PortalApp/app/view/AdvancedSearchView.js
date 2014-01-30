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
			align: 'stretch',
			type: 'hbox'
		    },
		    //layout: 'column',
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
			    store: this.getOps(fld),
			    value: '='
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
//	console.info("getOps: " + solrType + ", " + spType);
	if (spType == 'java.util.Calendar') {
	    return Ext.getStore('DateOps');
	} else if (solrType == 'string') {
	    return Ext.getStore('StringOps');
	} else if (solrType == 'tdouble' || solrType == 'int') {
	    return Ext.getStore('NumericOps');
	}
	return Ext.getStore('DateOps');
    }
});
