"use strict";
/*
 * SpWebPortal.view.ThumbnailView
 *
 * Individual thumbnail view.
 *
 */
Ext.define('SpWebPortal.view.ThumbnailView', {
    extend: 'Ext.view.View',
    xtype: 'spthumbnail',
    alias: 'widget.thumbnail',

    //localizable text...
    emptyText: 'No images to display',
    //...localizable text
    
    multiSelect: false,
    trackOver: true,
    overItemCls: 'tv-x-item-over',
    itemSelector: 'div.tv-thumb-wrap',
    /*plugins: [
	Ext.create('Ext.ux.DataView.DragSelector', {}),
	Ext.create('Ext.ux.DataView.LabelEditor', {dataIndex: 'name'})
    ],*/
    prepareData: function(data) {
	Ext.apply(data, {
	    shortName: Ext.util.Format.ellipsis(data.Title, 15)
	});
	return data;
    },

	

    initComponent: function() {
	var settingsStore =  Ext.getStore('SettingsStore');
	var settings = settingsStore.getAt(0);
	Ext.apply(this, {
	    tpl: [
		'<tpl for=".">',
		'<div class="tv-thumb-wrap" id="{AttachmentID}">',
		//'<div class="tv-thumb"><img src="' + settings.get('imageBaseUrl') + '/{AttachmentLocation}" title="{AttachedToDescr} - {Title}"></div>',
		//'<div class="tv-thumb"><img src="{ThumbSrc}" title="{AttachedToDescr} - {Title}"></div>',
		'<table class="tv-thumb"><tr><td><img src="{ThumbSrc}" title="{AttachedToDescr}"></td></tr></table>',
		//'<span class="x-editable">{shortName}</span>
		'</div>',
		'</tpl>',
		'<div class="x-clear"></div>'
	    ]
	});

//	this.callParent(arguments);
	this.superclass.initComponent.apply(this, arguments);
    }
		 
});

