Ext.define('SpWebPortal.view.DetailView', {
    extend: 'Ext.form.Panel',
    xtype: 'spdetailview',
    alias: 'widget.spdetail',


    autoScroll: true,

    initComponent: function() {
	//console.info('DetailView.initComponent');
	var fieldStore = Ext.getStore('FieldDefStore');
	var flds = [];
	for (var f = 1; f < fieldStore.count(); f++) {
	    var fld = fieldStore.getAt(f);
	    flds[f] = Ext.create('Ext.form.field.Text', {
		fieldLabel: fld.get('title'),
		name: fld.get('solrname'),
		readOnly: true,
		labelAlign: 'right',
		anchor: '100%',
	    });
	}

	this.items = flds;

	this.callParent(arguments);
    }

});
