Ext.define('SpWebPortal.store.DateOps', {
    extend: 'Ext.data.Store', 
    storeId: 'dateOps',
    fields: ['name','display'],
    data: [
	{"name":"=", "display":"="},
	{"name":"<=", "display":"before"},
	{"name":">=", "display":"after"},
	{"name":"between", "display":"btw"}
    ],
    autoLoad: true
});
