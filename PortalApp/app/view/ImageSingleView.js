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

Ext.define('SpWebPortal.view.ImageSingleView', {
    extend: 'Ext.panel.Panel',
    xtype: 'spimagesingleview',
    alias: 'widget.imagesingleview',

    layout: 'border',

    //localizable text...
    specimenBtnTxt: 'Associated Specimens',
    specimenBtnTip: 'View specimen(s) associated with this image',
    imageDetailBtnTxt: 'Image Details',
    imageDetailBtnTip: 'View image details',
    viewActualBtnText: 'Actual Size',
    viewStdBtnText: 'Standard Size',
    viewActualBtnTip: 'Click to view actual size',
    viewStdBtnTip: 'Click to view standard size',
    //...localizable text

    config: {	
	imageRecord: null,
	isActualSize: false,
	spOwner: null,
	showSpecDetailBtn: true
    },
    
    initComponent: function() {
	var cmps = [];
	cmps[0] = Ext.create('Ext.panel.Panel', {
	    region: 'center',
	    itemid: 'image-panel',
	    html: this.getImgHtml(),
	    autoScroll: true
	});

	var dcmps = [];
	dcmps[0] = Ext.create('Ext.toolbar.Toolbar', {
	    dock: 'bottom',
	    items: [
		{
		    xtype: 'button',
		    id: 'spwp-img-single-viewsize-btn',
		    text: this.isActualSize ? this.viewStdBtnText : this.viewActualBtnText,
		    tooltip: this.isActualSize ? this.viewStdBtnTip : this.viewActualBtnTip
		},
		{
		    xtype: 'button',
		    text: this.specimenBtnTxt,
		    tooltip: this.specimenBtnTip,
		    id: 'spwp-img-single-specimenbtn',
		    hidden: !this.getShowSpecDetailBtn()
		},
		{
		    xtype: 'button',
		    text: this.imageDetailBtnTxt,
		    tooltip: this.imageDetailBtnTip,
		    id: 'spwp-img-single-imagedetailbtn',
		    hidden: true
		}
	    ]
	});

	this.items = cmps;
	this.dockedItems = dcmps;
	
	//this.callParent(arguments);
	this.superclass.initComponent.apply(this, arguments);
    },

    getImgHtml: function() {
	var src = this.getIsActualSize() ? this.getImageRecord().get('Src') : this.getImageRecord().get('StdSrc');
	return  '<table class="deadcenter"> <tr><td><img src='+  src + '></td></tr></table>'; //caller will have filled-in the src.
    }

});
