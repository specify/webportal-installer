Ext.define('SpWebPortal.model.SettingsModel', {
    extend: 'Ext.data.Model',
    fields: [
	{name: 'portalInstance', type: 'string', defaultValue: 'spwp'},
	{name: 'solrURL', type: 'string'},
	{name: 'solrPort', type: 'string'},
	{name: 'solrCore', type: 'string'},
	{name: 'solrPageSize', type: 'int', defaultValue: 50},
	{name: 'maxSolrPageSize', type: 'int', defaultValue: 5000},
	{name: 'imageBaseUrl', type: 'string'},
	{name: 'collectionName', type: 'string'},
	{name: 'imagePreviewSize', type: 'int', defaultValue: 200},  //when this setting is changed in settings.json, the height and width for *.tv-thumb should be set to about 7 px greater than this setting in resources/css/thumb-view.css
	{name: 'imageViewSize', type: 'int', defaultValue: 500}, //<= 0 for actual size
	{name: 'defInitialView', type: 'string', defaultValue: 'grid'},
	{name: 'defMapType', type: 'string', defaultValue: 'roadmap'},
	{name: 'backgroundURL', type: 'string', defaultValue: 'resources/images/specify128.png'},
	{name: 'bannerURL', type: 'string'},
	{name: 'bannerTitle', type: 'string', defaultValue: 'Specify Web Portal'},
	{name: 'bannerHeight', type: 'int', defaultValue: 120},
	{name: 'bannerWidth', type: 'int', defaultValue: 250},
	{name: 'imageInfoFlds', type: 'string'},
	{name: 'topBranding', type: 'string'},
	{name: 'topHeight', type: 'int'},
	{name: 'topMarginLeft', type: 'string'},
	{name: 'topMarginRight', type: 'string'},
	{name: 'topWidth', type: 'int'},
	{name: 'bottomBranding', type: 'string'},
 	{name: 'bottomHeight', type: 'int'},
	{name: 'bottomMarginLeft', type: 'string'},
	{name: 'bottomMarginRight', type: 'string'},
	{name: 'bottomWidth', type: 'int'}
   ],

    validations: [
	{type: 'inclusion', field: 'defInitialView', list: ['grid', 'image', 'map']},
	{type: 'inclusion', field: 'defMapType', list: ['roadmap', 'satellite', 'hybrid', 'terrain']}
    ]
});
