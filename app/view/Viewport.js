Ext.define('SpWebPortal.view.Viewport', {
    extend: 'Ext.container.Viewport',
    title: 'Web Portal',
    layout: 'border',

    //localizable text...
    viewportTitle: 'Web Portal',
    recordsTitle: 'Records',
    imagesTitle: 'Images',
    mapsTitle: 'Maps',
    pagerDisplayMsg: 'Displaying records {0} - {1} of {2}',
    pagerEmptyMsg: 'No records to display',
    searchToolsTitle: 'Search Tools',
    mapsCheckBox: 'Geo Coords',
    imagesCheckBox: 'Images',
    fitToMapCheckBox:'Fit to Map',
    settingsBtnTip: 'Settings',
    mapSearchBtn: 'Search',
    mapSearchBtnTip: 'Apply current search criteria to map region',
    //...localizable text

    requires: [
	'Ext.panel.Panel',

	'SpWebPortal.view.ExpressSearchView',
	'SpWebPortal.view.AdvancedSearchView',
	'SpWebPortal.view.MainGrid',
	'SpWebPortal.view.ImageView',
	'SpWebPortal.view.MapView'
    ],


    initComponent: function () {
	console.info("initializing viewport component");
	//var pager =;
	this.items = [
	    {
		xtype: 'panel',
		region: 'center',
		layout: 'fit',
		items: [
		    {
			xtype: 'tabpanel',
			layout: 'fit',
			id: 'spwpmaintabpanel',
			bbar: [
			    {
				xtype: 'pagingtoolbar',
				id: 'spwpmainpagingtoolbar',
				store: Ext.getStore('MainSolrStore'),
				displayInfo: true,
				displayMsg: this.pagerDisplayMsg,
				emptyMsg: this.pagerEmptyMsg,
				region: 'center'
			    },
			    {
				xtype: 'button',
				itemid: 'mapsearchbtn',
				text: this.mapSearchBtn,
				region: 'east'
			    }
			],
			items: [
			    {
				xtype: 'spmaingrid',
				id: 'spwpmaingrid',
				title: this.recordsTitle,
				store: Ext.getStore('MainSolrStore'),
				invalidateScrollerOnRefresh: true
			    },
			    {
				xtype: 'spimageview',
				title: this.imagesTitle
			    },
			    {
				xtype: 'spmapview',
				title: this.mapsTitle,
				id: 'spwpmainmappane'
			    }
			]
		    }
		]
	    },
	    {
		xtype: 'panel',
		title: this.searchToolsTitle,
		region: 'west',
		width: 275,

		//resizable: true,
		collapsible: true,
		titleCollapse: true,
		split: true,

		layout: 'border',
		items: [
		    {
			xtype: 'panel',
			region: 'south',
			layout: 'hbox',
			height: 25,
			items: [
			    {
				xtype: 'checkbox',
				boxLabel: this.mapsCheckBox,
				name: 'Maps',
				itemid: 'req-geo-ctl',
				checked: false
			    },
			    {
				xtype: 'checkbox',
				boxLabel: this.imagesCheckBox,
				name: 'Images',
				itemid: 'req-img-ctl',
				checked: false
			    },
			    {
				xtype: 'checkbox',
				boxLabel: this.fitToMapCheckBox,
				name: 'Map',
				itemid: 'fit-to-map',
				checked: false
			    },
			    {
				xtype: 'button',
				tooltip: this.settingsBtnTip,
				icon: 'resources/images/system.png',
				itemid: 'spwpsettingsbtn'
			    }
			]
		    },
		    {
			xtype: 'panel',
			region: 'center',
			layout: 'accordion',
			items: [
			    {
				xtype: 'spexpresssrch'
			    },
			    {
				xtype: 'spadvsrch'
			    }
			]
		    }
		]
	    }
	];

	this.callParent(arguments);
    }
});
