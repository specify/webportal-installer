Ext.define('SpWebPortal.store.NumericOps', {
    extend: 'Ext.data.Store', 
    storeId: 'numericOps',
    fields: ['name','display'],
    data: [
	{"name":"=", "display":"="},
	{"name":"<=", "display":"<="},
	{"name":">=", "display":">="},
	{"name":"between", "display":"btw"}
    ],
    autoLoad: true
});
