Ext.define('SpWebPortal.view.widget.BangButton', {
    extend: 'Ext.button.Button',

    text: ' ',
    tooltip: 'negation of condition',
    bang: false,

    handler: function() {
	if (this.bang) {
	    this.bang = false;
	    this.setIcon('');
	} else {
	    this.bang = true;
	    //this.setIcon('resources/images/reddot.gif');
	    this.setIcon('resources/images/no.png');
	}
    }
});
