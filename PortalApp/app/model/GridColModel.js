Ext.define('SpWebPortal.model.GridColModel', {
    extend: 'Ext.data.Model',
    fields: [
	{name: 'header', type: 'string'},
	{name: 'field', type: 'string'},
	{name: 'width', type: 'int'}
    ]
});
