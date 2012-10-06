Ext.define('SpWebPortal.view.DetailPanel', {
    extend: 'Ext.panel.Panel',
    xtype: 'spdetailpanel',
    alias: 'widget.spdetailpanel',

    layout: 'border',

    config: {
	showMap: true,
	showImages: true,
	showFullImageView: true
    },

    requires: [
	'SpWebPortal.view.DetailView', 'SpWebPortal.view.ImageView'
    ],

    initComponent: function() {
	console.info('DetailPanel.initComponent');

	var cmps = [];

	cmps[0] = Ext.widget('spdetail', {
	    region: 'center'
	});

	/*var subCmps = [];
	var subIdx = 0;
	if (this.getShowMap()) {
	    subCmps[subIdx] = Ext.create('Ext.panel.Panel');
	    if (this.getShowImages()) {
		Ext.apply(subCmps[subIdx], {
		    region: 'north',
		    height: 300,
		    collapsible: true,
		    titleCollapse: true,
		    split: true
		});
	    } else {
		subCmps[subIdx].region = 'center';
	    }
	    subIdx++;
	}
	if (this.getShowImages()) {
	    subCmps[subIdx] = Ext.create('SpWebPortal.view.ImageView', {
		    region: 'center'
	    });
	    subIdx++;
	}*/
	cmps[1] = Ext.create('Ext.panel.Panel', {
	    collapsible: true,
	    header: false,
	    split: true,
	    layout: 'border',
	    region: 'east',
	    itemid: 'img-and-map-view',
	    width: 300,
	    items: [
		{
		    xtype: 'panel',
		    region: 'north',
		    height: 300,
		    collapsible: true,
		    split: true,
		    collapsed: !this.getShowMap(),
		    //id: 'spwpdetailmappane',
		    itemid: 'spdetailmappane'
		},
		{
		    xtype: 'spimageview',
		    region: 'center'
		}
	    ]
	});
	//cmps[1].items = subCmps;
	
	this.items = cmps;

	this.callParent(arguments);
    },

    loadRecord: function(record) {
	var frm = this.down('spdetailview');
	this.down('spdetailview').loadRecord(record);

	//set up image view
	var thumb = this.down('spimageview').down('spthumbnail');
	var img = this.down('spimageview').down('image');
	img.setSrc('');
	img.up('panel').setTitle('Image');
	var imgStore = thumb.getStore();
	imgStore.removeAll();

	var imgDef = record.get('img');
	var imagesPresent = imgDef != null && imgDef != '';
	if (imagesPresent) {
	    var imgs = Ext.JSON.decode(imgDef);
	    for (var i = 0; i < imgs.length; i++) {
		Ext.apply(imgs[i], {
		    AttachedTo: record.get('spid'),
		    AttachedToDescr: record.get('cn')
		});
	    }
	    imgStore.add(imgs);
	}
	var imgMapView = this.down('[itemid="img-and-map-view"]');
	if (!imagesPresent && !this.getShowMap()) {
	    imgMapView.setTitle('');
	    if (!imgMapView.getCollapsed()) {
		imgMapView.collapse();
	    }
	} else if (imgMapView.getCollapsed()) {
	    //img.setVisible(true);
	    //imgMapView.down('panel').setVisible(true);
	    
	    //auto-expanding kills the sub-elements in the imgMapView.
	    //imgMapView.expand(true);
	    //print msg in title for now
	    imgMapView.setTitle("expand to view image(s)");
	    //alert("The current record has associated image(s). Expand the right-hand section of the details form to view. Automatic expansion is not working at this time.");  
	    //img.setVisible(true);
	    //imgMapView.down('panel').setVisible(true);
	    //imgMapView.toggleCollapse();
	}
	//if (this.getShowMap()) {
	//    var aDom = Ext.getDom('spwpdetailmappane');
	//    this.down('#spwpdetailmappane').fireEvent('maprequest', record, aDom);
	//}
	//var imgpager = this.down('pagingtoolbar');
	this.down('pagingtoolbar').setVisible(false); //no paging yet
    }

});
