Ext.define('SpWebPortal.view.widget.SortButton', {
    extend: 'Ext.button.Button',

    sorts: Ext.getStore('Sorts'),

    text: '  ',
    tooltip: 'sort order',

    handler: function() {
	if (this.clickCount) {
	    this.clickCount++;
	} else {
	    this.clickCount = 1;
	}
	var idx = this.clickCount % this.sorts.getCount();
	var srt = this.sorts.getAt(idx);
	this.setIcon(srt.raw.icon);
    }

});
