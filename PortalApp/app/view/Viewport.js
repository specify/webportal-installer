Ext.define('SpWebPortal.view.Viewport', {
    extend: 'Ext.container.Viewport',
    title: 'Web Portal',
    layout: 'border',
    id: 'spwp-webportal-viewport',

    //localizable text...
    viewportTitle: 'Web Portal',
    recordsTitle: 'Records',
    imagesTitle: 'Images',
    mapsTitle: 'Map',
    pagerDisplayMsg: 'Displaying records {0} - {1} of {2}',
    pagerEmptyMsg: 'No records to display',
    searchToolsTitle: 'Search Tools',
    mapsCheckBox: 'Geo Coords',
    mapsCheckBoxTip: 'Check to select only records with geo-coordinates',
    imagesCheckBox: 'Images',
    imagesCheckBoxTip: 'Check to select only records with images',
    fitToMapCheckBox:'Fit to Map',
    fitToMapCheckBoxTip: 'Check to apply search criteria within map region',
    settingsBtnTip: 'Settings',
    mapSearchBtn: 'Search',
    mapSearchBtnTip: 'Apply search criteria to map region',
    mapCancelBtn: 'Cancel',
    mapCancelBtnTip: 'Stop plotting the current results',
    //...localizable text

    requires: [
	'Ext.panel.Panel',

	'SpWebPortal.view.ExpressSearchView',
	'SpWebPortal.view.AdvancedSearchView',
	'SpWebPortal.view.MainGrid',
	'SpWebPortal.view.ImageView',
	'SpWebPortal.view.MapView'
    ],


    banner: null,
    background: null,
    resultsTab: null,
    cls: "content",


    initComponent: function () {
	console.info("initializing viewport component");

	this.fireEvent('initsettings');

	//var pager =;
	var mapBtn = Ext.create('Ext.button.Button', {
	    xtype: 'button',
	    tooltip: this.mapSearchBtnTip,
	    itemid: 'mapsearchbtn',
	    text: this.mapSearchBtn
	});
	var mapCancelBtn = Ext.create('Ext.button.Button', {
	    xtype: 'button',
	    tooltip: this.mapCancelBtnTip,
	    itemid: 'mapcancelbtn',
	    id: 'spwpmainmapcancelbtn',
	    text: this.mapCancelBtn
	});
	var loadingBtn = Ext.create('Ext.button.Button', {
	    xtype: 'button',
	    itemid: 'mapsearchbtn',
	    id: 'spwpmainmaploadbtn',
	    text: '  ',
	    hidden: true
	});
	var mapProg = Ext.create('Ext.ProgressBar', {
	    hidden: true,
	    id: 'spwpmainmapprogbar'
	});
	var mapStatText = Ext.create('Ext.toolbar.TextItem', {
	    hidden: true,
	    id: 'spwpmainmapstatustext'
	});
	var settingsBtn = Ext.create('Ext.button.Button', {
	    xtype: 'button',
	    tooltip: this.settingsBtnTip,
	    icon: 'resources/images/system.png',
	    itemid: 'spwpsettingsbtn',
	    id: 'spwpsettingsbtn'
	});
	var expBtn = Ext.create('Ext.button.Button', {
	    xtype: 'button',
	    tooltip: 'to csv',
	    icon: 'resources/images/ExportExcelTemplate16x16.png',
	    itemid: 'spwpexpcsvbtn',
	    id: 'spwpexpcsvbtn'
	});

	mapBtn.setVisible(false);
	mapCancelBtn.setVisible(false);
	
	var settings = Ext.getStore('SettingsStore').getAt(0);
	var attUrl = settings.get("imageBaseUrl");
	var attachmentsPresent = typeof attUrl === "string" && attUrl.length > 0;  
	
	var bannerURL = settings.get('bannerURL');
	if (bannerURL) {
	    this.banner = Ext.create('Ext.panel.Panel', {
		html: '<table class="deadcenter"> <tr><td><img src='+  settings.get('bannerURL') + '></td></tr></table>',
		id: 'spwpbannerpanel',
		height: settings.get('bannerHeight'),
		region: 'north'
	    });
	}

	this.background = Ext.create('Ext.panel.Panel', {
	    html: '<table class="deadcenter"> <tr><td><img src='+  Ext.getStore('SettingsStore').getAt(0).get('backgroundURL') + '></td></tr></table>',
	    id: 'spwpmainbackground'
	});


	this.resultsTab = Ext.create('Ext.tab.Panel', {
	    hidden: true,
	    layout: 'fit',
	    id: 'spwpmaintabpanel',
	    bbar: [
		{
		    xtype: 'pagingtoolbar',
		    id: 'spwpmainpagingtoolbar',
		    store: Ext.getStore('MainSolrStore'),
		    displayInfo: true,
		    displayMsg: this.pagerDisplayMsg,
		    emptyMsg: this.pagerEmptyMsg
		},
		settingsBtn,
                expBtn,
		mapBtn,
		mapCancelBtn,
		mapProg,
		mapStatText,
		loadingBtn
	    ],
	    items: [
		{
		    xtype: 'spmaingrid',
		    id: 'spwpmaingrid',
		    title: this.recordsTitle,
		    store: Ext.getStore('MainSolrStore')
		},
		{
		    xtype: 'spimageview',
		    id: 'spwpmainimageview',
		    title: this.imagesTitle,
		    hidden: !attachmentsPresent
		},
		{
		    xtype: 'spmapview',
		    title: this.mapsTitle,
		    id: 'spwpmainmappane'
		}
	    ]
	});


	var stuffOnTop = settings.get('topBranding');
	var topHeight = settings.get('topHeight') ? settings.get('topHeight') : 118;
	var topMarginLeft = settings.get('topMarginLeft') ? settings.get('topMarginLeft') : 'auto';
	var topMarginRight = settings.get('topMarginRight') ? settings.get('topMarginRight') : 'auto';
	var topWidth = settings.get('topWidth') ? settings.get('topWidth') : 950;

	var stuffAtTheBottom = settings.get('bottomBranding');
	var bottomHeight = settings.get('bottomHeight') ? settings.get('bottomHeight') : 100;
	var bottomMarginLeft = settings.get('bottomMarginLeft') ? settings.get('bottomMarginLeft') : 'auto';
	var bottomMarginRight = settings.get('bottomMarginRight') ? settings.get('bottomMarginRight') : 'auto';
	var bottomWidth = settings.get('bottomWidth') ? settings.get('bottomWidth') : 950;
	var sideItems = [
	    this.banner,
	    {
		xtype: 'panel',
		title: this.searchToolsTitle,
		region: 'center',

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
				//tooltip: this.mapsCheckBoxTip, //checkboxes don't have tooltip config
				name: 'Maps',
				itemid: 'req-geo-ctl',
				checked: false
			    },
			    {
				xtype: 'checkbox',
				boxLabel: this.imagesCheckBox,
				//tooltip: this.imagesCheckBoxTip, //checkboxes don't have tooltip config
				name: 'Images',
				itemid: 'req-img-ctl',
				checked: false,
				hidden: !attachmentsPresent
			    },
			    {
				xtype: 'checkbox',
				boxLabel: this.fitToMapCheckBox,
				//tooltip: this.fitToMapCheckBoxTip,  //checkboxes don't have tooltip config
				name: 'Map',
				itemid: 'fit-to-map',
				id: 'spwp-fit-to-map-chkbx',
				checked: false,
				hidden: true
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

	if (!this.banner) {
	    sideItems.shift();
	}

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
		layout: 'border',
		region: 'west',
		width: settings.get('bannerWidth'),
		collapsible: true,
		split: true,
		title: settings.get('bannerTitle'),

		items: sideItems
	    }
	];
	if (stuffOnTop) {
	    this.items.push({
		xtype: 'panel',
		region: 'north',
		border: false,
		bodyStyle: 'background:none',
		height: topHeight,
		items: {
		    xtype: 'box',
		    id: "page",
		    cls: "container",
		    style: {
			marginLeft: topMarginLeft,
			marginRight: topMarginRight,
			width: topWidth
		    },
		    html: stuffOnTop
		}
	    });
	}
	if (stuffAtTheBottom) {
	    this.items.push(
	    {
		xtype: 'panel',
		region: 'south',
		border: false,
		bodyStyle: 'background:none',
		height: bottomHeight,
		items: {
		    xtype: 'box',
		    id: 'footer',
		    cls:'container',
		    height: bottomHeight ? bottomHeight : 100,
		    style: {
			marginLeft: bottomMarginLeft,
			marginRight: bottomMarginRight,
			width: bottomWidth
		    },
		    html: stuffAtTheBottom
		}
	    });
	}
	this.callParent(arguments);
    }
});
