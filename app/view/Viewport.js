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


    background: null,
    resultsTab: null,

    /*render: function() {
	if (this.background != null && this.resultsTab != null && !this.resultsTab.isVisible()) {
	    this.background.center();
	    this.background.show();
	}
	
	this.callParent(arguments);
    },*/

    initComponent: function () {
	console.info("initializing viewport component");
	//var pager =;
	var mapBtn = Ext.create('Ext.button.Button', {
	    xtype: 'button',
	    tooltip: this.mapSearchBtnTip,
	    itemid: 'mapsearchbtn',
	    text: this.mapSearchBtn,
	    region: 'west'
	});
	var loadingBtn = Ext.create('Ext.button.Button', {
	    xtype: 'button',
	    itemid: 'mapsearchbtn',
	    id: 'spwpmainmaploadbtn',
	    text: '           ',
	    region: 'east',
	    hidden: true
	});
	var mapProg = Ext.create('Ext.ProgressBar', {
	    region: 'center',
	    hidden: true,
	    id: 'spwpmainmapprogbar'
	});
	var mapStatText = Ext.create('Ext.toolbar.TextItem', {
	    region: 'center',
	    hidden: true,
	    id: 'spwpmainmapstatustext'
	});
	
	mapBtn.setVisible(false);
	
	this.background = Ext.create('Ext.Img', {
	    src: Ext.getStore('SettingsStore').getAt(0).get('backgroundURL'),
	    id: 'spwpmainbackground'
	    //maxHeight: 256,
	    //maxWidth: 256,
	    //style: "padding: 100px; max-height: 100%; max-width: 100%; vertical-align:middle;"
	    //style: "display: block; margin-left: auto;	margin-right: auto;" 
	    //floating: true
	});

	this.resultsTab = Ext.create('Ext.tab.Panel', {
	    hidden: true,
	    layout: 'fit',
	    id: 'spwpmaintabpanel',
	    bbar: [
		mapBtn,
		{
		    xtype: 'pagingtoolbar',
		    id: 'spwpmainpagingtoolbar',
		    store: Ext.getStore('MainSolrStore'),
		    displayInfo: true,
		    displayMsg: this.pagerDisplayMsg,
		    emptyMsg: this.pagerEmptyMsg,
		    region: 'center'
		},
		mapProg,
		mapStatText,
		loadingBtn
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
	});
	    
	this.items = [
	    {
		xtype: 'panel',
		region: 'center',
		layout: 'fit',
		items: [
		    this.background,
		    this.resultsTab
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
			region: 'north',
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
				checked: false,
				hidden: true
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
				xtype: 'spexpresssrch',
				id: 'spwpmainexpresssrch'
			    },
			    {
				xtype: 'spadvsrch',
				id: 'spwpmainadvsrch'
			    }
			]
		    }
		]
	    }
	];

	this.callParent(arguments);
    }
});
