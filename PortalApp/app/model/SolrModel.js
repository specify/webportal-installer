Ext.define('SolrModel', {
    extend: 'Ext.data.Model',
    fields: [
	{name: 'id',  type: 'int'},
	{name: 'cn',  type: 'string'},
	{name: 'yr',  type: 'string'},
	{name: 'cy',  type: 'string'},
	{name: 'ht',  type: 'string'},
	{name: 'xref',  type: 'string'},
	{name: 'contents', type: 'string'}
    ],
    idProperty: 'id'
});
