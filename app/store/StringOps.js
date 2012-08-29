Ext.define('SpWebPortal.store.StringOps', {
    extend: 'Ext.data.Store',
    storeId: 'stringOps',
    fields: ['name', 'display'],
    data: [
	{"name":"=", "display":"="},
	{"name":"contains", "display":"contains"},
	{"name":"in", "display":"in"}
    ],
    autoLoad: true
});
