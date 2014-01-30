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
		displaycolidx: fld.get('displaycolidx')
	    });
	}
	flds.sort(function(a, b){return a.displaycolidx - b.displaycolidx;});
	this.items = flds;

	this.callParent(arguments);
    },

    loadRecord: function(record) {
	//console.info("DetailView.loadRecord in");
	this.callParent(arguments);
	var imgFld = this.getForm().findField('img');
	if (imgFld != null) {
	    var value = imgFld.getValue();
	    if (value != null && value != '') {
		var newValue = '';
		var data = Ext.JSON.decode(value);
		var store = Ext.create('Ext.data.Store', {
		    model: 'SpWebPortal.model.AttachedImageModel',
		    data: data
		});
			
		for (var r = 0; r < store.getCount(); r++) {
		    if (newValue != '') {
			newValue += ', ';
		    }
		    newValue += store.getAt(r).get('Title');
		}
		imgFld.setValue(newValue);
	    }
	}	    
	//console.info("DetailView.loadRecord out");
    }

});
