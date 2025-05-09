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
    fitToMapCheckBox:'Limit to map',
    fitToMapCheckBoxTip: 'Check to apply search criteria within map region',
    settingsBtnTip: 'Settings',
    mapSearchBtn: 'Search',
    mapSearchBtnTip: 'Apply search criteria to map region',
    mapCancelBtn: 'Cancel',
    mapCancelBtnTip: 'Stop plotting the current results',
    toCsv: 'download to csv',
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
	var infoBtn = Ext.create('Ext.button.Button', {
	    xtype: 'button',
	    icon: 'resources/images/info.png',
	    itemid: 'spwpinfobtn',
            //align: 'right',
	    id: 'spwpinfobtn',
            hidden: false
	});
	var settingsBtn = Ext.create('Ext.button.Button', {
	    xtype: 'button',
	    tooltip: this.settingsBtnTip,
	    icon: 'resources/images/system.png',
	    itemid: 'spwpsettingsbtn',
	    id: 'spwpsettingsbtn'
	});

	mapBtn.setVisible(false);
	mapCancelBtn.setVisible(false);

	var settings = Ext.getStore('SettingsStore').getAt(0);
	var attUrl = settings.get("imageBaseUrl");
	var attachmentsPresent = typeof attUrl === "string" && attUrl.length > 0;
        var expOK = settings.get("allowExportToFile");

        if (typeof expOK === "undefined" || expOK != 0) {
            expOK = true;
        } else {
            expOK = false;
        }

	var expBtn = Ext.create('Ext.button.Button', {
	    xtype: 'button',
	    tooltip: this.toCsv,
	    icon: 'resources/images/ExportExcelTemplate16x16.png',
	    itemid: 'spwpexpcsvbtn',
	    id: 'spwpexpcsvbtn',
            hidden: !expOK,
            allowed: expOK
	});
	var expStatText = Ext.create('Ext.toolbar.TextItem', {
	    hidden: true,
	    id: 'spwpexpcsvstatustext'
	});

	var bannerURL = settings.get('bannerURL');
	if (bannerURL) {
	    this.banner = Ext.create('Ext.panel.Panel', {
		html: '<table class="deadcenter"> <tr><td><img src='+  settings.get('bannerURL') + ' alt=' + settings.get('bannerAltText') + '></td></tr></table>',
		id: 'spwpbannerpanel',
		height: settings.get('bannerHeight'),
		region: 'north'
	    });
	}

	this.background = Ext.create('Ext.panel.Panel', {
	    html: '<table class="deadcenter"> <tr><td><img src='+  settings.get('backgroundURL') + ' alt=' + settings.get('backgroundAltText') + '></td></tr></table>',
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
                infoBtn,
		settingsBtn,
                expBtn,
		mapBtn,
		mapCancelBtn,
		mapProg,
		mapStatText,
                expStatText,
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
        var colls = settings.get("collections");
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
			    },
                            {
	                        xtype: 'button',
	                        tooltip: '<html>Searching <b>all</b> Collections</html>',
                                text: 'Collections',
	                        itemid: 'spwpcollectionsbtn',
                                id: 'spwpcollectionsbtnid',
                                hidden: !colls || _.size(colls) < 2
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
