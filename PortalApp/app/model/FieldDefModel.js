Ext.define('SpWebPortal.model.FieldDefModel', {
    extend: 'Ext.data.Model',
    fields: [
	{name: 'colname', type: 'string'},
	{name: 'solrname', type: 'string'},
	{name: 'solrtype', type: 'string'},
	{name: 'solrtitle', type: 'string'},
	{name: 'title', type: 'string'},
	{name: 'type', type: 'string'},
	{name: 'width', type: 'int'},
	{name: 'concept', type: 'string'},
	{name: 'concepturl', type: 'string'},
	{name: 'sptable', type: 'string'},
	{name: 'sptabletitle', type: 'string'},
	{name: 'spfld', type: 'string'},
	{name: 'spfldtitle', type: 'string'},
	{name: 'spdescription', type: 'string'},
	{name: 'colidx', type: 'int'},
	{name: 'advancedsearch', type: 'boolean', defaultvalue: true},
	{name: 'displaycolidx', type: 'int'},
	{name: 'displaywidth', type: 'int', defaultvalue: 100},
	{name: 'hiddenbydefault', type: 'boolean', defaultvalue: false},
	{name: 'displayinmap', type: 'boolean', defaultvalue: true},
	{name: 'mapmarkertitle', type: 'boolean', defaultvalue: false},
	{name: 'treeid', type: 'string'},
	{name: 'treerank', type: 'int', defaultvalue: -1}
    ]
});

