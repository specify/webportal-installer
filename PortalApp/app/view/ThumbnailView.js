/* Copyright (C) 2020, Specify Collections Consortium
 * 
 * Specify Collections Consortium, Biodiversity Institute, University of Kansas,
 * 1345 Jayhawk Boulevard, Lawrence, Kansas, 66045, USA, support@specifysoftware.org
 * 
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
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
  prepareData: function (data) {
    Ext.apply(data, {
      shortName: Ext.util.Format.ellipsis(data.Title, 15),
      AttachedToDescrFormatted: data.AttachedToDescr.split('\n').join('<br>')
    })
    return data
  },

  initComponent: function () {
		var displayImgCaption = Ext.getStore('SettingsStore').getAt(0).get('displayImgCaption')

    Ext.apply(this, {
      tpl: new Ext.XTemplate(
        '<tpl for=".">',
        '<div class="tv-thumb-wrap" id="{AttachmentID}">',
        //'<div class="tv-thumb"><img src="' + settings.get('imageBaseUrl') + '/{AttachmentLocation}" title="{AttachedToDescr} - {Title}"></div>',
        //'<div class="tv-thumb"><img src="{ThumbSrc}" title="{AttachedToDescr} - {Title}"></div>',
        '<table class="tv-thumb"><tr><td class="tv-cell"><img src="{ThumbSrc}" title="{AttachedToDescr}"></td></tr></table>',
        '<tpl if="this.displayCaption()">',
          '<table class="tv-desc"><tr><td>{AttachedToDescrFormatted}</td></tr></table>',
        '</tpl>',
        //'<span class="x-editable">{shortName}</span>
        '</div>',
        '</tpl>',
        '<div class="x-clear"></div>',
        {
          displayCaption: function() {
            return displayImgCaption
          }
        }
      ),
    })

    //	this.callParent(arguments);
    this.superclass.initComponent.apply(this, arguments)
  }
})
