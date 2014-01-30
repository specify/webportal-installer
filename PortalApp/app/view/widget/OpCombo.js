Ext.define('SpWebPortal.view.widget.OpCombo', {
    extend: 'Ext.form.field.ComboBox',
    
    queryMode: 'local',
    displayField: 'display',
    valueField: 'name',

    listeners: {
	'select': function() {
	    var critter = this.up('panel');
	    var flds = critter.query('textfield');
	    var visible = this.value == 'between';
	    flds[1].setVisible(visible);
	    if (!visible) {
		flds[1].setValue(null);
	    }		
	}
    }	
});
