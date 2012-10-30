Ext.define('SpWebPortal.model.SettingsModel', {
    extend: 'Ext.data.Model',
    fields: [
	{name: 'solrURL', type: 'string'},
	{name: 'solrPort', type: 'string'},
	{name: 'solrCore', type: 'string'},
	{name: 'solrPageSize', type: 'int', defaultValue: 50},
	{name: 'maxSolrPageSize', type: 'int', defaultValue: 5000},
	{name: 'imageBaseUrl', type: 'string'},
	{name: 'imagePreviewSize', type: 'int', defaultValue: 200},
	{name: 'imageViewSize', type: 'int', defaultValue: 500}, //<= 0 for actual size
	{name: 'defInitialView', type: 'string', defaultValue: 'grid'},
	{name: 'defMapType', type: 'string', defaultValue: 'roadmap'},
	{name: 'backgroundURL', type: 'string', defaultValue: 'resources/images/specify128.png'},
	{name: 'bannerURL', type: 'string', defaultValue: 'resources/images/fishskel.gif'},
	{name: 'bannerTitle', type: 'string', defaultValue: 'KU Fish Web Portal Demo'},
	{name: 'bannerheight', type: 'int', defaultValue: 125}
    ],

    validations: [
	{type: 'inclusion', field: 'defInitialView', list: ['grid', 'image', 'map']},
	{type: 'inclusion', field: 'defMapType', list: ['roadmap', 'satellite', 'hybrid', 'terrain']}
    ]
});
