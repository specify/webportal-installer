Ext.define('SpWebPortal.store.Sorts', {
    extend: 'Ext.data.Store', 
    storeId: 'sorts',
    fields: ['name', 'display', 'icon'],
    data: [
	{"name":"none", "display":"-"},
	{"name":"asc", "display":"^", "icon":"resources/images/up.png"},
	{"name":"desc", "display":"v", "icon":"resources/images/down.png"}
    ],
    autoLoad: true
});
