Ext.define('SpWebPortal.store.StringOps', {
    extend: 'Ext.data.Store',
    storeId: 'stringOps',
    fields: ['name', 'display'],

    equalText: '=',
    containsText: 'contains',
    containsAnyText: 'contains any',
    inText: 'in',

    data: [
	{"name":"=", "display":"="},
	{"name":"contains", "display":"contains"},	
	{"name":"containsany", "display":"contains any"},
	{"name":"in", "display":"in"}
	//{"name":"=", "display":this.equalText},
	//{"name":"contains", "display":this.containsText},	
	//{"name":"containsany", "display":this.containsAnyText},
	//{"name":"in", "display":this.inText}
    ],
    autoLoad: true
});
