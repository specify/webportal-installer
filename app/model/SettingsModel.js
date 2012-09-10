Ext.define('SpWebPortal.model.SettingsModel', {
    extend: 'Ext.data.Model',
    fields: [
	{name: 'solrURL', type: 'string'},
	{name: 'solrPort', type: 'string'},
	{name: 'solrCore', type: 'string'},
	{name: 'solrPageSize', type: 'int', defaultValue: 50},
	{name: 'maxSolrPageSize', type: 'int', defaultValue: 5000},
	{name: 'imageBaseUrl', type: 'string'},
	{name: 'defInitialView', type: 'string', defaultValue: 'grid'},
	{name: 'defMapType', type: 'string', defaultValue: 'roadmap'}
    ],

    validations: [
	{type: 'inclusion', field: 'defInitialView', list: ['grid', 'image', 'map']},
	{type: 'inclusion', field: 'defMapType', list: ['roadmap', 'satellite', 'hybrid', 'terrain']}
    ]
});
