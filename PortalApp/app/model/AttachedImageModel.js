Ext.define('SpWebPortal.model.AttachedImageModel', {
    extend: 'Ext.data.Model',
    fields: [
	{name: 'AttachmentID', type: 'int'},
	{name: 'AttachedToTable', type: 'string'},
	{name: 'AttachedTo', type: 'int'},
	{name: 'AttachedToDescr', type: 'string'},
	{name: 'AttachmentLocation', type: 'string'},
	{name: 'ThumbSrc', type: 'string'},
	{name: 'StdSrc', type: 'string'},
	{name: 'Src', type: 'string'},
	{name: 'Title', type: 'string'},
	{name: 'Height', type: 'int'},
	{name: 'Width', type: 'int'}
    ]
});
